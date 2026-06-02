import { create } from 'zustand';

/**
 * useAuthStore — Stub kosong.
 * Auth sistem telah dihapus. Semua fitur bebas diakses tanpa login.
 * File ini dipertahankan agar tidak terjadi import error.
 */
const useAuthStore = create(() => ({
  user: null,
  setShowUpgradeModal: () => {},
  login: async () => true,
  logout: () => {},
  register: async () => true,
  refreshUserStatus: async () => null,
}));

export default useAuthStore;
