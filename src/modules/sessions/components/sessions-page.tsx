"use client";

import { useMemo, useState } from "react";
import { useQueries, type UseQueryResult } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowUpFromLine,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Loader2,
  PackageCheck,
  ScanLine,
} from "lucide-react";
import { ErrorAlert } from "@/components/ui/error-alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PaginationControls } from "@/components/ui/pagination-controls";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatTile } from "@/components/ui/stat-tile";
import { Skeleton } from "@/components/ui/skeleton";
import StyledTable from "@/components/ui/styled-table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog } from "@/components/ui/dialog";
import {
  ConfirmDialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/app-dialog";
import { cn } from "@/lib/utils";
import { formatLocaleDateTime } from "@/lib/format-locale";
import { TABLE_DETAIL_BOX } from "@/lib/table-border";
import { DIALOG_FOOTER_BUTTON_CLASS } from "@/lib/radius";
import {
  apiErrorMessageFromUnknown,
  isHandoverCloseConflictError,
  type HandoverDirection,
} from "@/modules/shipment-requests/services/dealer-handover.service";
import { useCloseHandoverSession } from "@/modules/shipment-requests/hooks/use-close-handover-session";
import { useViewOnlyMode } from "@/modules/dealer/hooks/use-view-only-mode";
import { useDealerHandoverSessions } from "@/modules/sessions/hooks/use-dealer-handover-sessions";
import {
  dealerHandoverSessionStateQueryKey,
} from "@/modules/sessions/hooks/use-dealer-handover-session-state";
import type { HandoverSessionRow } from "@/modules/sessions/lib/handover-session-dto";
import {
  formatScanResultLabel,
  scanResultBadgeClass,
  type NormalizedHandoverSessionState,
} from "@/modules/sessions/lib/handover-session-state-dto";
import { getDealerHandoverSessionState } from "@/modules/sessions/services/dealer-handover-session-state.service";
import type { HandoverSessionStatusFilter } from "@/modules/sessions/services/dealer-handover-sessions.service";

const PAGE_SIZE = 20;

type SessionsTab = "handover" | "preShipments";
type StatusFilter = "ALL" | HandoverSessionStatusFilter;

const TAB_DIRECTION: Record<SessionsTab, HandoverDirection> = {
  handover: "INBOUND_DELIVERY",
  preShipments: "OUTBOUND_PICKUP",
};

const SCAN_RESULT_I18N: Record<string, string> = {
  MATCH: "sessionsScanResultMatch",
  UNKNOWN_TIRE: "sessionsScanResultUnknownTire",
  NOT_IN_MANIFEST: "sessionsScanResultNotInManifest",
  DUPLICATE: "sessionsScanResultDuplicate",
  DISMISSED: "sessionsScanResultDismissed",
};

function scanResultLabel(result: string | null, t: (key: string) => string): string {
  if (!result) return "—";
  const key = SCAN_RESULT_I18N[result.toUpperCase()];
  if (key) return t(key);
  return formatScanResultLabel(result);
}

function statusBadgeClass(status: string): string {
  switch (status.toUpperCase()) {
    case "OPEN":
      return "border-0 bg-emerald-600 text-white shadow-none";
    case "CLOSED":
      return "border-0 bg-gray-500 text-white shadow-none";
    case "CANCELLED":
      return "border-0 bg-destructive text-destructive-foreground shadow-none";
    default:
      return "border-0 bg-muted text-muted-foreground shadow-none";
  }
}

function statusLabel(status: string, t: (key: string) => string): string {
  switch (status.toUpperCase()) {
    case "OPEN":
      return t("sessionsStatusOpen");
    case "CLOSED":
      return t("sessionsStatusClosed");
    case "CANCELLED":
      return t("sessionsStatusCancelled");
    default:
      return status;
  }
}

function seasonLabel(season: string, t: (key: string) => string): string {
  const s = season.toUpperCase();
  if (s === "WINTER") return t("sessionsSeasonWinter");
  if (s === "SUMMER") return t("sessionsSeasonSummer");
  return season || "—";
}

export function SessionsPage() {
  const t = useTranslations("dashboard");
  const ts = useTranslations("staff");
  const locale = useLocale();

  const [tab, setTab] = useState<SessionsTab>("handover");
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [closeConfirmSession, setCloseConfirmSession] = useState<HandoverSessionRow | null>(null);
  const [closingSessionId, setClosingSessionId] = useState<number | null>(null);

  const closeHandoverSession = useCloseHandoverSession();
  const { isViewOnly } = useViewOnlyMode();

  const direction = TAB_DIRECTION[tab];

  const listQuery = useMemo(
    () => ({
      direction,
      page,
      size: PAGE_SIZE,
      sortBy: "openedAt" as const,
      sort: "desc" as const,
      status: statusFilter === "ALL" ? undefined : statusFilter,
      dateFrom: dateFrom.trim() || undefined,
      dateTo: dateTo.trim() || undefined,
      locale,
    }),
    [direction, page, statusFilter, dateFrom, dateTo, locale],
  );

  const { data, isLoading, isError, error, refetch, isFetching } =
    useDealerHandoverSessions(listQuery);

  const rows = useMemo(() => data?.rows ?? [], [data?.rows]);
  const meta = data?.meta;
  const loading = isLoading || (isFetching && !data);
  const totalPages = meta?.totalPages ?? 0;

  const expandedIdsSorted = useMemo(
    () => [...expandedIds].sort((a, b) => a - b),
    [expandedIds],
  );

  const stateQueries = useQueries({
    queries: expandedIdsSorted.map((sessionId) => ({
      queryKey: dealerHandoverSessionStateQueryKey(sessionId),
      queryFn: () => getDealerHandoverSessionState(sessionId),
      enabled: expandedIds.has(sessionId),
      staleTime: 15_000,
      refetchInterval: (query: { state: { data?: NormalizedHandoverSessionState } }) =>
        query.state.data?.status === "OPEN" ? 8_000 : false,
    })),
  });

  const stateQueryById = useMemo(() => {
    const m = new Map<number, (typeof stateQueries)[number]>();
    expandedIdsSorted.forEach((id, idx) => {
      const q = stateQueries[idx];
      if (q) m.set(id, q);
    });
    return m;
  }, [expandedIdsSorted, stateQueries]);

  function onTabChange(value: string) {
    setTab(value as SessionsTab);
    setPage(0);
    setExpandedIds(new Set());
  }

  function onStatusChange(value: string) {
    setStatusFilter(value as StatusFilter);
    setPage(0);
  }

  function onDateFromChange(value: string) {
    setDateFrom(value);
    setPage(0);
  }

  function onDateToChange(value: string) {
    setDateTo(value);
    setPage(0);
  }

  function toggleExpanded(id: number) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function onCloseSessionRequest(row: HandoverSessionRow) {
    if (isViewOnly) return;
    setCloseConfirmSession(row);
  }

  async function onCloseSessionConfirm() {
    const session = closeConfirmSession;
    if (!session || closingSessionId !== null) return;

    setClosingSessionId(session.id);
    const toastId = toast.loading(t("handoverClosing"));

    try {
      const active = rows.find((r) => r.id === session.id) ?? session;
      if (active.version == null) {
        toast.error(t("handoverCloseMissingVersionTitle"), {
          id: toastId,
          description: t("handoverCloseMissingVersionDescription"),
          duration: 10_000,
        });
        return;
      }
      await closeHandoverSession.mutateAsync({
        sessionId: active.id,
        version: active.version,
      });
      toast.success(t("handoverCloseSuccess"), { id: toastId });
      setCloseConfirmSession(null);
      setExpandedIds((prev) => {
        const next = new Set(prev);
        next.delete(session.id);
        return next;
      });
    } catch (err: unknown) {
      if (isHandoverCloseConflictError(err)) {
        const apiMessage = apiErrorMessageFromUnknown(err);
        toast.error(apiMessage ?? t("handoverCloseError"), {
          id: toastId,
          duration: 10_000,
        });
        return;
      }
      const message = apiErrorMessageFromUnknown(err) ?? t("handoverCloseError");
      toast.error(message, { id: toastId });
    } finally {
      setClosingSessionId(null);
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-5">
      <div>
        <h1 className="text-headline-sm font-bold text-foreground">{t("sessionsTitle")}</h1>
        <p className="mt-1 text-body-md text-subtle">{t("sessionsIntro")}</p>
      </div>

      <Tabs value={tab} onValueChange={onTabChange} className="flex min-h-0 flex-1 flex-col gap-5">
        <div className="border-b border-border">
          <TabsList
            className={cn(
              "h-auto w-full justify-start gap-0 rounded-none bg-transparent p-0",
              "-mb-px text-body-md text-muted-foreground",
            )}
          >
            <TabsTrigger
              value="handover"
              className={cn(
                "relative z-10 h-11 flex-1 gap-2 rounded-none border-0 border-b-2 border-transparent px-4 py-0",
                "bg-transparent shadow-none",
                "text-muted-foreground hover:text-foreground",
                "data-[state=active]:border-b-primary-dark data-[state=active]:bg-transparent",
                "data-[state=active]:text-primary-dark data-[state=active]:shadow-none",
                "dark:data-[state=active]:border-b-primary dark:data-[state=active]:text-primary",
                "sm:flex-none sm:min-w-[10.5rem]",
              )}
            >
              <PackageCheck className="size-4 shrink-0 opacity-80" aria-hidden />
              <span className="truncate font-semibold">{t("sessionsTabHandover")}</span>
            </TabsTrigger>
            <TabsTrigger
              value="preShipments"
              className={cn(
                "relative z-10 h-11 flex-1 gap-2 rounded-none border-0 border-b-2 border-transparent px-4 py-0",
                "bg-transparent shadow-none",
                "text-muted-foreground hover:text-foreground",
                "data-[state=active]:border-b-primary-dark data-[state=active]:bg-transparent",
                "data-[state=active]:text-primary-dark data-[state=active]:shadow-none",
                "dark:data-[state=active]:border-b-primary dark:data-[state=active]:text-primary",
                "sm:flex-none sm:min-w-[10.5rem]",
              )}
            >
              <ArrowUpFromLine className="size-4 shrink-0 opacity-80" aria-hidden />
              <span className="truncate font-semibold">{t("sessionsTabPreShipments")}</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <span className="text-label-sm font-medium text-muted-foreground sm:me-1">
              {t("sessionsFilterStatusLabel")}
            </span>
            <Select value={statusFilter} onValueChange={onStatusChange}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{t("sessionsFilterAllStatus")}</SelectItem>
                <SelectItem value="OPEN">{t("sessionsStatusOpen")}</SelectItem>
                <SelectItem value="CLOSED">{t("sessionsStatusClosed")}</SelectItem>
                <SelectItem value="CANCELLED">{t("sessionsStatusCancelled")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <span className="text-label-sm font-medium text-muted-foreground sm:me-1">
              {t("sessionsFilterDateFrom")}
            </span>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => onDateFromChange(e.target.value)}
              className="w-full sm:w-[160px]"
              aria-label={t("sessionsFilterDateFrom")}
            />
          </div>

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <span className="text-label-sm font-medium text-muted-foreground sm:me-1">
              {t("sessionsFilterDateTo")}
            </span>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => onDateToChange(e.target.value)}
              className="w-full sm:w-[160px]"
              aria-label={t("sessionsFilterDateTo")}
            />
          </div>

          <p className="w-full text-end text-body-md text-muted-foreground sm:ms-auto sm:w-auto">
            {t("sessionsShowingCount", { count: meta?.totalElements ?? rows.length })}
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

        <HandoverSessionsTable
          rows={rows}
          loading={loading}
          expandedIds={expandedIds}
          stateQueryById={stateQueryById}
          onToggleExpanded={toggleExpanded}
          onCloseSession={onCloseSessionRequest}
          closeBusy={closeHandoverSession.isPending}
          closingSessionId={closingSessionId}
          isViewOnly={isViewOnly}
          emptyText={t("sessionsEmpty")}
          locale={locale}
          t={t}
        />
      </Tabs>

      <Dialog
        open={closeConfirmSession != null}
        onOpenChange={(open) => {
          if (!open && !closeHandoverSession.isPending) setCloseConfirmSession(null);
        }}
      >
        <ConfirmDialogContent>
          <div className="space-y-2 text-start">
            <DialogTitle className="text-lg font-semibold leading-tight text-foreground">
              {t("handoverCloseConfirmTitle")}
            </DialogTitle>
            <DialogDescription className="text-body-sm leading-relaxed text-muted-foreground">
              {t("sessionsCloseConfirmDescription", {
                sessionId: closeConfirmSession?.id ?? "",
              })}
            </DialogDescription>
          </div>
          <DialogFooter className="mt-6 flex-col-reverse gap-2 sm:flex-row sm:justify-end [&>button]:w-full sm:[&>button]:w-auto">
            <Button
              type="button"
              variant="outline"
              className={DIALOG_FOOTER_BUTTON_CLASS}
              disabled={closeHandoverSession.isPending}
              onClick={() => setCloseConfirmSession(null)}
            >
              {t("handoverCloseCancel")}
            </Button>
            <Button
              type="button"
              disabled={closeHandoverSession.isPending}
              onClick={() => void onCloseSessionConfirm()}
              className={cn(
                DIALOG_FOOTER_BUTTON_CLASS,
                "border-0 bg-[#7c3aed] font-semibold text-white hover:bg-[#6d28d9] dark:bg-violet-500 dark:hover:bg-violet-600",
              )}
            >
              {closeHandoverSession.isPending ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  {t("handoverClosing")}
                </span>
              ) : (
                t("actionCloseHandover")
              )}
            </Button>
          </DialogFooter>
        </ConfirmDialogContent>
      </Dialog>

      {meta != null && totalPages > 0 ? (
        <PaginationControls
          canPrevious={page > 0 && !loading}
          canNext={!meta.last && page < totalPages - 1 && !loading}
          previousLabel={ts("paginationPrev")}
          nextLabel={ts("paginationNext")}
          pageLabel={ts("pageInfo", { current: page + 1, total: totalPages })}
          pageText={ts("pageCompact", { current: page + 1, total: totalPages })}
          onPrevious={() => setPage((p) => Math.max(0, p - 1))}
          onNext={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
        />
      ) : null}
    </div>
  );
}

type StateQuery = UseQueryResult<NormalizedHandoverSessionState | undefined, Error>;

function HandoverSessionsTable({
  rows,
  loading,
  expandedIds,
  stateQueryById,
  onToggleExpanded,
  onCloseSession,
  closeBusy,
  closingSessionId,
  isViewOnly,
  emptyText,
  locale,
  t,
}: {
  rows: HandoverSessionRow[];
  loading: boolean;
  expandedIds: Set<number>;
  stateQueryById: Map<number, StateQuery>;
  onToggleExpanded: (id: number) => void;
  onCloseSession: (row: HandoverSessionRow) => void;
  closeBusy: boolean;
  closingSessionId: number | null;
  isViewOnly: boolean;
  emptyText: string;
  locale: string;
  t: (key: string, values?: Record<string, string | number | Date>) => string;
}) {
  return (
    <StyledTable
      isLoading={loading}
      rows={rows}
      keyProp={(r) => r.id}
      emptyText={emptyText}
      detailRow={{
        isExpanded: (row) => expandedIds.has(row.id),
        render: (row) => {
          const stateQuery = stateQueryById.get(row.id);
          return (
            <SessionDetailPanel
              row={row}
              state={stateQuery?.data}
              isPending={Boolean(stateQuery?.isPending || stateQuery?.isFetching) && !stateQuery?.data}
              isError={Boolean(stateQuery?.isError)}
              errorMessage={
                stateQuery?.error instanceof Error ? stateQuery.error.message : undefined
              }
              onRetry={() => void stateQuery?.refetch()}
              locale={locale}
              t={t}
            />
          );
        },
      }}
      columns={[
        {
          header: t("sessionsColId"),
          align: "left",
          className: "min-w-[120px]",
          render: (row) => (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 shrink-0"
                aria-expanded={expandedIds.has(row.id)}
                aria-label={t("sessionsToggleDetails")}
                onClick={() => onToggleExpanded(row.id)}
              >
                {expandedIds.has(row.id) ? (
                  <ChevronDown className="size-4" />
                ) : (
                  <ChevronRight className="size-4" />
                )}
              </Button>
              <span className="font-mono text-sm font-semibold">#{row.id}</span>
            </div>
          ),
        },
        {
          header: t("sessionsColOpenedBy"),
          align: "left",
          className: "min-w-[140px]",
          render: (row) => <span className="font-medium">{row.openedByName}</span>,
        },
        {
          header: t("sessionsColOpenedAt"),
          className: "min-w-[150px]",
          render: (row) => row.openedAtLabel,
        },
        {
          header: t("sessionsColClosedAt"),
          className: "min-w-[150px]",
          render: (row) => row.closedAtLabel,
        },
        {
          header: t("sessionsFilterStatusLabel"),
          render: (row) => {
            const liveStatus = stateQueryById.get(row.id)?.data?.status;
            const status = liveStatus ?? row.status;
            return (
              <Badge className={cn("px-3 py-1 text-label-sm font-semibold", statusBadgeClass(status))}>
                {statusLabel(status, t)}
              </Badge>
            );
          },
        },
        {
          header: t("sessionsColProgress"),
          render: (row) => {
            const state = stateQueryById.get(row.id)?.data;
            const matched = state?.matched ?? row.matched;
            const total = state?.total ?? row.total;
            return (
              <span className="font-mono text-sm">
                {matched}/{total}
              </span>
            );
          },
        },
        {
          header: t("sessionsColDiscrepancies"),
          render: (row) => {
            const discrepancies = stateQueryById.get(row.id)?.data?.discrepancies ?? row.discrepancies;
            return (
              <span
                className={cn(
                  "font-mono text-sm font-medium",
                  discrepancies > 0 ? "text-destructive" : "text-foreground",
                )}
              >
                {discrepancies}
              </span>
            );
          },
        },
        {
          header: t("sessionsColTireSets"),
          align: "left",
          className: "min-w-[160px]",
          render: (row) => {
            const first = row.tireSets[0];
            return (
              <div>
                <p className="font-medium text-foreground">
                  {t("sessionsTireSetsCount", { count: row.tireSets.length })}
                </p>
                {first ? (
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {first.customerDisplayName}
                    {first.plate && first.plate !== "—" ? ` · ${first.plate}` : ""}
                  </p>
                ) : null}
              </div>
            );
          },
        },
        {
          header: t("sessionsColActions"),
          align: "center",
          className: "min-w-[140px] whitespace-nowrap",
          render: (row) => {
            const liveStatus = stateQueryById.get(row.id)?.data?.status;
            const status = (liveStatus ?? row.status).toUpperCase();
            if (status !== "OPEN") return <span className="text-muted-foreground">—</span>;

            const isClosing = closeBusy && closingSessionId === row.id;
            return (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={
                  isViewOnly ||
                  row.version == null ||
                  (closeBusy && closingSessionId !== row.id) ||
                  isClosing
                }
                className="h-8 px-3 font-medium text-violet-700 hover:bg-violet-50 hover:text-violet-800 dark:text-violet-300 dark:hover:bg-violet-950/40"
                onClick={() => onCloseSession(row)}
              >
                {isClosing ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Loader2 className="size-3.5 animate-spin" aria-hidden />
                    {t("handoverClosing")}
                  </span>
                ) : (
                  t("actionCloseHandover")
                )}
              </Button>
            );
          },
        },
      ]}
    />
  );
}

