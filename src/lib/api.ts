const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Helper function to handle API errors
async function handleResponse(response: Response) {
  if (!response.ok) {
    let errorMessage = 'An error occurred';
    
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      // If JSON parsing fails, try to get text
      try {
        errorMessage = await response.text();
      } catch {
        // Use default error message
      }
    }
    
    throw new Error(errorMessage);
  }
  
  return response.json();
}

export const api = {
  // Units
  async getUnits() {
    const response = await fetch(`${API_BASE_URL}/units`);
    return handleResponse(response);
  },

  async getUnit(unitId: string) {
    const response = await fetch(`${API_BASE_URL}/units/${unitId}`);
    return handleResponse(response);
  },

  async getTopicsByUnit(unitId: string) {
    const response = await fetch(`${API_BASE_URL}/units/${unitId}/topics`);
    return handleResponse(response);
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
    return handleResponse(response);
  },

  async getNextQuestion(
    userId: string,
    sessionId: string,
    unitId: string,
    answeredQuestionIds: string[]
  ) {
    const response = await fetch(`${API_BASE_URL}/practice/next`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        sessionId,
        unitId,
        answeredQuestionIds,
      }),
    });
    return handleResponse(response);
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
    return handleResponse(response);
  },

  async endPracticeSession(sessionId: string) {
    const response = await fetch(`${API_BASE_URL}/practice/end/${sessionId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return handleResponse(response);
  },

  // Progress
  async getUserProgress(userId: string, unitId: string) {
    const response = await fetch(`${API_BASE_URL}/progress/${userId}/${unitId}`);
    return handleResponse(response);
  },

  async getLearningInsights(userId: string, unitId: string) {
    const response = await fetch(`${API_BASE_URL}/progress/insights/${userId}/${unitId}`);
    return handleResponse(response);
  },

  // Admin
  async getAdminStats() {
    const response = await fetch(`${API_BASE_URL}/admin/dashboard/stats`);
    return handleResponse(response);
  },

  async getDashboardStats() {
    const response = await fetch(`${API_BASE_URL}/admin/dashboard/stats`);
    return handleResponse(response);
  },

  async getQuestions(filters?: any) {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${API_BASE_URL}/admin/questions?${params}`);
    return handleResponse(response);
  },

  async getQuestion(questionId: string) {
    const response = await fetch(`${API_BASE_URL}/admin/questions/${questionId}`);
    return handleResponse(response);
  },

  async createQuestion(data: any) {
    const response = await fetch(`${API_BASE_URL}/admin/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async updateQuestion(questionId: string, data: any) {
    const response = await fetch(`${API_BASE_URL}/admin/questions/${questionId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async deleteQuestion(questionId: string) {
    const response = await fetch(`${API_BASE_URL}/admin/questions/${questionId}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  },

  async approveQuestion(questionId: string, approved: boolean) {
    const response = await fetch(`${API_BASE_URL}/admin/questions/${questionId}/approve`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approved }),
    });
    return handleResponse(response);
  },

  async bulkUploadQuestions(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_BASE_URL}/admin/questions/bulk-upload`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse(response);
  },

  // Analytics
  async getAnalytics(unitId?: string, timeRange?: string) {
    const params = new URLSearchParams();
    if (unitId) params.append('unitId', unitId);
    if (timeRange) params.append('timeRange', timeRange);
    
    const response = await fetch(`${API_BASE_URL}/analytics?${params}`);
    return handleResponse(response);
  },

  async downloadAnalyticsReport(unitId?: string, timeRange?: string) {
    const params = new URLSearchParams();
    if (unitId) params.append('unitId', unitId);
    if (timeRange) params.append('timeRange', timeRange);
    
    const response = await fetch(`${API_BASE_URL}/analytics/download?${params}`);
    return handleResponse(response);
  },

  // Settings
  async getSettings() {
    const response = await fetch(`${API_BASE_URL}/settings`);
    return handleResponse(response);
  },

  async updateSettings(settings: any) {
    const response = await fetch(`${API_BASE_URL}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    return handleResponse(response);
  },

  async resetSettings() {
    const response = await fetch(`${API_BASE_URL}/settings/reset`, {
      method: 'POST',
    });
    return handleResponse(response);
  },

  async exportSettings() {
    const response = await fetch(`${API_BASE_URL}/settings/export`);
    return handleResponse(response);
  },

  async importSettings(settings: any) {
    const response = await fetch(`${API_BASE_URL}/settings/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    return handleResponse(response);
  },
};