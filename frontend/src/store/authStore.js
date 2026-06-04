// src/store/authStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/services/api';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isLoading: false,
      isAuthenticated: false,

      setAuth: (user, accessToken) =>
        set({ user, accessToken, isAuthenticated: true }),

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const res = await api.post('/auth/login', { email, password });
          const { user, accessToken } = res.data.data;
          set({ user, accessToken, isAuthenticated: true, isLoading: false });
          return { success: true, user };
        } catch (err) {
          set({ isLoading: false });
          // Surface network errors cleanly
          if (err?.isNetworkError) throw { message: err.message };
          throw err.response?.data || { message: 'Login failed' };
        }
      },

      register: async (data) => {
        set({ isLoading: true });
        try {
          const res = await api.post('/auth/register', data);
          set({ isLoading: false });
          return { success: true, message: res.data.message };
        } catch (err) {
          set({ isLoading: false });
          if (err?.isNetworkError) throw { message: err.message };
          throw err.response?.data || { message: 'Registration failed' };
        }
      },

      logout: async () => {
        try { await api.post('/auth/logout'); } catch {}
        set({ user: null, accessToken: null, isAuthenticated: false });
      },

      refreshAccessToken: async () => {
        try {
          const res = await api.post('/auth/refresh');
          const { accessToken } = res.data.data;
          set({ accessToken });
          return accessToken;
        } catch {
          set({ user: null, accessToken: null, isAuthenticated: false });
          return null;
        }
      },

      updateUser: (updates) =>
        set((state) => ({ user: { ...state.user, ...updates } })),
    }),
    {
      name: 'taskhive-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);