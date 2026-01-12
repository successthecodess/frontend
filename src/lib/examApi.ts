import { TokenManager } from '@/utils/tokenManager';
import type { PartResponse } from '@/types/exam';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;
const TIMEOUT = 30000;

class APIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public context?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// Get auth headers with JWT token
const getAuthHeaders = () => {
  if (typeof window === 'undefined') return { 'Content-Type': 'application/json' };
  
  const token = TokenManager.getAccessToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function isRetryableError(error: any, statusCode?: number): boolean {
  // Check if error exists and has properties
  if (!error) return false;
  
  if (error instanceof TypeError && error.message?.includes('fetch')) {
    return true;
  }
  
  if (statusCode && statusCode >= 500 && statusCode !== 501) {
    return true;
  }
  
  if (statusCode === 429) {
    return true;
  }
  
  if (error.name === 'AbortError') {
    return true;
  }
  
  return false;
}

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = TIMEOUT) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

async function handleResponse(
  url: string,
  options: RequestInit = {},
  context?: string,
  retryCount = 0,
  hasAttemptedRefresh = false
): Promise<any> {
  try {
    const response = await fetchWithTimeout(url, options);
    
    // Handle token expiration with auto-refresh
    if (response.status === 401 && !hasAttemptedRefresh) {
      const errorData = await response.json().catch(() => ({}));
      
      if (errorData.code === 'TOKEN_EXPIRED') {
        console.log('🔄 Token expired, attempting refresh...');
        
        const newToken = await TokenManager.refreshAccessToken();
        
        if (newToken) {
          console.log('✅ Token refreshed successfully');
          
          // Retry request with new token
          const newOptions = {
            ...options,
            headers: {
              ...options.headers,
              'Authorization': `Bearer ${newToken}`,
            },
          };
          
          return handleResponse(url, newOptions, context, retryCount, true);
        } else {
          console.error('❌ Token refresh failed, redirecting to login');
          TokenManager.clearTokens();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          throw new APIError('Session expired. Please log in again.', 401, context);
        }
      }
    }
    
    if (!response.ok) {
      let errorMessage = 'An error occurred';
      let errorData: any = null;
      
      try {
        errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        try {
          errorMessage = await response.text();
        } catch {}
      }
      
      if (isRetryableError(null, response.status) && retryCount < MAX_RETRIES) {
        console.warn(`⚠️ API Error (attempt ${retryCount + 1}/${MAX_RETRIES}):`, {
          context,
          status: response.status,
          url,
        });
        
        await sleep(RETRY_DELAY * Math.pow(2, retryCount));
        return handleResponse(url, options, context, retryCount + 1, hasAttemptedRefresh);
      }
      
      console.error('❌ API Error:', {
        context,
        status: response.status,
        statusText: response.statusText,
        url,
        message: errorMessage,
        data: errorData,
      });
      
      throw new APIError(errorMessage, response.status, context);
    }
    
    return response.json();
  } catch (error: any) {
    if (isRetryableError(error) && retryCount < MAX_RETRIES) {
      console.warn(`⚠️ Network Error (attempt ${retryCount + 1}/${MAX_RETRIES}):`, {
        context,
        error: error?.message || 'Unknown error',
        url,
      });
      
      await sleep(RETRY_DELAY * Math.pow(2, retryCount));
      return handleResponse(url, options, context, retryCount + 1, hasAttemptedRefresh);
    }
    
    console.error('❌ Request Failed:', {
      context,
      error: error?.message || 'Unknown error',
      url,
      retries: retryCount,
    });
    
    if (error?.name === 'AbortError') {
      throw new APIError('Request timed out. Please check your connection and try again.', undefined, context);
    }
    
    if (error instanceof TypeError && error.message?.includes('fetch')) {
      throw new APIError('Unable to connect to server. Please check your internet connection.', undefined, context);
    }
    
    throw error || new APIError('Unknown error occurred', undefined, context);
  }
}

