import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';
import toast from 'react-hot-toast';

// Import lazily to avoid circular deps — accessed at call time
function getAdminStore() {
  return require('./adminAccountsStore').default.getState();
}

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      loading: false,

      login: async (email, password) => {
        set({ loading: true });

        // 1. Check local admin accounts store (works without Firebase)
        const adminStore = getAdminStore();
        const localAdmin = adminStore.verifyLocalAdmin(email, password);
        if (localAdmin) {
          const token = 'demo-token';
          const user = {
            _id: localAdmin.id,
            name: localAdmin.name,
            email: localAdmin.email,
            role: 'admin',
            avatar: '',
          };
          set({ user, token, loading: false });
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          toast.success(`Welcome back, ${user.name}!`);
          return { success: true, role: 'admin' };
        }

        // 2. Demo user account (no Firebase needed)
        if (email.toLowerCase() === 'user@vastralaya.com' && password === 'user123') {
          const token = 'demo-token';
          const user = { _id: 'demo-user', name: 'User', email: 'user@vastralaya.com', role: 'user', avatar: '' };
          set({ user, token, loading: false });
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          toast.success(`Welcome back, ${user.name}!`);
          return { success: true, role: 'user' };
        }

        // 3. Real backend (Firebase configured)
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
