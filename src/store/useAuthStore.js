import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null, // { id, name, email, role, paymentStatus }
      isLoading: false,
      error: null,
      showUpgradeModal: false,

      // -- Actions --
      setShowUpgradeModal: (show) => set({ showUpgradeModal: show }),

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const endpoint = typeof window !== 'undefined' && window.google?.script ? (import.meta.env.VITE_GAS_ENDPOINT || '') : '/api/gas';
          const response = await fetch(endpoint, {
            method: 'POST',
            body: JSON.stringify({ action: 'login', email, password })
          });
          const res = await response.json();
          if (res.success) {
            set({ user: res.data });
            return true;
          } else {
            set({ error: res.message });
            return false;
          }
        } catch (err) {
          set({ error: 'Gagal menghubungi server.' });
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (name, email, password) => {
        set({ isLoading: true, error: null });
        try {
          const endpoint = typeof window !== 'undefined' && window.google?.script ? (import.meta.env.VITE_GAS_ENDPOINT || '') : '/api/gas';
          const response = await fetch(endpoint, {
            method: 'POST',
            body: JSON.stringify({ action: 'register', name, email, password })
          });
          const res = await response.json();
          if (res.success) {
            set({ user: res.data });
            return true;
          } else {
            set({ error: res.message });
            return false;
          }
        } catch (err) {
          set({ error: 'Gagal menghubungi server.' });
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      logout: () => {
        set({ user: null, error: null });
      },

      requestUpgrade: async (paymentProof) => {
        const { user } = get();
        if (!user) return false;
        set({ isLoading: true, error: null });
        try {
          const endpoint = typeof window !== 'undefined' && window.google?.script ? (import.meta.env.VITE_GAS_ENDPOINT || '') : '/api/gas';
          const response = await fetch(endpoint, {
            method: 'POST',
            body: JSON.stringify({ action: 'requestPremium', email: user.email, paymentProof })
          });
          const res = await response.json();
          if (res.success) {
            // Update local state to Pending
            set({ user: { ...user, paymentStatus: 'Pending', paymentProof }, showUpgradeModal: false });
            return true;
          } else {
            set({ error: res.message });
            return false;
          }
        } catch (err) {
          set({ error: 'Gagal menghubungi server.' });
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      // Fetch fresh user data (useful if admin approved)
      refreshUserStatus: async () => {
        const { user } = get();
        if (!user) return;
        try {
          const endpoint = typeof window !== 'undefined' && window.google?.script ? (import.meta.env.VITE_GAS_ENDPOINT || '') : '/api/gas';
          const response = await fetch(endpoint, {
            method: 'POST',
            body: JSON.stringify({ action: 'getUserProfile', email: user.email })
          });
          const res = await response.json();
          if (res.success) {
            set({ user: res.data });
            return res.data;
          }
        } catch (e) {
          console.error('Gagal refresh status user:', e);
        }
      }
    }),
    {
      name: 'cv-auth-storage',
      partialize: (state) => ({ user: state.user }), // Only persist user info
    }
  )
);

export default useAuthStore;
