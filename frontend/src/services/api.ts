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
    ...(options.headers as Record<string, string>),
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

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

export const uploadApi = {
  uploadFile: (file: File, subfolder = 'general', mediaType = 'image') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('subfolder', subfolder);
    formData.append('media_type', mediaType);
    return request<{ url: string; filename: string }>('/uploads', {
      method: 'POST',
      body: formData,
    });
  },
};

export const eventsApi = {
  getEvents: (params: { category?: string; year?: number | string; club?: string; q?: string; page?: number; per_page?: number; archived?: boolean } = {}) => {
    const searchParams = new URLSearchParams();
    if (params.category) searchParams.set('category', params.category);
    if (params.year) searchParams.set('year', String(params.year));
    if (params.club) searchParams.set('club', params.club);
    if (params.q) searchParams.set('q', params.q);
    if (params.page) searchParams.set('page', String(params.page));
    if (params.per_page) searchParams.set('per_page', String(params.per_page));
    if (params.archived) searchParams.set('archived', 'true');
    return request<any>(`/events?${searchParams.toString()}`);
  },
  getEvent: (identifier: string | number) => request<any>(`/events/${identifier}`),
  createEvent: (data: any) =>
    request<any>('/events', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateEvent: (id: number, data: any) =>
    request<any>(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteEvent: (id: number) =>
    request<any>(`/events/${id}`, {
      method: 'DELETE',
    }),
  createAlbum: (eventId: number, data: { title: string; description?: string }) =>
    request<any>(`/events/${eventId}/albums`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  uploadMedia: (eventId: number, mediaData: FormData | Record<string, any>) => {
    const isFormData = mediaData instanceof FormData;
    return request<any>(`/events/${eventId}/media`, {
      method: 'POST',
      body: isFormData ? mediaData : JSON.stringify(mediaData),
    });
  },
  deleteMedia: (eventId: number, mediaId: number) =>
    request<any>(`/events/${eventId}/media/${mediaId}`, {
      method: 'DELETE',
    }),
  reorderMedia: (eventId: number, mediaIds: number[]) =>
    request<any>(`/events/${eventId}/media/reorder`, {
      method: 'POST',
      body: JSON.stringify({ media_ids: mediaIds }),
    }),
};

export const blogsApi = {
  getBlogs: (params: {
    category?: string;
    tag?: string;
    author?: string;
    q?: string;
    sort?: string;
    featured?: boolean;
    editors_pick?: boolean;
    status?: string;
    page?: number;
    per_page?: number;
  } = {}) => {
    const searchParams = new URLSearchParams();
    if (params.category) searchParams.set('category', params.category);
    if (params.tag) searchParams.set('tag', params.tag);
    if (params.author) searchParams.set('author', params.author);
    if (params.q) searchParams.set('q', params.q);
    if (params.sort) searchParams.set('sort', params.sort);
    if (params.featured) searchParams.set('featured', 'true');
    if (params.editors_pick) searchParams.set('editors_pick', 'true');
    if (params.status) searchParams.set('status', params.status);
    if (params.page) searchParams.set('page', String(params.page));
    if (params.per_page) searchParams.set('per_page', String(params.per_page));
    return request<any>(`/blogs?${searchParams.toString()}`);
  },
  getCategories: () => request<any[]>('/blogs/categories'),
  createCategory: (data: { name: string; description?: string }) =>
    request<any>('/blogs/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getBlog: (idOrSlug: string | number) => request<any>(`/blogs/${idOrSlug}`),
  createBlog: (data: any) =>
    request<any>('/blogs', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateBlog: (id: number, data: any) =>
    request<any>(`/blogs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteBlog: (id: number) =>
    request<any>(`/blogs/${id}`, {
      method: 'DELETE',
    }),
  toggleLike: (id: number) =>
    request<{ like_count: number; user_has_liked: boolean }>(`/blogs/${id}/like`, {
      method: 'POST',
    }),
  toggleBookmark: (id: number) =>
    request<{ user_has_bookmarked: boolean }>(`/blogs/${id}/bookmark`, {
      method: 'POST',
    }),
  addComment: (id: number, data: { content: string; parent_id?: number }) =>
    request<any>(`/blogs/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getEditorialCalendar: () => request<any>('/blogs/editorial/calendar'),
  moderateBlog: (id: number, data: { action: string; reason?: string; scheduled_at?: string }) =>
    request<any>(`/blogs/${id}/moderate`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

export const projectsApi = {
  getProjects: (params: {
    category?: string;
    tag?: string;
    author?: string;
    q?: string;
    sort?: string;
    page?: number;
    per_page?: number;
  } = {}) => {
    const searchParams = new URLSearchParams();
    if (params.category) searchParams.set('category', params.category);
    if (params.tag) searchParams.set('tag', params.tag);
    if (params.author) searchParams.set('author', params.author);
    if (params.q) searchParams.set('q', params.q);
    if (params.sort) searchParams.set('sort', params.sort);
    if (params.page) searchParams.set('page', String(params.page));
    if (params.per_page) searchParams.set('per_page', String(params.per_page));
    return request<any>(`/projects?${searchParams.toString()}`);
  },
  getProject: (idOrSlug: string | number) => request<any>(`/projects/${idOrSlug}`),
  createProject: (data: any) =>
    request<any>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateProject: (id: number, data: any) =>
    request<any>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteProject: (id: number) =>
    request<any>(`/projects/${id}`, {
      method: 'DELETE',
    }),
  toggleUpvote: (id: number) =>
    request<{ upvote_count: number; user_has_upvoted: boolean }>(`/projects/${id}/upvote`, {
      method: 'POST',
    }),
  submitReview: (
    id: number,
    data: {
      summary: string;
      architecture_feedback?: string;
      performance_feedback?: string;
      security_feedback?: string;
      ui_ux_feedback?: string;
      rating_overall: number;
    }
  ) =>
    request<any>(`/projects/${id}/reviews`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateReviewStatus: (projectId: number, reviewId: number, status: 'OPEN' | 'ADDRESSED' | 'RESOLVED') =>
    request<any>(`/projects/${projectId}/reviews/${reviewId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  upvoteReview: (projectId: number, reviewId: number) =>
    request<{ upvote_count: number; user_has_upvoted: boolean }>(
      `/projects/${projectId}/reviews/${reviewId}/upvote`,
      {
        method: 'POST',
      }
    ),
  addReviewComment: (
    projectId: number,
    reviewId: number,
    data: { content: string; code_snippet?: string }
  ) =>
    request<any>(`/projects/${projectId}/reviews/${reviewId}/comments`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  addMedia: (projectId: number, data: { media_url: string; caption?: string; display_order?: number }) =>
    request<any>(`/projects/${projectId}/media`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

