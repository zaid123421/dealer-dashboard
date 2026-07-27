"use client";

import { Ban } from "lucide-react";
import { useTranslations } from "next-intl";
import { useViewOnlyMode } from "@/modules/dealer/hooks/use-view-only-mode";
import { useSubscriptionRenewalContext } from "@/modules/dealer/hooks/use-subscription-renewal-context";
import {
  RenewSubscriptionButton,
  SubscriptionRenewalContactHint,
} from "@/modules/dealer/components/renew-subscription-actions";

/** Sticky dashboard banner when the dealer subscription is inactive (system is view-only). */
export function SubscriptionViewOnlyBanner() {
  const t = useTranslations("subscription");
  const { isViewOnly } = useViewOnlyMode();
  const renewalContext = useSubscriptionRenewalContext();

  if (!isViewOnly) return null;

  return (
    <div
      role="status"
      className="sticky top-0 z-30 mb-3 shrink-0 rounded-xl border border-[var(--color-error-main)]/30 bg-gradient-to-br from-red-50/95 to-red-50/50 px-4 py-3 text-[var(--color-error-main)] shadow-sm dark:from-red-950/40 dark:to-red-950/20 sm:mb-4 sm:px-4 sm:py-3.5"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-error-main)]/10">
            <Ban className="size-4" aria-hidden />
          </div>
          <div className="min-w-0 space-y-1">
            <p className="text-sm font-semibold leading-snug">{t("viewOnlyTitle")}</p>
            <p className="text-xs leading-snug text-[var(--color-error-main)]/80">
              {t("viewOnlyBody")}
            </p>
            {renewalContext.showContactAdmin ? (
              <SubscriptionRenewalContactHint className="text-[var(--color-error-main)]/75" />
            ) : null}
          </div>
        </div>
        {renewalContext.showRenewPrimary ? (
          <RenewSubscriptionButton
            urgency="inactive"
            variant="brand"
            onBanner
            className="shrink-0"
          />
        ) : null}
      </div>
    </div>
  );
}
