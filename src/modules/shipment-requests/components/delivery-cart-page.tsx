"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  AlertTriangle,
  Loader2,
  Plus,
  Send,
} from "lucide-react";
import { ErrorAlert } from "@/components/ui/error-alert";
import { Skeleton } from "@/components/ui/skeleton";
import { AddDeliveryItemModal } from "@/modules/shipment-requests/components/add-delivery-item-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { useDealerShipmentRequestsPaged } from "@/modules/shipment-requests/hooks/use-dealer-shipment-requests-paged";
import {
  useSubmitAllShipmentRequests,
  useSubmitShipmentRequest,
} from "@/modules/shipment-requests/hooks/use-submit-shipment-request";
import { SUBMIT_SHIPMENT_REQUEST_VERSION_FALLBACK } from "@/modules/shipment-requests/services/dealer-shipment-request-submit.service";
import type { DealerShipmentRequestsPagedQuery } from "@/modules/shipment-requests/services/dealer-shipment-requests-paged.service";
import type { NormalizedDeliveryOrderRow } from "@/modules/shipment-requests/lib/shipment-request-dto";
import { cn } from "@/lib/utils";
import { DIALOG_SHELL_CLASS } from "@/lib/radius";
import { PRIMARY_BUTTON_PILL_CLASS } from "@/lib/primary-button-styles";

/* ─────────────────────────── Window status ─────────────────────────── */

type WindowStatus = "ok" | "approaching" | "expired";

function getWindowStatus(appointmentDate: Date | null): WindowStatus {
  if (!appointmentDate) return "ok";
  const diffMs = appointmentDate.getTime() - Date.now();
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
  status: WindowStatus;
  tc: (k: string) => string;
}) {
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

function buildCounts(rows: NormalizedDeliveryOrderRow[]) {
  let ready = 0;
  let blocked = 0;
  let approaching = 0;
  for (const r of rows) {
    const ws = getWindowStatus(r.appointmentDate);
    if (ws === "ok") ready += 1;
    else if (ws === "expired") blocked += 1;
    else approaching += 1;
  }
  return { ready, blocked, approaching, total: rows.length };
}

/* ─────────────────────────── Main component ─────────────────────────── */

export type DeliveryCartPageProps = {
  baseQuery: Omit<DealerShipmentRequestsPagedQuery, "page">;
};

export function DeliveryCartPage({ baseQuery }: DeliveryCartPageProps) {
  const tc = useTranslations("deliveryCart");
  const ts = useTranslations("staff");
  const locale = useLocale();
  const [page, setPage] = useState(0);
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [submitAllOpen, setSubmitAllOpen] = useState(false);
  const [submittingRowId, setSubmittingRowId] = useState<number | null>(null);

  const submitMutation = useSubmitShipmentRequest();
  const submitAllMutation = useSubmitAllShipmentRequests();
  const submitPending = submitMutation.isPending || submitAllMutation.isPending;

  const listQuery = useMemo<DealerShipmentRequestsPagedQuery>(
    () => ({ ...baseQuery, page, size: baseQuery.size ?? 20, sortBy: baseQuery.sortBy ?? "createdAt" }),
    [baseQuery, page],
  );

  const { data, isPending, isError, refetch, isFetching } = useDealerShipmentRequestsPaged(listQuery);
  const rows = useMemo(() => data?.rows ?? [], [data?.rows]);
  const meta = data?.meta;

  const counts = useMemo(() => buildCounts(rows), [rows]);
  const loading = isPending || (isFetching && !data);

  const borderColor =
    "border-[var(--color-surface-light-container)] dark:border-[var(--color-surface-container-high)]";

  function formatDate(d: Date | null) {
    if (!d) return "—";
    try {
      return d.toLocaleDateString(locale, { year: "numeric", month: "short", day: "numeric" });
    } catch {
      return "—";
    }
  }

  function onAddItem() {
    setAddItemOpen(true);
  }

  function resolveRowVersion(row: NormalizedDeliveryOrderRow): number {
    return row.version ?? SUBMIT_SHIPMENT_REQUEST_VERSION_FALLBACK;
  }

  function canSubmitRow(row: NormalizedDeliveryOrderRow): boolean {
    return getWindowStatus(row.appointmentDate) !== "expired";
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
                tc("colAddress"),
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
                      <td className={cn(cellCls, "text-center")}><Skeleton className="mx-auto h-4 w-[50%]" /></td>
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
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="h-32 text-center text-body-md text-muted-foreground">
                  {tc("empty")}
                </td>
              </tr>
            ) : (
              rows.map((row, idx) => {
                const isLast = idx === rows.length - 1;
                const ws = getWindowStatus(row.appointmentDate);

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

                    {/* Address */}
                    <td className={cn(cellBase, "text-center text-muted-foreground")}>
                      {row.address || "—"}
                    </td>

                    {/* Appointment date */}
                    <td className={cn(cellBase, "text-center whitespace-nowrap font-medium")}>
                      {formatDate(row.appointmentDate)}
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
                      <Button
                        type="button"
                        size="sm"
                        disabled={
                          !canSubmitRow(row) ||
                          submitPending ||
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
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>

          {/* Footer */}
          {!loading && rows.length > 0 ? (
            <tfoot className={cn("border-t-2 bg-[var(--color-surface-light-container)]/80 dark:bg-[var(--color-surface-container-high)]/40 font-medium", borderColor)}>
              <tr>
                <td colSpan={7} className="px-4 py-3">
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
                        disabled={counts.ready === 0 || submitPending}
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

      <Dialog open={submitAllOpen} onOpenChange={setSubmitAllOpen}>
        <DialogContent className={cn("max-w-md", DIALOG_SHELL_CLASS)}>
          <DialogHeader className="space-y-2 text-start">
            <DialogTitle className="text-lg font-semibold leading-tight text-foreground">
              {tc("submitAllConfirmTitle")}
            </DialogTitle>
            <DialogDescription className="text-body-sm leading-relaxed text-muted-foreground">
              {tc("submitAllConfirmDescription", { count: counts.ready })}
            </DialogDescription>
          </DialogHeader>
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
        </DialogContent>
      </Dialog>
    </div>
  );
}
