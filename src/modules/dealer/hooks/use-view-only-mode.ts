"use client";

import { useCallback } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useDealerQuota } from "@/modules/dealer/hooks/use-dealer-quota";

/**
 * View-only when dealer profile is loaded and subscription is inactive.
 * Until profile loads, the app stays writable to avoid locking during bootstrap.
 */
export function useViewOnlyMode() {
  const { snapshot } = useDealerQuota();
  const isViewOnly = snapshot.isLoaded && !snapshot.hasActiveSubscription;

  return {
    isViewOnly,
    canMutate: !isViewOnly,
    isSubscriptionLoaded: snapshot.isLoaded,
  };
}

/** Returns false (and toasts) when the dealer cannot mutate due to inactive subscription. */
export function useGuardWrite() {
  const { isViewOnly } = useViewOnlyMode();
  const t = useTranslations("subscription");

  return useCallback(() => {
    if (!isViewOnly) return true;
    toast.error(t("viewOnlyBlocked"));
    return false;
  }, [isViewOnly, t]);
}
