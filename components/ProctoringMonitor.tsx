'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ProctoringViolation, ProctoringViolationType } from '@/types/form';
import { AlertTriangle, Camera, CameraOff, Eye, ShieldAlert, X } from 'lucide-react';

// Prohibited object classes from COCO dataset (shared by MediaPipe ObjectDetector)
const PROHIBITED_OBJECTS: Record<string, { type: ProctoringViolationType; label: string }> = {
    'cell phone': { type: 'phone_detected', label: 'Cell Phone' },
    'book': { type: 'book_detected', label: 'Book' },
    'laptop': { type: 'laptop_detected', label: 'Laptop' },
    'remote': { type: 'prohibited_object', label: 'Remote/Device' },
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
    const streamRef = useRef<MediaStream | null>(null);
    const faceDetectorRef = useRef<any>(null);
    const objectDetectorRef = useRef<any>(null);
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

    const VIOLATION_COOLDOWN_MS = 5000;

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

    // Load MediaPipe Vision models
    useEffect(() => {
        let cancelled = false;

        const loadModels = async () => {
            try {
                setIsLoading(true);

                const vision = await import('@mediapipe/tasks-vision');
                const { FaceDetector, ObjectDetector, FilesetResolver } = vision;

                // Load WASM fileset from CDN
                const filesetResolver = await FilesetResolver.forVisionTasks(
                    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
                );

                // Create Face Detector (lightweight, fast)
                const faceDetector = await FaceDetector.createFromOptions(filesetResolver, {
                    baseOptions: {
                        modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite',
                        delegate: 'GPU',
                    },
                    runningMode: 'IMAGE',
                    minDetectionConfidence: 0.5,
                });

                // Create Object Detector (EfficientDet-Lite, COCO classes)
                const objectDetector = await ObjectDetector.createFromOptions(filesetResolver, {
                    baseOptions: {
                        modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/int8/1/efficientdet_lite0.tflite',
                        delegate: 'GPU',
                    },
                    runningMode: 'IMAGE',
                    maxResults: 10,
                    scoreThreshold: 0.5,
                });

                if (!cancelled) {
                    faceDetectorRef.current = faceDetector;
                    objectDetectorRef.current = objectDetector;
                    setModelLoaded(true);
                    setIsLoading(false);
                }
            } catch (error) {
                console.error('Failed to load MediaPipe models:', error);
                if (!cancelled) {
                    setIsLoading(false);
                    setCameraError('Failed to load AI models. Proctoring will continue with tab-switch detection only.');
                }
            }
        };

        loadModels();

        return () => {
            cancelled = true;
            faceDetectorRef.current?.close();
            objectDetectorRef.current?.close();
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

    // Run detection loop
    useEffect(() => {
        if (!modelLoaded || !cameraActive || !videoRef.current) return;

        const detect = async () => {
            const video = videoRef.current;
            if (!video || video.readyState !== 4) return;

            try {
                // Face detection — person presence
                if (faceDetectorRef.current) {
                    const faceResult = faceDetectorRef.current.detect(video);
                    const faceCount = faceResult.detections.length;

                    if (faceCount === 0) {
                        addViolation('no_person', '⚠ No person detected — please stay in front of the camera');
                    } else if (faceCount > 1) {
                        addViolation(
                            'multiple_people',
                            `⚠ ${faceCount} people detected — only the test-taker should be visible`,
                            Math.max(...faceResult.detections.map((d: any) => d.categories[0]?.score || 0))
                        );
                    }
                }

                // Object detection — prohibited items
                if (objectDetectorRef.current) {
                    const objectResult = objectDetectorRef.current.detect(video);

                    for (const detection of objectResult.detections) {
                        const category = detection.categories[0];
                        if (!category) continue;

                        const prohibited = PROHIBITED_OBJECTS[category.categoryName.toLowerCase()];
                        if (prohibited && category.score > 0.5) {
                            addViolation(
                                prohibited.type,
                                `⚠ ${prohibited.label} detected — prohibited items are not allowed`,
                                category.score
                            );
                        }
                    }
                }
            } catch (error) {
                console.error('Detection error:', error);
            }
        };

        intervalRef.current = setInterval(detect, 2500);

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

                        {isLoading && (
                            <div className="proctoring-loading">
                                <div className="proctoring-spinner" />
                                <span>Loading models...</span>
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
