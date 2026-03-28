import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

// Default admin account seeded so there's always at least 1
const DEFAULT_ACCOUNTS = [
  {
    id: 'demo-admin-1',
    name: 'Super Admin',
    email: 'admin@vastralaya.com',
    // password: admin123 (stored hashed on server; shown here for demo only)
    isActive: true,
  },
];

const useAdminAccountsStore = create(
  persist(
    (set, get) => ({
      accounts: DEFAULT_ACCOUNTS,

      // Load from backend (when Firebase is configured)
      fetchAccounts: async () => {
        try {
          const { data } = await api.get('/admin/accounts');
          if (data.success) set({ accounts: data.accounts });
        } catch {
          // Firebase not configured — use local state
        }
      },

      addAccount: async ({ name, email, password }) => {
        const accounts = get().accounts;
        if (accounts.length >= 10) throw new Error('Maximum of 10 admin accounts reached');

        const emailLower = email.toLowerCase().trim();
        if (accounts.some((a) => a.email === emailLower)) {
          throw new Error('An admin with this email already exists');
        }

        // Try backend first
        try {
          const { data } = await api.post('/admin/accounts', { name, email, password });
          if (data.success) {
            set({ accounts: [...accounts, data.account] });
            return data.account;
          }
        } catch {
          // Fallback: store locally (demo mode)
        }

        const newAccount = { id: crypto.randomUUID(), name: name.trim(), email: emailLower, isActive: true, _localPassword: password };
        set({ accounts: [...accounts, newAccount] });
        return newAccount;
      },

      updateAccount: async (id, updates) => {
        // Try backend
        try {
          const { data } = await api.put(`/admin/accounts/${id}`, updates);
          if (data.success) {
            set({ accounts: get().accounts.map((a) => a.id === id ? { ...a, ...data.account } : a) });
            return;
          }
        } catch {
          // Fallback: update locally
        }

        set({
          accounts: get().accounts.map((a) => {
            if (a.id !== id) return a;
            const updated = { ...a };
            if (updates.name) updated.name = updates.name.trim();
            if (updates.email) updated.email = updates.email.toLowerCase().trim();
            if (updates.password) updated._localPassword = updates.password;
            return updated;
          }),
        });
      },

      deleteAccount: async (id) => {
        const accounts = get().accounts;
        if (accounts.length <= 1) throw new Error('Cannot delete the last admin account');

        try {
          await api.delete(`/admin/accounts/${id}`);
        } catch {
          // Fallback: delete locally
        }
        set({ accounts: accounts.filter((a) => a.id !== id) });
      },

      toggleActive: async (id) => {
        try {
          const { data } = await api.post(`/admin/accounts/${id}/toggle-active`);
          if (data.success) {
            set({ accounts: get().accounts.map((a) => a.id === id ? { ...a, isActive: data.isActive } : a) });
            return;
          }
        } catch {
          // Fallback: toggle locally
        }
        set({ accounts: get().accounts.map((a) => a.id === id ? { ...a, isActive: !a.isActive } : a) });
      },

      // Used by authStore login to verify demo/local admin credentials
      verifyLocalAdmin: (email, password) => {
        const acc = get().accounts.find((a) => a.email === email.toLowerCase() && a.isActive);
        if (!acc) return null;
        // Check local password (only in demo mode when Firebase not configured)
        if (acc._localPassword && acc._localPassword === password) return acc;
        // Built-in default admin
        if (acc.id === 'demo-admin-1' && password === 'admin123') return acc;
        return null;
      },
    }),
    {
      name: 'admin-accounts-storage',
      partialize: (state) => ({ accounts: state.accounts }),
    }
  )
);

export default useAdminAccountsStore;
