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
  
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function isRetryableError(error: any, statusCode?: number): boolean {
  if (error instanceof TypeError && error.message.includes('fetch')) {
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
  retryCount = 0
): Promise<any> {
  try {
    const response = await fetchWithTimeout(url, options);
    
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
        return handleResponse(url, options, context, retryCount + 1);
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
        error: error.message,
        url,
      });
      
      await sleep(RETRY_DELAY * Math.pow(2, retryCount));
      return handleResponse(url, options, context, retryCount + 1);
    }
    
    console.error('❌ Request Failed:', {
      context,
      error: error.message,
      url,
      retries: retryCount,
    });
    
    if (error.name === 'AbortError') {
      throw new APIError('Request timed out. Please check your connection and try again.', undefined, context);
    }
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new APIError('Unable to connect to server. Please check your internet connection.', undefined, context);
    }
    
    throw error;
  }
}

export const api = {
  // Units
  async getUnits() {
    const url = `${API_BASE_URL}/units`;
    return handleResponse(url, { headers: getAuthHeaders() }, 'getUnits');
  },

  async getUnit(unitId: string) {
    const url = `${API_BASE_URL}/units/${unitId}`;
    return handleResponse(url, { headers: getAuthHeaders() }, 'getUnit');
  },

  async getTopicsByUnit(unitId: string) {
    const url = `${API_BASE_URL}/units/${unitId}/topics`;
    return handleResponse(url, { headers: getAuthHeaders() }, 'getTopicsByUnit');
  },

  // Practice
  async startPracticeSession(
    userId: string,
    unitId: string,
    topicId?: string,
    userEmail?: string,
    userName?: string,
    targetQuestions?: number
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
        }),
      },
      'startPracticeSession'
    );
  },

  async getNextQuestion(
    userId: string,
    sessionId: string,
    unitId: string,
    answeredQuestionIds: string[]
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

  // Progress
  async getUserProgress(userId: string, unitId: string) {
    const url = `${API_BASE_URL}/progress/${userId}/${unitId}`;
    return handleResponse(url, { headers: getAuthHeaders() }, 'getUserProgress');
  },

  async getLearningInsights(userId: string, unitId: string) {
    const url = `${API_BASE_URL}/progress/insights/${userId}/${unitId}`;
    return handleResponse(url, { headers: getAuthHeaders() }, 'getLearningInsights');
  },

  // Dashboard
  async getDashboardOverview(userId: string) {
    const url = `${API_BASE_URL}/progress/dashboard/${userId}/overview`;
    return handleResponse(url, { headers: getAuthHeaders() }, 'getDashboardOverview');
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
    
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    
    const url = `${API_BASE_URL}/admin/questions/bulk-upload`;
    return handleResponse(
      url,
      {
        method: 'POST',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
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
};