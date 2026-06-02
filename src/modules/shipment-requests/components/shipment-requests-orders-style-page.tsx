"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useQueries, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  Loader2,
  MoreVertical,
  Search,
} from "lucide-react";
import { ErrorAlert } from "@/components/ui/error-alert";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PaginationControls } from "@/components/ui/pagination-controls";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import StyledTable from "@/components/ui/styled-table";
import { useDealerShipmentRequestsPaged } from "@/modules/shipment-requests/hooks/use-dealer-shipment-requests-paged";
import type { DealerShipmentRequestsPagedQuery } from "@/modules/shipment-requests/services/dealer-shipment-requests-paged.service";
import type {
  NormalizedDeliveryOrderRow,
  ShipmentUiStatus,
} from "@/modules/shipment-requests/lib/shipment-request-dto";
import type { NormalizedShipmentRequestDetail } from "@/modules/shipment-requests/lib/shipment-request-detail-dto";
import { getDealerShipmentRequestDetail } from "@/modules/shipment-requests/services/dealer-shipment-request-detail.service";
import {
  apiErrorMessageFromUnknown,
  handoverDirectionFromShipmentDirection,
  handoverSessionIdQueryKey,
  isHandoverCloseConflictError,
  prepareCloseHandoverSession,
} from "@/modules/shipment-requests/services/dealer-handover.service";
import { useOpenHandoverSession } from "@/modules/shipment-requests/hooks/use-open-handover-session";
import { useCloseHandoverSession } from "@/modules/shipment-requests/hooks/use-close-handover-session";
import { cn } from "@/lib/utils";
import { TABLE_DETAIL_BOX } from "@/lib/table-border";
import { PRIMARY_BUTTON_CLASS } from "@/lib/primary-button-styles";
import {
  DIALOG_FOOTER_BUTTON_CLASS,
  DIALOG_SHELL_CLASS,
  RADIUS_CONTROL,
  RADIUS_PANEL,
} from "@/lib/radius";

type StatusFilter = "all" | ShipmentUiStatus | "other";
type DateFilter = "all" | "today" | "week" | "month";

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function matchesDateFilter(date: Date | null, filter: DateFilter): boolean {
  if (filter === "all") return true;
  if (!date) return false;
  const now = new Date();
  const d0 = startOfDay(date);
  const n0 = startOfDay(now);
  if (filter === "today") return d0.getTime() === n0.getTime();
  if (filter === "week") {
    const day = n0.getDay();
    const ws = new Date(n0);
    ws.setDate(n0.getDate() - day);
    const we = new Date(ws);
    we.setDate(ws.getDate() + 7);
    return d0 >= ws && d0 < we;
  }
  if (filter === "month") {
    return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
  }
  return true;
}

function matchesStatusFilter(uiStatus: ShipmentUiStatus, filter: StatusFilter): boolean {
  if (filter === "all") return true;
  if (filter === "other") {
    return uiStatus === "cancelled" || uiStatus === "in_progress" || uiStatus === "in_cart";
  }
  return uiStatus === filter;
}

function statusBadgeClass(uiStatus: ShipmentUiStatus): string {
  switch (uiStatus) {
    case "confirmed":
      return "border-0 bg-info-main text-white shadow-none";
    case "handover":
      return "border-0 bg-tertiary-dark text-tertiary-onContainer shadow-none";
    case "completed":
      return "border-0 bg-success-dark text-success-onContainer shadow-none";
    case "cancelled":
      return "border-0 bg-gray-600 text-white shadow-none";
    case "in_cart":
      return "border-0 bg-info-main text-white shadow-none";
    default:
      return "border-0 bg-warning-dark/90 text-warning-onContainer shadow-none";
  }
}

function primaryActionButtonClass(uiStatus: ShipmentUiStatus): string {
  const base =
    "h-9 shrink-0 border-0 font-medium text-white shadow-none transition-colors duration-[var(--duration-normal)] hover:text-white [&_svg]:text-white";
  switch (uiStatus) {
    case "confirmed":
      return cn(
        base,
        "bg-[#2563eb] hover:bg-[#1d4ed8] dark:bg-blue-400 dark:hover:bg-blue-500",
      );
    case "handover":
      return cn(
        base,
        "bg-[#7c3aed] hover:bg-[#6d28d9] dark:bg-violet-400 dark:hover:bg-violet-500",
      );
    case "completed":
      return cn(
        base,
        "bg-[#16a34a] hover:bg-[#15803d] dark:bg-green-400 dark:hover:bg-green-500",
      );
    case "cancelled":
      return cn(base, "bg-gray-600 hover:bg-gray-700 dark:bg-gray-600 dark:hover:bg-gray-700");
    case "in_cart":
      return cn(
        base,
        "bg-[#2563eb] hover:bg-[#1d4ed8] dark:bg-blue-400 dark:hover:bg-blue-500",
      );
    default:
      return cn(base, "bg-slate-600 hover:bg-slate-700 dark:bg-slate-500 dark:hover:bg-slate-600");
  }
}

