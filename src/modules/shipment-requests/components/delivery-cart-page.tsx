"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  AlertTriangle,
  Loader2,
  Pencil,
  Plus,
  Search,
  Send,
  X,
} from "lucide-react";
import { ErrorAlert } from "@/components/ui/error-alert";
import { Skeleton } from "@/components/ui/skeleton";
import { AddDeliveryItemModal } from "@/modules/shipment-requests/components/add-delivery-item-modal";
import { EditAppointmentModal } from "@/modules/shipment-requests/components/edit-appointment-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import {
  ConfirmDialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/app-dialog";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDealerShipmentRequestsPaged } from "@/modules/shipment-requests/hooks/use-dealer-shipment-requests-paged";
import { useCancelShipmentRequest } from "@/modules/shipment-requests/hooks/use-cancel-shipment-request";
import {
  useSubmitAllShipmentRequests,
  useSubmitShipmentRequest,
} from "@/modules/shipment-requests/hooks/use-submit-shipment-request";
import { SUBMIT_SHIPMENT_REQUEST_VERSION_FALLBACK } from "@/modules/shipment-requests/services/dealer-shipment-request-submit.service";
import type { DealerShipmentRequestsPagedQuery } from "@/modules/shipment-requests/services/dealer-shipment-requests-paged.service";
import type { NormalizedDeliveryOrderRow } from "@/modules/shipment-requests/lib/shipment-request-dto";
import { useClientNowMs } from "@/shared/hooks/use-client-now-ms";
import { useViewOnlyMode } from "@/modules/dealer/hooks/use-view-only-mode";
import { cn } from "@/lib/utils";
import { formatLocaleDate } from "@/lib/format-locale";
import { PRIMARY_BUTTON_PILL_CLASS } from "@/lib/primary-button-styles";

/* ─────────────────────────── Window status ─────────────────────────── */

type WindowStatus = "ok" | "approaching" | "expired";

function getWindowStatus(
  appointmentDate: Date | null,
  nowMs: number | null,
): WindowStatus | null {
  if (nowMs == null) return null;
  if (!appointmentDate) return "ok";
  const diffMs = appointmentDate.getTime() - nowMs;
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  if (diffDays < 0) return "expired";
  if (diffDays < 2) return "expired";
  if (diffDays < 7) return "approaching";
  return "ok";
}

function WindowBadge({
  status,
  tc,
}: {
  status: WindowStatus | null;
  tc: (k: string) => string;
}) {
  if (status == null) {
    return (
      <Badge className="whitespace-nowrap border-0 bg-muted px-3 py-1 text-label-sm font-semibold text-muted-foreground shadow-none">
        …
      </Badge>
    );
  }

  const cfg: Record<WindowStatus, { label: string; cls: string }> = {
    ok: {
      label: tc("windowOk"),
      cls: "border-0 bg-emerald-600 text-white shadow-none",
    },
    approaching: {
      label: tc("windowApproaching"),
      cls: "border-0 bg-amber-500 text-white shadow-none",
    },
    expired: {
      label: tc("windowExpired"),
      cls: "border-0 bg-destructive text-destructive-foreground shadow-none",
    },
  };
  const { label, cls } = cfg[status];
  return (
    <Badge className={cn("whitespace-nowrap px-3 py-1 text-label-sm font-semibold", cls)}>
      {label}
    </Badge>
  );
}

/* ─────────────────────────── Footer counts ─────────────────────────── */

function buildCounts(rows: NormalizedDeliveryOrderRow[], nowMs: number | null) {
  let ready = 0;
  let blocked = 0;
  let approaching = 0;
  for (const r of rows) {
    const ws = getWindowStatus(r.appointmentDate, nowMs);
    if (ws === "ok") ready += 1;
    else if (ws === "expired") blocked += 1;
    else if (ws === "approaching") approaching += 1;
  }
  return { ready, blocked, approaching, total: rows.length };
}

