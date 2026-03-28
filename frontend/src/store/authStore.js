import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';
import toast from 'react-hot-toast';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      loading: false,

      login: async (email, password) => {
        set({ loading: true });
        try {
          const { data } = await api.post('/auth/login', { email, password });
          set({ user: data.user, token: data.token, loading: false });
          api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
          toast.success(`Welcome back, ${data.user.name}!`);
          return { success: true, role: data.user.role };
        } catch (err) {
          set({ loading: false });
          toast.error(err.response?.data?.message || 'Login failed');
          return { success: false };
        }
      },

      register: async (userData) => {
        set({ loading: true });
        try {
          const { data } = await api.post('/auth/register', userData);
          set({ user: data.user, token: data.token, loading: false });
          api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
          toast.success('Account created successfully!');
          return { success: true };
        } catch (err) {
          set({ loading: false });
          toast.error(err.response?.data?.message || 'Registration failed');
          return { success: false };
        }
      },

      logout: () => {
        set({ user: null, token: null });
        delete api.defaults.headers.common['Authorization'];
        toast.success('Logged out successfully');
      },

      updateUser: (userData) => set({ user: { ...get().user, ...userData } }),

      initAuth: () => {
        const token = get().token;
        if (token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);

export default useAuthStore;
