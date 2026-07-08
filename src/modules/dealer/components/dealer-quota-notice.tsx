"use client";

import { Ban } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { QuotaResource } from "@/modules/dealer/lib/dealer-quota";
import {
  RenewSubscriptionButton,
  SubscriptionRenewalContactHint,
} from "@/modules/dealer/components/renew-subscription-actions";
import { useSubscriptionRenewalContext } from "@/modules/dealer/hooks/use-subscription-renewal-context";

export type DealerQuotaNoticeVariant =
  | "subscription"
  | "staff"
  | "tires"
  | "role"
  | "tiresInsufficient";

type DealerQuotaNoticeProps = {
  variant: DealerQuotaNoticeVariant;
  className?: string;
  roleName?: string;
  roleQuota?: QuotaResource | null;
  staffQuota?: QuotaResource | null;
  tireQuota?: QuotaResource | null;
  requestedTireCount?: number;
};

export function DealerQuotaNotice({
  variant,
  className,
  roleName,
  roleQuota,
  staffQuota,
  tireQuota,
  requestedTireCount,
}: DealerQuotaNoticeProps) {
  const t = useTranslations("quota");
  const renewalContext = useSubscriptionRenewalContext();

  const message = (() => {
    switch (variant) {
      case "subscription":
        return t("blockedSubscription");
      case "staff":
        return t("blockedStaff");
      case "tires":
        return t("blockedTires");
      case "role":
        return t("blockedRole", { role: roleName ?? "—" });
      case "tiresInsufficient":
        return t("tiresInsufficientSlots", {
          requested: requestedTireCount ?? 0,
          remaining: tireQuota?.remaining ?? 0,
          max: tireQuota?.max ?? 0,
        });
      default:
        return "";
    }
  })();

  if (!message) return null;

  /* suppress unused-var warnings for quota details kept for future use */
  void staffQuota;
  void roleQuota;

  return (
    <div
      className={cn(
        "flex items-start gap-2 text-[var(--color-error-main)]",
        className,
      )}
      role="alert"
    >
      <Ban className="mt-px size-4 shrink-0" aria-hidden />
      <div className="space-y-1.5">
        <p className="text-sm leading-snug">{message}</p>
        {variant === "subscription" ? (
          renewalContext.showRenewPrimary ? (
            <RenewSubscriptionButton urgency="inactive" variant="link" />
          ) : renewalContext.showContactAdmin ? (
            <SubscriptionRenewalContactHint className="text-[var(--color-error-main)]/75" />
          ) : null
        ) : null}
      </div>
    </div>
  );
}
