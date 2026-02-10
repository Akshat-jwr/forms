'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Eye, 
  Palette, 
  Settings, 
  MoreVertical, 
  Send, 
  Undo, 
  Redo,
  FolderOpen,
  Star,
  FileText
} from 'lucide-react';
import { Form } from '@/types/form';

interface FormEditorHeaderProps {
  form: Form;
  activeTab: 'questions' | 'responses' | 'settings';
  onTabChange: (tab: 'questions' | 'responses' | 'settings') => void;
  onTitleChange: (title: string) => void;
  onOpenTheme: () => void;
  onOpenSettings: () => void;
  onPreview: () => void;
  onSend: () => void;
  responseCount: number;
}

export const FormEditorHeader: React.FC<FormEditorHeaderProps> = ({
  form,
  activeTab,
  onTabChange,
  onTitleChange,
  onOpenTheme,
  onOpenSettings,
  onPreview,
  onSend,
  responseCount,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  return (
    <header className="bg-card border-b border-border sticky top-0 z-40">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 hover:bg-hover rounded-full">
            <FileText size={28} className="text-google-purple" />
          </Link>
          <div>
            {isEditingTitle ? (
              <input
                type="text"
                className="text-lg font-medium bg-transparent border-b-2 border-google-purple outline-none"
                value={form.title}
                onChange={(e) => onTitleChange(e.target.value)}
                onBlur={() => setIsEditingTitle(false)}
                onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
                autoFocus
              />
            ) : (
              <h1
                className="text-lg font-medium cursor-pointer hover:border-b hover:border-border"
                onClick={() => setIsEditingTitle(true)}
              >
                {form.title || 'Untitled form'}
              </h1>
            )}
          </div>
          <button className="p-2 hover:bg-hover rounded">
            <FolderOpen size={20} className="text-text-secondary" />
          </button>
          <button className="p-2 hover:bg-hover rounded">
            <Star size={20} className="text-text-secondary" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="p-2 hover:bg-hover rounded"
            onClick={onOpenTheme}
            title="Customize theme"
          >
            <Palette size={20} className="text-text-secondary" />
          </button>
          <button
            className="p-2 hover:bg-hover rounded"
            onClick={onPreview}
            title="Preview"
          >
            <Eye size={20} className="text-text-secondary" />
          </button>
          <button
            className="p-2 hover:bg-hover rounded"
            onClick={onOpenSettings}
            title="Settings"
          >
            <Settings size={20} className="text-text-secondary" />
          </button>
          <button
            className="flex items-center gap-2 px-6 py-2 bg-google-purple text-white rounded-md hover:shadow-md transition-shadow"
            onClick={onSend}
          >
            <Send size={18} />
            <span>Send</span>
          </button>
          <div className="relative">
            <button
              className="p-2 hover:bg-hover rounded"
              onClick={() => setShowMoreMenu(!showMoreMenu)}
            >
              <MoreVertical size={20} className="text-text-secondary" />
            </button>
            {showMoreMenu && (
              <div className="dropdown-menu right-0 top-full mt-1">
                <div className="dropdown-item">
                  <Undo size={18} />
                  <span>Undo</span>
                </div>
                <div className="dropdown-item">
                  <Redo size={18} />
                  <span>Redo</span>
                </div>
                <div className="border-t border-border my-1" />
                <div className="dropdown-item">Make a copy</div>
                <div className="dropdown-item">Move to trash</div>
                <div className="dropdown-item">Get pre-filled link</div>
                <div className="dropdown-item">Print</div>
                <div className="border-t border-border my-1" />
                <div className="dropdown-item">Add collaborators</div>
                <div className="dropdown-item">Script editor</div>
                <div className="dropdown-item">Add-ons</div>
                <div className="border-t border-border my-1" />
                <div className="dropdown-item">Preferences</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="tab-nav px-4">
        <button
          className={`tab-button ${activeTab === 'questions' ? 'active' : ''}`}
          onClick={() => onTabChange('questions')}
        >
          Questions
        </button>
        <button
          className={`tab-button ${activeTab === 'responses' ? 'active' : ''}`}
          onClick={() => onTabChange('responses')}
        >
          Responses {responseCount > 0 && <span className="ml-1 px-2 py-0.5 bg-google-purple text-white text-xs rounded-full">{responseCount}</span>}
        </button>
        <button
          className={`tab-button ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => onTabChange('settings')}
        >
          Settings
        </button>
      </div>
    </header>
  );
};
