import type {
  DealerMeCurrentUser,
  DealerMeDealer,
  DealerMeRoleUsage,
  DealerMeRoleUsageEntry,
  DealerMeSubscription,
  DealerMeUsage,
  DealerProfile,
} from "@/modules/dealer/types/dealer-profile";

function asRecord(v: unknown): Record<string, unknown> | null {
  if (!v || typeof v !== "object" || Array.isArray(v)) return null;
  return v as Record<string, unknown>;
}

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function num(v: unknown): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = Number(v.trim());
    if (Number.isFinite(n)) return n;
  }
  return 0;
}

function bool(v: unknown): boolean {
  return v === true;
}

function strOrNull(v: unknown): string | null {
  const s = str(v);
  return s || null;
}

function numOrNull(v: unknown): number | null {
  if (v == null) return null;
  const n = num(v);
  return Number.isFinite(n) ? n : null;
}

function stringRecord(v: unknown): Record<string, number> {
  const rec = asRecord(v);
  if (!rec) return {};
  const out: Record<string, number> = {};
  for (const [key, value] of Object.entries(rec)) {
    out[key] = num(value);
  }
  return out;
}

function stringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.map((item) => str(item)).filter(Boolean);
}

function normalizeRoleUsageEntry(raw: unknown): DealerMeRoleUsageEntry {
  const rec = asRecord(raw) ?? {};
  return {
    canAddMore: bool(rec.canAddMore),
    currentCount: num(rec.currentCount),
    remainingSlots: num(rec.remainingSlots),
    usagePercentage: num(rec.usagePercentage),
    maxCount: num(rec.maxCount),
  };
}

function normalizeRoleUsage(raw: unknown): DealerMeRoleUsage | null {
  const rec = asRecord(raw);
  if (!rec) return null;
  const roleUsageRaw = asRecord(rec.roleUsage);
  const roleUsage: Record<string, DealerMeRoleUsageEntry> = {};
  if (roleUsageRaw) {
    for (const [key, value] of Object.entries(roleUsageRaw)) {
      roleUsage[key] = normalizeRoleUsageEntry(value);
    }
  }
  return {
    roleLimits: stringRecord(rec.roleLimits),
    totalRemainingSlots: num(rec.totalRemainingSlots),
    roleUsage,
    hasUserRolesConfig: bool(rec.hasUserRolesConfig),
    totalMaxStaff: num(rec.totalMaxStaff),
    totalCurrentStaff: num(rec.totalCurrentStaff),
  };
}

function normalizeDealer(raw: unknown): DealerMeDealer {
  const rec = asRecord(raw) ?? {};
  return {
    id: num(rec.id),
    legalName: str(rec.legalName),
    businessName: str(rec.businessName),
    email: str(rec.email),
    phoneNumber: str(rec.phoneNumber),
    dealerUniqueId: str(rec.dealerUniqueId),
    status: str(rec.status),
    streetNumber: str(rec.streetNumber),
    streetName: str(rec.streetName),
    aptUnitBldg: str(rec.aptUnitBldg),
    postalCode: str(rec.postalCode),
    createdAt: strOrNull(rec.createdAt),
    updatedAt: strOrNull(rec.updatedAt),
    totalUsers: num(rec.totalUsers),
    userRoles: stringRecord(rec.userRoles),
  };
}

function normalizeCurrentUser(raw: unknown): DealerMeCurrentUser {
  const rec = asRecord(raw) ?? {};
  return {
    email: str(rec.email),
    firstName: str(rec.firstName),
    lastName: str(rec.lastName),
    roleName: str(rec.roleName),
    accessLevel: str(rec.accessLevel),
    userActive: bool(rec.userActive),
  };
}

function normalizeSubscription(raw: unknown): DealerMeSubscription | null {
  const rec = asRecord(raw);
  if (!rec) return null;
  return {
    id: num(rec.id),
    dealerId: num(rec.dealerId),
    dealerName: str(rec.dealerName),
    planId: num(rec.planId),
    planName: str(rec.planName),
    startDate: strOrNull(rec.startDate),
    endDate: strOrNull(rec.endDate),
    status: str(rec.status),
    amountPaid: num(rec.amountPaid),
    autoRenew: bool(rec.autoRenew),
    billingWeekday: strOrNull(rec.billingWeekday),
    cancellationDate: strOrNull(rec.cancellationDate),
    cancellationReason: strOrNull(rec.cancellationReason),
    totalUsers: num(rec.totalUsers),
    userRoles: stringRecord(rec.userRoles),
    createdAt: strOrNull(rec.createdAt),
    updatedAt: strOrNull(rec.updatedAt),
  };
}

function normalizeUsage(raw: unknown): DealerMeUsage | null {
  const rec = asRecord(raw);
  if (!rec) return null;
  return {
    totalStaff: num(rec.totalStaff),
    activeStaff: num(rec.activeStaff),
    activeStaffLimit: num(rec.activeStaffLimit),
    remainingStaffSlots: num(rec.remainingStaffSlots),
    tireCount: num(rec.tireCount),
    tireStorageLimit: num(rec.tireStorageLimit),
    remainingTireSlots: num(rec.remainingTireSlots),
    totalUsers: num(rec.totalUsers),
    hasActiveSubscription: bool(rec.hasActiveSubscription),
    daysToSubscriptionExpiry: numOrNull(rec.daysToSubscriptionExpiry),
    subscriptionStatus: str(rec.subscriptionStatus),
  };
}

/** Accepts GET /v1/dealer/me response body (wrapped or unwrapped). */
export function normalizeDealerMeDto(rawUnknown: unknown): DealerProfile | null {
  const root = asRecord(rawUnknown);
  if (!root) return null;

  const payload = asRecord(root.data) ?? root;
  const dealer = normalizeDealer(payload.dealer);
  if (dealer.id <= 0) return null;

  return {
    dealer,
    currentUser: normalizeCurrentUser(payload.currentUser),
    activeSubscription: normalizeSubscription(payload.activeSubscription),
    usage: normalizeUsage(payload.usage),
    roleUsage: normalizeRoleUsage(payload.roleUsage),
    availableRoles: stringArray(payload.availableRoles),
    alerts: stringArray(payload.alerts),
  };
}