/* ─────────────────────────── Main component ─────────────────────────── */

export type DeliveryCartPageProps = {
  baseQuery: Omit<DealerShipmentRequestsPagedQuery, "page">;
};

type WindowFilter = "all" | WindowStatus;

export function DeliveryCartPage({ baseQuery }: DeliveryCartPageProps) {
  const tc = useTranslations("deliveryCart");
  const ts = useTranslations("staff");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const [page, setPage] = useState(0);
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [submitAllOpen, setSubmitAllOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<NormalizedDeliveryOrderRow | null>(null);
  const [editTarget, setEditTarget] = useState<NormalizedDeliveryOrderRow | null>(null);
  const [submittingRowId, setSubmittingRowId] = useState<number | null>(null);
  const [cancellingRowId, setCancellingRowId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [windowFilter, setWindowFilter] = useState<WindowFilter>("all");
  const nowMs = useClientNowMs();
  const { isViewOnly } = useViewOnlyMode();

  const submitMutation = useSubmitShipmentRequest();
  const submitAllMutation = useSubmitAllShipmentRequests();
  const cancelMutation = useCancelShipmentRequest();
  const rowActionPending =
    isViewOnly ||
    submitMutation.isPending ||
    submitAllMutation.isPending ||
    cancelMutation.isPending;

  const listQuery = useMemo<DealerShipmentRequestsPagedQuery>(
    () => ({ ...baseQuery, page, size: baseQuery.size ?? 20, sortBy: baseQuery.sortBy ?? "createdAt" }),
    [baseQuery, page],
  );

  const { data, isPending, isError, refetch, isFetching } = useDealerShipmentRequestsPaged(listQuery);
  const rows = useMemo(() => data?.rows ?? [], [data?.rows]);
  const meta = data?.meta;

  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return rows.filter((row) => {
      if (windowFilter !== "all") {
        const ws = getWindowStatus(row.appointmentDate, nowMs);
        // Until the client clock is ready, skip window filtering to keep SSR/hydrate stable.
        if (ws != null && ws !== windowFilter) return false;
      }
      if (!q) return true;
      const tireSetLabel =
        row.sets.length > 0
          ? row.sets[0].label
          : row.setCount > 0
            ? `${row.setCount} set(s)`
            : "";
      const hay = [
        row.primaryCustomerName,
        ...row.customerNames,
        row.vehicleLabel,
        row.vehiclePlate,
        tireSetLabel,
        row.notes,
        row.address,
        formatLocaleDate(row.appointmentDate, locale),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [rows, searchQuery, windowFilter, locale, nowMs]);

  const counts = useMemo(() => buildCounts(filteredRows, nowMs), [filteredRows, nowMs]);
  const loading = isPending || (isFetching && !data);

  const borderColor =
    "border-[var(--color-surface-light-container)] dark:border-[var(--color-surface-container-high)]";

  function onAddItem() {
    if (isViewOnly) return;
    setAddItemOpen(true);
  }

  function resolveRowVersion(row: NormalizedDeliveryOrderRow): number {
    return row.version ?? SUBMIT_SHIPMENT_REQUEST_VERSION_FALLBACK;
  }

  function canSubmitRow(row: NormalizedDeliveryOrderRow): boolean {
    const ws = getWindowStatus(row.appointmentDate, nowMs);
    return ws === "ok" || ws === "approaching";
  }

  function onSubmitRow(row: NormalizedDeliveryOrderRow) {
    if (!canSubmitRow(row)) {
      toast.error(tc("submitWindowBlocked"));
      return;
    }

    setSubmittingRowId(row.id);
    submitMutation.mutate(
      { id: row.id, version: resolveRowVersion(row) },
      {
        onSuccess: () => {
          toast.success(tc("submitSuccess"));
          setSubmittingRowId(null);
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : tc("submitError"));
          setSubmittingRowId(null);
        },
      },
    );
  }

  function onCancelConfirm() {
    if (!cancelTarget) return;
    setCancellingRowId(cancelTarget.id);
    cancelMutation.mutate(
      { id: cancelTarget.id, version: resolveRowVersion(cancelTarget) },
      {
        onSuccess: () => {
          toast.success(tc("cancelSuccess"));
          setCancelTarget(null);
          setCancellingRowId(null);
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : tc("cancelError"));
          setCancellingRowId(null);
        },
      },
    );
  }

  function onSubmitAllConfirm() {
    submitAllMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success(tc("submitAllSuccess"));
        setSubmitAllOpen(false);
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : tc("submitAllError"));
      },
    });
  }

  return (
    <div className="flex flex-col gap-4">

      {/* ── Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-headline-sm font-bold text-foreground">{tc("title")}</h1>
          <p className="mt-1 text-body-md text-subtle">{tc("intro")}</p>
        </div>
        <Button
          type="button"
          variant="brand"
          onClick={onAddItem}
          disabled={isViewOnly}
          className="w-full shrink-0 gap-2 sm:w-auto"
        >
          <Plus className="size-4 shrink-0" />
          <span className="truncate">{tc("addItem")}</span>
        </Button>
      </div>

      {/* ── Time-window warning banner ── */}
      <div className="flex gap-3 rounded-lg border border-amber-400/60 bg-amber-50 px-4 py-3 dark:border-amber-500/40 dark:bg-amber-950/30">
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-500" aria-hidden />
        <p className="text-body-sm text-amber-900 dark:text-amber-200">
          <span className="font-bold">{tc("warningTitle")} </span>
          {tc("warningBody")}
        </p>
      </div>

      {/* ── Error state ── */}
      {isError ? (
        <ErrorAlert
          message={tc("errorLoading")}
          onRetry={() => void refetch()}
          retryLabel={tc("retry")}
          className="shrink-0"
        />
      ) : null}

      <div className="flex shrink-0 flex-col gap-3 py-1 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="relative min-w-0 flex-1 sm:min-w-[220px]">
          <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder={tc("searchPlaceholder")}
            className="w-full ps-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label={tc("searchPlaceholder")}
          />
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <span className="text-label-sm font-medium text-muted-foreground sm:me-1">
            {tc("filterWindowLabel")}
          </span>
          <Select value={windowFilter} onValueChange={(v) => setWindowFilter(v as WindowFilter)}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{tc("filterAllWindows")}</SelectItem>
              <SelectItem value="ok">{tc("filterWindowOk")}</SelectItem>
              <SelectItem value="approaching">{tc("filterWindowApproaching")}</SelectItem>
              <SelectItem value="expired">{tc("filterWindowExpired")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <p className="w-full text-end text-body-md text-muted-foreground sm:ms-auto sm:w-auto">
          {tc("showingCount", { count: filteredRows.length })}
        </p>
      </div>

      {/* ── Table ── */}
      <div
        className={cn(
          "w-full overflow-x-auto rounded-lg border-2 bg-card",
          borderColor,
          loading && "opacity-70",
        )}
      >
        <table className="w-full border-separate border-spacing-0 caption-bottom text-sm">
          {/* Head */}
          <thead>
            <tr
              className={cn(
                "bg-[var(--color-surface-light-container)] dark:bg-[var(--color-surface-container-high)]",
              )}
            >
              {[
                tc("colCustomer"),
                tc("colTireSet"),
                tc("colApptDate"),
                tc("colNotes"),
                tc("colStatus"),
                tc("colActions"),
              ].map((h, i) => (
                <th
                  key={i}
                  className={cn(
                    "border-b-2 px-4 py-3 text-body-sm font-semibold tracking-wide text-foreground",
                    borderColor,
                    i === 0 ? "text-left" : "text-center",
                  )}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {loading && rows.length === 0 ? (
              <>
                {Array.from({ length: 6 }).map((_, i) => {
                  const cellCls = cn(
                    "px-4 py-3.5 align-middle",
                    i < 5 ? `border-b-2 ${borderColor}` : "",
                  );
                  return (
                    <tr key={i} className="transition-colors">
                      <td className={cn(cellCls, "text-left min-w-[170px]")}>
                        <Skeleton className="mb-1.5 h-4 w-[75%]" />
                        <Skeleton className="h-3 w-[55%]" />
                      </td>
                      <td className={cn(cellCls, "text-center")}><Skeleton className="mx-auto h-4 w-[60%]" /></td>
                      <td className={cn(cellCls, "text-center")}><Skeleton className="mx-auto h-4 w-[55%]" /></td>
                      <td className={cn(cellCls, "text-center")}><Skeleton className="mx-auto h-4 w-[40%]" /></td>
                      <td className={cn(cellCls, "text-center")}><Skeleton className="mx-auto h-6 w-20 rounded-full" /></td>
                      <td className={cn(cellCls, "text-center")}>
                        <Skeleton className="mx-auto h-8 w-24 rounded-full" />
                      </td>
                    </tr>
                  );
                })}
              </>
            ) : filteredRows.length === 0 ? (
              <tr>
                <td colSpan={6} className="h-32 text-center text-body-md text-muted-foreground">
                  {tc("empty")}
                </td>
              </tr>
            ) : (
              filteredRows.map((row, idx) => {
                const isLast = idx === filteredRows.length - 1;
                const ws = getWindowStatus(row.appointmentDate, nowMs);

                /* vehicle subtitle: "Toyota Camry — ABC-1234" */
                const vehicleSubtitle = [row.vehicleLabel, row.vehiclePlate]
                  .filter(Boolean)
                  .join(" — ");

                /* tire set: first set label, fallback count */
                const tireSetLabel =
                  row.sets.length > 0
                    ? row.sets[0].label
                    : row.setCount > 0
                    ? `${row.setCount} set(s)`
                    : "—";

                const cellBase = cn(
                  "px-4 py-3 align-middle text-foreground",
                  !isLast && `border-b-2 ${borderColor}`,
                );

                return (
                  <tr
                    key={row.id}
                    className="transition-colors hover:bg-[var(--color-surface-light)] dark:hover:bg-[var(--color-surface-bright)]/10"
                  >
                    {/* Customer */}
                    <td className={cn(cellBase, "text-left min-w-[170px]")}>
                      <p className="font-semibold text-foreground leading-snug">
                        {row.primaryCustomerName}
                      </p>
                      {vehicleSubtitle ? (
                        <p className="mt-0.5 text-xs text-muted-foreground">{vehicleSubtitle}</p>
                      ) : null}
                    </td>

                    {/* Tire set */}
                    <td className={cn(cellBase, "text-center whitespace-nowrap")}>
                      {tireSetLabel}
                    </td>

                    {/* Appointment date */}
                    <td className={cn(cellBase, "text-center whitespace-nowrap font-medium")}>
                      {formatLocaleDate(row.appointmentDate, locale)}
                    </td>

                    {/* Notes */}
                    <td className={cn(cellBase, "text-center italic text-muted-foreground max-w-[160px]")}>
                      {row.notes || "—"}
                    </td>

                    {/* Window status */}
                    <td className={cn(cellBase, "text-center")}>
                      <WindowBadge status={ws} tc={tc} />
                    </td>

                    {/* Actions */}
                    <td className={cn(cellBase, "text-center")}>
                      <div className="inline-flex flex-wrap items-center justify-center gap-2">
                        <Button
                          type="button"
                          size="sm"
                          disabled={rowActionPending}
                          onClick={() => setEditTarget(row)}
                          className="h-8 gap-1.5 rounded-full border border-border/70 bg-transparent px-3.5 text-label-sm font-medium text-foreground shadow-none transition-all duration-200 hover:border-border hover:bg-muted/50"
                        >
                          <Pencil className="size-3.5 shrink-0 opacity-80" aria-hidden />
                          {tc("editRow")}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          disabled={
                            !canSubmitRow(row) ||
                            rowActionPending ||
                            (submitMutation.isPending && submittingRowId === row.id)
                          }
                          onClick={() => onSubmitRow(row)}
                          title={!canSubmitRow(row) ? tc("submitWindowBlocked") : undefined}
                          className={cn(
                            "h-8 gap-1.5 rounded-full px-3.5 text-label-sm font-medium shadow-none transition-all duration-200",
                            canSubmitRow(row)
                              ? "border border-primary-dark/25 bg-primary-dark/10 text-primary-dark hover:border-primary-dark/40 hover:bg-primary-dark/15 dark:border-primary/30 dark:bg-primary/10 dark:text-primary dark:hover:bg-primary/15"
                              : "border border-border/60 bg-muted/40 text-muted-foreground",
                          )}
                        >
                          {submitMutation.isPending && submittingRowId === row.id ? (
                            <>
                              <Loader2 className="size-3.5 animate-spin" aria-hidden />
                              {tc("submittingRow")}
                            </>
                          ) : (
                            <>
                              <Send className="size-3.5 shrink-0 opacity-80" aria-hidden />
                              {tc("submitRow")}
                            </>
                          )}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          disabled={
                            rowActionPending ||
                            (cancelMutation.isPending && cancellingRowId === row.id)
                          }
                          onClick={() => setCancelTarget(row)}
                          className="h-8 gap-1.5 rounded-full border border-[var(--color-error-main)]/40 bg-transparent px-3.5 text-label-sm font-medium text-[var(--color-error-main)] shadow-none transition-all duration-200 hover:border-[var(--color-error-main)] hover:bg-[var(--color-error-main)] hover:text-white"
                        >
                          {cancelMutation.isPending && cancellingRowId === row.id ? (
                            <>
                              <Loader2 className="size-3.5 animate-spin" aria-hidden />
                              {tc("cancellingRow")}
                            </>
                          ) : (
                            <>
                              <X className="size-3.5 shrink-0 opacity-80" aria-hidden />
                              {tc("cancelRow")}
                            </>
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>

          {/* Footer */}
          {!loading && filteredRows.length > 0 ? (
            <tfoot className={cn("border-t-2 bg-[var(--color-surface-light-container)]/80 dark:bg-[var(--color-surface-container-high)]/40 font-medium", borderColor)}>
              <tr>
                <td colSpan={6} className="px-4 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    {/* Counts */}
                    <div className="flex flex-wrap items-center gap-0 divide-x divide-border/70 text-body-sm">
                      <span className="pe-3 font-semibold text-foreground">
                        {tc("footerTotal", { count: counts.total })}
                      </span>
                      <span className="px-3 font-medium text-emerald-600 dark:text-emerald-400">
                        {tc("footerReady", { count: counts.ready })}
                      </span>
                      <span className="px-3 font-medium text-destructive">
                        {tc("footerBlocked", { count: counts.blocked })}
                      </span>
                      <span className="ps-3 font-medium text-amber-500">
                        {tc("footerApproaching", { count: counts.approaching })}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <Button
                        type="button"
                        disabled={counts.ready === 0 || rowActionPending || isViewOnly}
                        onClick={() => setSubmitAllOpen(true)}
                        className="gap-2 rounded-full border border-primary-dark/25 bg-primary-dark/10 px-4 font-medium text-primary-dark shadow-none transition-all duration-200 hover:border-primary-dark/40 hover:bg-primary-dark/15 dark:border-primary/30 dark:bg-primary/10 dark:text-primary dark:hover:bg-primary/15"
                      >
                        {submitAllMutation.isPending ? (
                          <span className="inline-flex items-center gap-2">
                            <Loader2 className="size-4 animate-spin" aria-hidden />
                            {tc("submittingAll")}
                          </span>
                        ) : (
                          <>
                            <Send className="size-4 shrink-0 opacity-80" aria-hidden />
                            {tc("submitAll")}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </td>
              </tr>
            </tfoot>
          ) : null}
        </table>
      </div>

      {/* ── Pagination ── */}
      {meta && (meta.totalPages ?? 1) > 1 ? (
        <PaginationControls
          canPrevious={(meta.page ?? 0) > 0}
          canNext={!Boolean(meta.last)}
          previousLabel={ts("paginationPrev")}
          nextLabel={ts("paginationNext")}
          pageLabel={ts("pageInfo", { current: (meta.page ?? 0) + 1, total: meta.totalPages ?? 1 })}
          pageText={ts("pageCompact", { current: (meta.page ?? 0) + 1, total: meta.totalPages ?? 1 })}
          onPrevious={() => setPage((p) => Math.max(0, p - 1))}
          onNext={() => setPage((p) => p + 1)}
          className="mt-1"
        />
      ) : null}

      {/* ── Add Delivery Item Modal ── */}
      <AddDeliveryItemModal
        open={addItemOpen}
        onOpenChange={setAddItemOpen}
        onCreated={() => void refetch()}
      />

      <EditAppointmentModal
        open={editTarget != null}
        onOpenChange={(open) => {
          if (!open) setEditTarget(null);
        }}
        row={editTarget}
      />

      <Dialog open={submitAllOpen} onOpenChange={setSubmitAllOpen}>
        <ConfirmDialogContent>
          <div className="space-y-2 text-start">
            <DialogTitle className="text-lg font-semibold leading-tight text-foreground">
              {tc("submitAllConfirmTitle")}
            </DialogTitle>
            <DialogDescription className="text-body-sm leading-relaxed text-muted-foreground">
              {tc("submitAllConfirmDescription", { count: counts.ready })}
            </DialogDescription>
          </div>
          <DialogFooter className="mt-6 flex-col-reverse gap-2 sm:flex-row sm:justify-end [&>button]:w-full sm:[&>button]:w-auto">
            <Button type="button" variant="outline" onClick={() => setSubmitAllOpen(false)}>
              {tc("submitAllCancel")}
            </Button>
            <Button
              type="button"
              variant="brand"
              disabled={submitAllMutation.isPending}
              onClick={onSubmitAllConfirm}
              className={PRIMARY_BUTTON_PILL_CLASS}
            >
              {submitAllMutation.isPending ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  {tc("submittingAll")}
                </span>
              ) : (
                tc("submitAllConfirm")
              )}
            </Button>
          </DialogFooter>
        </ConfirmDialogContent>
      </Dialog>

      <Dialog
        open={cancelTarget != null}
        onOpenChange={(open) => !open && !cancelMutation.isPending && setCancelTarget(null)}
      >
        <ConfirmDialogContent>
          <div className="space-y-2 text-start">
            <DialogTitle className="text-lg font-semibold leading-tight text-foreground">
              {tc("cancelConfirmTitle")}
            </DialogTitle>
            <DialogDescription className="text-body-sm leading-relaxed text-muted-foreground">
              {tc("cancelConfirmDescription")}
            </DialogDescription>
          </div>
          <DialogFooter className="mt-6 flex-col-reverse gap-2 sm:flex-row sm:justify-end [&>button]:w-full sm:[&>button]:w-auto">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCancelTarget(null)}
              disabled={cancelMutation.isPending}
            >
              {tCommon("cancel")}
            </Button>
            <Button
              type="button"
              className="border-0 bg-[var(--color-error-main)] font-semibold text-white shadow-none hover:bg-[var(--color-error-main)]/90"
              disabled={cancelMutation.isPending}
              onClick={onCancelConfirm}
            >
              {cancelMutation.isPending ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  {tc("cancellingRow")}
                </span>
              ) : (
                tc("cancelConfirm")
              )}
            </Button>
          </DialogFooter>
        </ConfirmDialogContent>
      </Dialog>
    </div>
  );
}
