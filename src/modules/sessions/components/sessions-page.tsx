"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Search,
  ChevronDown,
  CheckCircle2,
  Circle,
  Truck,
  User,
  AlertCircle,
} from "lucide-react";
import { PRIMARY_BUTTON_CLASS } from "@/lib/primary-button-styles";
import { TABLE_FIELD_BORDER } from "@/lib/table-border";
import { cn } from "@/lib/utils";

// ─── Mock data types ───────────────────────────────────────────────────────────

type SessionStatus = "IN_PROGRESS" | "SCHEDULED" | "COMPLETED";

interface TireSetScan {
  id: string;
  label: string;
  season: "winter" | "summer" | "all-season";
  customerName: string;
  vehicleModel: string;
  scanned: number;
  total: number;
}

interface Session {
  id: string;
  sessionNumber: string;
  type: "HANDOVER" | "PRE_SHIPMENT";
  status: SessionStatus;
  direction: string;
  dateLabel: string;
  technician: string | null;
  truckId: string;
  driverName: string | null;
  tiresScanned: number;
  tiresTotal: number;
  discrepancies: boolean | null;
  tireSets: TireSetScan[];
}

// ─── Status styling (design tokens) ─────────────────────────────────────────────

function sessionStatusStyles(status: SessionStatus) {
  switch (status) {
    case "IN_PROGRESS":
      return {
        borderColor: "var(--color-warning-main-dark)",
        badge: "bg-warning-dark text-white",
        progress: "bg-warning-dark",
        accentText: "text-warning-dark",
      };
    case "SCHEDULED":
      return {
        borderColor: "var(--color-info-main)",
        badge: "bg-info-main text-white",
        progress: "bg-surface-container-high",
        accentText: "text-info-main",
      };
    case "COMPLETED":
      return {
        borderColor: "var(--color-success-main-dark)",
        badge: "bg-success-dark text-white",
        progress: "bg-success-dark",
        accentText: "text-success-dark",
      };
  }
}

// ─── Mock sessions data ────────────────────────────────────────────────────────

const MOCK_SESSIONS: Session[] = [
  {
    id: "s1",
    sessionNumber: "HND-2026-0501",
    type: "HANDOVER",
    status: "IN_PROGRESS",
    direction: "Warehouse → Dealership",
    dateLabel: "Started: Today 09:00 AM",
    technician: "Khalid Al-Amri",
    truckId: "TRX-TRUCK-04",
    driverName: "Hassan Al-Omari",
    tiresScanned: 5,
    tiresTotal: 12,
    discrepancies: null,
    tireSets: [
      {
        id: "ts1",
        label: "Winter Set",
        season: "winter",
        customerName: "Mohammed Al-Farsi",
        vehicleModel: "Toyota Camry",
        scanned: 4,
        total: 4,
      },
      {
        id: "ts2",
        label: "Summer Set",
        season: "summer",
        customerName: "Sara Al-Mansouri",
        vehicleModel: "Honda Civic",
        scanned: 1,
        total: 4,
      },
      {
        id: "ts3",
        label: "All-Season Set",
        season: "all-season",
        customerName: "Khalid Ibrahim",
        vehicleModel: "BMW 3-Series",
        scanned: 0,
        total: 4,
      },
    ],
  },
  {
    id: "s2",
    sessionNumber: "HND-2026-0502",
    type: "HANDOVER",
    status: "SCHEDULED",
    direction: "Dealership → Warehouse",
    dateLabel: "Scheduled: May 6, 2026 — 10:00 AM",
    technician: null,
    truckId: "TRX-TRUCK-02",
    driverName: null,
    tiresScanned: 0,
    tiresTotal: 8,
    discrepancies: null,
    tireSets: [
      {
        id: "ts4",
        label: "Winter Set",
        season: "winter",
        customerName: "Ahmed Al-Qasimi",
        vehicleModel: "Nissan Altima",
        scanned: 0,
        total: 4,
      },
      {
        id: "ts5",
        label: "Summer Set",
        season: "summer",
        customerName: "Latifa Al-Hammadi",
        vehicleModel: "Mazda 6",
        scanned: 0,
        total: 4,
      },
    ],
  },
  {
    id: "s3",
    sessionNumber: "HND-2026-0499",
    type: "HANDOVER",
    status: "COMPLETED",
    direction: "Warehouse → Dealership",
    dateLabel: "Completed: Apr 30, 2026 — 11:45 AM",
    technician: "Khalid Al-Amri",
    truckId: "",
    driverName: null,
    tiresScanned: 12,
    tiresTotal: 12,
    discrepancies: false,
    tireSets: [
      {
        id: "ts6",
        label: "Winter Set",
        season: "winter",
        customerName: "Mohammed Al-Farsi",
        vehicleModel: "Toyota Camry",
        scanned: 4,
        total: 4,
      },
      {
        id: "ts7",
        label: "Summer Set",
        season: "summer",
        customerName: "Sara Al-Mansouri",
        vehicleModel: "Honda Civic",
        scanned: 4,
        total: 4,
      },
      {
        id: "ts8",
        label: "All-Season Set",
        season: "all-season",
        customerName: "Khalid Ibrahim",
        vehicleModel: "BMW 3-Series",
        scanned: 4,
        total: 4,
      },
    ],
  },
];

