'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useFormStore } from '@/store';
import { QuestionResponse } from '@/types/form';
import { FormResponseView } from '@/components';

export default function ViewFormPage() {
  const params = useParams();
  const formId = params.id as string;

  const { forms, submitResponse } = useFormStore();
  const [responses, setResponses] = useState<QuestionResponse[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-google-purple border-t-transparent rounded-full" />
      </div>
    );
  }

  const form = forms.find((f) => f.id === formId);

  if (!form) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-google-purple-light">
        <div className="form-card p-8 max-w-lg text-center">
          <h1 className="text-2xl font-medium mb-4">Form not found</h1>
          <p className="text-text-secondary">
            The form you&apos;re looking for doesn&apos;t exist or has been deleted.
          </p>
        </div>
      </div>
    );
  }

  if (!form.settings.acceptingResponses) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: form.theme.backgroundColor }}>
        <div className="form-card p-8 max-w-lg">
          <div className="h-3 -mt-8 -mx-8 mb-6 rounded-t" style={{ backgroundColor: form.theme.headerColor }} />
          <h1 className="text-2xl font-medium mb-4">{form.title}</h1>
          <p className="text-text-secondary">
            This form is no longer accepting responses.
          </p>
        </div>
      </div>
    );
  }

  const handleResponseChange = (questionId: string, response: QuestionResponse) => {
    setResponses((prev) => {
      const existing = prev.findIndex((r) => r.questionId === questionId);
      if (existing >= 0) {
        const newResponses = [...prev];
        newResponses[existing] = response;
        return newResponses;
      }
      return [...prev, response];
    });
  };

  const handleSubmit = () => {
    submitResponse(formId, responses);
  };

  const handleClear = () => {
    setResponses([]);
  };

  return (
    <FormResponseView
      sections={form.sections}
      responses={responses}
      onResponseChange={handleResponseChange}
      onSubmit={handleSubmit}
      onClear={handleClear}
      headerColor={form.theme.headerColor}
      backgroundColor={form.theme.backgroundColor}
      title={form.title}
      description={form.description}
      showProgressBar={form.settings.showProgressBar}
    />
  );
}