function actionIconButtonClass(uiStatus: ShipmentUiStatus): string {
  const base =
    `h-9 w-9 shrink-0 ${RADIUS_CONTROL} border-0 text-white shadow-none transition-colors duration-[var(--duration-normal)] hover:text-white [&_svg]:text-white`;
  switch (uiStatus) {
    case "confirmed":
      return cn(
        base,
        "bg-[#2563eb] hover:bg-[#1d4ed8] dark:bg-blue-400 dark:hover:bg-blue-500",
      );
    case "handover":
      return cn(
        base,
        "bg-[#7c3aed] hover:bg-[#6d28d9] dark:bg-violet-400 dark:hover:bg-violet-500",
      );
    case "completed":
      return cn(
        base,
        "bg-[#16a34a] hover:bg-[#15803d] dark:bg-green-400 dark:hover:bg-green-500",
      );
    case "cancelled":
      return cn(base, "bg-gray-600 hover:bg-gray-700 dark:bg-gray-600 dark:hover:bg-gray-700");
    case "in_cart":
      return cn(
        base,
        "bg-[#2563eb] hover:bg-[#1d4ed8] dark:bg-blue-400 dark:hover:bg-blue-500",
      );
    default:
      return cn(base, "bg-slate-600 hover:bg-slate-700 dark:bg-slate-500 dark:hover:bg-slate-600");
  }
}

function primaryActionSoftClass(uiStatus: "confirmed" | "handover"): string {
  const base =
    "h-8 shrink-0 rounded-full px-3.5 text-label-sm font-medium shadow-none transition-all duration-200";
  if (uiStatus === "handover") {
    return cn(
      base,
      "border border-violet-500/25 bg-violet-500/10 text-violet-700 hover:border-violet-500/40 hover:bg-violet-500/15 dark:border-violet-400/30 dark:bg-violet-400/10 dark:text-violet-300 dark:hover:bg-violet-400/15",
    );
  }
  return cn(
    base,
    "border border-primary-dark/25 bg-primary-dark/10 text-primary-dark hover:border-primary-dark/40 hover:bg-primary-dark/15 dark:border-primary/30 dark:bg-primary/10 dark:text-primary dark:hover:bg-primary/15",
  );
}

const bulkCheckboxClass =
  "size-4 rounded border-primary-dark/30 accent-[var(--color-primary-main-light)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-dark/25 dark:accent-[var(--color-primary-main-dark)] dark:border-primary/30";

const bulkBarSoftClass =
  "border border-primary-dark/25 bg-primary-dark/10 dark:border-primary/30 dark:bg-primary/10";

const bulkClearSoftClass =
  "rounded-full border border-primary-dark/20 bg-transparent text-muted-foreground shadow-none hover:border-primary-dark/35 hover:bg-primary-dark/10 hover:text-primary-dark dark:border-primary/25 dark:hover:bg-primary/10 dark:hover:text-primary";

export type ShipmentRequestsOrdersStylePageProps = {
  title: string;
  intro: string;
  baseQuery: Omit<DealerShipmentRequestsPagedQuery, "page">;
  emptyText?: string;
  /** Load GET /v1/dealer/shipment-requests/:id when a row expands (delivery / pickup carts). */
  loadShipmentDetailsOnExpand?: boolean;
  /** e.g. "+ Add item" for pickup cart */
  headerActions?: ReactNode;
  /** Show row checkboxes + bulk "Convert to Handover" for confirmed orders. */
  enableBulkHandover?: boolean;
  /** Softer row actions (hide ⋮ menu, pill expand) — used on pickup cart. */
  actionsVariant?: "default" | "soft";
};

