import {
  fallbackProblems,
  fallbackTags,
  fallbackQuestions,
  fallbackLeaderboard,
  fallbackBlogCategories,
  fallbackBlogs,
  fallbackProjects,
  fallbackClubs,
  fallbackEvents,
} from './fallbackData';

const envApiUrl = typeof import.meta !== 'undefined' && (import.meta as any).env ? (import.meta as any).env.VITE_API_BASE_URL : '';
const API_BASE = (envApiUrl ? String(envApiUrl).replace(/\/+$/, '') : '') + '/api/v1';

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

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new ApiError('Backend API is currently offline or unreachable.', 'API_OFFLINE', {}, response.status);
  }

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

  return (data.data !== undefined ? data.data : data) as T;
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
  getQuestions: async (params?: { page?: number; per_page?: number; sort?: string; tag?: string; q?: string }) => {
    try {
      const query = new URLSearchParams();
      if (params?.page) query.append('page', params.page.toString());
      if (params?.per_page) query.append('per_page', params.per_page.toString());
      if (params?.sort) query.append('sort', params.sort);
      if (params?.tag) query.append('tag', params.tag);
      if (params?.q) query.append('q', params.q);
      const res = await request<any[]>(`/community/questions?${query.toString()}`);
      return Array.isArray(res) ? res : fallbackQuestions;
    } catch {
      let result = [...fallbackQuestions];
      if (params?.tag) result = result.filter(q => q.tags.some(t => t.slug === params.tag));
      if (params?.q) {
        const q = params.q.toLowerCase();
        result = result.filter(item => item.title.toLowerCase().includes(q) || item.content_markdown.toLowerCase().includes(q));
      }
      return result;
    }
  },
  getQuestion: async (id: number) => {
    try {
      const res = await request<any>(`/community/questions/${id}`);
      if (res && res.title) return res;
      throw new Error('Invalid question payload');
    } catch {
      const found = fallbackQuestions.find(q => String(q.id) === String(id) || q.slug === String(id));
      return found || fallbackQuestions[0];
    }
  },
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
  getTags: async () => {
    try {
      const res = await request<any[]>('/community/tags');
      return Array.isArray(res) ? res : fallbackTags;
    } catch {
      return fallbackTags;
    }
  },
};

