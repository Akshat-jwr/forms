'use client';

import React from 'react';
import { Section, Question } from '@/types/form';
import { MoreVertical, Copy, Trash2, MoveUp, MoveDown, Merge } from 'lucide-react';

interface SectionEditorProps {
  section: Section;
  sectionIndex: number;
  totalSections: number;
  formId: string;
  isSelected: boolean;
  onSelect: () => void;
  onUpdateTitle: (title: string) => void;
  onUpdateDescription: (description: string) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onMerge: () => void;
  children: React.ReactNode;
}

export const SectionEditor: React.FC<SectionEditorProps> = ({
  section,
  sectionIndex,
  totalSections,
  isSelected,
  onSelect,
  onUpdateTitle,
  onUpdateDescription,
  onDuplicate,
  onDelete,
  onMoveUp,
  onMoveDown,
  onMerge,
  children,
}) => {
  const [showMenu, setShowMenu] = React.useState(false);

  // First section has special styling (form title)
  if (sectionIndex === 0) {
    return <div>{children}</div>;
  }

  return (
    <div className="mt-6">
      <div
        className={`form-card ${isSelected ? 'selected' : ''}`}
        onClick={onSelect}
      >
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <input
                type="text"
                className="form-input text-xl font-medium"
                value={section.title}
                onChange={(e) => onUpdateTitle(e.target.value)}
                placeholder="Section title"
              />
              <input
                type="text"
                className="form-input text-sm mt-2"
                value={section.description || ''}
                onChange={(e) => onUpdateDescription(e.target.value)}
                placeholder="Section description (optional)"
              />
            </div>
            <div className="relative">
              <button
                className="p-2 hover:bg-hover rounded"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
              >
                <MoreVertical size={20} className="text-text-secondary" />
              </button>
              {showMenu && (
                <div className="dropdown-menu right-0 top-full mt-1">
                  <div className="dropdown-item" onClick={onDuplicate}>
                    <Copy size={18} />
                    <span>Duplicate section</span>
                  </div>
                  {sectionIndex > 1 && (
                    <div className="dropdown-item" onClick={onMoveUp}>
                      <MoveUp size={18} />
                      <span>Move section up</span>
                    </div>
                  )}
                  {sectionIndex < totalSections - 1 && (
                    <div className="dropdown-item" onClick={onMoveDown}>
                      <MoveDown size={18} />
                      <span>Move section down</span>
                    </div>
                  )}
                  {sectionIndex > 0 && (
                    <div className="dropdown-item" onClick={onMerge}>
                      <Merge size={18} />
                      <span>Merge with above</span>
                    </div>
                  )}
                  {totalSections > 1 && (
                    <div className="dropdown-item text-google-red" onClick={onDelete}>
                      <Trash2 size={18} />
                      <span>Delete section</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="text-sm text-text-secondary mt-4">
            Section {sectionIndex} of {totalSections - 1}
          </div>
        </div>
      </div>
      {children}
    </div>
  );
};