export function ShipmentRequestsOrdersStylePage({
  title,
  intro,
  baseQuery,
  emptyText,
  loadShipmentDetailsOnExpand = false,
  headerActions,
  enableBulkHandover = false,
  actionsVariant = "default",
}: ShipmentRequestsOrdersStylePageProps) {
  const td = useTranslations("deliveryOrders");
  const ts = useTranslations("staff");
  const locale = useLocale();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [page, setPage] = useState(0);
  const [actionOrderId, setActionOrderId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkHandoverOpen, setBulkHandoverOpen] = useState(false);
  const [closeConfirmOrder, setCloseConfirmOrder] = useState<NormalizedDeliveryOrderRow | null>(
    null,
  );

  const openHandoverSession = useOpenHandoverSession();
  const closeHandoverSession = useCloseHandoverSession();

  const baseKey = useMemo(
    () =>
      JSON.stringify([
        baseQuery.statuses,
        baseQuery.direction,
        baseQuery.size ?? 20,
        baseQuery.sortBy ?? "createdAt",
      ]),
    [baseQuery.statuses, baseQuery.direction, baseQuery.size, baseQuery.sortBy],
  );

  useEffect(() => {
    setPage(0);
    setSelectedIds(new Set());
  }, [baseKey]);

  useEffect(() => {
    setSelectedIds(new Set());
  }, [page]);

  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedSearch(searchQuery.trim().toLowerCase()), 280);
    return () => window.clearTimeout(id);
  }, [searchQuery]);

  const listQuery = useMemo<DealerShipmentRequestsPagedQuery>(
    () => ({
      ...baseQuery,
      page,
      size: baseQuery.size ?? 20,
      sortBy: baseQuery.sortBy ?? "createdAt",
    }),
    [baseQuery, page],
  );

  const { data, isPending, isError, error, refetch, isFetching } = useDealerShipmentRequestsPaged(listQuery);
  const deliveryRows = useMemo(() => data?.rows ?? [], [data?.rows]);

  const expandedDetailIdsSorted = useMemo(() => {
    if (!loadShipmentDetailsOnExpand) return [];
    return [...expandedIds].sort((a, b) => a - b);
  }, [expandedIds, loadShipmentDetailsOnExpand]);

  const shipmentDetailQueries = useQueries({
    queries: expandedDetailIdsSorted.map((requestId) => ({
      queryKey: ["shipment-requests", "detail", requestId] as const,
      queryFn: () => getDealerShipmentRequestDetail(requestId),
      enabled: loadShipmentDetailsOnExpand && expandedIds.has(requestId),
      staleTime: 60_000,
    })),
  });

  const shipmentDetailQueryById = useMemo(() => {
    const m = new Map<number, (typeof shipmentDetailQueries)[number]>();
    expandedDetailIdsSorted.forEach((id, idx) => {
      const q = shipmentDetailQueries[idx];
      if (q) m.set(id, q);
    });
    return m;
  }, [expandedDetailIdsSorted, shipmentDetailQueries]);

  function subtitleFromDetail(d: NormalizedShipmentRequestDetail): string {
    const parts = [d.customerDisplayName, d.vehicleLabel, d.vehiclePlate].filter(
      (p) => typeof p === "string" && p.trim() !== "" && p !== "—",
    );
    return parts.join(" — ");
  }

  const filtered = useMemo(() => {
    let rows = deliveryRows;
    rows = rows.filter((r) => matchesStatusFilter(r.uiStatus, statusFilter));
    rows = rows.filter((r) => matchesDateFilter(r.appointmentDate, dateFilter));
    if (debouncedSearch) {
      rows = rows.filter((r) => {
        const hay = [
          r.orderLabel.toLowerCase(),
          String(r.id),
          ...r.customerNames.map((c) => c.toLowerCase()),
        ].join(" ");
        return hay.includes(debouncedSearch);
      });
    }
    return rows;
  }, [deliveryRows, statusFilter, dateFilter, debouncedSearch]);

  const selectableConfirmedRows = useMemo(
    () => filtered.filter((r) => r.uiStatus === "confirmed"),
    [filtered],
  );

  const selectedOrders = useMemo(
    () => filtered.filter((r) => selectedIds.has(r.id)),
    [filtered, selectedIds],
  );

  const allSelectableSelected =
    selectableConfirmedRows.length > 0 &&
    selectableConfirmedRows.every((r) => selectedIds.has(r.id));

  const someSelectableSelected =
    selectableConfirmedRows.some((r) => selectedIds.has(r.id)) && !allSelectableSelected;

  const handoverBusy = actionOrderId !== null || openHandoverSession.isPending;

  const handoverModalOpenConfirmClass = cn(
    DIALOG_FOOTER_BUTTON_CLASS,
    actionsVariant === "soft"
      ? cn(PRIMARY_BUTTON_CLASS, "font-medium shadow-none")
      : "border-0 bg-[#2563eb] font-semibold text-white hover:bg-[#1d4ed8] dark:bg-blue-500 dark:hover:bg-blue-600",
  );

  const handoverModalCloseConfirmClass = cn(
    DIALOG_FOOTER_BUTTON_CLASS,
    "border-0 font-medium text-white shadow-none",
    actionsVariant === "soft"
      ? "bg-violet-600/90 hover:bg-violet-600 dark:bg-violet-500 dark:hover:bg-violet-400"
      : "bg-[#7c3aed] font-semibold hover:bg-[#6d28d9] dark:bg-violet-500 dark:hover:bg-violet-600",
  );

  const footerCounts = useMemo(() => {
    let confirmed = 0;
    let handover = 0;
    let completed = 0;
    for (const r of filtered) {
      if (r.uiStatus === "confirmed") confirmed += 1;
      else if (r.uiStatus === "handover") handover += 1;
      else if (r.uiStatus === "completed") completed += 1;
    }
    return { confirmed, handover, completed, total: filtered.length };
  }, [filtered]);

  const meta = data?.meta;
  const borderColor =
    "border-[var(--color-surface-light-container)] dark:border-[var(--color-surface-container-high)]";

  function toggleExpanded(id: number) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function formatAppointment(d: Date | null): string {
    if (!d) return td("noAppointment");
    try {
      return d.toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric" });
    } catch {
      return td("noAppointment");
    }
  }

  function statusLabel(uiStatus: ShipmentUiStatus): string {
    switch (uiStatus) {
      case "confirmed":
        return td("statusConfirmed");
      case "handover":
        return td("statusHandover");
      case "completed":
        return td("statusCompleted");
      case "cancelled":
        return td("statusBadgeCancelled");
      case "in_cart":
        return td("statusInCart");
      default:
        return td("statusBadgeInProgress");
    }
  }

  function workflowMiniBadge(key: "confirmed" | "handover" | "completed") {
    switch (key) {
      case "confirmed":
        return td("workflowConfirmed");
      case "handover":
        return td("workflowHandover");
      case "completed":
        return td("workflowCompleted");
    }
  }

  function hasWorkflowPrimaryAction(
    uiStatus: ShipmentUiStatus,
  ): uiStatus is "confirmed" | "handover" {
    return uiStatus === "confirmed" || uiStatus === "handover";
  }

  function primaryActionLabel(uiStatus: "confirmed" | "handover"): string {
    return uiStatus === "confirmed" ? td("actionConvertHandover") : td("actionCloseHandover");
  }

  function toggleSelected(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAllConfirmed() {
    if (allSelectableSelected) {
      setSelectedIds(new Set());
      return;
    }
    setSelectedIds(new Set(selectableConfirmedRows.map((r) => r.id)));
  }

  async function onOpenHandover(orders: NormalizedDeliveryOrderRow[]) {
    if (handoverBusy || orders.length === 0) return;

    const directions = new Set(
      orders.map((o) => handoverDirectionFromShipmentDirection(o.direction)),
    );
    if (directions.size > 1) {
      toast.error(td("handoverBulkMixedDirection"));
      return;
    }

    const markerId = orders.length === 1 ? orders[0].id : -1;
    setActionOrderId(markerId);
    const toastId = toast.loading(td("handoverOpening"));

    try {
      await openHandoverSession.mutateAsync({
        direction: handoverDirectionFromShipmentDirection(orders[0].direction),
        shipmentRequestIds: orders.map((o) => o.id),
      });
      toast.success(
        orders.length === 1
          ? td("handoverOpenSuccess")
          : td("handoverBulkOpenSuccess", { count: orders.length }),
        { id: toastId },
      );
      setSelectedIds(new Set());
      setBulkHandoverOpen(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : td("handoverOpenError");
      toast.error(message || td("handoverOpenError"), { id: toastId });
    } finally {
      setActionOrderId(null);
    }
  }

  function onPrimaryAction(order: NormalizedDeliveryOrderRow) {
    if (order.uiStatus === "confirmed") {
      void onOpenHandover([order]);
      return;
    }
    if (order.uiStatus === "handover") {
      setCloseConfirmOrder(order);
    }
  }

  async function onCloseHandoverConfirm() {
    const order = closeConfirmOrder;
    if (!order || actionOrderId !== null) return;

    setActionOrderId(order.id);
    const toastId = toast.loading(td("handoverClosing"));

    try {
      let active = deliveryRows.find((r) => r.id === order.id) ?? order;
      if (
        active.uiStatus === "handover" &&
        (active.handoverSessionId == null || active.version == null)
      ) {
        const refreshed = await refetch();
        active = refreshed.data?.rows.find((r) => r.id === order.id) ?? active;
      }

      const cachedSessionId = queryClient.getQueryData<number>(
        handoverSessionIdQueryKey(active.id),
      );
      const prepared = await prepareCloseHandoverSession({
        id: active.id,
        version: active.version,
        handoverSessionId: active.handoverSessionId ?? cachedSessionId,
      });
      if (!prepared.ok) {
        if (prepared.reason === "missing_version") {
          toast.error(td("handoverCloseMissingVersionTitle"), {
            id: toastId,
            description: td("handoverCloseMissingVersionDescription"),
            duration: 10000,
          });
        } else {
          toast.error(td("handoverCloseMissingSessionTitle"), {
            id: toastId,
            description: td("handoverCloseMissingSessionDescription"),
            duration: 10000,
          });
        }
        return;
      }

      await closeHandoverSession.mutateAsync(prepared.payload);
      toast.success(td("handoverCloseSuccess"), { id: toastId });
      setCloseConfirmOrder(null);
    } catch (err: unknown) {
      if (isHandoverCloseConflictError(err)) {
        const apiMessage = apiErrorMessageFromUnknown(err);
        toast.error(apiMessage ?? td("handoverCloseError"), {
          id: toastId,
          duration: 10000,
        });
        return;
      }
      const message = apiErrorMessageFromUnknown(err) ?? td("handoverCloseError");
      toast.error(message, { id: toastId });
    } finally {
      setActionOrderId(null);
    }
  }

  async function copyOrderId(label: string) {
    try {
      await navigator.clipboard.writeText(label);
      toast.success(td("copied"));
    } catch {
      toast.error(td("actionSoon"));
    }
  }

  const loading = isPending || (isFetching && !data);
  const empty = emptyText ?? td("empty");

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      {/* ── Page header ── */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-headline-sm font-bold text-foreground">{title}</h1>
          <p className="mt-1 text-body-md text-subtle">{intro}</p>
        </div>
        {headerActions}
      </div>

      {/* ── Workflow pipeline card ── */}
      <div
        className={cn(
          `flex flex-wrap items-center justify-center gap-4 ${RADIUS_PANEL} border-2 px-6 py-4`,
          "bg-[var(--color-surface-container,hsl(var(--card)))] dark:bg-[var(--color-surface-container-high,hsl(var(--card)))]",
          borderColor,
        )}
      >
        <Badge
          className="border-0 px-4 py-1.5 text-label-sm font-semibold shadow-none bg-[#1e40af] dark:bg-blue-600 text-white rounded-lg"
        >
          {workflowMiniBadge("confirmed")}
        </Badge>
        <ArrowRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        <Badge
          className="border-0 px-4 py-1.5 text-label-sm font-semibold shadow-none bg-[#6d28d9] dark:bg-violet-600 text-white rounded-lg"
        >
          {workflowMiniBadge("handover")}
        </Badge>
        <ArrowRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        <Badge
          className="border-0 px-4 py-1.5 text-label-sm font-semibold shadow-none bg-[#15803d] dark:bg-green-600 text-white rounded-lg"
        >
          {workflowMiniBadge("completed")}
        </Badge>
      </div>

      <div className="flex shrink-0 flex-col gap-3 py-2 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="relative min-w-0 flex-1 sm:min-w-[220px]">
          <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder={td("searchPlaceholder")}
            className="h-10 w-full ps-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label={td("searchPlaceholder")}
          />
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <span className="text-label-sm font-medium text-muted-foreground sm:me-1">{td("statusLabel")}</span>
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as StatusFilter)}
          >
            <SelectTrigger className="h-10 w-full sm:w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{td("statusAll")}</SelectItem>
              <SelectItem value="confirmed">{td("statusConfirmed")}</SelectItem>
              <SelectItem value="handover">{td("statusHandover")}</SelectItem>
              <SelectItem value="completed">{td("statusCompleted")}</SelectItem>
              <SelectItem value="in_cart">{td("statusInCart")}</SelectItem>
              <SelectItem value="other">{td("statusOther")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <span className="text-label-sm font-medium text-muted-foreground sm:me-1">{td("dateLabel")}</span>
          <Select value={dateFilter} onValueChange={(v) => setDateFilter(v as DateFilter)}>
            <SelectTrigger className="h-10 w-full sm:w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{td("dateAll")}</SelectItem>
              <SelectItem value="today">{td("dateToday")}</SelectItem>
              <SelectItem value="week">{td("dateThisWeek")}</SelectItem>
              <SelectItem value="month">{td("dateThisMonth")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <p className="w-full text-end text-body-md text-muted-foreground sm:ms-auto sm:w-auto">
          {td("showingCount", { count: filtered.length })}
        </p>
      </div>

      {enableBulkHandover && selectedIds.size > 0 ? (
        <div
          className={cn(
            `flex flex-wrap items-center justify-between gap-3 ${RADIUS_PANEL} px-4 py-3`,
            actionsVariant === "soft"
              ? bulkBarSoftClass
              : "border-2 border-[#2563eb]/40 bg-[#2563eb]/5 dark:border-blue-500/40 dark:bg-blue-500/10",
          )}
        >
          <span className="text-body-sm font-medium text-foreground">
            {td("bulkSelectedCount", { count: selectedIds.size })}
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant={actionsVariant === "soft" ? "ghost" : "outline"}
              size="sm"
              disabled={handoverBusy}
              onClick={() => setSelectedIds(new Set())}
              className={actionsVariant === "soft" ? bulkClearSoftClass : undefined}
            >
              {td("bulkClearSelection")}
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={handoverBusy || selectedOrders.length === 0}
              className={
                actionsVariant === "soft"
                  ? "rounded-full border border-primary-dark/25 bg-primary-dark/10 px-4 font-medium text-primary-dark shadow-none hover:border-primary-dark/40 hover:bg-primary-dark/15 dark:border-primary/30 dark:bg-primary/10 dark:text-primary dark:hover:bg-primary/15"
                  : "bg-[#2563eb] font-semibold text-white hover:bg-[#1d4ed8] dark:bg-blue-500 dark:hover:bg-blue-600"
              }
              onClick={() => setBulkHandoverOpen(true)}
            >
              {td("bulkConvertHandover", { count: selectedIds.size })}
            </Button>
          </div>
        </div>
      ) : null}

      {isError ? (
        <ErrorAlert
          message={error instanceof Error ? error.message : td("errorLoading")}
          onRetry={() => void refetch()}
          retryLabel={td("retry")}
          className="shrink-0"
        />
      ) : null}

      <StyledTable
        isLoading={loading}
        rows={filtered}
        keyProp={(r) => r.id}
        emptyText={empty}
        detailRow={
          loadShipmentDetailsOnExpand
            ? {
                isExpanded: (order: NormalizedDeliveryOrderRow) => expandedIds.has(order.id),
                render: (order: NormalizedDeliveryOrderRow) => {
                  const dq = shipmentDetailQueryById.get(order.id);
                  const detailData = dq?.data;
                  const detailPending = Boolean(dq?.isPending || dq?.isFetching) && !detailData;
                  const detailFailed = Boolean(dq?.isError);

                  return (
                    <div className="px-5 py-4">
                      <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        {td("setsInOrder")}
                      </p>

                      {detailPending ? (
                        <div className="flex items-center gap-2 py-3 text-body-sm text-muted-foreground">
                          <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          {td("detailLoading")}
                        </div>
                      ) : detailFailed ? (
                        <ErrorAlert message={td("detailError")} className="mx-5 my-3" />
                      ) : detailData ? (
                        <div className="flex flex-col gap-2">
                          {detailData.sets.map((setRow) => {
                            const metaLine = subtitleFromDetail(detailData);
                            return (
                              <div
                                key={`${setRow.setId}-${setRow.displayLabel}`}
                                className={cn(
                                  TABLE_DETAIL_BOX,
                                  "px-3.5 py-3 shadow-sm",
                                  "transition-colors hover:bg-[var(--color-surface-light)] dark:hover:bg-[var(--color-surface-bright)]/40",
                                )}
                              >
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                                  <div className="flex min-w-0 items-center gap-2.5 sm:flex-1">
                                    <div
                                      className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm dark:bg-emerald-600"
                                      aria-hidden
                                    >
                                      <Check className="size-4" strokeWidth={2.5} />
                                    </div>
                                    <p className="min-w-0 text-body-md font-bold leading-snug text-foreground">
                                      <span className="break-words">{setRow.displayLabel}</span>{" "}
                                      <span className="whitespace-nowrap font-bold">
                                        ({td("detailSetTiresCount", { n: setRow.tireCount })})
                                      </span>
                                    </p>
                                  </div>
                                  {metaLine ? (
                                    <p
                                      className={cn(
                                        "min-w-0 ps-[2.625rem] text-body-sm font-normal leading-snug text-muted-foreground",
                                        "sm:ms-auto sm:max-w-[min(100%,28rem)] sm:flex-none sm:ps-0 sm:text-end",
                                      )}
                                    >
                                      {metaLine}
                                    </p>
                                  ) : null}
                                </div>
                              </div>
                            );
                          })}
                          {detailData.sets.length === 0 ? (
                            <p className="py-2 text-body-sm text-muted-foreground">{td("noSetDetails")}</p>
                          ) : null}
                        </div>
                      ) : (
                        <p className="py-3 text-body-sm text-muted-foreground">{td("detailLoading")}</p>
                      )}
                    </div>
                  );
                },
              }
            : undefined
        }
        footer={
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="font-medium text-foreground">
              {td("footerTotal", { count: footerCounts.total })}
            </span>
            <div className="flex flex-wrap items-center divide-x divide-border/70">
              <span className="px-3 font-medium text-[#2563eb] dark:text-blue-400">
                {td("footerConfirmed", { count: footerCounts.confirmed })}
              </span>
              <span className="px-3 font-medium text-[#7c3aed] dark:text-violet-400">
                {td("footerHandover", { count: footerCounts.handover })}
              </span>
              <span className="ps-3 font-medium text-[#16a34a] dark:text-green-400">
                {td("footerCompleted", { count: footerCounts.completed })}
              </span>
            </div>
          </div>
        }
        columns={[
          ...(enableBulkHandover
            ? [
                {
                  header: (
                    <input
                      type="checkbox"
                      checked={allSelectableSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = someSelectableSelected;
                      }}
                      disabled={
                        handoverBusy || selectableConfirmedRows.length === 0
                      }
                      onChange={toggleSelectAllConfirmed}
                      aria-label={td("selectAllConfirmed")}
                      className={cn("cursor-pointer", bulkCheckboxClass)}
                    />
                  ),
                  className: "w-10 px-2",
                  align: "center" as const,
                  render: (order: NormalizedDeliveryOrderRow) => {
                    const selectable = order.uiStatus === "confirmed";
                    return (
                      <input
                        type="checkbox"
                        checked={selectedIds.has(order.id)}
                        disabled={!selectable || handoverBusy}
                        onChange={() => toggleSelected(order.id)}
                        aria-label={td("selectOrder", { orderId: order.orderLabel })}
                        className={cn(
                          bulkCheckboxClass,
                          selectable ? "cursor-pointer" : "cursor-not-allowed opacity-40",
                        )}
                      />
                    );
                  },
                },
              ]
            : []),
          {
            header: td("colOrderId"),
            render: (order: NormalizedDeliveryOrderRow) => (
              <span className="font-mono text-sm font-semibold text-warning-dark">
                {order.orderLabel}
              </span>
            ),
          },
          {
            header: td("colCustomersSets"),
            render: (order: NormalizedDeliveryOrderRow) => (
              <div>
                <div className="text-body-md font-medium text-foreground">
                  {td("customersSetsLine", {
                    customerCount: order.customerCount,
                    setCount: order.setCount,
                  })}
                </div>
                {order.customerNames.length > 0 ? (
                  <p className="mt-1 text-xs text-muted-foreground">{order.customerNames.join(", ")}</p>
                ) : null}
              </div>
            ),
          },
          {
            header: td("colDeliveryDate"),
            align: "center",
            render: (order: NormalizedDeliveryOrderRow) => (
              <span className="text-body-md">
                {formatAppointment(order.appointmentDate)}
              </span>
            ),
          },
          {
            header: td("colStatus"),
            align: "center",
            render: (order: NormalizedDeliveryOrderRow) => (
              <Badge className={cn("px-3 py-1 font-medium", statusBadgeClass(order.uiStatus))}>
                {statusLabel(order.uiStatus)}
              </Badge>
            ),
          },
          {
            header: td("colActions"),
            align: "center",
            className:
              actionsVariant === "soft"
                ? enableBulkHandover
                  ? "min-w-[160px] whitespace-nowrap"
                  : "min-w-[72px] whitespace-nowrap"
                : "min-w-[200px] whitespace-nowrap",
            render: (order: NormalizedDeliveryOrderRow) => {
              const expanded = expandedIds.has(order.id);
              const expandSoftClass = cn(
                "h-8 w-8 shrink-0 rounded-full border shadow-none transition-all duration-200",
                "border-primary-dark/25 bg-primary-dark/10 text-primary-dark",
                "hover:border-primary-dark/40 hover:bg-primary-dark/15",
                "dark:border-primary/30 dark:bg-primary/10 dark:text-primary dark:hover:bg-primary/15",
                expanded &&
                  "border-primary-dark/40 bg-primary-dark/15 dark:border-primary/40 dark:bg-primary/15",
              );
              return (
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {hasWorkflowPrimaryAction(order.uiStatus) ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="default"
                      disabled={handoverBusy && (actionOrderId === order.id || actionOrderId === -1)}
                      className={
                        actionsVariant === "soft"
                          ? primaryActionSoftClass(order.uiStatus)
                          : cn("px-3", primaryActionButtonClass(order.uiStatus))
                      }
                      onClick={() => onPrimaryAction(order)}
                    >
                      {primaryActionLabel(order.uiStatus)}
                    </Button>
                  ) : null}
                  {actionsVariant !== "soft" ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className={actionIconButtonClass(order.uiStatus)}
                          aria-label={td("moreOptions")}
                        >
                          <MoreVertical className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => void copyOrderId(order.orderLabel)}>
                          {td("copyOrderId")}
                        </DropdownMenuItem>
                        {hasWorkflowPrimaryAction(order.uiStatus) ? (
                          <DropdownMenuItem onClick={() => onPrimaryAction(order)}>
                            {primaryActionLabel(order.uiStatus)}
                          </DropdownMenuItem>
                        ) : null}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : null}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={
                      actionsVariant === "soft"
                        ? expandSoftClass
                        : actionIconButtonClass(order.uiStatus)
                    }
                    aria-expanded={expanded}
                    aria-label={expanded ? td("collapseRow") : td("expandRow")}
                    onClick={() => toggleExpanded(order.id)}
                  >
                    {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                  </Button>
                </div>
              );
            },
          },
        ]}
      />

      <PaginationControls
        canPrevious={(meta?.page ?? 0) > 0}
        canNext={!Boolean(meta?.last)}
        previousLabel={ts("paginationPrev")}
        nextLabel={ts("paginationNext")}
        pageLabel={ts("pageInfo", { current: (meta?.page ?? 0) + 1, total: meta?.totalPages ?? 1 })}
        pageText={ts("pageCompact", { current: (meta?.page ?? 0) + 1, total: meta?.totalPages ?? 1 })}
        onPrevious={() => setPage((p) => Math.max(0, p - 1))}
        onNext={() => setPage((p) => p + 1)}
        className="mt-1"
      />

      <Dialog
        open={bulkHandoverOpen}
        onOpenChange={(open) => {
          if (!open && !openHandoverSession.isPending) setBulkHandoverOpen(false);
        }}
      >
        <DialogContent className={cn("max-w-md", DIALOG_SHELL_CLASS)}>
          <DialogHeader className="space-y-2 text-start">
            <DialogTitle className="text-lg font-semibold leading-tight text-foreground">
              {td("handoverBulkConfirmTitle", { count: selectedOrders.length })}
            </DialogTitle>
            <DialogDescription className="text-body-sm leading-relaxed text-muted-foreground">
              {td("handoverBulkConfirmDescription", { count: selectedOrders.length })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 flex-col-reverse gap-2 sm:flex-row sm:justify-end [&>button]:w-full sm:[&>button]:w-auto">
            <Button
              type="button"
              variant="outline"
              className={DIALOG_FOOTER_BUTTON_CLASS}
              disabled={openHandoverSession.isPending}
              onClick={() => setBulkHandoverOpen(false)}
            >
              {td("handoverCloseCancel")}
            </Button>
            <Button
              type="button"
              variant={actionsVariant === "soft" ? "brand" : "default"}
              disabled={openHandoverSession.isPending || selectedOrders.length === 0}
              onClick={() => void onOpenHandover(selectedOrders)}
              className={handoverModalOpenConfirmClass}
            >
              {openHandoverSession.isPending ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  {td("handoverOpening")}
                </span>
              ) : (
                td("bulkConvertHandover", { count: selectedOrders.length })
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={closeConfirmOrder != null}
        onOpenChange={(open) => {
          if (!open && !closeHandoverSession.isPending) setCloseConfirmOrder(null);
        }}
      >
        <DialogContent className={cn("max-w-md", DIALOG_SHELL_CLASS)}>
          <DialogHeader className="space-y-2 text-start">
            <DialogTitle className="text-lg font-semibold leading-tight text-foreground">
              {td("handoverCloseConfirmTitle")}
            </DialogTitle>
            <DialogDescription className="text-body-sm leading-relaxed text-muted-foreground">
              {td("handoverCloseConfirmDescription", {
                orderId: closeConfirmOrder?.orderLabel ?? "",
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 flex-col-reverse gap-2 sm:flex-row sm:justify-end [&>button]:w-full sm:[&>button]:w-auto">
            <Button
              type="button"
              variant="outline"
              className={DIALOG_FOOTER_BUTTON_CLASS}
              disabled={closeHandoverSession.isPending}
              onClick={() => setCloseConfirmOrder(null)}
            >
              {td("handoverCloseCancel")}
            </Button>
            <Button
              type="button"
              disabled={closeHandoverSession.isPending}
              onClick={() => void onCloseHandoverConfirm()}
              className={handoverModalCloseConfirmClass}
            >
              {closeHandoverSession.isPending ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  {td("handoverClosing")}
                </span>
              ) : (
                td("actionCloseHandover")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
