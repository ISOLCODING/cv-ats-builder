import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * useAuthStore
 * ============================================================
 * Simplified version: No login/register/premium required.
 * Always returns a default 'Guest' user with 'Premium' role 
 * to ensure all features are accessible by default.
 */
const useAuthStore = create(
  persist(
    (set, get) => ({
      user: { 
        id: 'guest_user', 
        name: 'Guest User', 
        email: '', 
        role: 'Premium', 
        paymentStatus: 'Approved' 
      },
      isLoading: false,
      error: null,
      showUpgradeModal: false,

      // -- Actions (Disabled/Simplified) --
      setShowUpgradeModal: (show) => set({ showUpgradeModal: false }), // Always false
      login: async () => true, // Bypass
      register: async () => true, // Bypass
      logout: () => {
        // No-op or reset to guest if needed, but we want it to stay guest
      },
      requestUpgrade: async () => true,
      refreshUserStatus: async () => get().user
    }),
    {
      name: 'cv-auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);

export default useAuthStore;

