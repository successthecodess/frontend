import { TokenManager } from '@/utils/tokenManager';
import type { PartResponse } from '@/types/exam';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Retry configuration
const MAX_RETRIES = 2;
const RETRY_DELAY = 500;
const TIMEOUT = 15000;

// Request deduplication cache
const pendingRequests = new Map<string, Promise<any>>();
const responseCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 30000;

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

const getAuthHeaders = () => {
  if (typeof window === 'undefined') return { 'Content-Type': 'application/json' };

  const token = TokenManager.getAccessToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function isRetryableError(error: any, statusCode?: number): boolean {
  if (statusCode && statusCode >= 500 && statusCode !== 501) {
    return true;
  }

  if (statusCode === 429) {
    return true;
  }

  if (!error) {
    return false;
  }

  if (error instanceof TypeError && error.message && error.message.includes('fetch')) {
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

    if (response.status === 401 && !hasAttemptedRefresh) {
      const errorData = await response.json().catch(() => ({}));

      if (errorData.code === 'TOKEN_EXPIRED') {
        const newToken = await TokenManager.refreshAccessToken();

        if (newToken) {
          const newOptions = {
            ...options,
            headers: {
              ...options.headers,
              Authorization: `Bearer ${newToken}`,
            },
          };

          return handleResponse(url, newOptions, context, retryCount, true);
        } else {
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
        await sleep(RETRY_DELAY * Math.pow(2, retryCount));
        return handleResponse(url, options, context, retryCount + 1, hasAttemptedRefresh);
      }

      throw new APIError(errorMessage, response.status, context);
    }

    return response.json();
  } catch (error: any) {
    if (isRetryableError(error) && retryCount < MAX_RETRIES) {
      await sleep(RETRY_DELAY * Math.pow(2, retryCount));
      return handleResponse(url, options, context, retryCount + 1, hasAttemptedRefresh);
    }

    if (error.name === 'AbortError') {
      throw new APIError(
        'Request timed out. Please check your connection and try again.',
        undefined,
        context
      );
    }

    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new APIError(
        'Unable to connect to server. Please check your internet connection.',
        undefined,
        context
      );
    }

    throw error;
  }
}

async function cachedFetch(
  cacheKey: string,
  fetchFn: () => Promise<any>,
  ttl: number = CACHE_TTL
): Promise<any> {
  const cached = responseCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data;
  }

  const pending = pendingRequests.get(cacheKey);
  if (pending) {
    return pending;
  }

  const promise = fetchFn()
    .then((data) => {
      responseCache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    })
    .finally(() => {
      setTimeout(() => pendingRequests.delete(cacheKey), 100);
    });

  pendingRequests.set(cacheKey, promise);
  return promise;
}

// Main API for practice, progress, analytics
export const api = {
  // Units - CACHED
  async getUnits() {
    return cachedFetch('getUnits', () => {
      const url = `${API_BASE_URL}/units`;
      return handleResponse(url, { headers: getAuthHeaders() }, 'getUnits');
    }, 60000);
  },

  async getUnit(unitId: string) {
    return cachedFetch(`getUnit_${unitId}`, () => {
      const url = `${API_BASE_URL}/units/${unitId}`;
      return handleResponse(url, { headers: getAuthHeaders() }, 'getUnit');
    }, 60000);
  },

  async getTopicsByUnit(unitId: string) {
    return cachedFetch(`getTopics_${unitId}`, () => {
      const url = `${API_BASE_URL}/units/${unitId}/topics`;
      return handleResponse(url, { headers: getAuthHeaders() }, 'getTopicsByUnit');
    }, 60000);
  },

  // Practice - NO CACHE (dynamic data)
  // Updated to make unitId optional for mixed mode
  async startPracticeSession(
    userId: string,
    unitId?: string,
    topicId?: string,
    userEmail?: string,
    userName?: string,
    targetQuestions?: number,
    mixed?: boolean
  ) {
    const url = `${API_BASE_URL}/practice/start`;
    return handleResponse(
      url,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          userId,
          unitId,
          topicId,
          userEmail,
          userName,
          targetQuestions,
          mixed,
        }),
      },
      'startPracticeSession'
    );
  },

 // Updated to include difficulty parameter for adaptive learning
