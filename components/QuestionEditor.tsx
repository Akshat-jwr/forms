'use client';

import React, { useState } from 'react';
import { X, GripVertical, Image, MoreVertical, Copy, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Question, QuestionType, Option } from '@/types/form';
import { QuestionTypeSelector } from './QuestionTypeSelector';

interface QuestionEditorProps {
  question: Question;
  sectionId: string;
  formId: string;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<Question>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onAddOption: () => void;
  onUpdateOption: (optionId: string, value: string) => void;
  onDeleteOption: (optionId: string) => void;
}

export const QuestionEditor: React.FC<QuestionEditorProps> = ({
  question,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onDuplicate,
  onAddOption,
  onUpdateOption,
  onDeleteOption,
}) => {
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const handleTypeChange = (type: QuestionType) => {
    const updates: Partial<Question> = { type };
    
    // Add default options for choice types
    if (['multiple_choice', 'checkboxes', 'dropdown'].includes(type) && !question.options?.length) {
      updates.options = [{ id: uuidv4(), value: 'Option 1' }];
    }
    
    // Add default linear scale config
    if (type === 'linear_scale' && !question.linearScale) {
      updates.linearScale = { minValue: 1, maxValue: 5, minLabel: '', maxLabel: '' };
    }
    
    // Add default grid config
    if (['multiple_choice_grid', 'checkbox_grid'].includes(type)) {
      if (!question.rows?.length) updates.rows = [{ id: uuidv4(), label: 'Row 1' }];
      if (!question.columns?.length) updates.columns = [{ id: uuidv4(), label: 'Column 1' }];
    }
    
    onUpdate(updates);
  };

  const renderOptionIcon = () => {
    switch (question.type) {
      case 'multiple_choice':
        return <div className="option-circle" />;
      case 'checkboxes':
        return <div className="option-square" />;
      case 'dropdown':
        return <span className="text-text-secondary w-5 text-center">{}</span>;
      default:
        return null;
    }
  };

  const renderQuestionContent = () => {
    switch (question.type) {
      case 'short_answer':
        return (
          <div className="mt-4">
            <input
              type="text"
              className="form-input-underline w-1/2"
              placeholder="Short answer text"
              disabled
            />
          </div>
        );

      case 'paragraph':
        return (
          <div className="mt-4">
            <input
              type="text"
              className="form-input-underline w-full"
              placeholder="Long answer text"
              disabled
            />
          </div>
        );

      case 'multiple_choice':
      case 'checkboxes':
      case 'dropdown':
        return (
          <div className="mt-4 space-y-3">
            {question.options?.map((option, index) => (
              <div key={option.id} className="flex items-center gap-3 group">
                {question.type === 'dropdown' ? (
                  <span className="text-text-secondary w-5 text-center">{index + 1}.</span>
                ) : (
                  renderOptionIcon()
                )}
                <input
                  type="text"
                  className="form-input-underline flex-1"
                  value={option.value}
                  onChange={(e) => onUpdateOption(option.id, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                />
                {isSelected && (question.options?.length || 0) > 1 && (
                  <button
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-hover rounded"
                    onClick={() => onDeleteOption(option.id)}
                  >
                    <X size={20} className="text-text-secondary" />
                  </button>
                )}
              </div>
            ))}
            {isSelected && (
              <div className="flex items-center gap-3">
                {question.type === 'dropdown' ? (
                  <span className="text-text-secondary w-5 text-center">{(question.options?.length || 0) + 1}.</span>
                ) : (
                  renderOptionIcon()
                )}
                <button
                  className="text-text-secondary hover:text-text-primary"
                  onClick={onAddOption}
                >
                  Add option
                </button>
                {(question.type === 'multiple_choice' || question.type === 'checkboxes') && (
                  <>
                    <span className="text-text-secondary">or</span>
                    <button
                      className="text-google-blue hover:underline"
                      onClick={() => onUpdate({ hasOtherOption: !question.hasOtherOption })}
                    >
                      {question.hasOtherOption ? 'remove "Other"' : 'add "Other"'}
                    </button>
                  </>
                )}
              </div>
            )}
            {question.hasOtherOption && (
              <div className="flex items-center gap-3">
                {renderOptionIcon()}
                <span className="text-text-secondary">Other...</span>
              </div>
            )}
          </div>
        );

      case 'linear_scale':
        return (
          <div className="mt-4 space-y-4">
            <div className="flex items-center gap-4">
              <select
                className="border rounded p-2"
                value={question.linearScale?.minValue || 0}
                onChange={(e) =>
                  onUpdate({
                    linearScale: { ...question.linearScale!, minValue: parseInt(e.target.value) },
                  })
                }
              >
                {[0, 1].map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
              <span>to</span>
              <select
                className="border rounded p-2"
                value={question.linearScale?.maxValue || 5}
                onChange={(e) =>
                  onUpdate({
                    linearScale: { ...question.linearScale!, maxValue: parseInt(e.target.value) },
                  })
                }
              >
                {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-8 text-center">{question.linearScale?.minValue || 0}</span>
              <input
                type="text"
                className="form-input-underline flex-1"
                placeholder="Label (optional)"
                value={question.linearScale?.minLabel || ''}
                onChange={(e) =>
                  onUpdate({
                    linearScale: { ...question.linearScale!, minLabel: e.target.value },
                  })
                }
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="w-8 text-center">{question.linearScale?.maxValue || 5}</span>
              <input
                type="text"
                className="form-input-underline flex-1"
                placeholder="Label (optional)"
                value={question.linearScale?.maxLabel || ''}
                onChange={(e) =>
                  onUpdate({
                    linearScale: { ...question.linearScale!, maxLabel: e.target.value },
                  })
                }
              />
            </div>
          </div>
        );

      case 'multiple_choice_grid':
      case 'checkbox_grid':
        return (
          <div className="mt-4">
            <div className="mb-4">
              <div className="text-sm text-text-secondary mb-2">Rows</div>
              {question.rows?.map((row, index) => (
                <div key={row.id} className="flex items-center gap-3 mb-2 group">
                  <span className="text-text-secondary w-5 text-center">{index + 1}.</span>
                  <input
                    type="text"
                    className="form-input-underline flex-1"
                    value={row.label}
                    onChange={(e) => {
                      const newRows = question.rows?.map((r) =>
                        r.id === row.id ? { ...r, label: e.target.value } : r
                      );
                      onUpdate({ rows: newRows });
                    }}
                    placeholder={`Row ${index + 1}`}
                  />
                  {isSelected && (question.rows?.length || 0) > 1 && (
                    <button
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-hover rounded"
                      onClick={() => {
                        const newRows = question.rows?.filter((r) => r.id !== row.id);
                        onUpdate({ rows: newRows });
                      }}
                    >
                      <X size={20} className="text-text-secondary" />
                    </button>
                  )}
                </div>
              ))}
              {isSelected && (
                <button
                  className="text-text-secondary hover:text-text-primary ml-8"
                  onClick={() => {
                    const newRows = [
                      ...(question.rows || []),
                      { id: uuidv4(), label: `Row ${(question.rows?.length || 0) + 1}` },
                    ];
                    onUpdate({ rows: newRows });
                  }}
                >
                  Add row
                </button>
              )}
            </div>
            <div>
              <div className="text-sm text-text-secondary mb-2">Columns</div>
              {question.columns?.map((column, index) => (
                <div key={column.id} className="flex items-center gap-3 mb-2 group">
                  <span className="text-text-secondary w-5 text-center">{index + 1}.</span>
                  <input
                    type="text"
                    className="form-input-underline flex-1"
                    value={column.label}
                    onChange={(e) => {
                      const newColumns = question.columns?.map((c) =>
                        c.id === column.id ? { ...c, label: e.target.value } : c
                      );
                      onUpdate({ columns: newColumns });
                    }}
                    placeholder={`Column ${index + 1}`}
                  />
                  {isSelected && (question.columns?.length || 0) > 1 && (
                    <button
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-hover rounded"
                      onClick={() => {
                        const newColumns = question.columns?.filter((c) => c.id !== column.id);
                        onUpdate({ columns: newColumns });
                      }}
                    >
                      <X size={20} className="text-text-secondary" />
                    </button>
                  )}
                </div>
              ))}
              {isSelected && (
                <button
                  className="text-text-secondary hover:text-text-primary ml-8"
                  onClick={() => {
                    const newColumns = [
                      ...(question.columns || []),
                      { id: uuidv4(), label: `Column ${(question.columns?.length || 0) + 1}` },
                    ];
                    onUpdate({ columns: newColumns });
                  }}
                >
                  Add column
                </button>
              )}
            </div>
          </div>
        );

      case 'date':
        return (
          <div className="mt-4">
            <div className="flex items-center gap-2 border rounded p-3 w-48 text-text-secondary">
              <span>Month, day, year</span>
            </div>
          </div>
        );

      case 'time':
        return (
          <div className="mt-4">
            <div className="flex items-center gap-2 border rounded p-3 w-32 text-text-secondary">
              <span>Time</span>
            </div>
          </div>
        );

      case 'file_upload':
        return (
          <div className="mt-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center text-text-secondary">
              <p>File upload</p>
              <p className="text-sm mt-2">
                Max files: {question.fileUploadConfig?.maxFiles || 1} | 
                Max size: {question.fileUploadConfig?.maxFileSize || 10} MB
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className={`question-card ${isSelected ? 'focused' : ''}`}
      onClick={onSelect}
    >
      {isSelected && (
        <div className="question-handle">
          <GripVertical size={20} className="text-text-secondary" />
        </div>
      )}

      <div className="flex gap-4">
        <div className="flex-1">
          {/* Question Title */}
          <div className="flex items-start gap-4">
            <input
              type="text"
              className={`form-input text-base flex-1 ${!isSelected ? 'border-transparent' : ''}`}
              value={question.title}
              onChange={(e) => onUpdate({ title: e.target.value })}
              placeholder="Question"
            />
            {isSelected && (
              <QuestionTypeSelector
                currentType={question.type}
                onSelect={handleTypeChange}
                isOpen={isTypeDropdownOpen}
                onToggle={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
              />
            )}
          </div>

          {/* Question Description (only when selected) */}
          {isSelected && question.description !== undefined && (
            <input
              type="text"
              className="form-input text-sm mt-2"
              value={question.description || ''}
              onChange={(e) => onUpdate({ description: e.target.value })}
              placeholder="Description (optional)"
            />
          )}

          {/* Question Content */}
          {renderQuestionContent()}
        </div>
      </div>

      {/* Bottom toolbar */}
      {isSelected && (
        <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-border">
          <button
            className="p-2 hover:bg-hover rounded"
            onClick={onDuplicate}
            title="Duplicate"
          >
            <Copy size={20} className="text-text-secondary" />
          </button>
          <button
            className="p-2 hover:bg-hover rounded"
            onClick={onDelete}
            title="Delete"
          >
            <Trash2 size={20} className="text-text-secondary" />
          </button>
          <div className="w-px h-6 bg-border mx-2" />
          <span className="text-sm text-text-secondary">Required</span>
          <button
            className={`toggle-switch ${question.required ? 'active' : ''}`}
            onClick={() => onUpdate({ required: !question.required })}
          />
          <div className="relative">
            <button
              className="p-2 hover:bg-hover rounded"
              onClick={() => setShowMoreMenu(!showMoreMenu)}
            >
              <MoreVertical size={20} className="text-text-secondary" />
            </button>
            {showMoreMenu && (
              <div className="dropdown-menu right-0 top-full mt-1">
                <div
                  className="dropdown-item"
                  onClick={() => {
                    onUpdate({ description: question.description === undefined ? '' : undefined });
                    setShowMoreMenu(false);
                  }}
                >
                  {question.description !== undefined ? 'Remove description' : 'Add description'}
                </div>
                <div
                  className="dropdown-item"
                  onClick={() => {
                    onUpdate({ shuffleOptions: !question.shuffleOptions });
                    setShowMoreMenu(false);
                  }}
                >
                  {question.shuffleOptions ? 'Don\'t shuffle options' : 'Shuffle option order'}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
