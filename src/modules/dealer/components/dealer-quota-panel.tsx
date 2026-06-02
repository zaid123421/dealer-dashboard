"use client";

import { Ban, Users, Layers } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { TABLE_BORDER } from "@/lib/table-border";
import { useDealerQuota } from "@/modules/dealer/hooks/use-dealer-quota";
import type { QuotaResource } from "@/modules/dealer/lib/dealer-quota";
import type { LucideIcon } from "lucide-react";

type DealerQuotaPanelProps = {
  className?: string;
  showRoles?: boolean;
  variant?: "compact" | "full";
  filter?: "all" | "staff" | "tires";
};

type Severity = "ok" | "warning" | "full";

function isSubscriptionExpiryAlert(message: string): boolean {
  const normalized = message.trim().toLowerCase();
  if (!normalized) return false;
  if (normalized.includes("subscription") && normalized.includes("expir")) return true;
  if (message.includes("ينتهي") && message.includes("اشتراك")) return true;
  return false;
}

function isRoleBlockAlert(message: string): boolean {
  const normalized = message.trim().toLowerCase();
  if (!normalized) return false;
  if (normalized.includes("adding") && normalized.includes("blocked") && normalized.includes("role")) {
    return true;
  }
  if (message.includes("إضافة") && message.includes("محظورة") && message.includes("دور")) {
    return true;
  }
  return false;
}

type AlertFilterOptions = {
  excludeSubscriptionExpiry: boolean;
  excludeRoleBlocks: boolean;
};

function dedupeAlerts(alerts: string[], options: AlertFilterOptions): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const alert of alerts) {
    const trimmed = alert.trim();
    if (!trimmed || seen.has(trimmed)) continue;
    if (options.excludeSubscriptionExpiry && isSubscriptionExpiryAlert(trimmed)) continue;
    if (options.excludeRoleBlocks && isRoleBlockAlert(trimmed)) continue;
    seen.add(trimmed);
    result.push(trimmed);
  }
  return result;
}

function getSeverity(r: QuotaResource): Severity {
  if (!r.canAdd) return "full";
  if (r.usagePercentage >= 85) return "warning";
  return "ok";
}

const severityStyles = {
  ok: {
    bar: "bg-primary-dark",
    track: "bg-primary-dark/15 dark:bg-primary-dark/20",
    value: "text-primary-dark dark:text-primary",
    badge: "bg-primary-dark/10 text-primary-dark border-primary-dark/20 dark:bg-primary-dark/20",
    dot: "bg-primary-dark",
  },
  warning: {
    bar: "bg-amber-500",
    track: "bg-amber-500/15 dark:bg-amber-500/20",
    value: "text-amber-600 dark:text-amber-400",
    badge: "bg-amber-50 text-amber-700 border-amber-300/60 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-500/30",
    dot: "bg-amber-500",
  },
  full: {
    bar: "bg-[var(--color-error-main)]",
    track: "bg-[var(--color-error-main)]/15 dark:bg-[var(--color-error-main)]/20",
    value: "text-[var(--color-error-main)]",
    badge: "bg-red-50 text-[var(--color-error-main)] border-[var(--color-error-main)]/30 dark:bg-red-950/20 dark:border-[var(--color-error-main)]/30",
    dot: "bg-[var(--color-error-main)]",
  },
} as const;

