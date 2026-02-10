'use client';

import React, { useState } from 'react';
import { X, Link2, Mail, Code, Facebook, Twitter } from 'lucide-react';

interface SendFormModalProps {
  formId: string;
  formTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export const SendFormModal: React.FC<SendFormModalProps> = ({
  formId,
  formTitle,
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'email' | 'link' | 'embed' | 'social'>('link');
  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState(formTitle);
  const [emailMessage, setEmailMessage] = useState('');
  const [shortenUrl, setShortenUrl] = useState(false);

  // For demo purposes - in production this would be a real URL
  const formUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/forms/${formId}/viewform`;
  const shortUrl = shortenUrl ? `https://forms.gle/${formId.slice(0, 8)}` : formUrl;
  const embedCode = `<iframe src="${formUrl}" width="640" height="800" frameborder="0" marginheight="0" marginwidth="0">Loading…</iframe>`;

  if (!isOpen) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // In a real app, show a toast notification
    alert('Copied to clipboard!');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content w-[520px]" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="text-xl font-medium">Send form</h2>
          <button className="p-2 hover:bg-hover rounded" onClick={onClose}>
            <X size={20} className="text-text-secondary" />
          </button>
        </div>

        <div className="p-4">
          {/* Tab buttons */}
          <div className="flex justify-center gap-4 mb-6">
            <button
              className={`p-3 rounded-full ${activeTab === 'email' ? 'bg-google-purple-light' : 'hover:bg-hover'}`}
              onClick={() => setActiveTab('email')}
              title="Send via email"
            >
              <Mail size={24} className={activeTab === 'email' ? 'text-google-purple' : 'text-text-secondary'} />
            </button>
            <button
              className={`p-3 rounded-full ${activeTab === 'link' ? 'bg-google-purple-light' : 'hover:bg-hover'}`}
              onClick={() => setActiveTab('link')}
              title="Get link"
            >
              <Link2 size={24} className={activeTab === 'link' ? 'text-google-purple' : 'text-text-secondary'} />
            </button>
            <button
              className={`p-3 rounded-full ${activeTab === 'embed' ? 'bg-google-purple-light' : 'hover:bg-hover'}`}
              onClick={() => setActiveTab('embed')}
              title="Embed HTML"
            >
              <Code size={24} className={activeTab === 'embed' ? 'text-google-purple' : 'text-text-secondary'} />
            </button>
            <button
              className={`p-3 rounded-full ${activeTab === 'social' ? 'bg-google-purple-light' : 'hover:bg-hover'}`}
              onClick={() => setActiveTab('social')}
              title="Share on social media"
            >
              <Twitter size={24} className={activeTab === 'social' ? 'text-google-purple' : 'text-text-secondary'} />
            </button>
          </div>

          {/* Tab content */}
          {activeTab === 'email' && (
            <div className="space-y-4">
              <div>
                <label className="text-sm text-text-secondary">To</label>
                <input
                  type="email"
                  className="form-input mt-1"
                  placeholder="Enter email addresses, separated by commas"
                  value={emailTo}
                  onChange={(e) => setEmailTo(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm text-text-secondary">Subject</label>
                <input
                  type="text"
                  className="form-input mt-1"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm text-text-secondary">Message</label>
                <textarea
                  className="w-full border border-border rounded p-3 text-sm resize-none mt-1"
                  rows={4}
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  placeholder="Add a message (optional)"
                />
              </div>
              <label className="flex items-center gap-3">
                <input type="checkbox" />
                <span className="text-sm">Include form in email</span>
              </label>
            </div>
          )}

          {activeTab === 'link' && (
            <div className="space-y-4">
              <div>
                <label className="text-sm text-text-secondary">Link</label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="text"
                    className="form-input flex-1"
                    value={shortUrl}
                    readOnly
                  />
                  <button
                    className="px-4 py-2 text-google-purple hover:bg-hover rounded"
                    onClick={() => copyToClipboard(shortUrl)}
                  >
                    Copy
                  </button>
                </div>
              </div>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={shortenUrl}
                  onChange={(e) => setShortenUrl(e.target.checked)}
                />
                <span className="text-sm">Shorten URL</span>
              </label>
            </div>
          )}

          {activeTab === 'embed' && (
            <div className="space-y-4">
              <div>
                <label className="text-sm text-text-secondary">Embed HTML</label>
                <textarea
                  className="w-full border border-border rounded p-3 text-sm font-mono mt-1"
                  rows={4}
                  value={embedCode}
                  readOnly
                />
              </div>
              <div className="flex items-center gap-4">
                <div>
                  <label className="text-sm text-text-secondary">Width</label>
                  <input
                    type="number"
                    className="form-input mt-1 w-24"
                    defaultValue={640}
                  />
                </div>
                <div>
                  <label className="text-sm text-text-secondary">Height</label>
                  <input
                    type="number"
                    className="form-input mt-1 w-24"
                    defaultValue={800}
                  />
                </div>
              </div>
              <button
                className="px-4 py-2 text-google-purple hover:bg-hover rounded"
                onClick={() => copyToClipboard(embedCode)}
              >
                Copy
              </button>
            </div>
          )}

          {activeTab === 'social' && (
            <div className="space-y-4">
              <p className="text-sm text-text-secondary text-center">Share this form on social media</p>
              <div className="flex justify-center gap-4">
                <button
                  className="p-4 hover:bg-hover rounded-full"
                  onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(formUrl)}`, '_blank')}
                >
                  <Facebook size={32} className="text-[#1877f2]" />
                </button>
                <button
                  className="p-4 hover:bg-hover rounded-full"
                  onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(formUrl)}&text=${encodeURIComponent(formTitle)}`, '_blank')}
                >
                  <Twitter size={32} className="text-[#1da1f2]" />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border flex justify-end gap-2">
          <button
            className="px-4 py-2 hover:bg-hover rounded"
            onClick={onClose}
          >
            Cancel
          </button>
          {activeTab === 'email' && (
            <button className="px-4 py-2 bg-google-purple text-white rounded hover:shadow-md">
              Send
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
