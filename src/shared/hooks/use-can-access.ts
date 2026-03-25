"use client";

import { useEffect } from "react";
import { canAccess as checkCanAccess } from "@/shared/config/permissions";
import { useAuthStore } from "@/shared/stores/auth-store";
import TokenService from "@/infrastructure/auth/token-service";

/**
 * يملأ الـ store من الـ cookies عند التحميل (دور + ملف المستخدم).
 */
function useSyncAuthFromCookie() {
  const setRole = useAuthStore((s) => s.setRole);
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    const role = TokenService.getRole();
    const user = TokenService.getAuthProfile();
    setRole(role);
    setUser(user);
  }, [setRole, setUser]);
}

/**
 * يرجع هل المستخدم الحالي يملك صلاحية الوصول للمسار المعطى.
 */
export function useCanAccess(pathname: string): boolean {
  useSyncAuthFromCookie();
  const role = useAuthStore((s) => s.role);
  return checkCanAccess(role, pathname);
}

/**
 * دور المستخدم الحالي (من الـ store بعد مزامنته مع الـ cookie).
 */
export function useRole() {
  useSyncAuthFromCookie();
  return useAuthStore((s) => s.role);
}

/**
 * بيانات المستخدم والمستأجر من آخر تسجيل دخول.
 */
export function useAuthUser() {
  useSyncAuthFromCookie();
  return useAuthStore((s) => s.user);
}
