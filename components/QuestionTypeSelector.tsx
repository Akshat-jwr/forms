'use client';

import React from 'react';
import { 
  AlignLeft, 
  List, 
  CheckSquare, 
  ChevronDown, 
  Upload, 
  Sliders, 
  Grid3X3, 
  Calendar, 
  Clock 
} from 'lucide-react';
import { QuestionType } from '@/types/form';

interface QuestionTypeOption {
  type: QuestionType;
  label: string;
  icon: React.ReactNode;
  category: string;
}

export const questionTypeOptions: QuestionTypeOption[] = [
  { type: 'short_answer', label: 'Short answer', icon: <AlignLeft size={20} />, category: 'Text' },
  { type: 'paragraph', label: 'Paragraph', icon: <AlignLeft size={20} />, category: 'Text' },
  { type: 'multiple_choice', label: 'Multiple choice', icon: <List size={20} />, category: 'Choice' },
  { type: 'checkboxes', label: 'Checkboxes', icon: <CheckSquare size={20} />, category: 'Choice' },
  { type: 'dropdown', label: 'Dropdown', icon: <ChevronDown size={20} />, category: 'Choice' },
  { type: 'file_upload', label: 'File upload', icon: <Upload size={20} />, category: 'Other' },
  { type: 'linear_scale', label: 'Linear scale', icon: <Sliders size={20} />, category: 'Other' },
  { type: 'multiple_choice_grid', label: 'Multiple choice grid', icon: <Grid3X3 size={20} />, category: 'Grid' },
  { type: 'checkbox_grid', label: 'Checkbox grid', icon: <Grid3X3 size={20} />, category: 'Grid' },
  { type: 'date', label: 'Date', icon: <Calendar size={20} />, category: 'Date/Time' },
  { type: 'time', label: 'Time', icon: <Clock size={20} />, category: 'Date/Time' },
];

interface QuestionTypeSelectorProps {
  currentType: QuestionType;
  onSelect: (type: QuestionType) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const QuestionTypeSelector: React.FC<QuestionTypeSelectorProps> = ({
  currentType,
  onSelect,
  isOpen,
  onToggle,
}) => {
  const currentOption = questionTypeOptions.find((opt) => opt.type === currentType);
  const categories = [...new Set(questionTypeOptions.map((opt) => opt.category))];

  return (
    <div className="relative">
      <button 
        className="question-type-dropdown min-w-[200px]"
        onClick={onToggle}
      >
        {currentOption?.icon}
        <span className="flex-1 text-left">{currentOption?.label}</span>
        <ChevronDown size={20} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="dropdown-menu top-full left-0 mt-1">
          {categories.map((category) => (
            <div key={category}>
              <div className="px-4 py-2 text-xs font-medium text-text-secondary uppercase">
                {category}
              </div>
              {questionTypeOptions
                .filter((opt) => opt.category === category)
                .map((option) => (
                  <div
                    key={option.type}
                    className={`dropdown-item ${option.type === currentType ? 'selected' : ''}`}
                    onClick={() => {
                      onSelect(option.type);
                      onToggle();
                    }}
                  >
                    {option.icon}
                    <span>{option.label}</span>
                  </div>
                ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
