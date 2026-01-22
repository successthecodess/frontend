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

async getExamHistory() {
  const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
  
  if (!userStr) {
    console.error('No user in localStorage');
    throw new Error('User not found');
  }
  
  const user = JSON.parse(userStr);
  const userId = user.userId || user.id;
  
  console.log('🔍 Fetching history for userId:', userId);
  console.log('🔍 Full user object:', user);
  
  if (!userId) {
    console.error('No userId found in user object:', user);
    throw new Error('User ID not found');
  }
  
  const url = `${API_BASE_URL}/full-exam/history/${userId}`;
  console.log('🔍 Fetching from URL:', url);
  
  return handleResponse(url, { headers: getAuthHeaders() }, 'getExamHistory');
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

  // Get available practice questions for import
  async getAvailablePracticeQuestions(unitId?: string) {
    const params = unitId ? `?unitId=${unitId}` : '';
    const url = `${API_BASE_URL}/admin/exam-bank/practice-questions/available${params}`;
    return handleResponse(url, { headers: getAuthHeaders() }, 'getAvailablePracticeQuestions');
  },

  // Full Exam - Student Routes
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

  async getExamAttempt(examAttemptId: string) {
    const url = `${API_BASE_URL}/full-exam/${examAttemptId}`;
    return handleResponse(url, { headers: getAuthHeaders() }, 'getExamAttempt');
  },

  async getExamResults(examAttemptId: string) {
    const url = `${API_BASE_URL}/full-exam/${examAttemptId}/results`;
    return handleResponse(url, { headers: getAuthHeaders() }, 'getExamResults');
  },

  // Get user's exam history
  async getUserExamHistory(userId: string) {
    const url = `${API_BASE_URL}/full-exam/history/${userId}`;
    return handleResponse(url, { headers: getAuthHeaders() }, 'getUserExamHistory');
  },

  // ADMIN: Get all exam attempts
  async adminGetAllAttempts(filters?: {
    userId?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }) {
    const params = new URLSearchParams();
    if (filters?.userId) params.append('userId', filters.userId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());

    const url = `${API_BASE_URL}/admin/full-exams/attempts?${params.toString()}`;
    return handleResponse(url, { headers: getAuthHeaders() }, 'adminGetAllAttempts');
  },

  // ADMIN: Get exam statistics
  async adminGetExamStatistics() {
    const url = `${API_BASE_URL}/admin/full-exams/statistics`;
    return handleResponse(url, { headers: getAuthHeaders() }, 'adminGetExamStatistics');
  },

  // ADMIN: Get all exam users
  async adminGetExamUsers() {
    const url = `${API_BASE_URL}/admin/full-exams/users`;
    return handleResponse(url, { headers: getAuthHeaders() }, 'adminGetExamUsers');
  },

  // ADMIN: Get student exam history
  async adminGetStudentHistory(userId: string) {
    const url = `${API_BASE_URL}/admin/full-exams/users/${userId}/history`;
    return handleResponse(url, { headers: getAuthHeaders() }, 'adminGetStudentHistory');
  },

  // ADMIN: Get exam attempt details
  async adminGetExamDetails(examAttemptId: string) {
    const url = `${API_BASE_URL}/admin/full-exams/attempts/${examAttemptId}`;
    return handleResponse(url, { headers: getAuthHeaders() }, 'adminGetExamDetails');
  },
};