const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Helper function to handle API errors
async function handleResponse(response: Response, context?: string) {
  if (!response.ok) {
    let errorMessage = 'An error occurred';
    
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      try {
        errorMessage = await response.text();
      } catch {}
    }
    
    // Log detailed error info for debugging
    console.error('❌ API Error:', {
      context,
      status: response.status,
      statusText: response.statusText,
      url: response.url,
      message: errorMessage,
    });
    
    throw new Error(errorMessage);
  }
  
  return response.json();
}

export const api = {
  // Units
  async getUnits() {
    const response = await fetch(`${API_BASE_URL}/units`);
    return handleResponse(response, 'getUnits');
  },

  async getUnit(unitId: string) {
    const response = await fetch(`${API_BASE_URL}/units/${unitId}`);
    return handleResponse(response, 'getUnit');
  },

  async getTopicsByUnit(unitId: string) {
    const response = await fetch(`${API_BASE_URL}/units/${unitId}/topics`);
    return handleResponse(response, 'getTopicsByUnit');
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
    const response = await fetch(`${API_BASE_URL}/practice/start`, {
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
    });
    return handleResponse(response, 'startPracticeSession');
  },

  async getNextQuestion(
  userId: string,
  sessionId: string,
  unitId: string,
  answeredQuestionIds: string[]
) {
  console.log('🔄 API: Getting next question', {
    userId,
    sessionId,
    unitId,
    answeredCount: answeredQuestionIds.length,
  });

  const response = await fetch(`${API_BASE_URL}/practice/next`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      sessionId,
      unitId, // CRITICAL: Make sure unitId is sent!
      answeredQuestionIds,
    }),
  });
  return handleResponse(response, 'getNextQuestion');
},

  async submitAnswer(
    userId: string,
    sessionId: string,
    questionId: string,
    userAnswer: string,
    timeSpent: number
  ) {
    const response = await fetch(`${API_BASE_URL}/practice/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        sessionId,
        questionId,
        userAnswer,
        timeSpent,
      }),
    });
    return handleResponse(response, 'submitAnswer');
  },

  async endPracticeSession(sessionId: string) {
    const response = await fetch(`${API_BASE_URL}/practice/end/${sessionId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return handleResponse(response, 'endPracticeSession');
  },

  // Progress
  async getUserProgress(userId: string, unitId: string) {
    const response = await fetch(`${API_BASE_URL}/progress/${userId}/${unitId}`);
    return handleResponse(response, 'getUserProgress');
  },

  async getLearningInsights(userId: string, unitId: string) {
    const response = await fetch(`${API_BASE_URL}/progress/insights/${userId}/${unitId}`);
    return handleResponse(response, 'getLearningInsights');
  },

  // Admin
  async getAdminStats() {
    const response = await fetch(`${API_BASE_URL}/admin/dashboard/stats`);
    return handleResponse(response, 'getAdminStats');
  },

  async getQuestions(filters?: any) {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${API_BASE_URL}/admin/questions?${params}`);
    return handleResponse(response, 'getQuestions');
  },

  async getQuestion(questionId: string) {
    console.log('📝 Fetching question:', questionId);
    const response = await fetch(`${API_BASE_URL}/admin/questions/${questionId}`);
    return handleResponse(response, 'getQuestion');
  },

  async createQuestion(data: any) {
    const response = await fetch(`${API_BASE_URL}/admin/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(response, 'createQuestion');
  },

  async updateQuestion(questionId: string, data: any) {
    const response = await fetch(`${API_BASE_URL}/admin/questions/${questionId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(response, 'updateQuestion');
  },

  async deleteQuestion(questionId: string) {
    const response = await fetch(`${API_BASE_URL}/admin/questions/${questionId}`, {
      method: 'DELETE',
    });
    return handleResponse(response, 'deleteQuestion');
  },

  async approveQuestion(questionId: string, approved: boolean) {
    const response = await fetch(`${API_BASE_URL}/admin/questions/${questionId}/approve`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approved }),
    });
    return handleResponse(response, 'approveQuestion');
  },

  async bulkUploadQuestions(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_BASE_URL}/admin/questions/bulk-upload`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse(response, 'bulkUploadQuestions');
  },

  // Analytics
  async getAnalytics(unitId?: string, timeRange?: string) {
    const params = new URLSearchParams();
    if (unitId) params.append('unitId', unitId);
    if (timeRange) params.append('timeRange', timeRange);
    
    const response = await fetch(`${API_BASE_URL}/analytics?${params}`);
    return handleResponse(response, 'getAnalytics');
  },

  async downloadAnalyticsReport(unitId?: string, timeRange?: string) {
    const params = new URLSearchParams();
    if (unitId) params.append('unitId', unitId);
    if (timeRange) params.append('timeRange', timeRange);
    
    const response = await fetch(`${API_BASE_URL}/analytics/download?${params}`);
    return handleResponse(response, 'downloadAnalyticsReport');
  },

  // Settings
  async getSettings() {
    const response = await fetch(`${API_BASE_URL}/settings`);
    return handleResponse(response, 'getSettings');
  },

  async updateSettings(settings: any) {
    const response = await fetch(`${API_BASE_URL}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    return handleResponse(response, 'updateSettings');
  },

  async resetSettings() {
    const response = await fetch(`${API_BASE_URL}/settings/reset`, {
      method: 'POST',
    });
    return handleResponse(response, 'resetSettings');
  },

  async exportSettings() {
    const response = await fetch(`${API_BASE_URL}/settings/export`);
    return handleResponse(response, 'exportSettings');
  },

  async importSettings(settings: any) {
    const response = await fetch(`${API_BASE_URL}/settings/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    return handleResponse(response, 'importSettings');
  },
};