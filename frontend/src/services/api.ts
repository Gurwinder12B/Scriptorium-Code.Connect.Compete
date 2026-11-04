const API_BASE = '/api/v1';

export class ApiError extends Error {
  code: string;
  details: Record<string, string>;
  status: number;

  constructor(message: string, code = 'ERROR', details = {}, status = 500) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.details = details;
    this.status = status;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('scriptorium_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.success === false) {
    const error = data.error || {};
    throw new ApiError(
      error.message || `Request failed with status ${response.status}`,
      error.code || 'UNKNOWN_ERROR',
      error.details || {},
      response.status
    );
  }

  return data.data as T;
}

// ----------------------------------------------------------------------------
// API Services
// ----------------------------------------------------------------------------

export const authApi = {
  login: (loginData: { login: string; password: string }) =>
    request<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(loginData),
    }),
  register: (regData: { username: string; email: string; password: string }) =>
    request<{ user: any; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(regData),
    }),
  logout: () => request<{ message: string }>('/auth/logout', { method: 'POST' }),
  me: () => request<any>('/auth/me'),
};

export const usersApi = {
  getProfile: (username: string) => request<any>(`/users/profile/${username}`),
  updateProfile: (profileData: any) =>
    request<any>('/users/profile', {
      method: 'PATCH',
      body: JSON.stringify(profileData),
    }),
  getDashboard: () => request<any>('/users/dashboard'),
};

export const communityApi = {
  getQuestions: (params?: { page?: number; per_page?: number; sort?: string; tag?: string; q?: string }) => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.per_page) query.append('per_page', params.per_page.toString());
    if (params?.sort) query.append('sort', params.sort);
    if (params?.tag) query.append('tag', params.tag);
    if (params?.q) query.append('q', params.q);
    return request<any[]>(`/community/questions?${query.toString()}`);
  },
  getQuestion: (id: number) => request<any>(`/community/questions/${id}`),
  createQuestion: (data: { title: string; content_markdown: string; tags: string[] }) =>
    request<any>('/community/questions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateQuestion: (id: number, data: { title?: string; content_markdown?: string }) =>
    request<any>(`/community/questions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteQuestion: (id: number) =>
    request<any>(`/community/questions/${id}`, { method: 'DELETE' }),
  createAnswer: (questionId: number, data: { content_markdown: string }) =>
    request<any>(`/community/questions/${questionId}/answers`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  acceptAnswer: (questionId: number, answerId: number) =>
    request<any>(`/community/questions/${questionId}/accept`, {
      method: 'POST',
      body: JSON.stringify({ answer_id: answerId }),
    }),
  castVote: (target_type: 'question' | 'answer', target_id: number, value: number) =>
    request<{ vote_count: number; user_vote: number }>('/community/votes', {
      method: 'POST',
      body: JSON.stringify({ target_type, target_id, value }),
    }),
  createComment: (target_type: 'question' | 'answer', target_id: number, content: string) =>
    request<any>('/community/comments', {
      method: 'POST',
      body: JSON.stringify({ target_type, target_id, content }),
    }),
  getTags: () => request<any[]>('/community/tags'),
};

export const problemsApi = {
  getProblems: (params?: { page?: number; difficulty?: string; tag?: string; q?: string }) => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.difficulty) query.append('difficulty', params.difficulty);
    if (params?.tag) query.append('tag', params.tag);
    if (params?.q) query.append('q', params.q);
    return request<any[]>(`/problems?${query.toString()}`);
  },
  getProblem: (idOrSlug: string | number) => request<any>(`/problems/${idOrSlug}`),
  createProblem: (data: any) =>
    request<any>('/problems', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateProblem: (id: number, data: any) =>
    request<any>(`/problems/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

export const submissionsApi = {
  submitCode: (data: { problem_id: number; language: string; source_code: string }) =>
    request<any>('/submissions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getSubmission: (id: number) => request<any>(`/submissions/${id}`),
  listSubmissions: (problemId?: number) => {
    const query = problemId ? `?problem_id=${problemId}` : '';
    return request<any[]>(`/submissions${query}`);
  },
};

export const progressApi = {
  getSummary: () => request<any>('/progress/summary'),
};

export const leaderboardApi = {
  getLeaderboard: (limit = 50) => request<any[]>(`/leaderboard?limit=${limit}`),
};

export const notificationsApi = {
  getNotifications: () => request<any[]>('/notifications'),
  markRead: (id: number) => request<any>(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllRead: () => request<any>('/notifications/mark-all-read', { method: 'POST' }),
};

export const moderationApi = {
  reportContent: (data: { target_type: string; target_id: number; reason: string; details?: string }) =>
    request<any>('/moderation/reports', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getReports: (status = 'PENDING') => request<any[]>(`/moderation/reports?status=${status}`),
  resolveReport: (data: { report_id: number; action: string; reason?: string }) =>
    request<any>('/moderation/resolve', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

export const adminApi = {
  getStats: () => request<any>('/admin/stats'),
  getUsers: () => request<any[]>('/admin/users'),
  changeUserRole: (userId: number, role: string, is_active?: boolean) =>
    request<any>(`/admin/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role, is_active }),
    }),
  getAuditLogs: () => request<any[]>('/admin/audit-logs'),
};
