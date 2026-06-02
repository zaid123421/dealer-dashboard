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
    ROUTES.DASHBOARD.STAFF,
    '/dashboard/staff/',
    ROUTES.DASHBOARD.CUSTOMERS,
    ROUTES.DASHBOARD.DELIVERY_CART,
    '/dashboard/delivery-cart/',
    ROUTES.DASHBOARD.PICKUP_CART,
    '/dashboard/pickup-cart/',
    ROUTES.DASHBOARD.ORDERS.LIST,
    '/dashboard/orders/',
    ROUTES.DASHBOARD.PICKUP_ORDERS,
    '/dashboard/pickup-orders/',
    ROUTES.DASHBOARD.SESSIONS,
    '/dashboard/sessions/',
    ROUTES.DASHBOARD.EMAIL_INBOX,
    ROUTES.DASHBOARD.REPORTS,
    ROUTES.DASHBOARD.PROFILE,
    ROUTES.DASHBOARD.PRODUCTS.LIST,
    ROUTES.DASHBOARD.PRODUCTS.ADD,
    '/dashboard/products/',
    ROUTES.DASHBOARD.INVENTORY,
    ROUTES.DASHBOARD.STOCK,
  ],
  supplier: [
    ROUTES.DASHBOARD.ROOT,
    ROUTES.DASHBOARD.STAFF,
    '/dashboard/staff/',
    ROUTES.DASHBOARD.CUSTOMERS,
    ROUTES.DASHBOARD.DELIVERY_CART,
    '/dashboard/delivery-cart/',
    ROUTES.DASHBOARD.PICKUP_CART,
    '/dashboard/pickup-cart/',
    ROUTES.DASHBOARD.ORDERS.LIST,
    '/dashboard/orders/',
    ROUTES.DASHBOARD.PICKUP_ORDERS,
    '/dashboard/pickup-orders/',
    ROUTES.DASHBOARD.SESSIONS,
    '/dashboard/sessions/',
    ROUTES.DASHBOARD.EMAIL_INBOX,
    ROUTES.DASHBOARD.REPORTS,
    ROUTES.DASHBOARD.PROFILE,
    ROUTES.DASHBOARD.PRODUCTS.LIST,
    ROUTES.DASHBOARD.PRODUCTS.ADD,
    '/dashboard/products/',
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
  { path: ROUTES.DASHBOARD.ROOT, label: 'Overview', key: 'overview' },
  { path: ROUTES.DASHBOARD.STAFF, label: 'Staff', key: 'staff' },
  { path: ROUTES.DASHBOARD.CUSTOMERS, label: 'Customers', key: 'customers' },
  { path: ROUTES.DASHBOARD.EMAIL_INBOX, label: 'Email Inbox', key: 'emailInbox' },
  { path: ROUTES.DASHBOARD.DELIVERY_CART, label: 'Cart', key: 'cart' },
  { path: ROUTES.DASHBOARD.PICKUP_CART, label: 'Pickup Cart', key: 'pickupCart' },
  { path: ROUTES.DASHBOARD.ORDERS.LIST, label: 'Orders', key: 'orders' },
  { path: ROUTES.DASHBOARD.PICKUP_ORDERS, label: 'Pickup Orders', key: 'pickupOrders' },
  { path: ROUTES.DASHBOARD.SESSIONS, label: 'Sessions', key: 'sessions' },
  { path: ROUTES.DASHBOARD.REPORTS, label: 'Reports', key: 'reports' },
  { path: ROUTES.DASHBOARD.PROFILE, label: 'Settings', key: 'settings' },
] as const;

export function getAllowedNavEntries(role: Role | null | undefined): { path: string; label: string; key: string }[] {
  if (!role) return [];
  return NAV_ENTRIES.filter((entry) => canAccess(role, entry.path));
}
