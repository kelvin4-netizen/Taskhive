// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
  timeout: 8000, // fail fast when backend is down
});

// ── Request interceptor — attach access token ──────────────────
api.interceptors.request.use((config) => {
  try {
    const stored = JSON.parse(localStorage.getItem('taskhive-auth') || '{}');
    const token = stored?.state?.accessToken;
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch {}
  return config;
});

// ── Response interceptor — auto-refresh on 401 ─────────────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => error ? prom.reject(error) : prom.resolve(token));
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // ── Backend not running / network error ────────────────────
    if (!error.response) {
      // Return a structured error so callers can detect offline state
      return Promise.reject({
        isNetworkError: true,
        message: 'Server is currently unreachable. Please try again later.',
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