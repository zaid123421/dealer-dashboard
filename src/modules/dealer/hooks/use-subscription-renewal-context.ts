"use client";

import { useMemo } from "react";
import { getSubscriptionRenewalContext } from "@/modules/dealer/lib/subscription-renewal";
import { useAuthUser, useDealerProfile } from "@/shared/hooks/use-can-access";

export function useSubscriptionRenewalContext() {
  const profile = useDealerProfile();
  const user = useAuthUser();
  const backendRole = user?.backendRole || profile?.currentUser?.roleName;
  return useMemo(
    () => getSubscriptionRenewalContext(profile, backendRole),
    [profile, backendRole],
  );
}
