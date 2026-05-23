import { create } from 'zustand';
import api from '../api/axios.js';

const useAuthStore = create((set, get) => {
  let initialToken = null;
  let initialUser = null;

  try {
    initialToken = localStorage.getItem('manufact_token') || null;
    const storedUser = localStorage.getItem('manufact_user');
    initialUser = storedUser ? JSON.parse(storedUser) : null;
  } catch (e) {
    initialToken = null;
    initialUser = null;
  }

  return {
    user: initialUser,
    token: initialToken,
    loading: false,
    error: null,

    get isAuthenticated() {
      return !!get().token && !!get().user;
    },

    login: async (email, password) => {
      set({ loading: true, error: null });
      try {
        const response = await api.post('/auth/login', { email, password });
        const { token, user } = response.data;
        localStorage.setItem('manufact_token', token);
        localStorage.setItem('manufact_user', JSON.stringify(user));
        set({ user, token, loading: false, error: null });
        return user;
      } catch (error) {
        const message = error.response?.data?.message || 'Login failed. Please try again.';
        set({ loading: false, error: message });
        throw new Error(message);
      }
    },

    fetchMe: async () => {
      try {
        const response = await api.get('/auth/me');
        const user = response.data.user || response.data;
        localStorage.setItem('manufact_user', JSON.stringify(user));
        set({ user });
        return user;
      } catch (error) {
        set({ user: null, token: null });
        localStorage.removeItem('manufact_token');
        localStorage.removeItem('manufact_user');
        throw error;
      }
    },

    logout: () => {
      localStorage.removeItem('manufact_token');
      localStorage.removeItem('manufact_user');
      set({ user: null, token: null, error: null });
    },

    clearError: () => set({ error: null }),
  };
});

export default useAuthStore;
