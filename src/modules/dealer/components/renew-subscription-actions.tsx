"use client";

import { ArrowRight, RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PRIMARY_BUTTON_PILL_CLASS } from "@/lib/primary-button-styles";
import { useRenewSubscriptionDialog } from "@/modules/dealer/components/renew-subscription-dialog-provider";

type RenewSubscriptionButtonProps = {
  urgency?: "inactive" | "expiring" | "default";
  variant?: "brand" | "outline" | "link";
  className?: string;
  size?: "default" | "sm";
  /** Light surface for use on colored alert banners */
  onBanner?: boolean;
};

export function RenewSubscriptionButton({
  urgency = "default",
  variant = "brand",
  className,
  size = "default",
  onBanner = false,
}: RenewSubscriptionButtonProps) {
  const t = useTranslations("subscription");
  const { openRenewDialog } = useRenewSubscriptionDialog();

  const label =
    urgency === "inactive"
      ? t("renewNow")
      : urgency === "expiring"
        ? t("renewEarly")
        : t("renewSubscription");

  if (variant === "link") {
    return (
      <button
        type="button"
        onClick={openRenewDialog}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border border-current/20 bg-white/70 px-3 py-1.5 text-xs font-semibold shadow-sm transition-colors hover:bg-white dark:bg-black/20 dark:hover:bg-black/30",
          className,
        )}
      >
        <RefreshCw className="size-3.5 shrink-0" aria-hidden />
        {label}
        <ArrowRight className="size-3.5 shrink-0 opacity-70" aria-hidden />
      </button>
    );
  }

  const isBrand = variant === "brand";

  return (
    <Button
      type="button"
      variant={isBrand ? "brand" : "outline"}
      size={size}
      className={cn(
        "font-semibold shadow-none max-sm:w-full",
        isBrand && PRIMARY_BUTTON_PILL_CLASS,
        isBrand && size === "sm" && "h-9 px-4 text-sm",
        !isBrand &&
          "border-primary-dark/25 bg-card text-primary-dark hover:border-primary-dark/40 hover:bg-primary-dark/5 dark:border-primary-dark/35 dark:hover:bg-primary-dark/10",
        onBanner &&
          isBrand &&
          "border border-white/30 bg-white text-primary-dark shadow-sm hover:bg-white/95 dark:border-white/20 dark:bg-white/95 dark:hover:bg-white",
        onBanner &&
          !isBrand &&
          "border-white/40 bg-white/90 text-amber-900 hover:bg-white dark:border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-100 dark:hover:bg-amber-950/55",
        className,
      )}
      onClick={openRenewDialog}
    >
      <RefreshCw className="size-4 shrink-0" aria-hidden />
      {label}
    </Button>
  );
}

export function SubscriptionRenewalContactHint({ className }: { className?: string }) {
  const t = useTranslations("subscription");
  return (
    <p className={cn("text-xs leading-snug text-muted-foreground", className)}>
      {t("renewContactAdmin")}
    </p>
  );
}
