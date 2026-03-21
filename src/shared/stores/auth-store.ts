import { create } from 'zustand';
import type { Role } from '@/shared/config/roles';

/**
 * تخزين حالة المصادقة والدور في الواجهة.
 * لاحقاً يمكن تعبئته من response تسجيل الدخول بدل الـ cookie.
 */
interface AuthState {
  role: Role | null;
  setRole: (role: Role | null) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  role: null,
  setRole: (role) => set({ role }),
  clearAuth: () => set({ role: null }),
}));
