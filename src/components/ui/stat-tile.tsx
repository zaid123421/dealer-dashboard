"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type StatTileAccent = "primary" | "info" | "success" | "error" | "none";

const accentStyles = {
  primary: {
    icon: "bg-primary-dark/10 text-primary-dark border-primary-dark/20 dark:bg-primary-dark/20 dark:text-primary dark:border-primary/30",
    value: "text-primary-dark dark:text-primary",
    glow: "group-hover:shadow-md",
  },
  info: {
    icon: "bg-[#2563eb]/10 text-[#2563eb] border-[#2563eb]/25 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/30",
    value: "text-[#2563eb] dark:text-blue-400",
    glow: "group-hover:shadow-md",
  },
  success: {
    icon: "bg-success-dark/10 text-success-dark border-success-dark/25 dark:bg-success-dark/15 dark:text-success-onContainer dark:border-success-dark/30",
    value: "text-success-dark dark:text-success-onContainer",
    glow: "group-hover:shadow-md",
  },
  error: {
    icon: "bg-error-main/10 text-error-main border-error-main/25 dark:bg-error-main/15 dark:text-destructive-foreground dark:border-error-main/30",
    value: "text-error-main dark:text-destructive-foreground",
    glow: "group-hover:shadow-md",
  },
  none: {
    icon: "",
    value: "text-foreground",
    glow: "group-hover:shadow-md",
  },
} as const;

type StatTileProps = {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
  className?: string;
  valueClassName?: string;
  accent?: StatTileAccent;
  size?: "default" | "large";
};

export function StatTile({
  icon: Icon,
  label,
  value,
  className,
  valueClassName,
  accent = "none",
  size = "default",
}: StatTileProps) {
  const styles = accentStyles[accent];
  const isLarge = size === "large";

  return (
    <div className={cn("group min-w-0", className)}>
      <div className="mb-2 flex min-w-0 items-center gap-2">
        {isLarge ? (
          <div
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-lg border",
              styles.icon,
            )}
          >
            <Icon className="size-4" aria-hidden />
          </div>
        ) : (
          <Icon className="size-3 text-primary-dark sm:size-4" aria-hidden />
        )}
        <span className="min-w-0 truncate whitespace-nowrap text-xs font-medium text-muted-foreground sm:text-sm">
          {label}
        </span>
      </div>
      <div
        className={cn(
          "min-w-0 rounded-lg bg-surface-lightContainer dark:bg-surface-container p-4 transition-all",
          styles.glow,
          isLarge ? "px-4 py-4 sm:px-4 sm:py-5" : "p-2 sm:p-3",
        )}
      >
        <div
          className={cn(
            isLarge
              ? "text-3xl font-extrabold tabular-nums leading-none tracking-tight sm:text-4xl"
              : "min-w-0 truncate whitespace-nowrap text-sm font-semibold sm:text-base",
            styles.value,
            !isLarge && "break-words whitespace-normal sm:whitespace-nowrap",
            valueClassName,
          )}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

export function StatTileSkeleton({ large = false }: { large?: boolean }) {
  return (
    <div className="min-w-0">
      <div className="mb-2 flex min-w-0 items-center gap-2">
        <Skeleton className={cn("rounded-sm", large ? "size-8 rounded-lg" : "size-3 sm:size-4")} />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton
        className={cn(
          "w-full rounded-lg",
          large ? "h-16 sm:h-20" : "h-10 border-2 border-transparent sm:h-12",
        )}
      />
    </div>
  );
}

/** Shared value box for inline content (tags, pre blocks, etc.) */
export function StatTileBox({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "min-w-0 rounded-lg bg-surface-lightContainer dark:bg-surface-container p-4 transition-all group-hover:shadow-md",
        className,
      )}
    >
      {children}
    </div>
  );
}
