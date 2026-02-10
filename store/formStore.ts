import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import {
  Form,
  Section,
  Question,
  QuestionType,
  Option,
  FormTheme,
  FormSettings,
  FormResponse,
  QuestionResponse,
  FormListItem,
  defaultFormTheme,
  defaultFormSettings,
  defaultLinearScale,
  defaultFileUploadConfig,
  QuizAnswer,
} from '@/types/form';

interface FormStore {
  // Forms list
  forms: Form[];
  currentForm: Form | null;
  
  // Responses
  responses: { [formId: string]: FormResponse[] };
  
  // Actions - Forms
  createForm: (title: string, description?: string) => Form;
  updateForm: (formId: string, updates: Partial<Form>) => void;
  deleteForm: (formId: string) => void;
  duplicateForm: (formId: string) => Form | null;
  setCurrentForm: (formId: string | null) => void;
  
  // Actions - Sections
  addSection: (formId: string, afterSectionIndex?: number) => void;
  updateSection: (formId: string, sectionId: string, updates: Partial<Section>) => void;
  deleteSection: (formId: string, sectionId: string) => void;
  moveSection: (formId: string, fromIndex: number, toIndex: number) => void;
  duplicateSection: (formId: string, sectionId: string) => void;
  mergeSections: (formId: string, sectionId: string) => void;
  
  // Actions - Questions
  addQuestion: (formId: string, sectionId: string, type: QuestionType, afterQuestionIndex?: number) => void;
  updateQuestion: (formId: string, sectionId: string, questionId: string, updates: Partial<Question>) => void;
  deleteQuestion: (formId: string, sectionId: string, questionId: string) => void;
  moveQuestion: (formId: string, fromSectionId: string, toSectionId: string, fromIndex: number, toIndex: number) => void;
  duplicateQuestion: (formId: string, sectionId: string, questionId: string) => void;
  
  // Actions - Options
  addOption: (formId: string, sectionId: string, questionId: string) => void;
  updateOption: (formId: string, sectionId: string, questionId: string, optionId: string, value: string) => void;
  deleteOption: (formId: string, sectionId: string, questionId: string, optionId: string) => void;
  
  // Actions - Theme
  updateTheme: (formId: string, theme: Partial<FormTheme>) => void;
  
  // Actions - Settings
  updateSettings: (formId: string, settings: Partial<FormSettings>) => void;
  
  // Actions - Quiz
  updateQuizAnswer: (formId: string, questionId: string, answer: Partial<QuizAnswer>) => void;
  
  // Actions - Responses
  submitResponse: (formId: string, responses: QuestionResponse[], respondentEmail?: string) => void;
  deleteResponse: (formId: string, responseId: string) => void;
  getFormResponses: (formId: string) => FormResponse[];
  
  // Utility
  getFormsList: () => FormListItem[];
}

const createDefaultQuestion = (type: QuestionType): Question => {
  const baseQuestion: Question = {
    id: uuidv4(),
    type,
    title: '',
    required: false,
  };

  switch (type) {
    case 'multiple_choice':
    case 'checkboxes':
    case 'dropdown':
      return {
        ...baseQuestion,
        options: [
          { id: uuidv4(), value: 'Option 1' },
        ],
        hasOtherOption: false,
      };
    case 'linear_scale':
      return {
        ...baseQuestion,
        linearScale: { ...defaultLinearScale },
      };
    case 'multiple_choice_grid':
    case 'checkbox_grid':
      return {
        ...baseQuestion,
        rows: [{ id: uuidv4(), label: 'Row 1' }],
        columns: [{ id: uuidv4(), label: 'Column 1' }],
      };
    case 'file_upload':
      return {
        ...baseQuestion,
        fileUploadConfig: { ...defaultFileUploadConfig },
      };
    default:
      return baseQuestion;
  }
};

