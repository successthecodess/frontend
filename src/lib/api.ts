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
// Add this at the top of your API calls
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

// Update your fetch calls to use auth headers
const response = await fetch(`${API_BASE_URL}/endpoint`, {
  method: 'GET',
  headers: getAuthHeaders(),
});
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
    return handleResponse(url, {}, 'getUnits');
  },

  async getUnit(unitId: string) {
    const url = `${API_BASE_URL}/units/${unitId}`;
    return handleResponse(url, {}, 'getUnit');
  },

  async getTopicsByUnit(unitId: string) {
    const url = `${API_BASE_URL}/units/${unitId}/topics`;
    return handleResponse(url, {}, 'getTopicsByUnit');
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
        headers: { 'Content-Type': 'application/json' },
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
        headers: { 'Content-Type': 'application/json' },
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
        headers: { 'Content-Type': 'application/json' },
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
        headers: { 'Content-Type': 'application/json' },
      },
      'endPracticeSession'
    );
  },

  // Progress
  async getUserProgress(userId: string, unitId: string) {
    const url = `${API_BASE_URL}/progress/${userId}/${unitId}`;
    return handleResponse(url, {}, 'getUserProgress');
  },

  async getLearningInsights(userId: string, unitId: string) {
    const url = `${API_BASE_URL}/progress/insights/${userId}/${unitId}`;
    return handleResponse(url, {}, 'getLearningInsights');
  },

  // Dashboard
  async getDashboardOverview(userId: string) {
    const url = `${API_BASE_URL}/progress/dashboard/${userId}/overview`;
    return handleResponse(url, {}, 'getDashboardOverview');
  },

  async getPerformanceHistory(userId: string, days = 30, unitId?: string) {
    const params = new URLSearchParams({ days: days.toString() });
    if (unitId) params.append('unitId', unitId);
    
    const url = `${API_BASE_URL}/progress/dashboard/${userId}/performance-history?${params}`;
    return handleResponse(url, {}, 'getPerformanceHistory');
  },

  async getStreaks(userId: string) {
    const url = `${API_BASE_URL}/progress/dashboard/${userId}/streaks`;
    return handleResponse(url, {}, 'getStreaks');
  },

  async getAchievements(userId: string) {
    const url = `${API_BASE_URL}/progress/dashboard/${userId}/achievements`;
    return handleResponse(url, {}, 'getAchievements');
  },

  // Admin
  async getAdminStats() {
    const url = `${API_BASE_URL}/admin/dashboard/stats`;
    return handleResponse(url, {}, 'getAdminStats');
  },

  async getQuestions(filters?: any) {
    const params = new URLSearchParams(filters);
    const url = `${API_BASE_URL}/admin/questions?${params}`;
    return handleResponse(url, {}, 'getQuestions');
  },

  async getQuestion(questionId: string) {
    const url = `${API_BASE_URL}/admin/questions/${questionId}`;
    return handleResponse(url, {}, 'getQuestion');
  },

  async createQuestion(data: any) {
    const url = `${API_BASE_URL}/admin/questions`;
    return handleResponse(
      url,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        headers: { 'Content-Type': 'application/json' },
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved }),
      },
      'approveQuestion'
    );
  },

  async bulkUploadQuestions(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    
    const url = `${API_BASE_URL}/admin/questions/bulk-upload`;
    return handleResponse(
      url,
      {
        method: 'POST',
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
    return handleResponse(url, {}, 'getAnalytics');
  },

  async downloadAnalyticsReport(unitId?: string, timeRange?: string) {
    const params = new URLSearchParams();
    if (unitId) params.append('unitId', unitId);
    if (timeRange) params.append('timeRange', timeRange);
    
    const url = `${API_BASE_URL}/analytics/download?${params}`;
    return handleResponse(url, {}, 'downloadAnalyticsReport');
  },

  // GoHighLevel Integration
  async connectGHL(userId: string) {
    const url = `${API_BASE_URL}/ghl/connect?userId=${userId}`;
    const result = await handleResponse(url, {}, 'connectGHL');
    return { data: result };
  },

  async getGHLStatus(userId: string) {
    const url = `${API_BASE_URL}/ghl/status?userId=${userId}`;
    const result = await handleResponse(url, {}, 'getGHLStatus');
    return { data: result };
  },

  async disconnectGHL(userId: string) {
    const url = `${API_BASE_URL}/ghl/disconnect?userId=${userId}`;
    const result = await handleResponse(
      url,
      { method: 'DELETE' },
      'disconnectGHL'
    );
    return { data: result };
  },

  async syncGHLContact(userId: string, contactData: any) {
    const url = `${API_BASE_URL}/ghl/sync-contact`;
    const result = await handleResponse(
      url,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, contactData }),
      },
      'syncGHLContact'
    );
    return { data: result };
  },
};