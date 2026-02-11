'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ProctoringViolation, ProctoringViolationType } from '@/types/form';
import { AlertTriangle, Camera, CameraOff, Eye, ShieldAlert, X } from 'lucide-react';

// Prohibited object classes from COCO-SSD
const PROHIBITED_OBJECTS: Record<string, { type: ProctoringViolationType; label: string }> = {
    'cell phone': { type: 'phone_detected', label: 'Cell Phone' },
    'book': { type: 'book_detected', label: 'Book' },
    'laptop': { type: 'laptop_detected', label: 'Laptop' },
    'remote': { type: 'prohibited_object', label: 'Remote/Device' },
    'tablet': { type: 'prohibited_object', label: 'Tablet' },
};

interface ProctoringMonitorProps {
    formId: string;
    onViolation?: (violation: ProctoringViolation) => void;
}

export const ProctoringMonitor: React.FC<ProctoringMonitorProps> = ({
    formId,
    onViolation,
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const modelRef = useRef<any>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const lastViolationRef = useRef<Record<string, number>>({});

    const [isLoading, setIsLoading] = useState(true);
    const [modelLoaded, setModelLoaded] = useState(false);
    const [cameraActive, setCameraActive] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [violations, setViolations] = useState<ProctoringViolation[]>([]);
    const [currentAlert, setCurrentAlert] = useState<string | null>(null);
    const [isMinimized, setIsMinimized] = useState(false);
    const [tabSwitchCount, setTabSwitchCount] = useState(0);

    const VIOLATION_COOLDOWN_MS = 5000; // minimum gap between same violation type

    const addViolation = useCallback((type: ProctoringViolationType, message: string, confidence?: number) => {
        const now = Date.now();
        const lastTime = lastViolationRef.current[type] || 0;

        if (now - lastTime < VIOLATION_COOLDOWN_MS) return;
        lastViolationRef.current[type] = now;

        const violation: ProctoringViolation = {
            type,
            timestamp: new Date(),
            message,
            confidence,
        };

        setViolations(prev => [...prev, violation]);
        setCurrentAlert(message);
        onViolation?.(violation);

        // Send to API
        fetch('/api/proctoring', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ formId, violation }),
        }).catch(console.error);

        // Clear alert after 4 seconds
        setTimeout(() => {
            setCurrentAlert(prev => prev === message ? null : prev);
        }, 4000);
    }, [formId, onViolation]);

    // Load TensorFlow.js and COCO-SSD model
    useEffect(() => {
        let cancelled = false;

        const loadModel = async () => {
            try {
                setIsLoading(true);

                // Dynamic imports to avoid SSR issues
                const tf = await import('@tensorflow/tfjs');
                await tf.ready();

                const cocoSsd = await import('@tensorflow-models/coco-ssd');
                const model = await cocoSsd.load({
                    base: 'lite_mobilenet_v2', // Lighter model for better performance
                });

                if (!cancelled) {
                    modelRef.current = model;
                    setModelLoaded(true);
                    setIsLoading(false);
                }
            } catch (error) {
                console.error('Failed to load detection model:', error);
                if (!cancelled) {
                    setIsLoading(false);
                    setCameraError('Failed to load AI detection model. Proctoring will continue with tab-switch detection only.');
                }
            }
        };

        loadModel();

        return () => {
            cancelled = true;
        };
    }, []);

    // Start webcam
    useEffect(() => {
        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { width: 320, height: 240, facingMode: 'user' },
                    audio: false,
                });

                streamRef.current = stream;

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    await videoRef.current.play();
                    setCameraActive(true);
                }
            } catch (error) {
                console.error('Camera access denied:', error);
                setCameraError('Camera access required for proctoring. Please allow camera access and refresh.');
                setCameraActive(false);
            }
        };

        startCamera();

        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    // Run object detection loop
    useEffect(() => {
        if (!modelLoaded || !cameraActive || !videoRef.current) return;

        const detect = async () => {
            const video = videoRef.current;
            if (!video || !modelRef.current || video.readyState !== 4) return;

            try {
                const predictions = await modelRef.current.detect(video);

                // Count people
                const people = predictions.filter((p: any) => p.class === 'person');

                if (people.length === 0) {
                    addViolation('no_person', '⚠ No person detected — please stay in front of the camera');
                } else if (people.length > 1) {
                    addViolation(
                        'multiple_people',
                        `⚠ ${people.length} people detected — only the test-taker should be visible`,
                        Math.max(...people.map((p: any) => p.score))
                    );
                }

                // Check for prohibited objects
                for (const prediction of predictions) {
                    const prohibited = PROHIBITED_OBJECTS[prediction.class];
                    if (prohibited && prediction.score > 0.5) {
                        addViolation(
                            prohibited.type,
                            `⚠ ${prohibited.label} detected — prohibited items are not allowed`,
                            prediction.score
                        );
                    }
                }
            } catch (error) {
                console.error('Detection error:', error);
            }
        };

        intervalRef.current = setInterval(detect, 2000);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [modelLoaded, cameraActive, addViolation]);

    // Tab switch detection
    useEffect(() => {
        const handleVisibility = () => {
            if (document.hidden) {
                setTabSwitchCount(prev => prev + 1);
                addViolation('tab_switch', '⚠ Tab switch detected — do not leave this page during the assessment');
            }
        };

        document.addEventListener('visibilitychange', handleVisibility);
        return () => document.removeEventListener('visibilitychange', handleVisibility);
    }, [addViolation]);

    // Prevent right-click
    useEffect(() => {
        const prevent = (e: Event) => e.preventDefault();
        document.addEventListener('contextmenu', prevent);
        return () => document.removeEventListener('contextmenu', prevent);
    }, []);

    return (
        <>
            {/* Violation Alert Banner */}
            {currentAlert && (
                <div className="proctoring-alert">
                    <div className="proctoring-alert-content">
                        <ShieldAlert size={20} />
                        <span>{currentAlert}</span>
                        <button onClick={() => setCurrentAlert(null)} className="proctoring-alert-close">
                            <X size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* Camera Preview PIP */}
            <div className={`proctoring-pip ${isMinimized ? 'minimized' : ''}`}>
                {/* Header */}
                <div className="proctoring-pip-header">
                    <div className="proctoring-pip-status">
                        {cameraActive ? (
                            <Eye size={14} className="proctoring-status-icon active" />
                        ) : (
                            <CameraOff size={14} className="proctoring-status-icon error" />
                        )}
                        <span className="proctoring-pip-label">
                            {isLoading ? 'Loading AI...' : modelLoaded ? 'Proctoring Active' : 'Limited Mode'}
                        </span>
                    </div>
                    <div className="proctoring-pip-actions">
                        <button
                            onClick={() => setIsMinimized(!isMinimized)}
                            className="proctoring-pip-btn"
                            title={isMinimized ? 'Show camera' : 'Minimize'}
                        >
                            {isMinimized ? <Camera size={14} /> : <span>—</span>}
                        </button>
                    </div>
                </div>

                {/* Video preview */}
                {!isMinimized && (
                    <div className="proctoring-pip-video">
                        <video
                            ref={videoRef}
                            muted
                            playsInline
                            className="proctoring-video"
                        />
                        <canvas ref={canvasRef} className="proctoring-canvas" />

                        {isLoading && (
                            <div className="proctoring-loading">
                                <div className="proctoring-spinner" />
                                <span>Loading model...</span>
                            </div>
                        )}

                        {cameraError && (
                            <div className="proctoring-error">
                                <CameraOff size={24} />
                                <span>{cameraError}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Stats Bar */}
                <div className="proctoring-pip-stats">
                    <div className="proctoring-stat">
                        <AlertTriangle size={12} />
                        <span>{violations.length} violation{violations.length !== 1 ? 's' : ''}</span>
                    </div>
                    {tabSwitchCount > 0 && (
                        <div className="proctoring-stat warning">
                            <span>{tabSwitchCount} tab switch{tabSwitchCount !== 1 ? 'es' : ''}</span>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};
