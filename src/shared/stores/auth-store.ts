import { create } from "zustand";
import type { Role } from "@/shared/config/roles";
import type { AuthUser } from "@/shared/types/auth-session";

interface AuthState {
  role: Role | null;
  user: AuthUser | null;
  setRole: (role: Role | null) => void;
  setUser: (user: AuthUser | null) => void;
  setSession: (role: Role, user: AuthUser) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  role: null,
  user: null,
  setRole: (role) => set({ role }),
  setUser: (user) => set({ user }),
  setSession: (role, user) => set({ role, user }),
  clearAuth: () => set({ role: null, user: null }),
}));
