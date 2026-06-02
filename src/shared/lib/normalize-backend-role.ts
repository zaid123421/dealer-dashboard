import { ROLES, type Role, parseRole } from "@/shared/config/roles";

/** Maps backend role names (e.g. DEALER_ADMIN) to dashboard RBAC roles. */
export function normalizeBackendRole(raw: string | null | undefined): Role | null {
  if (!raw?.trim()) return null;
  const u = raw.toUpperCase();
  if (u.includes("TECHNICIAN")) return ROLES.USER;
  if (u.includes("DEALER")) return ROLES.SUPPLIER;
  if (u.includes("SALES") || u === "SYSTEM_ADMIN" || u === "PLATFORM_ADMIN") {
    return ROLES.ADMIN;
  }
  const direct = parseRole(raw.toLowerCase());
  if (direct) return direct;
  if (u.includes("ADMIN")) return ROLES.ADMIN;
  if (u.includes("SUPPLIER") || u.includes("VENDOR")) return ROLES.SUPPLIER;
  return null;
}
