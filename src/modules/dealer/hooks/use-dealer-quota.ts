"use client";

import { useMemo } from "react";
import { useDealerProfile } from "@/shared/hooks/use-can-access";
import {
  buildDealerQuotaSnapshot,
  canAddStaffMember,
  canAddTireCount,
  getRoleQuota,
  type DealerQuotaSnapshot,
  type QuotaResource,
} from "@/modules/dealer/lib/dealer-quota";

export function useDealerQuota() {
  const profile = useDealerProfile();

  const snapshot = useMemo(
    () => buildDealerQuotaSnapshot(profile),
    [profile],
  );

  return {
    profile,
    snapshot,
    canAddStaff: (role?: string) => canAddStaffMember(snapshot, role),
    canAddTires: (count = 1) => canAddTireCount(snapshot, count),
    getRoleQuota: (role: string) => getRoleQuota(snapshot, role),
  };
}

export type { DealerQuotaSnapshot, QuotaResource };