export const problemsApi = {
  getProblems: async (params?: { page?: number; difficulty?: string; tag?: string; q?: string }) => {
    try {
      const query = new URLSearchParams();
      if (params?.page) query.append('page', params.page.toString());
      if (params?.difficulty) query.append('difficulty', params.difficulty);
      if (params?.tag) query.append('tag', params.tag);
      if (params?.q) query.append('q', params.q);
      const res = await request<any[]>(`/problems?${query.toString()}`);
      return Array.isArray(res) ? res : fallbackProblems;
    } catch {
      let result = [...fallbackProblems];
      if (params?.difficulty) result = result.filter(p => p.difficulty === params.difficulty);
      if (params?.tag) result = result.filter(p => p.tags.some(t => t.slug === params.tag || t.name === params.tag));
      if (params?.q) {
        const q = params.q.toLowerCase();
        result = result.filter(p => p.title.toLowerCase().includes(q) || p.description_markdown.toLowerCase().includes(q));
      }
      return result;
    }
  },
  getProblem: async (idOrSlug: string | number) => {
    try {
      const res = await request<any>(`/problems/${idOrSlug}`);
      if (res && res.title) return res;
      throw new Error('Invalid problem payload');
    } catch {
      const found = fallbackProblems.find(p => String(p.id) === String(idOrSlug) || p.slug === String(idOrSlug));
      return found || fallbackProblems[0];
    }
  },
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
  getHints: async (idOrSlug: string | number) => {
    try {
      const res = await request<any[]>(`/problems/${idOrSlug}/hints`);
      return Array.isArray(res) ? res : [
        { level: 1, title: 'Level 1: Conceptual Intuition', content: 'Consider using a hash map to look up complements in O(1) time rather than a nested loop.' },
        { level: 2, title: 'Level 2: Approach Breakdown', content: 'As you iterate through the array, compute target - current_val and check if it already exists in your map.' },
        { level: 3, title: 'Level 3: Edge Case Pitfalls', content: 'Ensure you do not use the same element twice and handle duplicate numbers properly.' },
        { level: 4, title: 'Level 4: Pseudo-code Scaffold', content: 'seen = {}\nfor i, n in enumerate(nums):\n    diff = target - n\n    if diff in seen: return [seen[diff], i]\n    seen[n] = i' }
      ];
    } catch {
      return [
        { level: 1, title: 'Level 1: Conceptual Intuition', content: 'Consider using a hash map to look up complements in O(1) time rather than a nested loop.' },
        { level: 2, title: 'Level 2: Approach Breakdown', content: 'As you iterate through the array, compute target - current_val and check if it already exists in your map.' },
        { level: 3, title: 'Level 3: Edge Case Pitfalls', content: 'Ensure you do not use the same element twice and handle duplicate numbers properly.' },
        { level: 4, title: 'Level 4: Pseudo-code Scaffold', content: 'seen = {}\nfor i, n in enumerate(nums):\n    diff = target - n\n    if diff in seen: return [seen[diff], i]\n    seen[n] = i' }
      ];
    }
  },
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
  getLeaderboard: async (limit = 50) => {
    try {
      const res = await request<any[]>(`/leaderboard?limit=${limit}`);
      return Array.isArray(res) ? res : fallbackLeaderboard;
    } catch {
      return fallbackLeaderboard;
    }
  },
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
  getEvents: async (params: { category?: string; year?: number | string; club?: string; q?: string; page?: number; per_page?: number; archived?: boolean } = {}) => {
    try {
      const searchParams = new URLSearchParams();
      if (params.category) searchParams.set('category', params.category);
      if (params.year) searchParams.set('year', String(params.year));
      if (params.club) searchParams.set('club', params.club);
      if (params.q) searchParams.set('q', params.q);
      if (params.page) searchParams.set('page', String(params.page));
      if (params.per_page) searchParams.set('per_page', String(params.per_page));
      if (params.archived) searchParams.set('archived', 'true');
      const res = await request<any[]>(`/events?${searchParams.toString()}`);
      return Array.isArray(res) ? res : fallbackEvents;
    } catch {
      return fallbackEvents;
    }
  },
  getEvent: async (identifier: string | number) => {
    try {
      const res = await request<any>(`/events/${identifier}`);
      if (res && res.title) return res;
      throw new Error('Invalid event payload');
    } catch {
      const found = fallbackEvents.find(e => String(e.id) === String(identifier) || e.slug === String(identifier));
      return found || fallbackEvents[0];
    }
  },
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
  getBlogs: async (params: {
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
    try {
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
      const res = await request<any>(`/blogs?${searchParams.toString()}`);
      return Array.isArray(res) ? res : fallbackBlogs;
    } catch {
      return fallbackBlogs;
    }
  },
  getCategories: async () => {
    try {
      const res = await request<any[]>('/blogs/categories');
      return Array.isArray(res) ? res : fallbackBlogCategories;
    } catch {
      return fallbackBlogCategories;
    }
  },
  createCategory: (data: { name: string; description?: string }) =>
    request<any>('/blogs/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getBlog: async (idOrSlug: string | number) => {
    try {
      const res = await request<any>(`/blogs/${idOrSlug}`);
      if (res && res.title) return res;
      throw new Error('Invalid blog payload');
    } catch {
      const found = fallbackBlogs.find(b => String(b.id) === String(idOrSlug) || b.slug === String(idOrSlug));
      return found || fallbackBlogs[0];
    }
  },
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
  getProjects: async (params: { category?: string; tag?: string; author?: string; q?: string; sort?: string; page?: number; per_page?: number } = {}) => {
    try {
      const searchParams = new URLSearchParams();
      if (params.category) searchParams.set('category', params.category);
      if (params.tag) searchParams.set('tag', params.tag);
      if (params.author) searchParams.set('author', params.author);
      if (params.q) searchParams.set('q', params.q);
      if (params.sort) searchParams.set('sort', params.sort);
      if (params.page) searchParams.set('page', String(params.page));
      if (params.per_page) searchParams.set('per_page', String(params.per_page));
      const res = await request<any>(`/projects?${searchParams.toString()}`);
      return Array.isArray(res) ? res : fallbackProjects;
    } catch {
      return fallbackProjects;
    }
  },
  getProject: async (idOrSlug: string | number) => {
    try {
      const res = await request<any>(`/projects/${idOrSlug}`);
      if (res && res.title) return res;
      throw new Error('Invalid project payload');
    } catch {
      const found = fallbackProjects.find(p => String(p.id) === String(idOrSlug) || p.slug === String(idOrSlug));
      return found || fallbackProjects[0];
    }
  },
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
  addMedia: (id: number, data: any) =>
    request<any>(`/projects/${id}/media`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  submitReview: (id: number, data: any) =>
    request<any>(`/projects/${id}/reviews`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateReviewStatus: (projectId: number, reviewId: number, status: string) =>
    request<any>(`/projects/reviews/${reviewId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  upvoteReview: (projectId: number, reviewId: number) =>
    request<{ upvote_count: number; user_has_upvoted: boolean }>(`/projects/reviews/${reviewId}/upvote`, {
      method: 'POST',
    }),
  addReviewComment: (projectId: number, reviewId: number, data: any) =>
    request<any>(`/projects/reviews/${reviewId}/comments`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

export const clubsApi = {
  getClubs: async (params: { category?: string; q?: string } = {}) => {
    try {
      const searchParams = new URLSearchParams();
      if (params.category) searchParams.set('category', params.category);
      if (params.q) searchParams.set('q', params.q);
      const res = await request<any[]>(`/clubs?${searchParams.toString()}`);
      return Array.isArray(res) ? res : fallbackClubs;
    } catch {
      return fallbackClubs;
    }
  },
  getClub: async (idOrSlug: string | number) => {
    try {
      const res = await request<any>(`/clubs/${idOrSlug}`);
      if (res && res.name) return res;
      throw new Error('Invalid club payload');
    } catch {
      const found = fallbackClubs.find(c => String(c.id) === String(idOrSlug) || c.slug === String(idOrSlug));
      return found || fallbackClubs[0];
    }
  },
  createClub: (data: any) =>
    request<any>('/clubs', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  toggleJoin: (clubId: number) =>
    request<{ user_is_member: boolean; member_count: number }>(`/clubs/${clubId}/join`, {
      method: 'POST',
    }),
  getAnnouncementsFeed: () => request<any[]>('/clubs/announcements/feed'),
  getAnnouncements: (clubId: number) => request<any[]>(`/clubs/${clubId}/announcements`),
  createAnnouncement: (clubId: number, data: any) =>
    request<any>(`/clubs/${clubId}/announcements`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};


