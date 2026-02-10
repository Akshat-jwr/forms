// Form Types and Interfaces for Google Forms Clone

export type QuestionType =
  | 'short_answer'
  | 'paragraph'
  | 'multiple_choice'
  | 'checkboxes'
  | 'dropdown'
  | 'file_upload'
  | 'linear_scale'
  | 'multiple_choice_grid'
  | 'checkbox_grid'
  | 'date'
  | 'time';

export interface Option {
  id: string;
  value: string;
  imageUrl?: string;
}

export interface GridRow {
  id: string;
  label: string;
}

export interface GridColumn {
  id: string;
  label: string;
}

export interface LinearScaleConfig {
  minValue: number;
  maxValue: number;
  minLabel?: string;
  maxLabel?: string;
}

export interface FileUploadConfig {
  allowedTypes: string[];
  maxFiles: number;
  maxFileSize: number; // in MB
}

export interface ValidationRule {
  type: 'number' | 'text' | 'length' | 'regex' | 'contains' | 'email' | 'url';
  condition?: 'greater_than' | 'less_than' | 'equal_to' | 'not_equal_to' | 'between' | 'contains' | 'not_contains' | 'matches';
  value?: string | number;
  minValue?: number;
  maxValue?: number;
  errorMessage: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  title: string;
  description?: string;
  required: boolean;
  imageUrl?: string;
  imageAlignment?: 'left' | 'center' | 'right';
  
  // For multiple choice, checkboxes, dropdown
  options?: Option[];
  hasOtherOption?: boolean;
  
  // For linear scale
  linearScale?: LinearScaleConfig;
  
  // For grid types
  rows?: GridRow[];
  columns?: GridColumn[];
  
  // For file upload
  fileUploadConfig?: FileUploadConfig;
  
  // Validation
  validation?: ValidationRule;
  
  // Shuffle options
  shuffleOptions?: boolean;
  
  // Go to section based on answer (for multiple choice)
  goToSection?: { [optionId: string]: string }; // optionId -> sectionId
}

export interface Section {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
}

export interface FormTheme {
  headerColor: string;
  backgroundColor: string;
  fontFamily: string;
  headerImageUrl?: string;
}

export interface FormSettings {
  // Responses
  collectEmails: boolean;
  limitOneResponse: boolean;
  editAfterSubmit: boolean;
  
  // Presentation
  showProgressBar: boolean;
  shuffleQuestions: boolean;
  confirmationMessage: string;
  
  // Quiz settings
  isQuiz: boolean;
  releaseGrades: 'immediately' | 'later' | 'after_manual_review';
  showMissedQuestions: boolean;
  showCorrectAnswers: boolean;
  showPointValues: boolean;
  
  // Other
  acceptingResponses: boolean;
  responseDeadline?: Date;
}

export interface QuizAnswer {
  questionId: string;
  correctOptions?: string[]; // For multiple choice/checkboxes
  correctText?: string; // For short answer
  points: number;
  feedback?: {
    correct: string;
    incorrect: string;
  };
}

export interface Form {
  id: string;
  title: string;
  description?: string;
  sections: Section[];
  theme: FormTheme;
  settings: FormSettings;
  quizAnswers?: QuizAnswer[];
  createdAt: Date;
  updatedAt: Date;
  ownerId?: string;
  collaborators?: string[];
}

// Response Types
export interface QuestionResponse {
  questionId: string;
  value: string | string[] | File[] | { [rowId: string]: string | string[] };
}

export interface FormResponse {
  id: string;
  formId: string;
  responses: QuestionResponse[];
  respondentEmail?: string;
  submittedAt: Date;
  score?: number;
  maxScore?: number;
}

// API Types (for future backend integration)
export interface CreateFormRequest {
  title: string;
  description?: string;
}

export interface UpdateFormRequest {
  title?: string;
  description?: string;
  sections?: Section[];
  theme?: FormTheme;
  settings?: FormSettings;
  quizAnswers?: QuizAnswer[];
}

export interface SubmitResponseRequest {
  formId: string;
  responses: QuestionResponse[];
  respondentEmail?: string;
}

export interface FormListItem {
  id: string;
  title: string;
  description?: string;
  responseCount: number;
  createdAt: Date;
  updatedAt: Date;
  lastOpenedAt?: Date;
}

// Default values
export const defaultFormTheme: FormTheme = {
  headerColor: '#673ab7',
  backgroundColor: '#f0ebf8',
  fontFamily: 'Google Sans, Roboto, Arial, sans-serif',
};

export const defaultFormSettings: FormSettings = {
  collectEmails: false,
  limitOneResponse: false,
  editAfterSubmit: false,
  showProgressBar: true,
  shuffleQuestions: false,
  confirmationMessage: 'Your response has been recorded.',
  isQuiz: false,
  releaseGrades: 'immediately',
  showMissedQuestions: true,
  showCorrectAnswers: true,
  showPointValues: true,
  acceptingResponses: true,
};

export const defaultLinearScale: LinearScaleConfig = {
  minValue: 1,
  maxValue: 5,
  minLabel: '',
  maxLabel: '',
};

export const defaultFileUploadConfig: FileUploadConfig = {
  allowedTypes: ['image/*', 'application/pdf', '.doc', '.docx'],
  maxFiles: 1,
  maxFileSize: 10,
};
