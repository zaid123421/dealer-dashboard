'use client';

import { useEffect } from 'react';
import { canAccess as checkCanAccess } from '@/shared/config/permissions';
import { useAuthStore } from '@/shared/stores/auth-store';
import TokenService from '@/infrastructure/auth/token-service';

/**
 * يملأ الـ store من الـ cookie عند التحميل حتى يتوفر الدور في الواجهة.
 */
function useSyncRoleFromCookie() {
  const setRole = useAuthStore((s) => s.setRole);
  useEffect(() => {
    const role = TokenService.getRole();
    if (role) setRole(role);
  }, [setRole]);
}

/**
 * يرجع هل المستخدم الحالي يملك صلاحية الوصول للمسار المعطى.
 * يعتمد على الدور في الـ store (يُملأ من الـ cookie عند التحميل).
 */
export function useCanAccess(pathname: string): boolean {
  useSyncRoleFromCookie();
  const role = useAuthStore((s) => s.role);
  return checkCanAccess(role, pathname);
}

/**
 * يرجع دور المستخدم الحالي (من الـ store بعد مزامنته مع الـ cookie).
 */
export function useRole() {
  useSyncRoleFromCookie();
  return useAuthStore((s) => s.role);
}
