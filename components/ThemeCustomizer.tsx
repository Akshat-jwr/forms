'use client';

import React from 'react';
import { X } from 'lucide-react';
import { FormTheme } from '@/types/form';

interface ThemeCustomizerProps {
  theme: FormTheme;
  onUpdateTheme: (updates: Partial<FormTheme>) => void;
  isOpen: boolean;
  onClose: () => void;
}

const headerColors = [
  '#db4437', // Red
  '#e91e63', // Pink
  '#673ab7', // Purple (default)
  '#3f51b5', // Indigo
  '#4285f4', // Blue
  '#03a9f4', // Light Blue
  '#00bcd4', // Cyan
  '#009688', // Teal
  '#4caf50', // Green
  '#8bc34a', // Light Green
  '#cddc39', // Lime
  '#ffeb3b', // Yellow
  '#ffc107', // Amber
  '#ff9800', // Orange
  '#ff5722', // Deep Orange
  '#795548', // Brown
  '#607d8b', // Blue Grey
  '#9e9e9e', // Grey
];

const backgroundColors = [
  '#ffffff', // White
  '#f0ebf8', // Light Purple
  '#e3f2fd', // Light Blue
  '#e8f5e9', // Light Green
  '#fff3e0', // Light Orange
  '#fce4ec', // Light Pink
  '#f3e5f5', // Light Purple
  '#e1f5fe', // Light Cyan
  '#e0f2f1', // Light Teal
  '#f1f8e9', // Light Lime
  '#fffde7', // Light Yellow
  '#fff8e1', // Light Amber
  '#fbe9e7', // Light Deep Orange
  '#efebe9', // Light Brown
  '#eceff1', // Light Blue Grey
  '#fafafa', // Light Grey
];

const fontFamilies = [
  { value: 'Google Sans, Roboto, Arial, sans-serif', label: 'Google Sans' },
  { value: 'Roboto, Arial, sans-serif', label: 'Roboto' },
  { value: 'Arial, sans-serif', label: 'Arial' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: 'Times New Roman, serif', label: 'Times New Roman' },
  { value: 'Courier New, monospace', label: 'Courier New' },
];

export const ThemeCustomizer: React.FC<ThemeCustomizerProps> = ({
  theme,
  onUpdateTheme,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-card border-l border-border shadow-lg z-50 animate-fadeIn overflow-y-auto">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="text-lg font-medium">Theme options</h2>
        <button
          className="p-2 hover:bg-hover rounded"
          onClick={onClose}
        >
          <X size={20} className="text-text-secondary" />
        </button>
      </div>

      <div className="p-4 space-y-6">
        {/* Header Image */}
        <div>
          <h3 className="text-sm font-medium mb-3">Header</h3>
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
            {theme.headerImageUrl ? (
              <div className="relative">
                <img
                  src={theme.headerImageUrl}
                  alt="Header"
                  className="max-w-full h-auto rounded"
                />
                <button
                  className="absolute top-2 right-2 p-1 bg-black/50 rounded-full"
                  onClick={() => onUpdateTheme({ headerImageUrl: undefined })}
                >
                  <X size={16} className="text-white" />
                </button>
              </div>
            ) : (
              <div>
                <p className="text-text-secondary text-sm">Choose an image</p>
                <button
                  className="mt-2 px-4 py-2 text-google-blue hover:bg-hover rounded"
                  onClick={() => {
                    // In a real app, this would open a file picker
                    const url = prompt('Enter image URL:');
                    if (url) onUpdateTheme({ headerImageUrl: url });
                  }}
                >
                  Select image
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Theme Color */}
        <div>
          <h3 className="text-sm font-medium mb-3">Theme color</h3>
          <div className="grid grid-cols-6 gap-2">
            {headerColors.map((color) => (
              <button
                key={color}
                className={`color-option ${theme.headerColor === color ? 'selected' : ''}`}
                style={{ backgroundColor: color }}
                onClick={() => onUpdateTheme({ headerColor: color })}
              />
            ))}
          </div>
        </div>

        {/* Background Color */}
        <div>
          <h3 className="text-sm font-medium mb-3">Background color</h3>
          <div className="grid grid-cols-4 gap-2">
            {backgroundColors.map((color) => (
              <button
                key={color}
                className={`color-option ${theme.backgroundColor === color ? 'selected' : ''}`}
                style={{ backgroundColor: color }}
                onClick={() => onUpdateTheme({ backgroundColor: color })}
              />
            ))}
          </div>
        </div>

        {/* Font Family */}
        <div>
          <h3 className="text-sm font-medium mb-3">Font style</h3>
          <select
            className="w-full border border-border rounded p-2"
            value={theme.fontFamily}
            onChange={(e) => onUpdateTheme({ fontFamily: e.target.value })}
          >
            {fontFamilies.map((font) => (
              <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                {font.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
