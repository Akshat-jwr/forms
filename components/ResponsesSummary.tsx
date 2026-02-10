'use client';

import React, { useState } from 'react';
import { Form, FormResponse, QuestionResponse } from '@/types/form';
import { 
  ChevronDown, 
  ChevronUp, 
  Download, 
  Trash2, 
  FileSpreadsheet,
  User,
  Clock
} from 'lucide-react';

interface ResponsesSummaryProps {
  form: Form;
  responses: FormResponse[];
  onDeleteResponse: (responseId: string) => void;
}

export const ResponsesSummary: React.FC<ResponsesSummaryProps> = ({
  form,
  responses,
  onDeleteResponse,
}) => {
  const [viewMode, setViewMode] = useState<'summary' | 'individual'>('summary');
  const [selectedResponseIndex, setSelectedResponseIndex] = useState(0);

  const allQuestions = form.sections.flatMap((s) => s.questions);

  const getQuestionResponses = (questionId: string) => {
    return responses
      .map((r) => r.responses.find((qr) => qr.questionId === questionId)?.value)
      .filter(Boolean);
  };

  const getOptionStats = (questionId: string, options: { id: string; value: string }[]) => {
    const questionResponses = getQuestionResponses(questionId);
    return options.map((option) => {
      const count = questionResponses.filter((r) => {
        if (Array.isArray(r)) {
          return (r as string[]).includes(option.id);
        }
        return r === option.id;
      }).length;
      return {
        ...option,
        count,
        percentage: responses.length > 0 ? (count / responses.length) * 100 : 0,
      };
    });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  const getResponseValue = (questionId: string, questionType: string, response: QuestionResponse | undefined) => {
    if (!response?.value) return '-';
    
    const question = allQuestions.find((q) => q.id === questionId);
    if (!question) return String(response.value);

    switch (questionType) {
      case 'multiple_choice':
      case 'dropdown':
        const option = question.options?.find((o) => o.id === response.value);
        return option?.value || (response.value === 'other' ? 'Other' : String(response.value));
      
      case 'checkboxes':
        const values = response.value as string[];
        return values
          .map((v) => {
            const opt = question.options?.find((o) => o.id === v);
            return opt?.value || (v === 'other' ? 'Other' : v);
          })
          .join(', ');
      
      case 'linear_scale':
        return String(response.value);
      
      case 'multiple_choice_grid':
      case 'checkbox_grid':
        const gridValue = response.value as { [rowId: string]: string | string[] };
        return Object.entries(gridValue)
          .map(([rowId, colVal]) => {
            const row = question.rows?.find((r) => r.id === rowId);
            if (Array.isArray(colVal)) {
              const cols = colVal.map((v) => question.columns?.find((c) => c.id === v)?.label).join(', ');
              return `${row?.label}: ${cols}`;
            }
            const col = question.columns?.find((c) => c.id === colVal);
            return `${row?.label}: ${col?.label}`;
          })
          .join('\n');
      
      default:
        return String(response.value);
    }
  };

  if (responses.length === 0) {
    return (
      <div className="max-w-3xl mx-auto py-8">
        <div className="text-center py-16">
          <FileSpreadsheet size={64} className="mx-auto text-text-secondary mb-4" />
          <h2 className="text-xl font-medium mb-2">No responses yet</h2>
          <p className="text-text-secondary">Share your form to start collecting responses</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <span className="text-2xl font-medium">{responses.length}</span>
          <span className="text-text-secondary">response{responses.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 hover:bg-hover rounded">
            <Download size={20} className="text-text-secondary" />
            <span>Download responses</span>
          </button>
        </div>
      </div>

      {/* View mode toggle */}
      <div className="flex border-b border-border mb-6">
        <button
          className={`px-6 py-3 relative ${viewMode === 'summary' ? 'text-google-purple' : 'text-text-secondary'}`}
          onClick={() => setViewMode('summary')}
        >
          Summary
          {viewMode === 'summary' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-google-purple" />
          )}
        </button>
        <button
          className={`px-6 py-3 relative ${viewMode === 'individual' ? 'text-google-purple' : 'text-text-secondary'}`}
          onClick={() => setViewMode('individual')}
        >
          Individual
          {viewMode === 'individual' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-google-purple" />
          )}
        </button>
      </div>

      {viewMode === 'summary' ? (
        /* Summary view */
        <div className="space-y-6">
          {allQuestions.map((question) => (
            <div key={question.id} className="form-card p-6">
              <h3 className="font-medium mb-4">{question.title || 'Untitled Question'}</h3>
              <p className="text-sm text-text-secondary mb-4">
                {getQuestionResponses(question.id).length} response{getQuestionResponses(question.id).length !== 1 ? 's' : ''}
              </p>

              {['multiple_choice', 'checkboxes', 'dropdown'].includes(question.type) && question.options && (
                <div className="space-y-3">
                  {getOptionStats(question.id, question.options).map((stat) => (
                    <div key={stat.id}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">{stat.value}</span>
                        <span className="text-sm text-text-secondary">
                          {stat.count} ({Math.round(stat.percentage)}%)
                        </span>
                      </div>
                      <div className="h-6 bg-hover rounded overflow-hidden">
                        <div
                          className="chart-bar"
                          style={{ width: `${stat.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {['short_answer', 'paragraph'].includes(question.type) && (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {getQuestionResponses(question.id).map((response, index) => (
                    <div key={index} className="p-3 bg-hover rounded text-sm">
                      {String(response)}
                    </div>
                  ))}
                </div>
              )}

              {question.type === 'linear_scale' && (
                <div className="flex items-end gap-2 h-32">
                  {Array.from(
                    { length: (question.linearScale?.maxValue || 5) - (question.linearScale?.minValue || 1) + 1 },
                    (_, i) => (question.linearScale?.minValue || 1) + i
                  ).map((value) => {
                    const count = getQuestionResponses(question.id).filter((r) => String(r) === String(value)).length;
                    const percentage = responses.length > 0 ? (count / responses.length) * 100 : 0;
                    return (
                      <div key={value} className="flex-1 flex flex-col items-center">
                        <div
                          className="w-full bg-google-blue rounded-t"
                          style={{ height: `${percentage}%`, minHeight: count > 0 ? '4px' : '0' }}
                        />
                        <span className="text-sm mt-2">{value}</span>
                        <span className="text-xs text-text-secondary">{count}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {question.type === 'date' && (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {getQuestionResponses(question.id).map((response, index) => (
                    <div key={index} className="p-3 bg-hover rounded text-sm">
                      {new Date(String(response)).toLocaleDateString()}
                    </div>
                  ))}
                </div>
              )}

              {question.type === 'time' && (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {getQuestionResponses(question.id).map((response, index) => (
                    <div key={index} className="p-3 bg-hover rounded text-sm">
                      {String(response)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        /* Individual response view */
        <div>
          <div className="flex items-center justify-between mb-6">
            <button
              className="p-2 hover:bg-hover rounded disabled:opacity-50"
              disabled={selectedResponseIndex === 0}
              onClick={() => setSelectedResponseIndex(selectedResponseIndex - 1)}
            >
              <ChevronUp size={24} className="text-text-secondary" />
            </button>
            <span className="text-text-secondary">
              {selectedResponseIndex + 1} of {responses.length}
            </span>
            <button
              className="p-2 hover:bg-hover rounded disabled:opacity-50"
              disabled={selectedResponseIndex === responses.length - 1}
              onClick={() => setSelectedResponseIndex(selectedResponseIndex + 1)}
            >
              <ChevronDown size={24} className="text-text-secondary" />
            </button>
          </div>

          {responses[selectedResponseIndex] && (
            <div>
              <div className="form-card p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {responses[selectedResponseIndex].respondentEmail && (
                      <div className="flex items-center gap-2 text-sm">
                        <User size={16} className="text-text-secondary" />
                        <span>{responses[selectedResponseIndex].respondentEmail}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                      <Clock size={16} />
                      <span>{formatDate(responses[selectedResponseIndex].submittedAt)}</span>
                    </div>
                  </div>
                  <button
                    className="p-2 hover:bg-hover rounded text-google-red"
                    onClick={() => onDeleteResponse(responses[selectedResponseIndex].id)}
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {allQuestions.map((question) => {
                  const response = responses[selectedResponseIndex].responses.find(
                    (r) => r.questionId === question.id
                  );
                  return (
                    <div key={question.id} className="form-card p-4">
                      <h4 className="text-sm text-text-secondary mb-2">
                        {question.title || 'Untitled Question'}
                      </h4>
                      <p className="whitespace-pre-wrap">
                        {getResponseValue(question.id, question.type, response)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