function QuotaCard({
  resource,
  title,
  unitLabel,
  icon: Icon,
  blockMessage,
}: {
  resource: QuotaResource;
  title: string;
  unitLabel: string;
  icon: LucideIcon;
  blockMessage: string | null;
}) {
  const t = useTranslations("quota");
  const sev = getSeverity(resource);
  const styles = severityStyles[sev];
  const pct = Math.min(100, Math.round(resource.usagePercentage));

  return (
    <div className={cn("rounded-lg bg-card p-4 space-y-3", TABLE_BORDER)}>
      {/* Header row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className={cn("flex size-7 shrink-0 items-center justify-center rounded-lg", styles.badge, "border")}>
            <Icon className="size-3.5" aria-hidden />
          </div>
          <span className="text-sm font-semibold text-foreground truncate">{title}</span>
        </div>
        {/* percentage badge */}
        <span
          className={cn(
            "shrink-0 rounded-full border px-2 py-0.5 text-xs font-bold tabular-nums",
            styles.badge,
          )}
        >
          {pct}%
        </span>
      </div>

      {/* Numbers */}
      <div className="flex items-baseline gap-1">
        <span className={cn("text-2xl font-extrabold tabular-nums leading-none", styles.value)}>
          {resource.current}
        </span>
        <span className="text-sm font-medium text-muted-foreground">
          / {resource.max} {unitLabel}
        </span>
      </div>

      {/* Progress bar */}
      <div className={cn("h-2 w-full overflow-hidden rounded-full", styles.track)}>
        <div
          className={cn("h-full rounded-full transition-all duration-700 ease-out", styles.bar)}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Footer: remaining or block */}
      {!resource.canAdd && blockMessage ? (
        <div className={cn("flex items-start gap-1.5", styles.value)}>
          <Ban className="mt-px size-3.5 shrink-0" aria-hidden />
          <p className="text-xs leading-snug">{blockMessage}</p>
        </div>
      ) : resource.remaining > 0 ? (
        <p className="text-xs text-muted-foreground">
          {t("remainingSlots", { remaining: resource.remaining })}
        </p>
      ) : null}
    </div>
  );
}

function QuotaRoleRow({
  resource,
  blockMessage,
}: {
  resource: QuotaResource;
  blockMessage: string | null;
}) {
  const t = useTranslations("quota");
  const sev = getSeverity(resource);
  const styles = severityStyles[sev];
  const pct = Math.min(100, Math.round(resource.usagePercentage));

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className={cn("inline-block size-2 shrink-0 rounded-full", styles.dot)} />
          <span className="text-xs font-mono font-semibold text-foreground truncate">{resource.label}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs tabular-nums text-muted-foreground">
            {resource.current}/{resource.max}
          </span>
          <span className={cn("text-xs font-bold tabular-nums", styles.value)}>{pct}%</span>
        </div>
      </div>
      <div className={cn("h-1.5 w-full overflow-hidden rounded-full", styles.track)}>
        <div
          className={cn("h-full rounded-full transition-all duration-700", styles.bar)}
          style={{ width: `${pct}%` }}
        />
      </div>
      {!resource.canAdd && blockMessage ? (
        <div className={cn("flex items-start gap-1.5 pt-0.5", styles.value)}>
          <Ban className="mt-px size-3 shrink-0" aria-hidden />
          <p className="text-xs leading-snug">{blockMessage}</p>
        </div>
      ) : null}
    </div>
  );
}

