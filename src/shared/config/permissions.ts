import { ROUTES } from '@/constants/routes';
import type { Role } from './roles';

/**
 * مسارات/بادئات المسارات المسموحة لكل دور.
 * admin: كل الـ dashboard.
 * supplier: المنتجات، الطلبات، المخزون.
 * user: لوحة التحكم والملف الشخصي فقط (عرض محدود).
 */
const ROLE_ROUTE_PREFIXES: Record<Role, string[]> = {
  admin: [
    ROUTES.DASHBOARD.ROOT,
    ROUTES.DASHBOARD.PROFILE,
    ROUTES.DASHBOARD.PRODUCTS.LIST,
    ROUTES.DASHBOARD.PRODUCTS.ADD,
    '/dashboard/products/',
    ROUTES.DASHBOARD.ORDERS.LIST,
    '/dashboard/orders/',
    ROUTES.DASHBOARD.INVENTORY,
    ROUTES.DASHBOARD.STOCK,
  ],
  supplier: [
    ROUTES.DASHBOARD.ROOT,
    ROUTES.DASHBOARD.PROFILE,
    ROUTES.DASHBOARD.PRODUCTS.LIST,
    ROUTES.DASHBOARD.PRODUCTS.ADD,
    '/dashboard/products/',
    ROUTES.DASHBOARD.ORDERS.LIST,
    '/dashboard/orders/',
    ROUTES.DASHBOARD.INVENTORY,
  ],
  user: [
    ROUTES.DASHBOARD.ROOT,
    ROUTES.DASHBOARD.PROFILE,
  ],
};

/**
 * يتحقق مما إذا كان الدور مسموحاً له بالوصول للمسار المعطى.
 * يقارن pathname مع بادئات المسارات المسموحة للدور.
 */
export function canAccess(role: Role | null | undefined, pathname: string): boolean {
  if (!role) return false;
  const allowed = ROLE_ROUTE_PREFIXES[role];
  if (!allowed) return false;
  const normalized = pathname.replace(/\/$/, '') || '/';
  return allowed.some((prefix) => normalized === prefix || normalized.startsWith(prefix + '/'));
}

/**
 * يرجع قائمة المسارات/المفاتيح المسموح عرضها في الـ nav لهذا الدور.
 * يمكن استخدامها لإظهار/إخفاء روابط القائمة.
 */
export const NAV_ENTRIES = [
  { path: ROUTES.DASHBOARD.ROOT, label: 'لوحة التحكم', key: 'dashboard' },
  { path: ROUTES.DASHBOARD.PRODUCTS.LIST, label: 'المنتجات', key: 'products' },
  { path: ROUTES.DASHBOARD.ORDERS.LIST, label: 'الطلبات', key: 'orders' },
  { path: ROUTES.DASHBOARD.INVENTORY, label: 'المخزون', key: 'inventory' },
  { path: ROUTES.DASHBOARD.PROFILE, label: 'الملف الشخصي', key: 'profile' },
] as const;

export function getAllowedNavEntries(role: Role | null | undefined): { path: string; label: string; key: string }[] {
  if (!role) return [];
  return NAV_ENTRIES.filter((entry) => canAccess(role, entry.path));
}
