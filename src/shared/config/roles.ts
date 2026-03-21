/**
 * أدوار المستخدم (RBAC).
 * لاحقاً يمكن أن يأتي الدور من response تسجيل الدخول من الـ Backend.
 */
export const ROLES = {
  ADMIN: 'admin',
  SUPPLIER: 'supplier',
  USER: 'user',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

const ROLE_VALUES: Role[] = [ROLES.ADMIN, ROLES.SUPPLIER, ROLES.USER];

/** يتحقق من أن النص يمثل دوراً صالحاً (للاستخدام في الـ middleware من cookie) */
export function parseRole(value: string | undefined): Role | null {
  if (!value) return null;
  return ROLE_VALUES.includes(value as Role) ? (value as Role) : null;
}
