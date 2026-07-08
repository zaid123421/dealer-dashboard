"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CheckCircle2, Clock, Layers, Search, XCircle } from "lucide-react";
import { ErrorAlert } from "@/components/ui/error-alert";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import StyledTable from "@/components/ui/styled-table";
import { StatTile } from "@/components/ui/stat-tile";
import { formatTableCell } from "@/lib/format-table-cell";
import { cn } from "@/lib/utils";
import { useServiceSessions } from "@/modules/sessions/hooks/use-service-sessions";
import type { ServiceSessionRow } from "@/modules/sessions/lib/service-session-dto";

type StatusFilter = "ALL" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
type TypeFilter = "ALL" | "INITIAL_INSPECTION" | "ROTATION" | "REPLACEMENT";
type DateFilter = "ALL" | "TODAY" | "THIS_WEEK" | "THIS_MONTH";

function statusBadgeClass(status: string): string {
  switch (status) {
    case "IN_PROGRESS":
      return "border-0 bg-[#2563eb] text-white shadow-none dark:bg-blue-500";
    case "CANCELLED":
      return "border-0 bg-error-main text-destructive-foreground shadow-none";
    case "COMPLETED":
      return "border-0 bg-success-dark text-success-onContainer shadow-none";
    default:
      return "border-0 bg-secondary text-secondary-foreground shadow-none";
  }
}

function seasonBadgeClass(seasonType: string): string {
  if (seasonType === "WINTER") {
    return "border-0 bg-tertiary-dark/15 text-tertiary-dark shadow-none";
  }
  if (seasonType === "SUMMER") {
    return "border-0 bg-primary-dark/15 text-primary-dark shadow-none";
  }
  return "border-0 bg-muted text-muted-foreground shadow-none";
}

function matchesDateFilter(startedAt: string | null, filter: DateFilter): boolean {
  if (filter === "ALL") return true;
  if (!startedAt) return false;

  const d = new Date(startedAt);
  if (Number.isNaN(d.getTime())) return false;

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  if (filter === "TODAY") return d >= startOfToday;
  if (filter === "THIS_WEEK") return d >= startOfWeek;
  if (filter === "THIS_MONTH") return d >= startOfMonth;
  return true;
}

