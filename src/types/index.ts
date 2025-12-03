// Base difficulty type
export type DifficultyLevel = 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';

export type QuestionType = 
  | 'MULTIPLE_CHOICE' 
  | 'FREE_RESPONSE' 
  | 'CODE_ANALYSIS' 
  | 'CODE_COMPLETION' 
  | 'TRUE_FALSE';

export interface Unit {
  id: string;
  unitNumber: number;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  isActive: boolean;
  topics?: Topic[];
  questionCount?: number;
}

export interface Topic {
  id: string;
  name: string;
  description: string | null;
  unitId: string;
  orderIndex: number;
}

export interface Question {
  id: string;
  questionText: string;
  codeSnippet?: string;
  options?: string[];
  type: QuestionType;
  difficulty: DifficultyLevel;
  unit: Unit;
  topic?: Topic;
}

export interface ProgressMetrics {
  currentDifficulty: DifficultyLevel;
  consecutiveCorrect: number;
  consecutiveWrong: number;
  totalAttempts: number;
  correctAttempts: number;
  masteryLevel: number;
}

export interface AnswerResult {
  id: string;
  isCorrect: boolean;
  correctAnswer: string;
  explanation: string;
  userAnswer: string;
  progress?: ProgressMetrics;
}

export interface UserProgress {
  id: string;
  unitId: string;
  topicId?: string;
  masteryLevel: number;
  totalAttempts: number;
  correctAttempts: number;
  currentDifficulty: DifficultyLevel;
}

export interface PracticeSession {
  id: string;
  userId: string;
  unitId: string;
  topicId?: string;
  totalQuestions: number;
  correctAnswers: number;
  targetQuestions?: number;
  startedAt: string;
}

export interface SessionSummary {
  totalQuestions: number;
  correctAnswers: number;
  accuracyRate: number;
  totalDuration: number;
  averageTime: number;
  responses?: Array<{
    questionId: string;
    isCorrect: boolean;
    timeSpent?: number;
    topic?: string;
  }>;
}

// Exam types
export interface ExamBlueprint {
  id: string;
  name: string;
  description?: string;
  examType: 'AP_PRACTICE' | 'UNIT_TEST' | 'MIDTERM' | 'FINAL' | 'CUSTOM';
  totalQuestions: number;
  unitDistribution?: Record<string, number>;
  mcqCount: number;
  frqCount: number;
  easyCount: number;
  mediumCount: number;
  hardCount: number;
  expertCount: number;
  timeLimit?: number;
  isOfficial: boolean;
  isPremium: boolean;
  createdAt: string;
}

export interface Exam {
  id: string;
  userId: string;
  blueprintId: string;
  examType: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
  totalQuestions: number;
  answeredQuestions: number;
  correctAnswers: number;
  startedAt: string;
  completedAt?: string;
  timeSpent: number;
  score?: number;
  grade?: string;
  blueprint?: ExamBlueprint;
}

// Subscription types
export interface Subscription {
  id: string;
  userId: string;
  plan: 'FREE' | 'BASIC' | 'PREMIUM' | 'LIFETIME';
  status: 'ACTIVE' | 'INACTIVE' | 'CANCELED' | 'PAST_DUE' | 'TRIALING';
  hasExamAccess: boolean;
  hasAITutor: boolean;
  hasPremiumContent: boolean;
  maxExamsPerMonth: number;
  examsUsedThisMonth: number;
  stripeCurrentPeriodEnd?: string;
  planName?: string;
  planPrice?: number;
}