"use client";

import { Snowflake, Sun } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import StyledTable from "@/components/ui/styled-table";
import { cn } from "@/lib/utils";
import {
  truncateVin,
  type ServiceSessionRow,
} from "@/modules/sessions/lib/service-session-dto";

type Translate = (key: string, values?: Record<string, string | number | Date>) => string;

function serviceStatusBadgeClass(status: string): string {
  switch (status.toUpperCase()) {
    case "IN_PROGRESS":
      return "border-0 bg-sky-600 text-white shadow-none";
    case "COMPLETED":
      return "border-0 bg-emerald-600 text-white shadow-none";
    case "CANCELLED":
      return "border-0 bg-destructive text-destructive-foreground shadow-none";
    default:
      return "border-0 bg-muted text-muted-foreground shadow-none";
  }
}

function serviceStatusLabel(status: string, t: Translate): string {
  switch (status.toUpperCase()) {
    case "IN_PROGRESS":
      return t("serviceSessionsStatusInProgress");
    case "COMPLETED":
      return t("serviceSessionsStatusCompleted");
    case "CANCELLED":
      return t("sessionsStatusCancelled");
    default:
      return status;
  }
}

function sessionTypeLabel(sessionType: string, t: Translate): string {
  switch (sessionType.toUpperCase()) {
    case "INITIAL_INSPECTION":
      return t("serviceSessionsTypeInitialInspection");
    case "ROTATION":
      return t("serviceSessionsTypeRotation");
    case "REPLACEMENT":
      return t("serviceSessionsTypeReplacement");
    case "SET_REPLACEMENT":
      return t("serviceSessionsTypeSetReplacement");
    default:
      return sessionType;
  }
}

function seasonBadgeClass(season: string): string {
  switch (season.toUpperCase()) {
    case "WINTER":
      return "border-sky-200 bg-sky-100 text-sky-900 dark:border-sky-500/30 dark:bg-sky-500/15 dark:text-sky-300";
    case "SUMMER":
      return "border-orange-200 bg-orange-100 text-orange-900 dark:border-orange-500/30 dark:bg-orange-500/15 dark:text-orange-300";
    default:
      return "border-border bg-muted text-muted-foreground";
  }
}

function seasonLabel(season: string, t: Translate): string {
  const s = season.toUpperCase();
  if (s === "WINTER") return t("sessionsSeasonWinter");
  if (s === "SUMMER") return t("sessionsSeasonSummer");
  return season || "—";
}

export function ServiceSessionsTable({
  rows,
  loading,
  emptyText,
  t,
}: {
  rows: ServiceSessionRow[];
  loading: boolean;
  emptyText: string;
  t: Translate;
}) {
  return (
    <StyledTable
      isLoading={loading}
      rows={rows}
      keyProp={(r) => r.id}
      emptyText={emptyText}
      columns={[
        {
          header: t("sessionsColId"),
          align: "left",
          className: "min-w-[100px]",
          render: (row) => (
            <span className="font-mono text-sm font-semibold">#{row.id}</span>
          ),
        },
        {
          header: t("sessionsCustomer"),
          align: "left",
          className: "min-w-[140px]",
          render: (row) => (
            <span className="font-medium text-foreground">{row.customerDisplayName}</span>
          ),
        },
        {
          header: t("serviceSessionsColStaff"),
          align: "left",
          className: "min-w-[140px]",
          render: (row) => (
            <span className="font-medium text-foreground">{row.dealerStaffName}</span>
          ),
        },
        {
          header: t("sessionsVehicle"),
          align: "left",
          className: "min-w-[180px]",
          render: (row) => {
            const plate = row.plate !== "—" ? row.plate : null;
            const vinShort = truncateVin(row.vin);
            return (
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">
                  {plate && vinShort !== "—"
                    ? `${plate} - ${vinShort}`
                    : plate ?? (vinShort !== "—" ? row.vin : "—")}
                </p>
                {plate && row.vin !== "—" ? (
                  <p className="mt-0.5 truncate font-mono text-xs text-muted-foreground">
                    {row.vin}
                  </p>
                ) : null}
              </div>
            );
          },
        },
        {
          header: t("sessionsTireSet"),
          align: "left",
          className: "min-w-[120px]",
          render: (row) => (
            <div className="min-w-0">
              <p className="font-medium text-foreground">
                {t("serviceSessionsTireCount", { count: row.tireCount })}
              </p>
              {row.tireSetLabel ? (
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {row.tireSetLabel}
                </p>
              ) : null}
            </div>
          ),
        },
        {
          header: t("serviceSessionsColType"),
          align: "left",
          className: "min-w-[140px]",
          render: (row) => (
            <span className="text-body-sm font-medium text-foreground">
              {sessionTypeLabel(row.sessionType, t)}
            </span>
          ),
        },
        {
          header: t("sessionsSeason"),
          className: "min-w-[110px]",
          render: (row) => {
            const season = row.seasonType.toUpperCase();
            return (
              <Badge
                variant="outline"
                className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 py-1 text-label-sm font-semibold",
                  seasonBadgeClass(season),
                )}
              >
                {season === "WINTER" ? (
                  <Snowflake className="size-3.5 shrink-0" aria-hidden />
                ) : null}
                {season === "SUMMER" ? (
                  <Sun className="size-3.5 shrink-0" aria-hidden />
                ) : null}
                {seasonLabel(season, t)}
              </Badge>
            );
          },
        },
        {
          header: t("sessionsFilterStatusLabel"),
          className: "min-w-[120px]",
          render: (row) => (
            <Badge
              className={cn(
                "px-3 py-1 text-label-sm font-semibold",
                serviceStatusBadgeClass(row.status),
              )}
            >
              {serviceStatusLabel(row.status, t)}
            </Badge>
          ),
        },
        {
          header: t("serviceSessionsColStarted"),
          className: "min-w-[150px]",
          render: (row) => row.startedAtLabel,
        },
        {
          header: t("serviceSessionsColEnded"),
          className: "min-w-[150px]",
          render: (row) => row.endedAtLabel,
        },
      ]}
    />
  );
}
