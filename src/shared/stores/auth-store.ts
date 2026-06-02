import { create } from "zustand";
import type { Role } from "@/shared/config/roles";
import type { AuthUser } from "@/shared/types/auth-session";
import type { DealerProfile } from "@/modules/dealer/types/dealer-profile";

interface AuthState {
  role: Role | null;
  user: AuthUser | null;
  dealerProfile: DealerProfile | null;
  setRole: (role: Role | null) => void;
  setUser: (user: AuthUser | null) => void;
  setDealerProfile: (profile: DealerProfile | null) => void;
  setSession: (role: Role, user: AuthUser, dealerProfile?: DealerProfile | null) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  role: null,
  user: null,
  dealerProfile: null,
  setRole: (role) => set({ role }),
  setUser: (user) => set({ user }),
  setDealerProfile: (dealerProfile) => set({ dealerProfile }),
  setSession: (role, user, dealerProfile = null) => set({ role, user, dealerProfile }),
  clearAuth: () => set({ role: null, user: null, dealerProfile: null }),
}));