function SessionDetailPanel({
  row,
  state,
  isPending,
  isError,
  errorMessage,
  onRetry,
  locale,
  t,
}: {
  row: HandoverSessionRow;
  state?: NormalizedHandoverSessionState;
  isPending: boolean;
  isError: boolean;
  errorMessage?: string;
  onRetry: () => void;
  locale: string;
  t: (key: string, values?: Record<string, string | number | Date>) => string;
}) {
  const matched = state?.matched ?? row.matched;
  const total = state?.total ?? row.total;
  const discrepancies = state?.discrepancies ?? row.discrepancies;
  const status = state?.status ?? row.status;
  const newScans = state?.newScans ?? [];

  return (
    <div className={cn("mx-2 mb-2 space-y-5 p-4", TABLE_DETAIL_BOX)}>
      <div>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            {t("sessionsLiveState")}
          </p>
          {isPending ? (
            <span className="inline-flex items-center gap-1.5 text-label-sm text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" aria-hidden />
              {t("sessionsStateLoading")}
            </span>
          ) : null}
        </div>

        {isError ? (
          <ErrorAlert
            message={errorMessage ?? t("sessionsStateError")}
            onRetry={onRetry}
            retryLabel={t("sessionsRetry")}
          />
        ) : isPending && !state ? (
          <div className="grid gap-3 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-md" />
            ))}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-3">
            <StatTile
              icon={CheckCircle2}
              label={t("sessionsColProgress")}
              value={`${matched}/${total}`}
              accent="success"
            />
            <StatTile
              icon={AlertTriangle}
              label={t("sessionsColDiscrepancies")}
              value={discrepancies}
              accent={discrepancies > 0 ? "error" : "none"}
            />
            <StatTile
              icon={PackageCheck}
              label={t("sessionsFilterStatusLabel")}
              value={statusLabel(status, t)}
              accent={status.toUpperCase() === "OPEN" ? "primary" : "none"}
            />
          </div>
        )}
      </div>

      <div>
        <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          {t("sessionsNewScans")}
        </p>
        {isPending && !state ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-10 w-3/4 rounded-md" />
          </div>
        ) : newScans.length === 0 ? (
          <p className="text-body-sm text-muted-foreground">{t("sessionsNoNewScans")}</p>
        ) : (
          <ul className="space-y-2">
            {newScans.map((scan) => (
              <li
                key={scan.id}
                className="flex items-start gap-3 rounded-md border border-border/60 bg-muted/20 px-3 py-2.5"
              >
                <ScanLine className="mt-0.5 size-4 shrink-0 text-primary-dark dark:text-primary" aria-hidden />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="min-w-0 truncate font-mono text-sm font-medium text-foreground">
                      {scan.label}
                    </p>
                    {scan.result ? (
                      <Badge
                        className={cn(
                          "shrink-0 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
                          scanResultBadgeClass(scan.result),
                        )}
                      >
                        {scanResultLabel(scan.result, t)}
                      </Badge>
                    ) : null}
                  </div>
                  {scan.detail ? (
                    <p className="mt-0.5 truncate text-label-sm text-muted-foreground">{scan.detail}</p>
                  ) : null}
                  {scan.scannedAt ? (
                    <p className="mt-0.5 text-label-sm text-muted-foreground">
                      {formatLocaleDateTime(scan.scannedAt, locale)}
                    </p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          {t("sessionsTireSetsDetail")}
        </p>
        {row.tireSets.length === 0 ? (
          <p className="text-body-sm text-muted-foreground">{t("sessionsNoTireSets")}</p>
        ) : (
          <div className="space-y-3">
            {row.tireSets.map((ts, idx) => (
              <div
                key={`${ts.tireSetId ?? "ts"}-${idx}`}
                className="grid gap-2 rounded-md border border-border/60 bg-muted/20 p-3 sm:grid-cols-2 lg:grid-cols-3"
              >
                <div>
                  <p className="text-label-sm text-muted-foreground">{t("sessionsTireSet")}</p>
                  <p className="font-medium text-foreground">{ts.tireSetLabel}</p>
                </div>
                <div>
                  <p className="text-label-sm text-muted-foreground">{t("sessionsCustomer")}</p>
                  <p className="font-medium text-foreground">{ts.customerDisplayName}</p>
                </div>
                <div>
                  <p className="text-label-sm text-muted-foreground">{t("sessionsVehicle")}</p>
                  <p className="font-medium text-foreground">
                    {[ts.vehicleLabel, ts.plate].filter((p) => p && p !== "—").join(" — ") || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-label-sm text-muted-foreground">{t("sessionsSeason")}</p>
                  <p className="font-medium text-foreground">{seasonLabel(ts.seasonType, t)}</p>
                </div>
                <div>
                  <p className="text-label-sm text-muted-foreground">{t("sessionsScanProgress")}</p>
                  <p className="font-medium text-foreground">
                    {ts.scanned}/{ts.total}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