async getNextQuestion(
  userId: string,
  sessionId: string,
  unitId?: string,
  answeredQuestionIds?: string[],
  mixed?: boolean,
  difficulty?: string // NEW: Pass requested difficulty
) {
  const url = `${API_BASE_URL}/practice/next`;
  return handleResponse(
    url,
    {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        userId,
        sessionId,
        unitId,
        answeredQuestionIds,
        mixed,
        difficulty, // NEW: Include in request
      }),
    },
    'getNextQuestion'
  );
},
  async submitAnswer(
    userId: string,
    sessionId: string,
    questionId: string,
    userAnswer: string,
    timeSpent: number
  ) {
    const url = `${API_BASE_URL}/practice/submit`;
    return handleResponse(
      url,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          userId,
          sessionId,
          questionId,
          userAnswer,
          timeSpent,
        }),
      },
      'submitAnswer'
    );
  },

  async endPracticeSession(sessionId: string) {
    const url = `${API_BASE_URL}/practice/end/${sessionId}`;
    return handleResponse(
      url,
      {
        method: 'POST',
        headers: getAuthHeaders(),
      },
      'endPracticeSession'
    );
  },

  // Progress - SHORT CACHE
  async getUserProgress(userId: string, unitId?: string) {
    const cacheKey = unitId ? `progress_${userId}_${unitId}` : `progress_${userId}_all`;
    return cachedFetch(cacheKey, () => {
      const url = unitId 
        ? `${API_BASE_URL}/progress/${userId}/${unitId}`
        : `${API_BASE_URL}/progress/${userId}`;
      return handleResponse(url, { headers: getAuthHeaders() }, 'getUserProgress');
    }, 5000);
  },

  async getLearningInsights(userId: string, unitId?: string) {
    const cacheKey = unitId ? `insights_${userId}_${unitId}` : `insights_${userId}_all`;
    return cachedFetch(cacheKey, () => {
      const url = unitId
        ? `${API_BASE_URL}/progress/insights/${userId}/${unitId}`
        : `${API_BASE_URL}/progress/insights/${userId}`;
      return handleResponse(url, { headers: getAuthHeaders() }, 'getLearningInsights');
    }, 10000);
  },

  // Dashboard
  async getDashboardOverview(userId: string) {
    return cachedFetch(`dashboard_${userId}`, () => {
      const url = `${API_BASE_URL}/progress/dashboard/${userId}/overview`;
      return handleResponse(url, { headers: getAuthHeaders() }, 'getDashboardOverview');
    }, 30000);
  },

  async getPerformanceHistory(userId: string, days = 30, unitId?: string) {
    const params = new URLSearchParams({ days: days.toString() });
    if (unitId) params.append('unitId', unitId);

    const url = `${API_BASE_URL}/progress/dashboard/${userId}/performance-history?${params}`;
    return handleResponse(url, { headers: getAuthHeaders() }, 'getPerformanceHistory');
  },

  async getStreaks(userId: string) {
    const url = `${API_BASE_URL}/progress/dashboard/${userId}/streaks`;
    return handleResponse(url, { headers: getAuthHeaders() }, 'getStreaks');
  },

  async getAchievements(userId: string) {
    const url = `${API_BASE_URL}/progress/dashboard/${userId}/achievements`;
    return handleResponse(url, { headers: getAuthHeaders() }, 'getAchievements');
  },

  // Admin
  async getAdminStats() {
    const url = `${API_BASE_URL}/admin/dashboard/stats`;
    return handleResponse(url, { headers: getAuthHeaders() }, 'getAdminStats');
  },

  async getQuestions(filters?: any) {
    const params = new URLSearchParams(filters);
    const url = `${API_BASE_URL}/admin/questions?${params}`;
    return handleResponse(url, { headers: getAuthHeaders() }, 'getQuestions');
  },

  async getQuestion(questionId: string) {
    const url = `${API_BASE_URL}/admin/questions/${questionId}`;
    return handleResponse(url, { headers: getAuthHeaders() }, 'getQuestion');
  },

  async createQuestion(data: any) {
    const url = `${API_BASE_URL}/admin/questions`;
    return handleResponse(
      url,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      },
      'createQuestion'
    );
  },