// ─── Sub-components ────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: SessionStatus }) {
  const styles = sessionStatusStyles(status);

  if (status === "IN_PROGRESS") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-label-sm font-bold uppercase tracking-wider",
          styles.badge,
        )}
      >
        <span className="size-1.5 animate-pulse rounded-full bg-white" />
        In Progress
      </span>
    );
  }
  if (status === "SCHEDULED") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-label-sm font-bold uppercase tracking-wider",
          styles.badge,
        )}
      >
        Scheduled
      </span>
    );
  }
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-label-sm font-bold uppercase tracking-wider",
        styles.badge,
      )}
    >
      <CheckCircle2 className="size-3.5" />
      Completed
    </span>
  );
}

function TireSetProgressIcon({
  scanned,
  total,
}: {
  scanned: number;
  total: number;
}) {
  const done = scanned === total && total > 0;
  const partial = scanned > 0 && scanned < total;

  if (done) {
    return (
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-success-dark/20 text-success-dark">
        <CheckCircle2 className="size-4" />
      </div>
    );
  }
  if (partial) {
    return (
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-warning-dark text-warning-dark">
        <span className="text-[10px] font-bold leading-none">
          {Math.round((scanned / total) * 100)}%
        </span>
      </div>
    );
  }
  return (
    <div className="flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-border text-muted-foreground">
      <Circle className="size-3.5" />
    </div>
  );
}

function TireSetCard({ tireSet }: { tireSet: TireSetScan }) {
  const seasonColor =
    tireSet.season === "winter"
      ? "text-tertiary-dark"
      : tireSet.season === "summer"
        ? "text-primary-dark"
        : "text-chart-6";

  return (
    <div className="flex min-w-[160px] shrink-0 items-start gap-3 rounded-lg border border-border bg-surface-container/50 px-3 py-2.5">
      <TireSetProgressIcon scanned={tireSet.scanned} total={tireSet.total} />
      <div className="min-w-0 flex-1">
        <p className={cn("text-label-sm font-semibold leading-tight", seasonColor)}>
          {tireSet.label}
        </p>
        <p className="mt-0.5 truncate text-label-sm font-medium text-foreground">
          {tireSet.customerName}
        </p>
        <p className="truncate text-[11px] text-muted-foreground">{tireSet.vehicleModel}</p>
        <p
          className={cn(
            "mt-1 text-label-sm font-bold tabular-nums",
            tireSet.scanned === tireSet.total && tireSet.total > 0
              ? "text-success-dark"
              : tireSet.scanned > 0
                ? "text-warning-dark"
                : "text-muted-foreground",
          )}
        >
          {tireSet.scanned}/{tireSet.total}
        </p>
      </div>
    </div>
  );
}

