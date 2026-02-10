'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useFormStore } from '@/store';
import { QuestionType, QuestionResponse } from '@/types/form';
import {
  QuestionEditor,
  FloatingToolbar,
  SectionEditor,
  ThemeCustomizer,
  SettingsModal,
  FormEditorHeader,
  SendFormModal,
  ResponsesSummary,
} from '@/components';

export default function FormEditorPage() {
  const params = useParams();
  const router = useRouter();
  const formId = params.id as string;

  const {
    forms,
    currentForm,
    setCurrentForm,
    updateForm,
    addSection,
    updateSection,
    deleteSection,
    moveSection,
    duplicateSection,
    mergeSections,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    duplicateQuestion,
    addOption,
    updateOption,
    deleteOption,
    updateTheme,
    updateSettings,
    getFormResponses,
    deleteResponse,
  } = useFormStore();

  const [activeTab, setActiveTab] = useState<'questions' | 'responses' | 'settings'>('questions');
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setCurrentForm(formId);
    return () => setCurrentForm(null);
  }, [formId, setCurrentForm]);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-google-purple border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!currentForm) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-medium mb-4">Form not found</h1>
          <button
            className="text-google-purple hover:underline"
            onClick={() => router.push('/')}
          >
            Go back to forms
          </button>
        </div>
      </div>
    );
  }

  const responses = getFormResponses(formId);

  const handleAddQuestion = (type: QuestionType) => {
    const currentSection = currentForm.sections[0];
    addQuestion(formId, currentSection.id, type);
  };

  const handlePreview = () => {
    window.open(`/forms/${formId}/viewform`, '_blank');
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: currentForm.theme.backgroundColor }}>
      <FormEditorHeader
        form={currentForm}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onTitleChange={(title) => updateForm(formId, { title })}
        onOpenTheme={() => setIsThemeOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onPreview={handlePreview}
        onSend={() => setIsSendModalOpen(true)}
        responseCount={responses.length}
      />

      {activeTab === 'questions' && (
        <div className="max-w-3xl mx-auto py-6 px-4 flex gap-4">
          {/* Main content */}
          <div className="flex-1">
            {currentForm.sections.map((section, sectionIndex) => (
              <SectionEditor
                key={section.id}
                section={section}
                sectionIndex={sectionIndex}
                totalSections={currentForm.sections.length}
                formId={formId}
                isSelected={selectedSectionId === section.id}
                onSelect={() => {
                  setSelectedSectionId(section.id);
                  setSelectedQuestionId(null);
                }}
                onUpdateTitle={(title) => updateSection(formId, section.id, { title })}
                onUpdateDescription={(description) => updateSection(formId, section.id, { description })}
                onDuplicate={() => duplicateSection(formId, section.id)}
                onDelete={() => deleteSection(formId, section.id)}
                onMoveUp={() => moveSection(formId, sectionIndex, sectionIndex - 1)}
                onMoveDown={() => moveSection(formId, sectionIndex, sectionIndex + 1)}
                onMerge={() => mergeSections(formId, section.id)}
              >
                {/* Form header card (only in first section) */}
                {sectionIndex === 0 && (
                  <div
                    className="form-card overflow-hidden mb-4"
                    onClick={() => {
                      setSelectedSectionId(section.id);
                      setSelectedQuestionId(null);
                    }}
                  >
                    <div
                      className="h-3"
                      style={{ backgroundColor: currentForm.theme.headerColor }}
                    />
                    <div className="p-6">
                      <input
                        type="text"
                        className="form-input text-3xl font-medium mb-2"
                        value={currentForm.title}
                        onChange={(e) => updateForm(formId, { title: e.target.value })}
                        placeholder="Untitled form"
                      />
                      <input
                        type="text"
                        className="form-input text-sm"
                        value={currentForm.description || ''}
                        onChange={(e) => updateForm(formId, { description: e.target.value })}
                        placeholder="Form description"
                      />
                    </div>
                  </div>
                )}

                {/* Questions */}
                {section.questions.map((question, questionIndex) => (
                  <QuestionEditor
                    key={question.id}
                    question={question}
                    sectionId={section.id}
                    formId={formId}
                    isSelected={selectedQuestionId === question.id}
                    onSelect={() => {
                      setSelectedQuestionId(question.id);
                      setSelectedSectionId(null);
                    }}
                    onUpdate={(updates) => updateQuestion(formId, section.id, question.id, updates)}
                    onDelete={() => deleteQuestion(formId, section.id, question.id)}
                    onDuplicate={() => duplicateQuestion(formId, section.id, question.id)}
                    onAddOption={() => addOption(formId, section.id, question.id)}
                    onUpdateOption={(optionId, value) => updateOption(formId, section.id, question.id, optionId, value)}
                    onDeleteOption={(optionId) => deleteOption(formId, section.id, question.id, optionId)}
                  />
                ))}
              </SectionEditor>
            ))}
          </div>

          {/* Floating toolbar */}
          <div className="w-14">
            <FloatingToolbar
              onAddQuestion={handleAddQuestion}
              onAddSection={() => addSection(formId)}
              onAddTitleAndDescription={() => {
                // Add a new title/description section
              }}
              onAddImage={() => {
                // Add image functionality
              }}
              onAddVideo={() => {
                // Add video functionality
              }}
              onImportQuestions={() => {
                // Import questions functionality
              }}
            />
          </div>
        </div>
      )}

      {activeTab === 'responses' && (
        <ResponsesSummary
          form={currentForm}
          responses={responses}
          onDeleteResponse={(responseId) => deleteResponse(formId, responseId)}
        />
      )}

      {activeTab === 'settings' && (
        <div className="max-w-3xl mx-auto py-6 px-4">
          <div className="form-card p-6">
            <h2 className="text-xl font-medium mb-6">Form Settings</h2>
            
            <div className="space-y-6">
              {/* Responses section */}
              <div>
                <h3 className="text-sm font-medium text-text-secondary uppercase mb-4">Responses</h3>
                
                <div className="space-y-4">
                  <label className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Collect email addresses</div>
                      <div className="text-sm text-text-secondary">
                        Respondents will be required to sign in
                      </div>
                    </div>
                    <button
                      className={`toggle-switch ${currentForm.settings.collectEmails ? 'active' : ''}`}
                      onClick={() => updateSettings(formId, { collectEmails: !currentForm.settings.collectEmails })}
                    />
                  </label>

                  <label className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Allow response editing</div>
                      <div className="text-sm text-text-secondary">
                        Respondents can change their responses after submitting
                      </div>
                    </div>
                    <button
                      className={`toggle-switch ${currentForm.settings.editAfterSubmit ? 'active' : ''}`}
                      onClick={() => updateSettings(formId, { editAfterSubmit: !currentForm.settings.editAfterSubmit })}
                    />
                  </label>

                  <label className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Limit to 1 response</div>
                    </div>
                    <button
                      className={`toggle-switch ${currentForm.settings.limitOneResponse ? 'active' : ''}`}
                      onClick={() => updateSettings(formId, { limitOneResponse: !currentForm.settings.limitOneResponse })}
                    />
                  </label>
                </div>
              </div>

              {/* Presentation section */}
              <div>
                <h3 className="text-sm font-medium text-text-secondary uppercase mb-4">Presentation</h3>
                
                <div className="space-y-4">
                  <label className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Show progress bar</div>
                    </div>
                    <button
                      className={`toggle-switch ${currentForm.settings.showProgressBar ? 'active' : ''}`}
                      onClick={() => updateSettings(formId, { showProgressBar: !currentForm.settings.showProgressBar })}
                    />
                  </label>

                  <label className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Shuffle question order</div>
                    </div>
                    <button
                      className={`toggle-switch ${currentForm.settings.shuffleQuestions ? 'active' : ''}`}
                      onClick={() => updateSettings(formId, { shuffleQuestions: !currentForm.settings.shuffleQuestions })}
                    />
                  </label>

                  <div>
                    <div className="font-medium mb-2">Confirmation message</div>
                    <textarea
                      className="w-full border border-border rounded p-3 text-sm resize-none"
                      rows={3}
                      value={currentForm.settings.confirmationMessage}
                      onChange={(e) => updateSettings(formId, { confirmationMessage: e.target.value })}
                      placeholder="Your response has been recorded."
                    />
                  </div>
                </div>
              </div>

              {/* Quiz section */}
              <div>
                <h3 className="text-sm font-medium text-text-secondary uppercase mb-4">Quizzes</h3>
                
                <label className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Make this a quiz</div>
                    <div className="text-sm text-text-secondary">
                      Assign point values and provide feedback
                    </div>
                  </div>
                  <button
                    className={`toggle-switch ${currentForm.settings.isQuiz ? 'active' : ''}`}
                    onClick={() => updateSettings(formId, { isQuiz: !currentForm.settings.isQuiz })}
                  />
                </label>
              </div>

              {/* Form Status */}
              <div>
                <h3 className="text-sm font-medium text-text-secondary uppercase mb-4">Form status</h3>
                
                <label className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Accepting responses</div>
                    <div className="text-sm text-text-secondary">
                      Turn off to stop collecting responses
                    </div>
                  </div>
                  <button
                    className={`toggle-switch ${currentForm.settings.acceptingResponses ? 'active' : ''}`}
                    onClick={() => updateSettings(formId, { acceptingResponses: !currentForm.settings.acceptingResponses })}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Theme customizer sidebar */}
      <ThemeCustomizer
        theme={currentForm.theme}
        onUpdateTheme={(updates) => updateTheme(formId, updates)}
        isOpen={isThemeOpen}
        onClose={() => setIsThemeOpen(false)}
      />

      {/* Settings modal */}
      <SettingsModal
        settings={currentForm.settings}
        onUpdateSettings={(updates) => updateSettings(formId, updates)}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Send form modal */}
      <SendFormModal
        formId={formId}
        formTitle={currentForm.title}
        isOpen={isSendModalOpen}
        onClose={() => setIsSendModalOpen(false)}
      />
    </div>
  );
}
