'use client';

import React, { useState } from 'react';
import { Question, QuestionResponse, Section } from '@/types/form';
import { Check, ChevronDown, ChevronUp, Upload, X } from 'lucide-react';

interface QuestionResponseViewProps {
  question: Question;
  response: QuestionResponse | undefined;
  onResponseChange: (response: QuestionResponse) => void;
  questionNumber: number;
}

export const QuestionResponseView: React.FC<QuestionResponseViewProps> = ({
  question,
  response,
  onResponseChange,
  questionNumber,
}) => {
  const [otherText, setOtherText] = useState('');

  const handleValueChange = (value: string | string[]) => {
    onResponseChange({
      questionId: question.id,
      value,
    });
  };

  const handleCheckboxChange = (optionId: string, checked: boolean) => {
    const currentValues = (response?.value as string[]) || [];
    let newValues: string[];
    
    if (checked) {
      newValues = [...currentValues, optionId];
    } else {
      newValues = currentValues.filter((v) => v !== optionId);
    }
    
    handleValueChange(newValues);
  };

  const handleGridChange = (rowId: string, value: string | string[]) => {
    const currentGrid = (response?.value as { [rowId: string]: string | string[] }) || {};
    onResponseChange({
      questionId: question.id,
      value: {
        ...currentGrid,
        [rowId]: value,
      },
    });
  };

  const renderQuestionInput = () => {
    switch (question.type) {
      case 'short_answer':
        return (
          <input
            type="text"
            className="response-input"
            placeholder="Your answer"
            value={(response?.value as string) || ''}
            onChange={(e) => handleValueChange(e.target.value)}
          />
        );

      case 'paragraph':
        return (
          <textarea
            className="response-input resize-none"
            rows={4}
            placeholder="Your answer"
            value={(response?.value as string) || ''}
            onChange={(e) => handleValueChange(e.target.value)}
          />
        );

      case 'multiple_choice':
        return (
          <div className="space-y-3">
            {question.options?.map((option) => (
              <label key={option.id} className="response-option cursor-pointer">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    response?.value === option.id
                      ? 'border-google-purple bg-google-purple'
                      : 'border-border'
                  }`}
                >
                  {response?.value === option.id && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
                <span>{option.value}</span>
              </label>
            ))}
            {question.hasOtherOption && (
              <label className="response-option cursor-pointer">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    response?.value === 'other'
                      ? 'border-google-purple bg-google-purple'
                      : 'border-border'
                  }`}
                  onClick={() => handleValueChange('other')}
                >
                  {response?.value === 'other' && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
                <span>Other:</span>
                <input
                  type="text"
                  className="form-input flex-1"
                  value={otherText}
                  onChange={(e) => setOtherText(e.target.value)}
                  onClick={() => handleValueChange('other')}
                />
              </label>
            )}
          </div>
        );

      case 'checkboxes':
        return (
          <div className="space-y-3">
            {question.options?.map((option) => {
              const isChecked = ((response?.value as string[]) || []).includes(option.id);
              return (
                <label key={option.id} className="response-option cursor-pointer">
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      isChecked ? 'border-google-purple bg-google-purple' : 'border-border'
                    }`}
                    onClick={() => handleCheckboxChange(option.id, !isChecked)}
                  >
                    {isChecked && <Check size={14} className="text-white" />}
                  </div>
                  <span>{option.value}</span>
                </label>
              );
            })}
            {question.hasOtherOption && (
              <label className="response-option cursor-pointer">
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    ((response?.value as string[]) || []).includes('other')
                      ? 'border-google-purple bg-google-purple'
                      : 'border-border'
                  }`}
                  onClick={() => handleCheckboxChange('other', !((response?.value as string[]) || []).includes('other'))}
                >
                  {((response?.value as string[]) || []).includes('other') && <Check size={14} className="text-white" />}
                </div>
                <span>Other:</span>
                <input
                  type="text"
                  className="form-input flex-1"
                  value={otherText}
                  onChange={(e) => setOtherText(e.target.value)}
                />
              </label>
            )}
          </div>
        );

      case 'dropdown':
        return (
          <select
            className="response-input cursor-pointer"
            value={(response?.value as string) || ''}
            onChange={(e) => handleValueChange(e.target.value)}
          >
            <option value="">Choose</option>
            {question.options?.map((option) => (
              <option key={option.id} value={option.id}>
                {option.value}
              </option>
            ))}
          </select>
        );

      case 'linear_scale':
        const { minValue = 1, maxValue = 5, minLabel, maxLabel } = question.linearScale || {};
        const scaleValues = Array.from(
          { length: maxValue - minValue + 1 },
          (_, i) => minValue + i
        );
        return (
          <div className="flex items-center gap-2">
            {minLabel && <span className="text-sm text-text-secondary">{minLabel}</span>}
            <div className="flex gap-2">
              {scaleValues.map((value) => (
                <label key={value} className="flex flex-col items-center gap-1 cursor-pointer">
                  <span className="text-sm">{value}</span>
                  <div
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                      response?.value === String(value)
                        ? 'border-google-purple bg-google-purple'
                        : 'border-border hover:bg-hover'
                    }`}
                    onClick={() => handleValueChange(String(value))}
                  >
                    {response?.value === String(value) && (
                      <div className="w-3 h-3 rounded-full bg-white" />
                    )}
                  </div>
                </label>
              ))}
            </div>
            {maxLabel && <span className="text-sm text-text-secondary">{maxLabel}</span>}
          </div>
        );

      case 'multiple_choice_grid':
        return (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="p-2"></th>
                  {question.columns?.map((column) => (
                    <th key={column.id} className="p-2 text-center text-sm font-medium">
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {question.rows?.map((row) => {
                  const gridResponse = response?.value as { [rowId: string]: string } | undefined;
                  return (
                    <tr key={row.id} className="border-t border-border">
                      <td className="p-2 text-sm">{row.label}</td>
                      {question.columns?.map((column) => (
                        <td key={column.id} className="p-2 text-center">
                          <div
                            className={`w-5 h-5 mx-auto rounded-full border-2 cursor-pointer ${
                              gridResponse?.[row.id] === column.id
                                ? 'border-google-purple bg-google-purple'
                                : 'border-border hover:bg-hover'
                            }`}
                            onClick={() => handleGridChange(row.id, column.id)}
                          >
                            {gridResponse?.[row.id] === column.id && (
                              <div className="w-2 h-2 mx-auto mt-0.5 rounded-full bg-white" />
                            )}
                          </div>
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );

      case 'checkbox_grid':
        return (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="p-2"></th>
                  {question.columns?.map((column) => (
                    <th key={column.id} className="p-2 text-center text-sm font-medium">
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {question.rows?.map((row) => {
                  const gridResponse = response?.value as { [rowId: string]: string[] } | undefined;
                  const rowValues = gridResponse?.[row.id] || [];
                  return (
                    <tr key={row.id} className="border-t border-border">
                      <td className="p-2 text-sm">{row.label}</td>
                      {question.columns?.map((column) => {
                        const isChecked = rowValues.includes(column.id);
                        return (
                          <td key={column.id} className="p-2 text-center">
                            <div
                              className={`w-5 h-5 mx-auto rounded border-2 cursor-pointer flex items-center justify-center ${
                                isChecked
                                  ? 'border-google-purple bg-google-purple'
                                  : 'border-border hover:bg-hover'
                              }`}
                              onClick={() => {
                                const newValues = isChecked
                                  ? rowValues.filter((v) => v !== column.id)
                                  : [...rowValues, column.id];
                                handleGridChange(row.id, newValues);
                              }}
                            >
                              {isChecked && <Check size={12} className="text-white" />}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );

      case 'date':
        return (
          <input
            type="date"
            className="response-input"
            value={(response?.value as string) || ''}
            onChange={(e) => handleValueChange(e.target.value)}
          />
        );

      case 'time':
        return (
          <input
            type="time"
            className="response-input"
            value={(response?.value as string) || ''}
            onChange={(e) => handleValueChange(e.target.value)}
          />
        );

      case 'file_upload':
        return (
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
            <Upload size={48} className="mx-auto text-text-secondary mb-4" />
            <button className="px-4 py-2 border border-google-blue text-google-blue rounded hover:bg-hover">
              Add file
            </button>
            <p className="text-sm text-text-secondary mt-2">
              or drag files here
            </p>
            <p className="text-xs text-text-secondary mt-1">
              Max {question.fileUploadConfig?.maxFiles || 1} file(s), 
              {question.fileUploadConfig?.maxFileSize || 10} MB each
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="question-card">
      <div className="flex items-start gap-2 mb-4">
        <span className="text-base">
          {question.title || 'Question'}
          {question.required && <span className="text-google-red ml-1">*</span>}
        </span>
      </div>
      {question.description && (
        <p className="text-sm text-text-secondary mb-4">{question.description}</p>
      )}
      {renderQuestionInput()}
    </div>
  );
};

interface FormResponseViewProps {
  sections: Section[];
  responses: QuestionResponse[];
  onResponseChange: (questionId: string, response: QuestionResponse) => void;
  onSubmit: () => void;
  onClear: () => void;
  headerColor: string;
  backgroundColor: string;
  title: string;
  description?: string;
  showProgressBar?: boolean;
}

export const FormResponseView: React.FC<FormResponseViewProps> = ({
  sections,
  responses,
  onResponseChange,
  onSubmit,
  onClear,
  headerColor,
  backgroundColor,
  title,
  description,
  showProgressBar = true,
}) => {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const allQuestions = sections.flatMap((s) => s.questions);
  const answeredQuestions = responses.length;
  const totalQuestions = allQuestions.filter((q) => q.required).length;
  const progress = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;

  const currentSection = sections[currentSectionIndex];
  let questionNumber = 0;

  for (let i = 0; i < currentSectionIndex; i++) {
    questionNumber += sections[i].questions.length;
  }

  const handleSubmit = () => {
    // Validate required questions
    const missingRequired = allQuestions.filter(
      (q) => q.required && !responses.find((r) => r.questionId === q.id)?.value
    );

    if (missingRequired.length > 0) {
      alert('Please answer all required questions');
      return;
    }

    setSubmitted(true);
    onSubmit();
  };

  if (submitted) {
    return (
      <div className="min-h-screen" style={{ backgroundColor }}>
        <div className="max-w-2xl mx-auto py-8 px-4">
          <div className="form-card overflow-hidden">
            <div className="h-3" style={{ backgroundColor: headerColor }} />
            <div className="p-6">
              <h1 className="text-2xl font-medium mb-4">{title}</h1>
              <p className="text-text-secondary">Your response has been recorded.</p>
              <div className="mt-6">
                <button
                  className="text-google-purple hover:underline"
                  onClick={() => {
                    setSubmitted(false);
                    onClear();
                  }}
                >
                  Submit another response
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor }}>
      <div className="max-w-2xl mx-auto py-8 px-4">
        {/* Progress bar */}
        {showProgressBar && sections.length > 1 && (
          <div className="progress-bar mb-4">
            <div
              className="progress-bar-fill"
              style={{ width: `${((currentSectionIndex + 1) / sections.length) * 100}%` }}
            />
          </div>
        )}

        {/* Form header */}
        <div className="form-card overflow-hidden mb-4">
          <div className="h-3" style={{ backgroundColor: headerColor }} />
          <div className="p-6">
            <h1 className="text-3xl font-medium">{title}</h1>
            {description && (
              <p className="text-text-secondary mt-2 whitespace-pre-wrap">{description}</p>
            )}
            <p className="text-sm text-google-red mt-4">* Required</p>
          </div>
        </div>

        {/* Section header (for multi-section forms) */}
        {sections.length > 1 && currentSectionIndex > 0 && (
          <div className="form-card overflow-hidden mb-4">
            <div className="h-3" style={{ backgroundColor: headerColor }} />
            <div className="p-6">
              <h2 className="text-xl font-medium">{currentSection.title}</h2>
              {currentSection.description && (
                <p className="text-text-secondary mt-2">{currentSection.description}</p>
              )}
              <p className="text-sm text-text-secondary mt-4">
                Section {currentSectionIndex} of {sections.length - 1}
              </p>
            </div>
          </div>
        )}

        {/* Questions */}
        {currentSection.questions.map((question, index) => (
          <QuestionResponseView
            key={question.id}
            question={question}
            response={responses.find((r) => r.questionId === question.id)}
            onResponseChange={(response) => onResponseChange(question.id, response)}
            questionNumber={questionNumber + index + 1}
          />
        ))}

        {/* Navigation buttons */}
        <div className="flex items-center justify-between mt-6">
          <div>
            {sections.length > 1 && currentSectionIndex > 0 && (
              <button
                className="px-6 py-2 text-google-purple hover:bg-hover rounded"
                onClick={() => setCurrentSectionIndex(currentSectionIndex - 1)}
              >
                Back
              </button>
            )}
          </div>
          <div className="flex items-center gap-4">
            <button
              className="text-google-purple hover:underline"
              onClick={onClear}
            >
              Clear form
            </button>
            {currentSectionIndex < sections.length - 1 ? (
              <button
                className="px-6 py-2 bg-google-purple text-white rounded hover:shadow-md"
                onClick={() => setCurrentSectionIndex(currentSectionIndex + 1)}
              >
                Next
              </button>
            ) : (
              <button
                className="px-6 py-2 bg-google-purple text-white rounded hover:shadow-md"
                onClick={handleSubmit}
              >
                Submit
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