export function SessionsPage() {
  const t = useTranslations("dashboard");
  const locale = useLocale();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("ALL");
  const [dateFilter, setDateFilter] = useState<DateFilter>("ALL");

  const { data, isLoading, isError, error, refetch, isFetching } = useServiceSessions({
    page: 0,
    size: 20,
    sortBy: "startedAt",
    direction: "desc",
    locale,
  });

  const sessions = useMemo(() => data?.rows ?? [], [data?.rows]);
  const loading = isLoading || (isFetching && !data);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return sessions.filter((session) => {
      if (statusFilter !== "ALL" && session.status !== statusFilter) return false;
      if (typeFilter !== "ALL" && session.sessionType !== typeFilter) return false;
      if (!matchesDateFilter(session.startedAt, dateFilter)) return false;
      if (!q) return true;

      const haystack = [
        String(session.id),
        session.customerDisplayName,
        session.plate,
        session.vin,
        session.tireSetLabel,
        session.sessionType,
        session.status,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [sessions, search, statusFilter, typeFilter, dateFilter]);

  const totalSessions = data?.meta.totalElements ?? sessions.length;
  const inProgressCount = sessions.filter((s) => s.status === "IN_PROGRESS").length;
  const completedCount = sessions.filter((s) => s.status === "COMPLETED").length;
  const cancelledCount = sessions.filter((s) => s.status === "CANCELLED").length;

  function statusLabel(status: string): string {
    switch (status) {
      case "IN_PROGRESS":
        return t("sessionsStatusInProgress");
      case "COMPLETED":
        return t("sessionsStatusCompleted");
      case "CANCELLED":
        return t("sessionsStatusCancelled");
      default:
        return status;
    }
  }

  function sessionTypeLabel(type: string): string {
    switch (type) {
      case "INITIAL_INSPECTION":
        return t("sessionsTypeInitialInspection");
      case "ROTATION":
        return t("sessionsTypeRotation");
      case "REPLACEMENT":
        return t("sessionsTypeReplacement");
      default:
        return type;
    }
  }

  function seasonLabel(seasonType: string): string {
    if (seasonType === "WINTER") return t("sessionsSeasonWinter");
    if (seasonType === "SUMMER") return t("sessionsSeasonSummer");
    return seasonType;
  }

  function vehicleLabel(session: ServiceSessionRow): string {
    if (session.plate !== "—" && session.vin !== "—") {
      return `${session.plate} · ${session.vin}`;
    }
    return session.plate !== "—" ? session.plate : session.vin;
  }

  function tireSetLabel(session: ServiceSessionRow): string {
    if (session.tireSetLabel !== "—") {
      return `${session.tireSetLabel} (${session.tireCount})`;
    }
    return t("sessionsTireCount", { count: session.tireCount });
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div>
        <h1 className="text-headline-sm font-bold text-foreground">{t("sessionsTitle")}</h1>
        <p className="mt-1 text-body-md text-subtle">{t("sessionsIntro")}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatTile
          icon={Layers}
          label={t("sessionsStatTotal")}
          value={totalSessions}
          accent="primary"
          size="large"
        />
        <StatTile
          icon={Clock}
          label={t("sessionsStatusInProgress")}
          value={inProgressCount}
          accent="info"
          size="large"
        />
        <StatTile
          icon={CheckCircle2}
          label={t("sessionsStatusCompleted")}
          value={completedCount}
          accent="success"
          size="large"
        />
        <StatTile
          icon={XCircle}
          label={t("sessionsStatusCancelled")}
          value={cancelledCount}
          accent="error"
          size="large"
        />
      </div>

      <div className="flex shrink-0 flex-col gap-3 py-1 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="relative min-w-0 flex-1 sm:min-w-[220px]">
          <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t("sessionsSearchPlaceholder")}
            className="w-full ps-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label={t("sessionsSearchPlaceholder")}
          />
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <span className="text-label-sm font-medium text-muted-foreground sm:me-1">
            {t("sessionsFilterTypeLabel")}
          </span>
          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as TypeFilter)}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{t("sessionsFilterAllTypes")}</SelectItem>
              <SelectItem value="INITIAL_INSPECTION">{t("sessionsTypeInitialInspection")}</SelectItem>
              <SelectItem value="ROTATION">{t("sessionsTypeRotation")}</SelectItem>
              <SelectItem value="REPLACEMENT">{t("sessionsTypeReplacement")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <span className="text-label-sm font-medium text-muted-foreground sm:me-1">
            {t("sessionsFilterStatusLabel")}
          </span>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{t("sessionsFilterAllStatus")}</SelectItem>
              <SelectItem value="IN_PROGRESS">{t("sessionsStatusInProgress")}</SelectItem>
              <SelectItem value="COMPLETED">{t("sessionsStatusCompleted")}</SelectItem>
              <SelectItem value="CANCELLED">{t("sessionsStatusCancelled")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <span className="text-label-sm font-medium text-muted-foreground sm:me-1">
            {t("sessionsFilterDateLabel")}
          </span>
          <Select value={dateFilter} onValueChange={(v) => setDateFilter(v as DateFilter)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{t("sessionsFilterAllDates")}</SelectItem>
              <SelectItem value="TODAY">{t("sessionsFilterToday")}</SelectItem>
              <SelectItem value="THIS_WEEK">{t("sessionsFilterThisWeek")}</SelectItem>
              <SelectItem value="THIS_MONTH">{t("sessionsFilterThisMonth")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <p className="w-full text-end text-body-md text-muted-foreground sm:ms-auto sm:w-auto">
          {t("sessionsShowingCount", { count: filtered.length })}
        </p>
      </div>

      {isError ? (
        <ErrorAlert
          message={error instanceof Error ? error.message : t("sessionsLoadError")}
          onRetry={() => void refetch()}
          retryLabel={t("sessionsRetry")}
          className="shrink-0"
        />
      ) : null}

      <StyledTable
        isLoading={loading}
        rows={filtered}
        keyProp={(row) => row.id}
        emptyText={t("sessionsEmpty")}
        columns={[
          {
            header: t("sessionsColId"),
            className: "min-w-[100px]",
            render: (row) => (
              <span className="font-mono text-label-md font-semibold text-foreground">
                #{row.id}
              </span>
            ),
          },
          {
            header: t("sessionsCustomer"),
            className: "min-w-[160px]",
            align: "left",
            render: (row) => (
              <span className="block max-w-[200px] truncate font-medium text-foreground">
                {formatTableCell(row.customerDisplayName)}
              </span>
            ),
          },
          {
            header: t("sessionsVehicle"),
            className: "min-w-[140px]",
            render: (row) => (
              <span className="block max-w-[180px] truncate font-mono text-label-md">
                {formatTableCell(vehicleLabel(row))}
              </span>
            ),
          },
          {
            header: t("sessionsTireSet"),
            className: "min-w-[140px]",
            align: "left",
            render: (row) => (
              <span className="block max-w-[180px] truncate text-body-sm">
                {formatTableCell(tireSetLabel(row))}
              </span>
            ),
          },
          {
            header: t("sessionsFilterTypeLabel"),
            className: "min-w-[130px]",
            render: (row) => (
              <span className="text-body-sm text-foreground">
                {sessionTypeLabel(row.sessionType)}
              </span>
            ),
          },
          {
            header: t("sessionsSeason"),
            className: "min-w-[100px]",
            render: (row) => (
              <Badge className={cn("text-label-sm", seasonBadgeClass(row.seasonType))}>
                {seasonLabel(row.seasonType)}
              </Badge>
            ),
          },
          {
            header: t("sessionsFilterStatusLabel"),
            className: "min-w-[120px]",
            render: (row) => (
              <Badge className={cn("text-label-sm", statusBadgeClass(row.status))}>
                {statusLabel(row.status)}
              </Badge>
            ),
          },
          {
            header: t("sessionsColStarted"),
            className: "min-w-[150px]",
            render: (row) => (
              <span className="whitespace-nowrap text-body-sm text-muted-foreground">
                {row.startedAtLabel}
              </span>
            ),
          },
          {
            header: t("sessionsColEnded"),
            className: "min-w-[150px]",
            render: (row) => (
              <span className="whitespace-nowrap text-body-sm text-muted-foreground">
                {row.endedAtLabel ?? "—"}
              </span>
            ),
          },
        ]}
      />
    </div>
  );
}