async getSessionAnswers(sessionId: string) {
  const url = `${API_BASE_URL}/practice/session/${sessionId}/answers`;
  return handleResponse(url, { headers: getAuthHeaders() }, 'getSessionAnswers');
},
  async updateQuestion(questionId: string, data: any) {
    const url = `${API_BASE_URL}/admin/questions/${questionId}`;
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
    const url = `${API_BASE_URL}/admin/questions/${questionId}`;
    return handleResponse(
      url,
      {
        method: 'DELETE',
        headers: getAuthHeaders(),
      },
      'deleteQuestion'
    );
  },

  async approveQuestion(questionId: string, approved: boolean) {
    const url = `${API_BASE_URL}/admin/questions/${questionId}/approve`;
    return handleResponse(
      url,
      {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ approved }),
      },
      'approveQuestion'
    );
  },

  async bulkUploadQuestions(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const token = TokenManager.getAccessToken();

    const url = `${API_BASE_URL}/admin/questions/bulk-upload`;
    return handleResponse(
      url,
      {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      },
      'bulkUploadQuestions'
    );
  },

  // Analytics
  async getAnalytics(unitId?: string, timeRange?: string) {
    const params = new URLSearchParams();
    if (unitId) params.append('unitId', unitId);
    if (timeRange) params.append('timeRange', timeRange);

    const url = `${API_BASE_URL}/analytics?${params}`;
    return handleResponse(url, { headers: getAuthHeaders() }, 'getAnalytics');
  },

  async downloadAnalyticsReport(unitId?: string, timeRange?: string) {
    const params = new URLSearchParams();
    if (unitId) params.append('unitId', unitId);
    if (timeRange) params.append('timeRange', timeRange);

    const url = `${API_BASE_URL}/analytics/download?${params}`;
    return handleResponse(url, { headers: getAuthHeaders() }, 'downloadAnalyticsReport');
  },

  // GoHighLevel Integration
  async syncProgress(userId: string, progressData: any) {
    const url = `${API_BASE_URL}/auth/oauth/sync-progress`;
    return handleResponse(
      url,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ userId, progressData }),
      },
      'syncProgress'
    );
  },

  // Cache invalidation helper
  invalidateCache(pattern?: string) {
    if (pattern) {
      for (const key of responseCache.keys()) {
        if (key.includes(pattern)) {
          responseCache.delete(key);
        }
      }
    } else {
      responseCache.clear();
    }
  },
};

// Exam API for full exam simulation
export const examApi = {
  async getExamUnits() {
    return cachedFetch('examUnits', () => {
      const url = `${API_BASE_URL}/admin/exam-bank/units`;
      return handleResponse(url, { headers: getAuthHeaders() }, 'getExamUnits');
    }, 60000);
  },

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
    return cachedFetch('examQuestionCounts', () => {
      const url = `${API_BASE_URL}/admin/exam-bank/questions/counts`;
      return handleResponse(url, { headers: getAuthHeaders() }, 'getQuestionCounts');
    }, 30000);
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

  async importMCQToExamBank(questionIds: string[]) {
    const url = `${API_BASE_URL}/admin/exam-bank/import`;
    return handleResponse(
      url,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ questionIds }),
      },
      'importMCQToExamBank'
    );
  },

  async getAvailablePracticeQuestions(unitId?: string) {
    const params = unitId ? `?unitId=${unitId}` : '';
    const url = `${API_BASE_URL}/admin/practice-questions/available${params}`;
    return handleResponse(url, { headers: getAuthHeaders() }, 'getAvailablePracticeQuestions');
  },

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

  async flagMCQForReview(data: { examAttemptId: string; orderIndex: number; flagged: boolean }) {
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

  async submitFullExam(data: { examAttemptId: string; totalTimeSpent: number }) {
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
};