export function DealerQuotaPanel({
  className,
  showRoles = false,
  variant = "full",
  filter = "all",
}: DealerQuotaPanelProps) {
  const t = useTranslations("quota");
  const tSettings = useTranslations("settings");
  const { snapshot, profile } = useDealerQuota();

  if (!snapshot.isLoaded) return null;

  const showStaff = filter === "all" || filter === "staff";
  const showTires = filter === "all" || filter === "tires";

  /* ── compact variant ── */
  if (variant === "compact") {
    const rows: { label: string; resource: QuotaResource }[] = [];
    if (showStaff && snapshot.staff) rows.push({ label: t("staffUnit"), resource: snapshot.staff });
    if (showTires && snapshot.tires) rows.push({ label: t("tiresUnit"), resource: snapshot.tires });
    if (rows.length === 0) return null;

    return (
      <div className={cn("flex flex-wrap gap-2", className)}>
        {rows.map(({ label, resource }) => {
          const sev = getSeverity(resource);
          const styles = severityStyles[sev];
          const pct = Math.min(100, Math.round(resource.usagePercentage));
          return (
            <span
              key={resource.id}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
                styles.badge,
              )}
            >
              <span className={cn("inline-block size-1.5 rounded-full", styles.dot)} />
              {resource.current}/{resource.max} {label}
              <span className="font-bold">({pct}%)</span>
            </span>
          );
        })}
      </div>
    );
  }

  /* ── full variant ── */
  const hasContent =
    (showStaff && snapshot.staff) ||
    (showTires && snapshot.tires) ||
    (showRoles && snapshot.roles.length > 0);

  if (!hasContent && !snapshot.planName) return null;

  const daysToExpiry = profile?.usage?.daysToSubscriptionExpiry;
  const showSubscriptionExpiry = daysToExpiry != null;
  const blockedRoles = showRoles ? snapshot.roles.filter((role) => !role.canAdd) : [];
  const blockedRoleNames = blockedRoles.map((role) => role.label).join(", ");
  const showRoleBlockSummary = blockedRoles.length > 0;
  const visibleAlerts = dedupeAlerts(snapshot.alerts, {
    excludeSubscriptionExpiry: showSubscriptionExpiry,
    excludeRoleBlocks: showRoleBlockSummary,
  });

  return (
    <div className={cn("space-y-4", className)}>

      {/* Plan header */}
      {snapshot.planName ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-primary-dark px-3 py-0.5 text-xs font-semibold text-primary-onContainer">
            {snapshot.planName}
          </span>
          {snapshot.subscriptionStatus ? (
            <span
              className={cn(
                "inline-flex items-center rounded-full px-3 py-1 text-sm text-white",
                snapshot.hasActiveSubscription
                  ? "bg-emerald-600"
                  : "bg-gray-500",
              )}
            >
              {snapshot.subscriptionStatus}
            </span>
          ) : null}
          {showSubscriptionExpiry ? (
            <span className="text-xs text-muted-foreground">
              {tSettings("subscriptionExpiryDays", {
                count: daysToExpiry,
              })}
            </span>
          ) : null}
        </div>
      ) : null}

      {/* No active subscription banner */}
      {!snapshot.hasActiveSubscription ? (
        <div className="flex items-start gap-2 rounded-lg border border-[var(--color-error-main)]/30 bg-red-50/60 px-3 py-2.5 text-[var(--color-error-main)] dark:bg-red-950/15">
          <Ban className="mt-px size-4 shrink-0" aria-hidden />
          <p className="text-sm leading-snug">{t("blockedSubscription")}</p>
        </div>
      ) : null}

      {/* Usage cards grid */}
      {(showStaff && snapshot.staff) || (showTires && snapshot.tires) ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {showStaff && snapshot.staff ? (
            <QuotaCard
              resource={snapshot.staff}
              title={t("staffLabel")}
              unitLabel={t("staffUnit")}
              icon={Users}
              blockMessage={snapshot.staff.canAdd ? null : t("blockedStaff")}
            />
          ) : null}
          {showTires && snapshot.tires ? (
            <QuotaCard
              resource={snapshot.tires}
              title={t("tiresLabel")}
              unitLabel={t("tiresUnit")}
              icon={Layers}
              blockMessage={snapshot.tires.canAdd ? null : t("blockedTires")}
            />
          ) : null}
        </div>
      ) : null}

      {/* Per-role breakdown */}
      {showRoles && snapshot.roles.length > 0 ? (
        <div className={cn("rounded-lg bg-card p-4 space-y-3", TABLE_BORDER)}>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {t("rolesLabel")}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {snapshot.roles.map((role) => (
              <QuotaRoleRow key={role.id} resource={role} blockMessage={null} />
            ))}
          </div>
          {showRoleBlockSummary ? (
            <div className="flex items-start gap-2 rounded-lg border border-[var(--color-error-main)]/30 bg-red-50/60 px-3 py-2.5 text-[var(--color-error-main)] dark:bg-red-950/15">
              <Ban className="mt-px size-3.5 shrink-0" aria-hidden />
              <p className="text-xs leading-snug">
                {t("blockedRole", { role: blockedRoleNames })}
              </p>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* Alerts */}
      {visibleAlerts.length > 0 ? (
        <ul className="space-y-1.5">
          {visibleAlerts.map((alert) => (
            <li
              key={alert}
              className="flex items-start gap-2 rounded-lg border border-amber-400/40 bg-amber-50/70 px-3 py-2 text-amber-700 dark:border-amber-500/25 dark:bg-amber-950/15 dark:text-amber-300"
            >
              <span className="mt-0.5 text-xs leading-none">⚠</span>
              <p className="text-xs leading-snug">{alert}</p>
            </li>
          ))}
        </ul>
      ) : null}

    </div>
  );
}
