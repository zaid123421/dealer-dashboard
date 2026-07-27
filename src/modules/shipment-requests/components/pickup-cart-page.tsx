"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { ArrowRight, Loader2, Plus, Search, Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import type { NormalizedDeliveryOrderRow } from "@/modules/shipment-requests/lib/shipment-request-dto";
import { useDealerShipmentRequestsPaged } from "@/modules/shipment-requests/hooks/use-dealer-shipment-requests-paged";
import type { DealerShipmentRequestsPagedQuery } from "@/modules/shipment-requests/services/dealer-shipment-requests-paged.service";
import { AddPickupItemModal } from "@/modules/shipment-requests/components/add-pickup-item-modal";
import {
  submitDealerShipmentRequest,
  SUBMIT_SHIPMENT_REQUEST_VERSION_FALLBACK,
} from "@/modules/shipment-requests/services/dealer-shipment-request-submit.service";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ErrorAlert } from "@/components/ui/error-alert";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { Dialog } from "@/components/ui/dialog";
import {
  ConfirmDialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/app-dialog";
import { cn } from "@/lib/utils";
import { PRIMARY_BUTTON_PILL_CLASS } from "@/lib/primary-button-styles";
import { useViewOnlyMode } from "@/modules/dealer/hooks/use-view-only-mode";

/** Dividers that match panel surfaces — never light/white outlines. */
const PANEL_DIVIDER =
  "border-[var(--color-surface-light-container)] dark:border-[var(--color-surface-container-high)]";

type CartCustomerGroup = {
  name: string;
  rows: NormalizedDeliveryOrderRow[];
  setsStored: number;
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "—";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase();
}

function formatSetLabel(row: NormalizedDeliveryOrderRow): string {
  if (row.sets?.[0]?.label) return row.sets[0]!.label;
  if (row.setCount > 0) return `${row.setCount} set(s)`;
  return "—";
}

function formatVehicleLine(row: NormalizedDeliveryOrderRow): string {
  const v = [row.vehicleLabel, row.vehiclePlate].filter(Boolean).join(" — ");
  return v.trim() || "—";
}

export type PickupCartPageProps = {
  baseQuery: Omit<DealerShipmentRequestsPagedQuery, "page">;
};

export function PickupCartPage({ baseQuery }: PickupCartPageProps) {
  const td = useTranslations("deliveryOrders");
  const t = useTranslations("dashboard");
  const tc = useTranslations("pickupCart");
  // keep locale for future date formatting or API display
  useLocale();
  const queryClient = useQueryClient();
  const { isViewOnly } = useViewOnlyMode();

  const [page, setPage] = useState(0);
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [activeCustomer, setActiveCustomer] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [createOpen, setCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittingId, setSubmittingId] = useState<number | null>(null);

  const listQuery = useMemo<DealerShipmentRequestsPagedQuery>(
    () => ({
      ...baseQuery,
      page,
      size: baseQuery.size ?? 50,
      sortBy: baseQuery.sortBy ?? "createdAt",
    }),
    [baseQuery, page],
  );

  const { data, isPending, isError, error, refetch, isFetching } =
    useDealerShipmentRequestsPaged(listQuery);

  const allRows = useMemo(() => data?.rows ?? [], [data?.rows]);
  const meta = data?.meta;

  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return allRows;
    return allRows.filter((r) => {
      const hay = [
        r.primaryCustomerName,
        ...r.customerNames,
        r.vehiclePlate,
        r.vehicleLabel,
        ...(r.sets ?? []).map((s) => s.label),
        r.orderLabel,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [allRows, searchQuery]);

  const customerGroups = useMemo<CartCustomerGroup[]>(() => {
    const map = new Map<string, CartCustomerGroup>();
    for (const r of filteredRows) {
      const name = r.primaryCustomerName || "—";
      const existing = map.get(name);
      if (existing) {
        existing.rows.push(r);
        existing.setsStored += r.setCount ?? (r.sets?.length ?? 0);
      } else {
        map.set(name, {
          name,
          rows: [r],
          setsStored: r.setCount ?? (r.sets?.length ?? 0),
        });
      }
    }
    return Array.from(map.values()).sort((a, b) => b.setsStored - a.setsStored);
  }, [filteredRows]);

  const activeCustomerEffective = useMemo(() => {
    if (activeCustomer && customerGroups.some((g) => g.name === activeCustomer)) {
      return activeCustomer;
    }
    return customerGroups[0]?.name ?? null;
  }, [activeCustomer, customerGroups]);

  const activeRows = useMemo(() => {
    if (!activeCustomerEffective) return [];
    return filteredRows.filter((r) => r.primaryCustomerName === activeCustomerEffective);
  }, [activeCustomerEffective, filteredRows]);

  const selectedRows = useMemo(
    () => allRows.filter((r) => selectedIds.has(r.id)),
    [allRows, selectedIds],
  );

  const selectedSetsCount = useMemo(
    () =>
      selectedRows.reduce(
        (sum, r) => sum + (r.setCount ?? r.sets?.length ?? 0),
        0,
      ),
    [selectedRows],
  );

  const selectedByCustomer = useMemo(() => {
    const map = new Map<string, NormalizedDeliveryOrderRow[]>();
    for (const r of selectedRows) {
      const key = r.primaryCustomerName || "—";
      const list = map.get(key) ?? [];
      list.push(r);
      map.set(key, list);
    }
    return Array.from(map.entries()).sort((a, b) => b[1].length - a[1].length);
  }, [selectedRows]);

  const loading = isPending || (isFetching && !data);

  function toggleSelected(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function submitSelected() {
    if (selectedRows.length === 0) return;
    setSubmitting(true);

    const successes: number[] = [];
    const failures: { id: number; message: string }[] = [];

    for (const row of selectedRows) {
      setSubmittingId(row.id);
      try {
        await submitDealerShipmentRequest({
          id: row.id,
          version: row.version ?? SUBMIT_SHIPMENT_REQUEST_VERSION_FALLBACK,
        });
        successes.push(row.id);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : tc("submitErrorFallback");
        failures.push({ id: row.id, message });
      }
    }

    setSubmittingId(null);

    // Invalidate & refresh to reflect the backend state.
    await queryClient.invalidateQueries({
      queryKey: ["dealer", "shipment-requests-paged"],
    });
    await queryClient.invalidateQueries({ queryKey: ["dealer", "cart"] });
    await refetch();

    if (failures.length === 0) {
      toast.success(tc("submitAllSuccess", { count: successes.length }));
      setSelectedIds(new Set());
      setCreateOpen(false);
    } else {
      toast.error(
        tc("submitAllPartialError", {
          success: successes.length,
          count: failures.length,
        }),
      );
      // Keep failures selected for easier retry; remove successes.
      const failedIds = new Set(failures.map((f) => f.id));
      setSelectedIds(failedIds);
    }
    setSubmitting(false);
  }

  const selection = useMemo(() => {
    return {
      customers: selectedByCustomer.length,
      requests: selectedRows.length,
      sets: selectedSetsCount,
    };
  }, [selectedByCustomer.length, selectedRows.length, selectedSetsCount]);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      {/* ── Page header ── */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-headline-sm font-bold text-foreground">
            {t("pickupCartTitle")}
          </h1>
          <p className="mt-1 text-body-md text-subtle">{t("pickupCartIntro")}</p>
        </div>
        <Button
          type="button"
          variant="brand"
          disabled={isViewOnly}
          onClick={() => setAddItemOpen(true)}
          className="w-full shrink-0 gap-2 sm:w-auto"
        >
          <Plus className="size-4 shrink-0" />
          <span className="truncate">{tc("addItem")}</span>
        </Button>
      </div>

      {isError ? (
        <ErrorAlert
          message={error instanceof Error ? error.message : tc("errorLoadingFallback")}
          onRetry={() => void refetch()}
          retryLabel={tc("retry")}
          className="shrink-0"
        />
      ) : null}

      <div className="grid min-h-0 gap-4 lg:grid-cols-[1.65fr_1fr]">
        {/* ── Left panel: Step 1 + Step 2 ── */}
        <div className="min-h-0 overflow-hidden rounded-lg border-0 bg-surface-lightContainer dark:bg-surface-container">
          <div className={cn("border-b px-4 py-4 sm:px-6", PANEL_DIVIDER)}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {tc("step1Title")}
            </p>
            <div className="mt-2 flex items-center gap-3">
              <div className="relative min-w-0 flex-1">
                <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder={tc("searchPlaceholder")}
                  className="w-full border-0 ps-9 shadow-none focus:border-0 focus-visible:border-0 dark:border-0"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="min-h-0 overflow-auto p-4 sm:p-6">
            {loading ? (
              <div className="flex flex-col gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-16 rounded-lg bg-muted/20" aria-hidden />
                ))}
              </div>
            ) : customerGroups.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 rounded-lg border-0 bg-muted/30 px-4 py-10 text-center">
                <div
                  className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground"
                  aria-hidden
                >
                  <Search className="size-6" />
                </div>
                <p className="text-body-md font-semibold text-foreground">{tc("empty")}</p>
                <p className="max-w-xs text-body-sm text-muted-foreground">{tc("emptyHint")}</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {/* Customers list */}
                <div>
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    {tc("step1Customers")}
                  </p>
                  <div className="flex flex-col gap-2">
                    {customerGroups.map((g) => {
                      const selected = g.name === activeCustomerEffective;
                      return (
                        <button
                          key={g.name}
                          type="button"
                          onClick={() => setActiveCustomer(g.name)}
                          className={cn(
                            "flex items-center justify-between gap-3 rounded-lg border bg-surface-lightContainer p-3 text-left transition-colors dark:bg-surface-container",
                            "hover:bg-[var(--color-surface-light)] dark:hover:bg-[var(--color-surface-bright)]/30",
                            selected
                              ? "border-primary-dark/50 bg-primary-dark/10 dark:border-primary/50"
                              : "border-primary-dark/20 dark:border-primary/25",
                          )}
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <div
                              className={cn(
                                "flex size-10 shrink-0 items-center justify-center rounded-full border transition-colors",
                                selected
                                  ? "border-primary-dark/40 bg-primary-dark/10 text-primary-dark dark:border-primary/40"
                                  : "border-primary-dark/20 bg-surface-light text-muted-foreground dark:border-primary/25 dark:bg-surface-bright",
                              )}
                              aria-hidden
                            >
                              <span className="text-body-sm font-bold">{initials(g.name)}</span>
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-body-md font-bold text-foreground">{g.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {tc("setsStored", { count: g.setsStored })}
                              </p>
                            </div>
                          </div>
                          <Plus className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Tire sets selection */}
                <div className="pt-2">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    {tc("step2Title")}
                  </p>

                  <div className="flex flex-col gap-2">
                    {activeRows.map((row) => {
                      const checked = selectedIds.has(row.id);
                      const setLabel = formatSetLabel(row);
                      const vehicleLine = formatVehicleLine(row);
                      return (
                        <button
                          key={row.id}
                          type="button"
                          role="checkbox"
                          aria-checked={checked}
                          onClick={() => toggleSelected(row.id)}
                          className={cn(
                            "group w-full overflow-hidden rounded-lg border bg-surface-lightContainer p-3 text-left transition-all duration-[var(--duration-normal)] dark:bg-surface-container",
                            "hover:bg-[var(--color-surface-light)] dark:hover:bg-[var(--color-surface-bright)]/20",
                            checked
                              ? "border-primary-dark/50 bg-primary-dark/10 dark:border-primary/50"
                              : "border-primary-dark/20 dark:border-primary/25",
                          )}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-body-md font-bold leading-snug text-foreground">
                                {setLabel}
                              </p>
                              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                {vehicleLine}
                              </p>
                              {row.notes ? (
                                <p className="mt-1 line-clamp-1 text-xs italic text-muted-foreground">
                                  {row.notes}
                                </p>
                              ) : null}
                            </div>

                            <div className="flex shrink-0 items-center gap-2">
                              <div
                                className={cn(
                                  "flex size-6 items-center justify-center rounded-full border transition-colors",
                                  checked
                                    ? "border-primary-dark bg-primary-dark text-white dark:border-primary"
                                    : "border-primary-dark/25 bg-surface-light text-transparent group-hover:text-muted-foreground dark:border-primary/30 dark:bg-surface-bright",
                                )}
                                aria-hidden
                              >
                                {checked ? <span className="text-[10px] font-black">✓</span> : <span>•</span>}
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}

                    {activeRows.length === 0 ? (
                      <div className="rounded-lg border-0 bg-muted/30 px-4 py-8 text-center text-body-sm text-muted-foreground">
                        {tc("step2Empty")}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Right panel: cart summary + submit ── */}
        <div className="min-h-0 overflow-hidden rounded-lg border-0 bg-surface-lightContainer dark:bg-surface-container">
          <div className={cn("border-b px-4 py-4 sm:px-6", PANEL_DIVIDER)}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {tc("cartTitle")}
                </p>
                <p className="mt-2 text-body-md font-bold text-foreground">
                  {selection.requests > 0 ? (
                    <>
                      {selection.customers} {tc("customers")}
                      {" | "}
                      {selection.sets} {tc("setsTotal")}
                    </>
                  ) : (
                    tc("cartEmpty")
                  )}
                </p>
              </div>
              <Badge className="border-0 bg-primary-dark/10 text-primary-dark shadow-none">
                {selectedSetsCount}
              </Badge>
            </div>
          </div>

          <div className="min-h-0 overflow-auto p-4 sm:p-6">
            {selectedRows.length === 0 ? (
              <div className="rounded-lg border-0 bg-muted/30 px-4 py-10 text-center">
                <p className="text-body-md font-semibold text-foreground">{tc("cartEmptyHint")}</p>
                <p className="mt-1 text-body-sm text-muted-foreground">{tc("cartEmptyHint2")}</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {selectedByCustomer.map(([customer, list]) => (
                  <div
                    key={customer}
                    className="rounded-lg border-0 bg-surface-light p-3 dark:bg-surface-bright"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div
                          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground"
                          aria-hidden
                        >
                          <span className="text-body-sm font-bold">{initials(customer)}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-body-md font-bold text-foreground">{customer}</p>
                          <p className="text-xs text-muted-foreground">
                            {list.length} {tc("requests")}
                          </p>
                        </div>
                      </div>
                      <Badge className="border-0 bg-primary-dark/10 text-primary-dark shadow-none">
                        {list.reduce((sum, r) => sum + (r.setCount ?? r.sets?.length ?? 0), 0)}
                      </Badge>
                    </div>

                    <div className="mt-3 flex flex-col gap-2">
                      {list.map((row) => (
                        <div
                          key={row.id}
                          className="flex items-center justify-between gap-3 rounded-lg border-0 bg-surface-lightContainer dark:bg-surface-container p-2"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-body-sm font-semibold text-foreground">
                              {formatSetLabel(row)}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">{formatVehicleLine(row)}</p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 shrink-0 rounded-full"
                            onClick={() => toggleSelected(row.id)}
                            aria-label={tc("removeFromCart")}
                            disabled={submitting}
                          >
                            <Trash2 className="size-4" aria-hidden />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={cn("shrink-0 border-t px-4 py-4 sm:px-6", PANEL_DIVIDER)}>
            <Button
              type="button"
              variant="brand"
              className={cn("w-full gap-2", PRIMARY_BUTTON_PILL_CLASS)}
              disabled={isViewOnly || selectedRows.length === 0 || submitting}
              onClick={() => setCreateOpen(true)}
            >
              {submitting ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  {tc("submitting")}
                </span>
              ) : (
                <>
                  <ArrowRight className="size-4 shrink-0 opacity-80" aria-hidden />
                  {tc("createPickupOrder")}
                </>
              )}
            </Button>
            {submittingId != null ? (
              <p className="mt-2 text-xs text-muted-foreground">
                {tc("submittingRow", { id: String(submittingId) })}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {/* ── Pagination ── */}
      {meta && (meta.totalPages ?? 1) > 1 ? (
        <PaginationControls
          canPrevious={(meta.page ?? 0) > 0}
          canNext={!Boolean(meta.last)}
          previousLabel={td("paginationPrev")}
          nextLabel={td("paginationNext")}
          pageLabel={td("pageInfo", {
            current: (meta.page ?? 0) + 1,
            total: meta.totalPages ?? 1,
          })}
          pageText={td("pageCompact", {
            current: (meta.page ?? 0) + 1,
            total: meta.totalPages ?? 1,
          })}
          onPrevious={() => {
            setSelectedIds(new Set());
            setActiveCustomer(null);
            setPage((p) => Math.max(0, p - 1));
          }}
          onNext={() => {
            setSelectedIds(new Set());
            setActiveCustomer(null);
            setPage((p) => p + 1);
          }}
          className="mt-1"
        />
      ) : null}

      <AddPickupItemModal
        open={addItemOpen}
        onOpenChange={setAddItemOpen}
        onCreated={() => void refetch()}
      />

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <ConfirmDialogContent>
          <div className="space-y-2 text-start">
            <DialogTitle className="text-lg font-semibold leading-tight text-foreground">
              {tc("createConfirmTitle", { count: selectedRows.length })}
            </DialogTitle>
            <DialogDescription className="text-body-sm leading-relaxed text-muted-foreground">
              {tc("createConfirmDescription")}
            </DialogDescription>
          </div>
          <DialogFooter className="mt-6 flex-col-reverse gap-2 sm:flex-row sm:justify-end [&>button]:w-full sm:[&>button]:w-auto">
            <Button
              type="button"
              variant="outline"
              className="border-0 bg-transparent text-muted-foreground shadow-none hover:bg-[var(--color-surface-light)] dark:hover:bg-[var(--color-surface-bright)]"
              onClick={() => setCreateOpen(false)}
              disabled={submitting}
            >
              {tc("createCancel")}
            </Button>
            <Button
              type="button"
              variant="brand"
              disabled={submitting}
              onClick={() => void submitSelected()}
              className={PRIMARY_BUTTON_PILL_CLASS}
            >
              {submitting ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  {tc("submitting")}
                </span>
              ) : (
                tc("createConfirm")
              )}
            </Button>
          </DialogFooter>
        </ConfirmDialogContent>
      </Dialog>
    </div>
  );
}