function SessionCard({ session }: { session: Session }) {
  const styles = sessionStatusStyles(session.status);
  const progressPct =
    session.tiresTotal > 0
      ? Math.round((session.tiresScanned / session.tiresTotal) * 100)
      : 0;

  const actionLabel =
    session.status === "IN_PROGRESS"
      ? "View Details"
      : session.status === "SCHEDULED"
        ? "Edit"
        : "View Report";

  return (
    <div
      className="overflow-hidden rounded-lg border border-border bg-card [border-inline-start-width:4px]"
      style={{ borderInlineStartColor: styles.borderColor }}
    >
      {/* Card header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={session.status} />
            <span className="font-semibold text-foreground">
              Session #{session.sessionNumber}
            </span>
          </div>
          <span className="text-body-sm text-muted-foreground sm:before:content-['|'] sm:before:me-3">
            Physical Handover — {session.direction}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <span className="text-label-sm text-muted-foreground">{session.dateLabel}</span>
          <button
            type="button"
            className="text-label-md font-semibold text-primary-dark hover:underline"
          >
            {actionLabel}
          </button>
        </div>
      </div>

      {/* Card body — two columns on large screens */}
      <div className="grid gap-4 px-4 py-3 lg:grid-cols-[minmax(0,1fr)_minmax(280px,1.2fr)] lg:items-start">
        {/* Left: technician, truck, progress */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
            <div className="flex items-center gap-1.5">
              <User className="size-3.5 shrink-0 text-muted-foreground" />
              {session.technician ? (
                <span className="text-body-sm font-medium text-foreground">
                  Technician: {session.technician}
                </span>
              ) : (
                <span className={cn("text-body-sm font-medium", styles.accentText)}>
                  Technician: Not assigned yet
                </span>
              )}
            </div>
            {session.truckId && (
              <div className="flex items-center gap-1.5">
                <Truck className="size-3.5 shrink-0 text-muted-foreground" />
                <span className="text-label-sm text-muted-foreground">
                  Truck: {session.truckId}
                  {session.driverName && <> | Driver: {session.driverName}</>}
                </span>
              </div>
            )}
            {session.status === "COMPLETED" && session.technician && (
              <span className="text-label-sm text-muted-foreground">
                Duration: 45 min | {session.tiresScanned}/{session.tiresTotal} tires
              </span>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              {session.status === "COMPLETED" && session.discrepancies === false ? (
                <span className="text-label-sm font-semibold text-success-dark">
                  No discrepancies
                </span>
              ) : session.status === "SCHEDULED" ? (
                <span className="text-label-sm text-muted-foreground">
                  {session.tiresScanned}/{session.tiresTotal} tires | Not started
                </span>
              ) : (
                <span className="text-label-sm text-muted-foreground">
                  {session.tiresScanned}/{session.tiresTotal} tires scanned
                </span>
              )}
              {session.status === "IN_PROGRESS" && (
                <span className={cn("text-label-sm font-bold", styles.accentText)}>
                  {progressPct}%
                </span>
              )}
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-container">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  styles.progress,
                )}
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right: tire sets */}
        <div className="flex gap-2 overflow-x-auto pb-1 lg:justify-end">
          {session.tireSets.map((ts) => (
            <TireSetCard key={ts.id} tireSet={ts} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  valueColor,
}: {
  label: string;
  value: number | string;
  sub: string;
  valueColor?: string;
}) {
  return (
    <div className="min-w-[140px] flex-1 space-y-1 rounded-lg border border-border bg-card px-5 py-4">
      <p className="text-label-sm text-muted-foreground">{label}</p>
      <p className={cn("text-3xl font-bold leading-none", valueColor ?? "text-foreground")}>
        {value}
      </p>
      <p className="text-label-sm text-muted-foreground">{sub}</p>
    </div>
  );
}

// ─── Main page component ────────────────────────────────────────────────────────

const STATUS_OPTIONS: { value: "ALL" | SessionStatus; label: string }[] = [
  { value: "ALL", label: "All Status" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "SCHEDULED", label: "Scheduled" },
  { value: "COMPLETED", label: "Completed" },
];

const DATE_OPTIONS = [
  { value: "ALL", label: "All Dates" },
  { value: "TODAY", label: "Today" },
  { value: "THIS_WEEK", label: "This week" },
  { value: "THIS_MONTH", label: "This month" },
];

export function SessionsPage() {
  const t = useTranslations("dashboard");

  const [activeTab, setActiveTab] = useState<"HANDOVER" | "PRE_SHIPMENT">("HANDOVER");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | SessionStatus>("ALL");
  const [dateFilter, setDateFilter] = useState("ALL");

  const filtered = MOCK_SESSIONS.filter((s) => {
    if (s.type !== activeTab) return false;
    if (statusFilter !== "ALL" && s.status !== statusFilter) return false;
    if (
      search.trim() &&
      !s.sessionNumber.toLowerCase().includes(search.toLowerCase()) &&
      !s.direction.toLowerCase().includes(search.toLowerCase()) &&
      !s.tireSets.some(
        (ts) =>
          ts.customerName.toLowerCase().includes(search.toLowerCase()) ||
          ts.vehicleModel.toLowerCase().includes(search.toLowerCase()),
      )
    )
      return false;
    return true;
  });

  const totalSessions = MOCK_SESSIONS.length;
  const scheduledCount = MOCK_SESSIONS.filter((s) => s.status === "SCHEDULED").length;
  const inProgressCount = MOCK_SESSIONS.filter((s) => s.status === "IN_PROGRESS").length;
  const completedCount = MOCK_SESSIONS.filter((s) => s.status === "COMPLETED").length;

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Page header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-headline-sm font-bold text-foreground">{t("sessionsTitle")}</h1>
          <p className="mt-0.5 text-body-md text-subtle">{t("sessionsIntro")}</p>
        </div>
        <button
          type="button"
          className={cn(
            "flex items-center gap-2 rounded-lg px-4 py-2.5 text-label-md",
            PRIMARY_BUTTON_CLASS,
            "w-full sm:w-auto",
          )}
        >
          + New Handover Session
        </button>
      </div>

      {/* Stats row */}
      <div className="flex flex-wrap gap-4">
        <StatCard label="Total Sessions" value={totalSessions} sub="This Season" />
        <StatCard
          label="Scheduled"
          value={scheduledCount}
          sub="Upcoming"
          valueColor="text-info-main"
        />
        <StatCard
          label="In Progress"
          value={inProgressCount}
          sub="Active Now"
          valueColor="text-warning-dark"
        />
        <StatCard
          label="Completed"
          value={completedCount}
          sub="This Season"
          valueColor="text-success-dark"
        />
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex gap-0">
          {(
            [
              { key: "HANDOVER", label: "Handover Sessions" },
              { key: "PRE_SHIPMENT", label: "Pre-Shipment Sessions" },
            ] as const
          ).map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={cn(
                "border-b-2 px-4 py-2.5 text-label-md font-semibold transition-colors",
                activeTab === key
                  ? "border-primary-dark text-primary-dark"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Filters bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] max-w-xs flex-1">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            data-slot="input"
            placeholder="Search sessions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={cn(
              "h-9 w-full rounded-lg ps-9 pe-3 text-body-sm text-foreground placeholder:text-muted-foreground focus:outline-none",
              TABLE_FIELD_BORDER,
            )}
          />
        </div>

        <div className="relative">
          <select
            data-slot="select-trigger"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "ALL" | SessionStatus)}
            className={cn(
              "h-9 appearance-none rounded-lg pe-8 ps-3 text-body-sm text-foreground focus:outline-none",
              TABLE_FIELD_BORDER,
            )}
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute end-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        </div>

        <div className="relative">
          <select
            data-slot="select-trigger"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className={cn(
              "h-9 appearance-none rounded-lg pe-8 ps-3 text-body-sm text-foreground focus:outline-none",
              TABLE_FIELD_BORDER,
            )}
          >
            {DATE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute end-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        </div>

        <span className="ms-auto text-label-sm text-muted-foreground">
          Showing {filtered.length} session{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Sessions list */}
      <div className="flex flex-col gap-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-card py-16 text-center">
            <AlertCircle className="size-8 text-muted-foreground" />
            <p className="text-body-sm text-muted-foreground">No sessions match your filters.</p>
          </div>
        ) : (
          filtered.map((session) => <SessionCard key={session.id} session={session} />)
        )}
      </div>
    </div>
  );
}
