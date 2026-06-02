import type {
  DealerMeRoleUsageEntry,
  DealerProfile,
} from "@/modules/dealer/types/dealer-profile";

export type QuotaResourceId = "staff" | "tires" | `role:${string}`;

export interface QuotaResource {
  id: QuotaResourceId;
  /** i18n key segment: staff | tires | or backend role name */
  label: string;
  current: number;
  max: number;
  remaining: number;
  canAdd: boolean;
  usagePercentage: number;
}

export interface DealerQuotaSnapshot {
  isLoaded: boolean;
  hasActiveSubscription: boolean;
  subscriptionStatus: string | null;
  planName: string | null;
  staff: QuotaResource | null;
  tires: QuotaResource | null;
  roles: QuotaResource[];
  totalRoleRemainingSlots: number | null;
  hasUserRolesConfig: boolean;
  alerts: string[];
}

function clampPct(current: number, max: number): number {
  if (max <= 0) return current > 0 ? 100 : 0;
  return Math.min(100, Math.round((current / max) * 100));
}

function buildRoleQuota(roleName: string, entry: DealerMeRoleUsageEntry): QuotaResource {
  return {
    id: `role:${roleName}`,
    label: roleName,
    current: entry.currentCount,
    max: entry.maxCount,
    remaining: entry.remainingSlots,
    canAdd: entry.canAddMore && entry.remainingSlots > 0,
    usagePercentage: entry.usagePercentage,
  };
}

export function buildDealerQuotaSnapshot(
  profile: DealerProfile | null,
): DealerQuotaSnapshot {
  if (!profile) {
    return {
      isLoaded: false,
      hasActiveSubscription: false,
      subscriptionStatus: null,
      planName: null,
      staff: null,
      tires: null,
      roles: [],
      totalRoleRemainingSlots: null,
      hasUserRolesConfig: false,
      alerts: [],
    };
  }

  const usage = profile.usage;
  const hasActiveSubscription = usage?.hasActiveSubscription ?? false;

  const staff: QuotaResource | null = usage
    ? {
        id: "staff",
        label: "staff",
        current: usage.activeStaff,
        max: usage.activeStaffLimit,
        remaining: usage.remainingStaffSlots,
        canAdd: hasActiveSubscription && usage.remainingStaffSlots > 0,
        usagePercentage: clampPct(usage.activeStaff, usage.activeStaffLimit),
      }
    : null;

  const tires: QuotaResource | null = usage
    ? {
        id: "tires",
        label: "tires",
        current: usage.tireCount,
        max: usage.tireStorageLimit,
        remaining: usage.remainingTireSlots,
        canAdd: hasActiveSubscription && usage.remainingTireSlots > 0,
        usagePercentage: clampPct(usage.tireCount, usage.tireStorageLimit),
      }
    : null;

  const roles: QuotaResource[] = [];
  const roleUsageMap = profile.roleUsage?.roleUsage;
  if (roleUsageMap) {
    for (const [roleName, entry] of Object.entries(roleUsageMap)) {
      roles.push(buildRoleQuota(roleName, entry));
    }
  }

  return {
    isLoaded: true,
    hasActiveSubscription,
    subscriptionStatus:
      usage?.subscriptionStatus?.trim() ||
      profile.activeSubscription?.status?.trim() ||
      null,
    planName: profile.activeSubscription?.planName?.trim() || null,
    staff,
    tires,
    roles,
    totalRoleRemainingSlots: profile.roleUsage?.totalRemainingSlots ?? null,
    hasUserRolesConfig: profile.roleUsage?.hasUserRolesConfig ?? false,
    alerts: profile.alerts ?? [],
  };
}

export function getRoleQuota(
  snapshot: DealerQuotaSnapshot,
  role: string,
): QuotaResource | null {
  return snapshot.roles.find((r) => r.label === role) ?? null;
}

export function canAddStaffMember(
  snapshot: DealerQuotaSnapshot,
  role?: string,
): boolean {
  if (!snapshot.hasActiveSubscription) return false;
  if (!snapshot.staff?.canAdd) return false;
  if (
    snapshot.hasUserRolesConfig &&
    snapshot.totalRoleRemainingSlots != null &&
    snapshot.totalRoleRemainingSlots <= 0
  ) {
    return false;
  }
  if (role) {
    const roleQuota = getRoleQuota(snapshot, role);
    if (roleQuota && !roleQuota.canAdd) return false;
  }
  return true;
}

export function canAddTireCount(
  snapshot: DealerQuotaSnapshot,
  count: number,
): boolean {
  if (!Number.isFinite(count) || count <= 0) return false;
  if (!snapshot.hasActiveSubscription) return false;
  if (!snapshot.tires) return false;
  return snapshot.tires.remaining >= count;
}