export const useFormStore = create<FormStore>()(
  persist(
    (set, get) => ({
      forms: [],
      currentForm: null,
      responses: {},

      createForm: (title, description) => {
        const newForm: Form = {
          id: uuidv4(),
          title,
          description,
          sections: [
            {
              id: uuidv4(),
              title: '',
              description: '',
              questions: [],
            },
          ],
          theme: { ...defaultFormTheme },
          settings: { ...defaultFormSettings },
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        set((state) => ({
          forms: [...state.forms, newForm],
          currentForm: newForm,
        }));

        return newForm;
      },

      updateForm: (formId, updates) => {
        set((state) => ({
          forms: state.forms.map((form) =>
            form.id === formId
              ? { ...form, ...updates, updatedAt: new Date() }
              : form
          ),
          currentForm:
            state.currentForm?.id === formId
              ? { ...state.currentForm, ...updates, updatedAt: new Date() }
              : state.currentForm,
        }));
      },

      deleteForm: (formId) => {
        set((state) => ({
          forms: state.forms.filter((form) => form.id !== formId),
          currentForm: state.currentForm?.id === formId ? null : state.currentForm,
        }));
      },

      duplicateForm: (formId) => {
        const form = get().forms.find((f) => f.id === formId);
        if (!form) return null;

        const newForm: Form = {
          ...JSON.parse(JSON.stringify(form)),
          id: uuidv4(),
          title: `Copy of ${form.title}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // Regenerate all IDs
        newForm.sections = newForm.sections.map((section: Section) => ({
          ...section,
          id: uuidv4(),
          questions: section.questions.map((question: Question) => ({
            ...question,
            id: uuidv4(),
            options: question.options?.map((option: Option) => ({
              ...option,
              id: uuidv4(),
            })),
          })),
        }));

        set((state) => ({
          forms: [...state.forms, newForm],
        }));

        return newForm;
      },

      setCurrentForm: (formId) => {
        if (formId === null) {
          set({ currentForm: null });
          return;
        }
        const form = get().forms.find((f) => f.id === formId);
        set({ currentForm: form || null });
      },

      addSection: (formId, afterSectionIndex) => {
        const newSection: Section = {
          id: uuidv4(),
          title: 'Untitled Section',
          description: '',
          questions: [],
        };

        set((state) => {
          const updateForms = (forms: Form[]) =>
            forms.map((form) => {
              if (form.id !== formId) return form;
              const sections = [...form.sections];
              const insertIndex = afterSectionIndex !== undefined ? afterSectionIndex + 1 : sections.length;
              sections.splice(insertIndex, 0, newSection);
              return { ...form, sections, updatedAt: new Date() };
            });

          return {
            forms: updateForms(state.forms),
            currentForm: state.currentForm?.id === formId
              ? updateForms([state.currentForm])[0]
              : state.currentForm,
          };
        });
      },

      updateSection: (formId, sectionId, updates) => {
        set((state) => {
          const updateForms = (forms: Form[]) =>
            forms.map((form) => {
              if (form.id !== formId) return form;
              return {
                ...form,
                sections: form.sections.map((section) =>
                  section.id === sectionId ? { ...section, ...updates } : section
                ),
                updatedAt: new Date(),
              };
            });

          return {
            forms: updateForms(state.forms),
            currentForm: state.currentForm?.id === formId
              ? updateForms([state.currentForm])[0]
              : state.currentForm,
          };
        });
      },

      deleteSection: (formId, sectionId) => {
        set((state) => {
          const updateForms = (forms: Form[]) =>
            forms.map((form) => {
              if (form.id !== formId) return form;
              // Don't delete if it's the only section
              if (form.sections.length <= 1) return form;
              return {
                ...form,
                sections: form.sections.filter((section) => section.id !== sectionId),
                updatedAt: new Date(),
              };
            });

          return {
            forms: updateForms(state.forms),
            currentForm: state.currentForm?.id === formId
              ? updateForms([state.currentForm])[0]
              : state.currentForm,
          };
        });
      },

      moveSection: (formId, fromIndex, toIndex) => {
        set((state) => {
          const updateForms = (forms: Form[]) =>
            forms.map((form) => {
              if (form.id !== formId) return form;
              const sections = [...form.sections];
              const [removed] = sections.splice(fromIndex, 1);
              sections.splice(toIndex, 0, removed);
              return { ...form, sections, updatedAt: new Date() };
            });

          return {
            forms: updateForms(state.forms),
            currentForm: state.currentForm?.id === formId
              ? updateForms([state.currentForm])[0]
              : state.currentForm,
          };
        });
      },

      duplicateSection: (formId, sectionId) => {
        set((state) => {
          const updateForms = (forms: Form[]) =>
            forms.map((form) => {
              if (form.id !== formId) return form;
              const sectionIndex = form.sections.findIndex((s) => s.id === sectionId);
              if (sectionIndex === -1) return form;
              
              const section = form.sections[sectionIndex];
              const newSection: Section = {
                ...JSON.parse(JSON.stringify(section)),
                id: uuidv4(),
                title: `Copy of ${section.title}`,
                questions: section.questions.map((q) => ({
                  ...JSON.parse(JSON.stringify(q)),
                  id: uuidv4(),
                  options: q.options?.map((o) => ({ ...o, id: uuidv4() })),
                })),
              };
              
              const sections = [...form.sections];
              sections.splice(sectionIndex + 1, 0, newSection);
              return { ...form, sections, updatedAt: new Date() };
            });

          return {
            forms: updateForms(state.forms),
            currentForm: state.currentForm?.id === formId
              ? updateForms([state.currentForm])[0]
              : state.currentForm,
          };
        });
      },

      mergeSections: (formId, sectionId) => {
        set((state) => {
          const updateForms = (forms: Form[]) =>
            forms.map((form) => {
              if (form.id !== formId) return form;
              const sectionIndex = form.sections.findIndex((s) => s.id === sectionId);
              if (sectionIndex <= 0) return form; // Can't merge first section
              
              const currentSection = form.sections[sectionIndex];
              const previousSection = form.sections[sectionIndex - 1];
              
              const mergedSection: Section = {
                ...previousSection,
                questions: [...previousSection.questions, ...currentSection.questions],
              };
              
              const sections = form.sections.filter((s) => s.id !== sectionId);
              sections[sectionIndex - 1] = mergedSection;
              
              return { ...form, sections, updatedAt: new Date() };
            });

          return {
            forms: updateForms(state.forms),
            currentForm: state.currentForm?.id === formId
              ? updateForms([state.currentForm])[0]
              : state.currentForm,
          };
        });
      },

      addQuestion: (formId, sectionId, type, afterQuestionIndex) => {
        const newQuestion = createDefaultQuestion(type);

        set((state) => {
          const updateForms = (forms: Form[]) =>
            forms.map((form) => {
              if (form.id !== formId) return form;
              return {
                ...form,
                sections: form.sections.map((section) => {
                  if (section.id !== sectionId) return section;
                  const questions = [...section.questions];
                  const insertIndex = afterQuestionIndex !== undefined ? afterQuestionIndex + 1 : questions.length;
                  questions.splice(insertIndex, 0, newQuestion);
                  return { ...section, questions };
                }),
                updatedAt: new Date(),
              };
            });

          return {
            forms: updateForms(state.forms),
            currentForm: state.currentForm?.id === formId
              ? updateForms([state.currentForm])[0]
              : state.currentForm,
          };
        });
      },

      updateQuestion: (formId, sectionId, questionId, updates) => {
        set((state) => {
          const updateForms = (forms: Form[]) =>
            forms.map((form) => {
              if (form.id !== formId) return form;
              return {
                ...form,
                sections: form.sections.map((section) => {
                  if (section.id !== sectionId) return section;
                  return {
                    ...section,
                    questions: section.questions.map((question) =>
                      question.id === questionId
                        ? { ...question, ...updates }
                        : question
                    ),
                  };
                }),
                updatedAt: new Date(),
              };
            });

          return {
            forms: updateForms(state.forms),
            currentForm: state.currentForm?.id === formId
              ? updateForms([state.currentForm])[0]
              : state.currentForm,
          };
        });
      },

      deleteQuestion: (formId, sectionId, questionId) => {
        set((state) => {
          const updateForms = (forms: Form[]) =>
            forms.map((form) => {
              if (form.id !== formId) return form;
              return {
                ...form,
                sections: form.sections.map((section) => {
                  if (section.id !== sectionId) return section;
                  return {
                    ...section,
                    questions: section.questions.filter((q) => q.id !== questionId),
                  };
                }),
                updatedAt: new Date(),
              };
            });

          return {
            forms: updateForms(state.forms),
            currentForm: state.currentForm?.id === formId
              ? updateForms([state.currentForm])[0]
              : state.currentForm,
          };
        });
      },

      moveQuestion: (formId, fromSectionId, toSectionId, fromIndex, toIndex) => {
        set((state) => {
          const updateForms = (forms: Form[]) =>
            forms.map((form) => {
              if (form.id !== formId) return form;
              
              let questionToMove: Question | null = null;
              
              // First, find and remove the question from source section
              const sectionsAfterRemoval = form.sections.map((section) => {
                if (section.id !== fromSectionId) return section;
                const questions = [...section.questions];
                questionToMove = questions[fromIndex];
                questions.splice(fromIndex, 1);
                return { ...section, questions };
              });
              
              if (!questionToMove) return form;
              
              // Then, add it to the target section
              const sectionsAfterInsertion = sectionsAfterRemoval.map((section) => {
                if (section.id !== toSectionId) return section;
                const questions = [...section.questions];
                questions.splice(toIndex, 0, questionToMove!);
                return { ...section, questions };
              });
              
              return { ...form, sections: sectionsAfterInsertion, updatedAt: new Date() };
            });

          return {
            forms: updateForms(state.forms),
            currentForm: state.currentForm?.id === formId
              ? updateForms([state.currentForm])[0]
              : state.currentForm,
          };
        });
      },

      duplicateQuestion: (formId, sectionId, questionId) => {
        set((state) => {
          const updateForms = (forms: Form[]) =>
            forms.map((form) => {
              if (form.id !== formId) return form;
              return {
                ...form,
                sections: form.sections.map((section) => {
                  if (section.id !== sectionId) return section;
                  const questionIndex = section.questions.findIndex((q) => q.id === questionId);
                  if (questionIndex === -1) return section;
                  
                  const question = section.questions[questionIndex];
                  const newQuestion: Question = {
                    ...JSON.parse(JSON.stringify(question)),
                    id: uuidv4(),
                    options: question.options?.map((o) => ({ ...o, id: uuidv4() })),
                    rows: question.rows?.map((r) => ({ ...r, id: uuidv4() })),
                    columns: question.columns?.map((c) => ({ ...c, id: uuidv4() })),
                  };
                  
                  const questions = [...section.questions];
                  questions.splice(questionIndex + 1, 0, newQuestion);
                  return { ...section, questions };
                }),
                updatedAt: new Date(),
              };
            });

          return {
            forms: updateForms(state.forms),
            currentForm: state.currentForm?.id === formId
              ? updateForms([state.currentForm])[0]
              : state.currentForm,
          };
        });
      },

      addOption: (formId, sectionId, questionId) => {
        set((state) => {
          const updateForms = (forms: Form[]) =>
            forms.map((form) => {
              if (form.id !== formId) return form;
              return {
                ...form,
                sections: form.sections.map((section) => {
                  if (section.id !== sectionId) return section;
                  return {
                    ...section,
                    questions: section.questions.map((question) => {
                      if (question.id !== questionId) return question;
                      const optionNumber = (question.options?.length || 0) + 1;
                      return {
                        ...question,
                        options: [
                          ...(question.options || []),
                          { id: uuidv4(), value: `Option ${optionNumber}` },
                        ],
                      };
                    }),
                  };
                }),
                updatedAt: new Date(),
              };
            });

          return {
            forms: updateForms(state.forms),
            currentForm: state.currentForm?.id === formId
              ? updateForms([state.currentForm])[0]
              : state.currentForm,
          };
        });
      },

      updateOption: (formId, sectionId, questionId, optionId, value) => {
        set((state) => {
          const updateForms = (forms: Form[]) =>
            forms.map((form) => {
              if (form.id !== formId) return form;
              return {
                ...form,
                sections: form.sections.map((section) => {
                  if (section.id !== sectionId) return section;
                  return {
                    ...section,
                    questions: section.questions.map((question) => {
                      if (question.id !== questionId) return question;
                      return {
                        ...question,
                        options: question.options?.map((option) =>
                          option.id === optionId ? { ...option, value } : option
                        ),
                      };
                    }),
                  };
                }),
                updatedAt: new Date(),
              };
            });

          return {
            forms: updateForms(state.forms),
            currentForm: state.currentForm?.id === formId
              ? updateForms([state.currentForm])[0]
              : state.currentForm,
          };
        });
      },

      deleteOption: (formId, sectionId, questionId, optionId) => {
        set((state) => {
          const updateForms = (forms: Form[]) =>
            forms.map((form) => {
              if (form.id !== formId) return form;
              return {
                ...form,
                sections: form.sections.map((section) => {
                  if (section.id !== sectionId) return section;
                  return {
                    ...section,
                    questions: section.questions.map((question) => {
                      if (question.id !== questionId) return question;
                      // Don't delete if it's the only option
                      if ((question.options?.length || 0) <= 1) return question;
                      return {
                        ...question,
                        options: question.options?.filter((o) => o.id !== optionId),
                      };
                    }),
                  };
                }),
                updatedAt: new Date(),
              };
            });

          return {
            forms: updateForms(state.forms),
            currentForm: state.currentForm?.id === formId
              ? updateForms([state.currentForm])[0]
              : state.currentForm,
          };
        });
      },

      updateTheme: (formId, theme) => {
        set((state) => {
          const updateForms = (forms: Form[]) =>
            forms.map((form) => {
              if (form.id !== formId) return form;
              return {
                ...form,
                theme: { ...form.theme, ...theme },
                updatedAt: new Date(),
              };
            });

          return {
            forms: updateForms(state.forms),
            currentForm: state.currentForm?.id === formId
              ? updateForms([state.currentForm])[0]
              : state.currentForm,
          };
        });
      },

      updateSettings: (formId, settings) => {
        set((state) => {
          const updateForms = (forms: Form[]) =>
            forms.map((form) => {
              if (form.id !== formId) return form;
              return {
                ...form,
                settings: { ...form.settings, ...settings },
                updatedAt: new Date(),
              };
            });

          return {
            forms: updateForms(state.forms),
            currentForm: state.currentForm?.id === formId
              ? updateForms([state.currentForm])[0]
              : state.currentForm,
          };
        });
      },

      updateQuizAnswer: (formId, questionId, answer) => {
        set((state) => {
          const updateForms = (forms: Form[]) =>
            forms.map((form) => {
              if (form.id !== formId) return form;
              const existingAnswers = form.quizAnswers || [];
              const answerIndex = existingAnswers.findIndex((a) => a.questionId === questionId);
              
              let newAnswers: QuizAnswer[];
              if (answerIndex >= 0) {
                newAnswers = existingAnswers.map((a, i) =>
                  i === answerIndex ? { ...a, ...answer } : a
                );
              } else {
                newAnswers = [
                  ...existingAnswers,
                  { questionId, points: 0, ...answer } as QuizAnswer,
                ];
              }
              
              return {
                ...form,
                quizAnswers: newAnswers,
                updatedAt: new Date(),
              };
            });

          return {
            forms: updateForms(state.forms),
            currentForm: state.currentForm?.id === formId
              ? updateForms([state.currentForm])[0]
              : state.currentForm,
          };
        });
      },

      submitResponse: (formId, responses, respondentEmail) => {
        const newResponse: FormResponse = {
          id: uuidv4(),
          formId,
          responses,
          respondentEmail,
          submittedAt: new Date(),
        };

        set((state) => ({
          responses: {
            ...state.responses,
            [formId]: [...(state.responses[formId] || []), newResponse],
          },
        }));
      },

      deleteResponse: (formId, responseId) => {
        set((state) => ({
          responses: {
            ...state.responses,
            [formId]: (state.responses[formId] || []).filter((r) => r.id !== responseId),
          },
        }));
      },

      getFormResponses: (formId) => {
        return get().responses[formId] || [];
      },

      getFormsList: () => {
        return get().forms.map((form) => ({
          id: form.id,
          title: form.title,
          description: form.description,
          responseCount: (get().responses[form.id] || []).length,
          createdAt: form.createdAt,
          updatedAt: form.updatedAt,
        }));
      },
    }),
    {
      name: 'yellow-forms-storage',
      partialize: (state) => ({
        forms: state.forms,
        responses: state.responses,
      }),
    }
  )
);
