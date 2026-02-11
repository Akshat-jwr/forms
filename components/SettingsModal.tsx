'use client';

import React from 'react';
import { X } from 'lucide-react';
import { FormSettings } from '@/types/form';

interface SettingsModalProps {
  settings: FormSettings;
  onUpdateSettings: (updates: Partial<FormSettings>) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="text-xl font-medium">Settings</h2>
          <button className="p-2 hover:bg-hover rounded" onClick={onClose}>
            <X size={20} className="text-text-secondary" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Defaults section */}
          <div>
            <h3 className="text-sm font-medium text-text-secondary uppercase mb-4">Defaults</h3>

            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Make questions required by default</div>
                </div>
                <button
                  className={`toggle-switch ${settings.collectEmails ? 'active' : ''}`}
                  onClick={() => onUpdateSettings({ collectEmails: !settings.collectEmails })}
                />
              </label>
            </div>
          </div>

          {/* Responses section */}
          <div>
            <h3 className="text-sm font-medium text-text-secondary uppercase mb-4">Responses</h3>

            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Collect email addresses</div>
                  <div className="text-sm text-text-secondary">
                    Respondents will be required to sign in to Google
                  </div>
                </div>
                <button
                  className={`toggle-switch ${settings.collectEmails ? 'active' : ''}`}
                  onClick={() => onUpdateSettings({ collectEmails: !settings.collectEmails })}
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
                  className={`toggle-switch ${settings.editAfterSubmit ? 'active' : ''}`}
                  onClick={() => onUpdateSettings({ editAfterSubmit: !settings.editAfterSubmit })}
                />
              </label>

              <label className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Limit to 1 response</div>
                  <div className="text-sm text-text-secondary">
                    Requires sign-in, only for Google Workspace
                  </div>
                </div>
                <button
                  className={`toggle-switch ${settings.limitOneResponse ? 'active' : ''}`}
                  onClick={() => onUpdateSettings({ limitOneResponse: !settings.limitOneResponse })}
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
                  className={`toggle-switch ${settings.showProgressBar ? 'active' : ''}`}
                  onClick={() => onUpdateSettings({ showProgressBar: !settings.showProgressBar })}
                />
              </label>

              <label className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Shuffle question order</div>
                </div>
                <button
                  className={`toggle-switch ${settings.shuffleQuestions ? 'active' : ''}`}
                  onClick={() => onUpdateSettings({ shuffleQuestions: !settings.shuffleQuestions })}
                />
              </label>

              <div>
                <div className="font-medium mb-2">Confirmation message</div>
                <textarea
                  className="w-full border border-border rounded p-3 text-sm resize-none"
                  rows={3}
                  value={settings.confirmationMessage}
                  onChange={(e) => onUpdateSettings({ confirmationMessage: e.target.value })}
                  placeholder="Your response has been recorded."
                />
              </div>
            </div>
          </div>

          {/* Quiz section */}
          <div>
            <h3 className="text-sm font-medium text-text-secondary uppercase mb-4">Quizzes</h3>

            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Make this a quiz</div>
                  <div className="text-sm text-text-secondary">
                    Assign point values and provide feedback
                  </div>
                </div>
                <button
                  className={`toggle-switch ${settings.isQuiz ? 'active' : ''}`}
                  onClick={() => onUpdateSettings({ isQuiz: !settings.isQuiz })}
                />
              </label>

              {settings.isQuiz && (
                <>
                  <div>
                    <div className="font-medium mb-2">Release grade</div>
                    <select
                      className="w-full border border-border rounded p-2"
                      value={settings.releaseGrades}
                      onChange={(e) => onUpdateSettings({ releaseGrades: e.target.value as FormSettings['releaseGrades'] })}
                    >
                      <option value="immediately">Immediately after each submission</option>
                      <option value="later">Later, after manual review</option>
                      <option value="after_manual_review">After manual review</option>
                    </select>
                  </div>

                  <div>
                    <div className="font-medium mb-2">Respondent can see</div>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={settings.showMissedQuestions}
                          onChange={(e) => onUpdateSettings({ showMissedQuestions: e.target.checked })}
                        />
                        <span className="text-sm">Missed questions</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={settings.showCorrectAnswers}
                          onChange={(e) => onUpdateSettings({ showCorrectAnswers: e.target.checked })}
                        />
                        <span className="text-sm">Correct answers</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={settings.showPointValues}
                          onChange={(e) => onUpdateSettings({ showPointValues: e.target.checked })}
                        />
                        <span className="text-sm">Point values</span>
                      </label>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Proctoring section */}
          <div>
            <h3 className="text-sm font-medium text-text-secondary uppercase mb-4">Proctoring</h3>

            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Enable AI Proctoring</div>
                  <div className="text-sm text-text-secondary">
                    Uses camera to detect prohibited items and monitor test-taker presence
                  </div>
                </div>
                <button
                  className={`toggle-switch ${settings.proctoringEnabled ? 'active' : ''}`}
                  onClick={() => onUpdateSettings({ proctoringEnabled: !settings.proctoringEnabled })}
                />
              </label>

              {settings.proctoringEnabled && (
                <div className="text-xs text-text-secondary bg-hover rounded p-3">
                  <strong>When enabled:</strong>
                  <ul className="mt-1 ml-4 list-disc space-y-1">
                    <li>Camera access is required for respondents</li>
                    <li>AI detects absence, multiple people, phones, books, and laptops</li>
                    <li>Tab switching is tracked and flagged</li>
                    <li>All violations are logged for review</li>
                  </ul>
                </div>
              )}
            </div>
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
                className={`toggle-switch ${settings.acceptingResponses ? 'active' : ''}`}
                onClick={() => onUpdateSettings({ acceptingResponses: !settings.acceptingResponses })}
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
