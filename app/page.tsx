'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FileText, 
  Plus, 
  MoreVertical, 
  Search, 
  Grid, 
  List,
  FolderOpen,
  Trash2,
  Copy,
  ExternalLink,
  Clock,
  SortAsc
} from 'lucide-react';
import { useFormStore } from '@/store';
import { FormListItem } from '@/types/form';

// Template gallery data
const templates = [
  { id: 'blank', name: 'Blank', color: '#673ab7' },
  { id: 'contact', name: 'Contact Information', color: '#4285f4' },
  { id: 'rsvp', name: 'Party Invite', color: '#e91e63' },
  { id: 'feedback', name: 'Event Feedback', color: '#00bcd4' },
  { id: 'registration', name: 'Event Registration', color: '#4caf50' },
  { id: 'assessment', name: 'Assessment', color: '#ff9800' },
];

export default function HomePage() {
  const router = useRouter();
  const { forms, createForm, deleteForm, duplicateForm, getFormsList } = useFormStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'modified'>('recent');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
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

  const formsList = getFormsList();

  const filteredForms = formsList.filter((form) =>
    form.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedForms = [...filteredForms].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.title.localeCompare(b.title);
      case 'modified':
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      case 'recent':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const handleCreateForm = (templateId: string) => {
    let title = 'Untitled form';
    let description = '';

    switch (templateId) {
      case 'contact':
        title = 'Contact Information';
        description = 'Please fill out your contact details.';
        break;
      case 'rsvp':
        title = 'Party Invite';
        description = 'Please let us know if you can make it!';
        break;
      case 'feedback':
        title = 'Event Feedback';
        description = 'We would love to hear your thoughts on the event.';
        break;
      case 'registration':
        title = 'Event Registration';
        description = 'Register for the upcoming event.';
        break;
      case 'assessment':
        title = 'Assessment';
        description = 'Please complete this assessment.';
        break;
    }

    const form = createForm(title, description);
    router.push(`/forms/${form.id}/edit`);
  };

  const handleOpenForm = (formId: string) => {
    router.push(`/forms/${formId}/edit`);
  };

  const handleDeleteForm = (formId: string) => {
    if (confirm('Are you sure you want to delete this form?')) {
      deleteForm(formId);
    }
    setOpenMenuId(null);
  };

  const handleDuplicateForm = (formId: string) => {
    const newForm = duplicateForm(formId);
    if (newForm) {
      router.push(`/forms/${newForm.id}/edit`);
    }
    setOpenMenuId(null);
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return 'Today';
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      return d.toLocaleDateString();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText size={40} className="text-google-purple" />
              <span className="text-xl text-text-secondary">Forms</span>
            </div>

            <div className="flex-1 max-w-2xl mx-8">
              <div className="relative">
                <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
                <input
                  type="text"
                  className="w-full pl-12 pr-4 py-3 bg-hover rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-google-blue"
                  placeholder="Search forms"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="w-10 h-10 flex items-center justify-center hover:bg-hover rounded-full">
                <Grid size={20} className="text-text-secondary" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Template gallery */}
      <section className="bg-hover py-6">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-sm font-medium text-text-secondary mb-4">Start a new form</h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {templates.map((template) => (
              <div
                key={template.id}
                className="template-card flex-shrink-0 w-40 cursor-pointer"
                onClick={() => handleCreateForm(template.id)}
              >
                <div 
                  className="h-28 flex items-center justify-center"
                  style={{ backgroundColor: template.id === 'blank' ? '#f8f9fa' : template.color + '20' }}
                >
                  {template.id === 'blank' ? (
                    <Plus size={48} className="text-google-purple" />
                  ) : (
                    <FileText size={48} style={{ color: template.color }} />
                  )}
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium truncate">{template.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Forms list */}
      <section className="py-6">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-text-secondary">Recent forms</h2>
            <div className="flex items-center gap-2">
              <button
                className={`p-2 rounded hover:bg-hover ${viewMode === 'grid' ? 'bg-hover' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <Grid size={20} className="text-text-secondary" />
              </button>
              <button
                className={`p-2 rounded hover:bg-hover ${viewMode === 'list' ? 'bg-hover' : ''}`}
                onClick={() => setViewMode('list')}
              >
                <List size={20} className="text-text-secondary" />
              </button>
              <div className="w-px h-6 bg-border mx-2" />
              <select
                className="bg-transparent text-sm text-text-secondary focus:outline-none cursor-pointer"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'recent' | 'name' | 'modified')}
              >
                <option value="recent">Last opened by me</option>
                <option value="modified">Last modified by me</option>
                <option value="name">Title</option>
              </select>
            </div>
          </div>

          {sortedForms.length === 0 ? (
            <div className="text-center py-16">
              <FolderOpen size={64} className="mx-auto text-text-secondary mb-4" />
              <h3 className="text-lg font-medium mb-2">No forms yet</h3>
              <p className="text-text-secondary mb-6">
                Click on &quot;Blank&quot; above to create your first form
              </p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {sortedForms.map((form) => (
                <div
                  key={form.id}
                  className="form-card cursor-pointer group"
                  onClick={() => handleOpenForm(form.id)}
                >
                  <div 
                    className="h-32 flex items-center justify-center"
                    style={{ backgroundColor: '#f0ebf8' }}
                  >
                    <FileText size={48} className="text-google-purple" />
                  </div>
                  <div className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{form.title || 'Untitled form'}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-text-secondary">
                          <FileText size={14} className="text-google-purple" />
                          <span>Opened {formatDate(form.updatedAt)}</span>
                        </div>
                      </div>
                      <div className="relative">
                        <button
                          className="p-1 hover:bg-hover rounded opacity-0 group-hover:opacity-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(openMenuId === form.id ? null : form.id);
                          }}
                        >
                          <MoreVertical size={20} className="text-text-secondary" />
                        </button>
                        {openMenuId === form.id && (
                          <div className="dropdown-menu right-0 top-full mt-1">
                            <div
                              className="dropdown-item"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(`/forms/${form.id}/viewform`, '_blank');
                                setOpenMenuId(null);
                              }}
                            >
                              <ExternalLink size={18} />
                              <span>Open in new tab</span>
                            </div>
                            <div
                              className="dropdown-item"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDuplicateForm(form.id);
                              }}
                            >
                              <Copy size={18} />
                              <span>Make a copy</span>
                            </div>
                            <div className="border-t border-border my-1" />
                            <div
                              className="dropdown-item text-google-red"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteForm(form.id);
                              }}
                            >
                              <Trash2 size={18} />
                              <span>Move to trash</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {sortedForms.map((form) => (
                <div
                  key={form.id}
                  className="form-card flex items-center p-4 cursor-pointer group"
                  onClick={() => handleOpenForm(form.id)}
                >
                  <FileText size={24} className="text-google-purple flex-shrink-0" />
                  <div className="flex-1 min-w-0 ml-4">
                    <p className="font-medium truncate">{form.title || 'Untitled form'}</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-text-secondary">
                    <div className="flex items-center gap-2">
                      <Clock size={16} />
                      <span>{formatDate(form.updatedAt)}</span>
                    </div>
                    <span>{form.responseCount} response{form.responseCount !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="relative ml-4">
                    <button
                      className="p-2 hover:bg-hover rounded opacity-0 group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === form.id ? null : form.id);
                      }}
                    >
                      <MoreVertical size={20} className="text-text-secondary" />
                    </button>
                    {openMenuId === form.id && (
                      <div className="dropdown-menu right-0 top-full mt-1">
                        <div
                          className="dropdown-item"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(`/forms/${form.id}/viewform`, '_blank');
                            setOpenMenuId(null);
                          }}
                        >
                          <ExternalLink size={18} />
                          <span>Open in new tab</span>
                        </div>
                        <div
                          className="dropdown-item"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDuplicateForm(form.id);
                          }}
                        >
                          <Copy size={18} />
                          <span>Make a copy</span>
                        </div>
                        <div className="border-t border-border my-1" />
                        <div
                          className="dropdown-item text-google-red"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteForm(form.id);
                          }}
                        >
                          <Trash2 size={18} />
                          <span>Move to trash</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
