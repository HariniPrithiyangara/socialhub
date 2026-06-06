import axios from 'axios';

let API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
// Automatically append /api if it is missing from the environment variable configuration
if (!API_BASE.replace(/\/$/, '').endsWith('/api')) {
  API_BASE = `${API_BASE.replace(/\/$/, '')}/api`;
}

// ── Axios instance ─────────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: attach JWT ───────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('sh_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: handle 401 ──────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('sh_token');
      localStorage.removeItem('sh_user');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

// ════════════════════════════════════════════════════════════════════════
// AUTH APIs
// ════════════════════════════════════════════════════════════════════════
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  getUsers: () => api.get('/auth/users'),
  getNotifications: () => api.get('/auth/notifications'),
  markNotificationsRead: () => api.put('/auth/notifications/read'),
};

// ════════════════════════════════════════════════════════════════════════
// POST APIs
// ════════════════════════════════════════════════════════════════════════
export const postAPI = {
  /** Get paginated posts  sort: recent | mostLiked | mostCommented */
  getAll: (params) => api.get('/posts', { params }),

  /** Create post — send as FormData for image uploads */
  create: (formData) =>
    api.post('/posts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  /** Toggle like on a post */
  toggleLike: (postId) => api.put(`/posts/${postId}/like`),

  /** Add comment */
  addComment: (postId, text) => api.post(`/posts/${postId}/comment`, { text }),

  /** Get comments for a post */
  getComments: (postId) => api.get(`/posts/${postId}/comments`),

  /** Delete post */
  deletePost: (postId) => api.delete(`/posts/${postId}`),
};

export default api;
