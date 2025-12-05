export interface Unit {
  id: string;
  unitNumber: number;
  name: string;
  description: string;
   color?: string;     
  icon?: string; 
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Topic {
  id: string;
  unitId: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  id: string;
  unitId: string;
  topicId?: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'CODE_ANALYSIS' | 'FREE_RESPONSE' | 'CODE_COMPLETION';
  approved: boolean;
  aiGenerated: boolean;
  createdAt: string;
  updatedAt: string;
  unit?: Unit;
  topic?: Topic;
}

export interface StudySession {
  id: string;
  userId: string;
  unitId: string;
  topicId?: string;
  sessionType: 'PRACTICE' | 'EXAM' | 'REVIEW';
  totalQuestions: number;
  correctAnswers: number;
  targetQuestions?: number;
  accuracyRate?: number;
  totalDuration?: number;
  averageTime?: number;
  startedAt: string;
  endedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionResponse {
  id: string;
  userId: string;
  questionId: string;
  sessionId: string;
  userAnswer: string;
  isCorrect: boolean;
  timeSpent?: number;
  createdAt: string;
  question?: Question;
}

export interface ProgressMetrics {
  currentDifficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
  consecutiveCorrect: number;
  consecutiveWrong: number;
  totalAttempts: number;
  correctAttempts: number;
  masteryLevel: number;
  nextReviewDate?: Date;
  easeFactor?: number;
}

export interface Progress {
  id: string;
  userId: string;
  unitId: string;
  topicId?: string;
  currentDifficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
  consecutiveCorrect: number;
  consecutiveWrong: number;
  totalAttempts: number;
  correctAttempts: number;
  masteryLevel: number;
  lastPracticed?: string;
  nextReviewDate?: string;
  easeFactor: number;
  interval: number;
  totalTimeSpent: number;
  averageTimePerQuestion: number;
  strugglingTopics?: string[];
  commonMistakes?: Record<string, number>;
  createdAt: string;
  updatedAt: string;
  unit?: Unit;
  topic?: Topic;
}

export interface AnswerResult {
  isCorrect: boolean;
  correctAnswer: string;
  explanation: string;
  userAnswer: string;
  question: Question;
  session?: StudySession;
  progress?: ProgressMetrics;
}

export interface SessionSummary {
  totalQuestions: number;
  correctAnswers: number;
  accuracyRate: number;
  totalDuration: number;
  averageTime: number;
  responses: Array<{
    questionId: string;
    isCorrect: boolean;
    timeSpent: number;
    topic: string;
  }>;
}

export interface LearningInsight {
  status: string;
  message?: string;
  masteryLevel?: number;
  currentDifficulty?: string;
  accuracy?: number;
  totalAttempts?: number;
  averageTimePerQuestion?: number;
  nextReviewDate?: string;
  weakTopics?: string[];
  strongTopics?: string[];
  recommendations?: string[];
}

export interface QuestionCounts {
  total: number;
  easy: number;
  medium: number;
  hard: number;
  expert: number;
}

export interface AdminStats {
  totalQuestions: number;
  approvedQuestions: number;
  pendingQuestions: number;
  totalAttempts: number;
}