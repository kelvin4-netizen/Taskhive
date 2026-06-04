// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000, // 30s — Render free tier can take time to wake up
});

// ── Request interceptor — attach access token ─────────────────
api.interceptors.request.use((config) => {
  try {
    const stored = JSON.parse(localStorage.getItem('taskhive-auth') || '{}');
    const token = stored?.state?.accessToken;
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch {}
  return config;
});

// ── Response interceptor ──────────────────────────────────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => error ? prom.reject(error) : prom.resolve(token));
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Network error or CORS or backend asleep
    if (!error.response) {
      const isTimeout = error.code === 'ECONNABORTED';
      return Promise.reject({
        isNetworkError: true,
        message: isTimeout
          ? 'Request timed out. The server may be starting up — please try again in 30 seconds.'
          : 'Server is currently unreachable. Please try again later.',
        originalError: error,
      });
    }

    const originalRequest = error.config;
    const status = error.response?.status;
    const code   = error.response?.data?.code;

    if (status === 401 && code === 'TOKEN_EXPIRED' && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await api.post('/auth/refresh');
        const { accessToken } = res.data.data;
        const stored = JSON.parse(localStorage.getItem('taskhive-auth') || '{}');
        if (stored?.state) {
          stored.state.accessToken = accessToken;
          localStorage.setItem('taskhive-auth', JSON.stringify(stored));
        }
        processQueue(null, accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('taskhive-auth');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;