export const examApi = {
  
  // Exam Units
  async getExamUnits() {
    const url = `${API_BASE_URL}/admin/exam-bank/units`;
    return handleResponse(url, { headers: getAuthHeaders() }, 'getExamUnits');
  },

  // Exam Bank Questions
  async getExamBankQuestions(filters?: {
    unitId?: string;
    questionType?: string;
    frqType?: string;
    approved?: boolean;
  }) {
    const params = new URLSearchParams();
    if (filters?.unitId) params.append('unitId', filters.unitId);
    if (filters?.questionType) params.append('questionType', filters.questionType);
    if (filters?.frqType) params.append('frqType', filters.frqType);
    if (filters?.approved !== undefined) params.append('approved', String(filters.approved));

    const url = `${API_BASE_URL}/admin/exam-bank/questions?${params.toString()}`;
    return handleResponse(url, { headers: getAuthHeaders() }, 'getExamBankQuestions');
  },

  async getQuestionCounts() {
    const url = `${API_BASE_URL}/admin/exam-bank/questions/counts`;
    return handleResponse(url, { headers: getAuthHeaders() }, 'getQuestionCounts');
  },

  async createMCQQuestion(data: any) {
    const url = `${API_BASE_URL}/admin/exam-bank/questions/mcq`;
    return handleResponse(
      url,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      },
      'createMCQQuestion'
    );
  },

  async createFRQQuestion(data: any) {
    const url = `${API_BASE_URL}/admin/exam-bank/questions/frq`;
    return handleResponse(
      url,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      },
      'createFRQQuestion'
    );
  },

  async updateQuestion(questionId: string, data: any) {
    const url = `${API_BASE_URL}/admin/exam-bank/questions/${questionId}`;
    return handleResponse(
      url,
      {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      },
      'updateQuestion'
    );
  },

  async deleteQuestion(questionId: string) {
    const url = `${API_BASE_URL}/admin/exam-bank/questions/${questionId}`;
    return handleResponse(
      url,
      {
        method: 'DELETE',
        headers: getAuthHeaders(),
      },
      'deleteQuestion'
    );
  },

  // Full Exam
  async startFullExam(userId: string) {
    const url = `${API_BASE_URL}/full-exam/start`;
    return handleResponse(
      url,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ userId }),
      },
      'startFullExam'
    );
  },

  async submitMCQAnswer(data: {
    examAttemptId: string;
    orderIndex: number;
    userAnswer: string;
    timeSpent?: number;
  }) {
    const url = `${API_BASE_URL}/full-exam/mcq/submit`;
    return handleResponse(
      url,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      },
      'submitMCQAnswer'
    );
  },

  async submitFRQAnswer(data: {
    examAttemptId: string;
    frqNumber: number;
    userCode: string;
    partResponses?: PartResponse[];
    timeSpent?: number;
  }) {
    const url = `${API_BASE_URL}/full-exam/frq/submit`;
    return handleResponse(
      url,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      },
      'submitFRQAnswer'
    );
  },

  async flagMCQForReview(data: {
    examAttemptId: string;
    orderIndex: number;
    flagged: boolean;
  }) {
    const url = `${API_BASE_URL}/full-exam/mcq/flag`;
    return handleResponse(
      url,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      },
      'flagMCQForReview'
    );
  },

  async submitFullExam(data: {
    examAttemptId: string;
    totalTimeSpent: number;
  }) {
    const url = `${API_BASE_URL}/full-exam/submit`;
    return handleResponse(
      url,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      },
      'submitFullExam'
    );
  },
  // Add these methods to the examApi object (after deleteQuestion method)

// Import MCQ questions from practice tests
async importMCQQuestions(questionIds: string[]) {
  const url = `${API_BASE_URL}/admin/exam-bank/import`;
  return handleResponse(
    url,
    {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ questionIds }),
    },
    'importMCQQuestions'
  );
},
// Add this method to the examApi object (after getExamResults)
async requestFRQReview(examAttemptId: string, frqNumber: number) {
  // Get user info from localStorage
  const userEmail = typeof window !== 'undefined' ? localStorage.getItem('userEmail') : null;
  const userName = typeof window !== 'undefined' ? localStorage.getItem('userName') : null;
  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;

  const url = `${API_BASE_URL}/full-exam/${examAttemptId}/request-review`;
  return handleResponse(
    url,
    {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        frqNumber,
        userId,
        userEmail,
        userName,
      }),
    },
    'requestFRQReview'
  );
},
// Get available practice questions for import
async getAvailablePracticeQuestions(unitId?: string) {
  const params = unitId ? `?unitId=${unitId}` : '';
  const url = `${API_BASE_URL}/admin/practice-questions/available${params}`;
  return handleResponse(url, { headers: getAuthHeaders() }, 'getAvailablePracticeQuestions');
},
  async getExamAttempt(examAttemptId: string) {
    const url = `${API_BASE_URL}/full-exam/${examAttemptId}`;
    return handleResponse(url, { headers: getAuthHeaders() }, 'getExamAttempt');
  },

  async getExamResults(examAttemptId: string) {
    const url = `${API_BASE_URL}/full-exam/${examAttemptId}/results`;
    return handleResponse(url, { headers: getAuthHeaders() }, 'getExamResults');
  },
};