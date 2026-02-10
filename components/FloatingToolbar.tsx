'use client';

import React, { useState } from 'react';
import { 
  PlusCircle, 
  Import, 
  Type, 
  Image, 
  Video, 
  SeparatorHorizontal 
} from 'lucide-react';
import { QuestionType } from '@/types/form';
import { questionTypeOptions } from './QuestionTypeSelector';

interface FloatingToolbarProps {
  onAddQuestion: (type: QuestionType) => void;
  onAddSection: () => void;
  onAddTitleAndDescription: () => void;
  onAddImage: () => void;
  onAddVideo: () => void;
  onImportQuestions: () => void;
}

export const FloatingToolbar: React.FC<FloatingToolbarProps> = ({
  onAddQuestion,
  onAddSection,
  onAddTitleAndDescription,
  onAddImage,
  onAddVideo,
  onImportQuestions,
}) => {
  const [showQuestionTypes, setShowQuestionTypes] = useState(false);

  return (
    <div className="toolbar sticky top-24">
      <div className="relative">
        <button
          className="toolbar-button"
          onClick={() => setShowQuestionTypes(!showQuestionTypes)}
          title="Add question"
        >
          <PlusCircle size={24} />
        </button>
        {showQuestionTypes && (
          <div className="dropdown-menu left-full ml-2 top-0">
            {questionTypeOptions.map((option) => (
              <div
                key={option.type}
                className="dropdown-item"
                onClick={() => {
                  onAddQuestion(option.type);
                  setShowQuestionTypes(false);
                }}
              >
                {option.icon}
                <span>{option.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <button
        className="toolbar-button"
        onClick={onImportQuestions}
        title="Import questions"
      >
        <Import size={24} />
      </button>
      <button
        className="toolbar-button"
        onClick={onAddTitleAndDescription}
        title="Add title and description"
      >
        <Type size={24} />
      </button>
      <button
        className="toolbar-button"
        onClick={onAddImage}
        title="Add image"
      >
        <Image size={24} />
      </button>
      <button
        className="toolbar-button"
        onClick={onAddVideo}
        title="Add video"
      >
        <Video size={24} />
      </button>
      <button
        className="toolbar-button"
        onClick={onAddSection}
        title="Add section"
      >
        <SeparatorHorizontal size={24} />
      </button>
    </div>
  );
};
