export type ExamQuestionType = 'MCQ' | 'FRQ';

export type FRQType = 'METHODS_CONTROL' | 'CLASSES' | 'ARRAYLIST' | 'TWO_D_ARRAY';

export type ExamDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

export type FullExamStatus = 'IN_PROGRESS' | 'SUBMITTED' | 'GRADED' | 'ABANDONED';

export interface ExamUnit {
  id: string;
  unitNumber: number;
  name: string;
  description?: string;
  examWeight: string;
  topics: string[];
  mcqCount?: number;
  frqCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface FRQPart {
  partLetter: string; // 'a', 'b', 'c', 'd'
  promptText: string;
  starterCode?: string;
  rubricPoints: any;
  maxPoints: number;
  sampleSolution?: string;
}

export interface ExamBankQuestion {
  id: string;
  unitId: string;
  unit?: ExamUnit;
  questionType: ExamQuestionType;
  frqType?: FRQType;
  
  // Display fields
  questionText: string; // Summary/title
  
  // MCQ fields
  options?: string[]; // Array of 4 strings for MCQ
  correctAnswer?: string; // "A", "B", "C", or "D"
  
  // FRQ fields - Multi-part structure
  promptText?: string; // Main scenario/context
  starterCode?: string; // Class information/structure
  frqParts?: FRQPart[]; // Array of { partLetter, promptText, starterCode, rubricPoints, maxPoints, sampleSolution }
  maxPoints: number; // Total points (usually 9)
  
  explanation?: string;
  difficulty: ExamDifficulty;
  approved: boolean;
  aiGenerated: boolean;
  isActive: boolean;
  timesUsed: number;
  averageScore?: number;
  createdAt: string;
  updatedAt: string;
}

export interface PartResponse {
  partLetter: string;
  userCode: string;
  timeSpent: number;
}

export interface ExamAttemptFRQ {
  id: string;
  examAttemptId: string;
  questionId: string;
  question: ExamBankQuestion;
  frqNumber: number;
  
  // Student responses
  userCode?: string; // Combined code for all parts
  partResponses?: PartResponse[]; // Array of { partLetter, userCode, timeSpent }
  
  // AI Evaluation
  aiEvaluated: boolean;
  aiEvaluationResult?: any; // Full evaluation with part breakdowns
  aiComments?: string;
  
  // Manual Override
  manualScore?: number;
  manualComments?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  
  finalScore?: number; // AI or manual score
  timeSpent?: number; // Total time in seconds
  
  createdAt: string;
  updatedAt: string;
}

export interface ExamAttemptMCQ {
  id: string;
  examAttemptId: string;
  questionId: string;
  question: ExamBankQuestion;
  orderIndex: number;
  userAnswer?: string;
  isCorrect?: boolean;
  timeSpent?: number;
  flaggedForReview: boolean;
  createdAt: string;
}

export interface FullExamAttempt {
  id: string;
  userId: string;
  startedAt: string;
  submittedAt?: string;
  status: FullExamStatus;
  totalTimeSpent?: number;
  
  mcqResponses: ExamAttemptMCQ[];
  mcqScore?: number;
  mcqPercentage?: number;
  
  frqResponses: ExamAttemptFRQ[];
  frqTotalScore?: number;
  frqPercentage?: number;
  
  rawScore?: number;
  percentageScore?: number;
  predictedAPScore?: number;
  
  unitBreakdown?: any;
  strengths?: string[];
  weaknesses?: string[];
  recommendations?: any;
  
  createdAt: string;
  updatedAt: string;
}

export interface QuestionCounts {
  mcq: number;
  frq: number;
  frqByType: {
    methodsControl: number;
    classes: number;
    arrayList: number;
    twoDArray: number;
  };
  total: number;
}

export interface RubricScore {
  criterion: string;
  earned: number;
  possible: number;
  feedback: string;
}

export interface Penalty {
  type: string;
  points: number;
  reason: string;
}

export interface PartEvaluation {
  score: number;
  maxScore: number;
  rubricScores: RubricScore[];
  penalties: Penalty[];
  generalFeedback: string;
  strengths: string[];
  improvements: string[];
}

export interface EvaluationResult {
  totalScore: number;
  maxScore: number;
  parts?: PartEvaluation[];
  rubricScores?: RubricScore[];
  penalties?: Penalty[];
  generalFeedback?: string;
  strengths?: string[];
  improvements?: string[];
}