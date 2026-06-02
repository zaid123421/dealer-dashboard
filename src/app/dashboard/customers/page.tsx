"use client";

import { Suspense, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useDealerId } from "@/shared/hooks/use-can-access";
import { useDealerMe } from "@/modules/dealer/hooks/use-dealer-me";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { ROUTES } from "@/constants/routes";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Archive,
  Eye,
  User,
  Mail,
  Phone,
  Hash,
  MapPin,
  Building2,
  Home,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";
import { ErrorAlert } from "@/components/ui/error-alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import StyledTable from "@/components/ui/styled-table";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatTableCell } from "@/lib/format-table-cell";
import { TABLE_BORDER } from "@/lib/table-border";
import type { DealerCustomer } from "@/modules/customers/schemas/create-dealer-customer.schema";
import { useDealerCustomersInfinite } from "@/modules/customers/hooks/use-my-dealer-customers";
import { useArchiveDealerCustomer } from "@/modules/customers/hooks/use-archive-dealer-customer";
import { useDeleteDealerCustomer } from "@/modules/customers/hooks/use-delete-dealer-customer";
import {
  DealerCustomerVehicleModal,
  type VehicleToEdit,
} from "@/modules/vehicles/components/dealer-customer-vehicle-modal";
import { useCustomerVehicles } from "@/modules/vehicles/hooks/use-customer-vehicles";
import { useDeleteVehicleForCustomer } from "@/modules/vehicles/hooks/use-delete-vehicle-for-customer";
import { dealerCustomerVehicleToEdit } from "@/modules/vehicles/lib/vehicle-to-edit";

function formatPhoneDisplay(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("966") && digits.length >= 9) {
    return `+966 ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
  }
  if (digits.length >= 10) {
    return `+${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
  }
  return phone;
}

function customerInitials(c: DealerCustomer): string {
  const fi = c.firstName?.trim();
  const la = c.lastName?.trim();
  if (fi && la) return `${fi[0]}${la[0]}`.toUpperCase();
  if (fi) return fi.slice(0, 2).toUpperCase();
  if (c.email) return c.email.slice(0, 2).toUpperCase();
  return "?";
}

const INITIAL_COLORS = [
  "bg-primary-dark text-primary-onContainer",
  "bg-tertiary-dark text-tertiary-onContainer",
  "bg-success-dark text-success-onContainer",
  "bg-warning-dark text-warning-onContainer",
  "bg-info-main text-white",
];

function CustomerDetailTile({
  icon: Icon,
  label,
  value,
  className,
  valueClassName,
}: {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
  className?: string;
  valueClassName?: string;
}) {
  return (
    <div className={cn("group min-w-0", className)}>
      <div className="mb-2 flex min-w-0 items-center gap-2">
        <Icon className="size-3 text-primary-dark sm:size-4" />
        <span className="min-w-0 truncate whitespace-nowrap text-xs font-medium text-secondary-on-surface sm:text-sm">
          {label}
        </span>
      </div>
      <div className="min-w-0 rounded-lg border-2 border-surface-high bg-surface-bright p-2 transition-all group-hover:border-primary-dark group-hover:shadow-md sm:p-3">
        <div
          className={cn(
            "min-w-0 truncate whitespace-nowrap text-sm font-semibold text-onSurface sm:text-base",
            valueClassName,
          )}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

function CustomerListItemSkeleton() {
  return (
    <div
      className="relative flex w-full min-w-0 items-start gap-2 rounded-md border border-transparent bg-muted/20 p-3 dark:bg-surface-container sm:gap-3 sm:p-4"
      aria-hidden
    >
      <Skeleton className="size-9 shrink-0 rounded-full sm:size-10" />
      <div className="min-w-0 flex-1 space-y-2 pt-0.5">
        <Skeleton className="h-4 w-[68%]" />
        <Skeleton className="h-3.5 w-[82%]" />
        <Skeleton className="h-3 w-[48%]" />
      </div>
    </div>
  );
}

function CustomerDetailTileSkeleton() {
  return (
    <div className="min-w-0">
      <div className="mb-2 flex min-w-0 items-center gap-2">
        <Skeleton className="size-3 rounded-sm sm:size-4" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="h-10 w-full rounded-lg border-2 border-transparent sm:h-12" />
    </div>
  );
}

function CustomerDetailCardSkeleton() {
  return (
    <Card className="rounded-lg border-0 bg-surface-container">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-start">
          <Skeleton className="mx-auto size-12 shrink-0 rounded-full sm:size-16 lg:mx-0" />
          <div className="min-w-0 flex-1">
            <div className="mb-4 space-y-2 text-center lg:text-left">
              <Skeleton className="mx-auto h-6 w-[58%] max-w-xs lg:mx-0" />
              <Skeleton className="mx-auto h-4 w-[42%] max-w-[14rem] lg:mx-0" />
            </div>
            <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-[repeat(auto-fit,minmax(180px,1fr))] sm:gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <CustomerDetailTileSkeleton key={i} />
              ))}
            </div>
          </div>
          <div className="flex w-full shrink-0 flex-wrap justify-center gap-2 lg:w-auto lg:flex-col lg:items-stretch">
            <Skeleton className="h-9 flex-1 rounded-md sm:flex-initial sm:w-24 lg:w-full" />
            <Skeleton className="h-9 flex-1 rounded-md sm:flex-initial sm:w-24 lg:w-full" />
            <Skeleton className="h-9 flex-1 rounded-md sm:flex-initial sm:w-28 lg:w-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CustomerVehiclesTableSkeleton() {
  return (
    <div
      className={cn(
        "w-full overflow-x-auto rounded-lg border-2 bg-card",
        TABLE_BORDER,
      )}
    >
      <div className="min-w-[640px]">
        <div
          className={cn(
            "flex gap-4 border-b-2 px-4 py-3",
            TABLE_BORDER,
            "bg-[var(--color-surface-light-container)] dark:bg-[var(--color-surface-container-high)]",
          )}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>
        {Array.from({ length: 3 }).map((_, row) => (
          <div
            key={row}
            className={cn(
              "flex gap-4 px-4 py-3.5",
              row < 2 && `border-b-2 ${TABLE_BORDER}`,
            )}
          >
            {Array.from({ length: 6 }).map((_, col) => (
              <Skeleton
                key={col}
                className={cn("h-4 flex-1", col === 0 ? "max-w-[120px]" : "")}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function CustomerVehiclesSectionSkeleton() {
  return (
    <div className="min-w-0">
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-6 w-28" />
        <Skeleton className="h-9 w-full rounded-md sm:w-36" />
      </div>
      <CustomerVehiclesTableSkeleton />
    </div>
  );
}

function CustomersPageSkeleton() {
  return (
    <div className="flex min-w-0 flex-col gap-4" aria-busy="true" aria-live="polite">
      <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-9 w-full rounded-md sm:w-40" />
      </div>
      <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:flex-nowrap sm:items-center sm:gap-2">
        <Skeleton className="h-10 w-full rounded-md sm:flex-1" />
        <Skeleton className="h-10 w-full rounded-md sm:w-44" />
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[minmax(280px,1fr)_minmax(400px,2fr)]">
        <div className="flex min-h-[200px] flex-col gap-2 overflow-hidden rounded-lg bg-card p-2 sm:min-h-0">
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <CustomerListItemSkeleton key={i} />
            ))}
          </div>
        </div>
        <div className="flex min-h-[280px] min-w-0 flex-col gap-4 sm:min-h-0">
          <CustomerDetailCardSkeleton />
          <CustomerVehiclesSectionSkeleton />
        </div>
      </div>
    </div>
  );
}

function CustomersPageContent() {
  const t = useTranslations("customers");
  const router = useRouter();
  const searchParams = useSearchParams();
  const dealerId = useDealerId();
  const { isLoading: isProfileLoading } = useDealerMe({ enabled: dealerId == null });

  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [includeArchived, setIncludeArchived] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedSearch(searchQuery.trim()), 320);
    return () => window.clearTimeout(id);
  }, [searchQuery]);

  const phoneSearchTerm = useMemo(
    () => debouncedSearch.replace(/\D/g, ""),
    [debouncedSearch],
  );

  const archiveCustomer = useArchiveDealerCustomer();
  const deleteCustomer = useDeleteDealerCustomer();
  const deleteVehicle = useDeleteVehicleForCustomer();

  const [vehicleModalOpen, setVehicleModalOpen] = useState(false);
  const [vehicleToEdit, setVehicleToEdit] = useState<VehicleToEdit | null>(null);

  useEffect(() => {
    const id = searchParams.get("openVehicleModal");
    if (id == null || !/^\d+$/.test(id)) return;
    setSelectedCustomerId(id);
    setVehicleToEdit(null);
    setVehicleModalOpen(true);
    router.replace(ROUTES.DASHBOARD.CUSTOMERS, { scroll: false });
  }, [searchParams, router]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
    isError,
    error,
    refetch,
  } = useDealerCustomersInfinite({
    dealerId,
    searchTerm: phoneSearchTerm,
    size: 10,
    sortBy: "firstName",
    direction: "desc",
    includeArchived,
    startsWith: true,
  });

  const allRows = useMemo(
    () => data?.pages.flatMap((p) => p.content) ?? [],
    [data?.pages],
  );

  const visibleCustomers = allRows;

  const selectedCustomer = useMemo(() => {
    if (!selectedCustomerId) return undefined;
    return visibleCustomers.find((c) => String(c.id) === selectedCustomerId);
  }, [visibleCustomers, selectedCustomerId]);

  const selectedCustomerDisplayName = useMemo(() => {
    if (!selectedCustomer) return "";
    return [selectedCustomer.firstName, selectedCustomer.lastName].filter(Boolean).join(" ").trim();
  }, [selectedCustomer]);

  const {
    data: customerVehicles = [],
    isPending: vehiclesPending,
    isError: vehiclesError,
    error: vehiclesErr,
    refetch: refetchVehicles,
  } = useCustomerVehicles(selectedCustomer?.id ?? null);

  const colorIndexFor = useCallback((c: DealerCustomer) => {
    return Math.abs(Number(c.id)) % INITIAL_COLORS.length;
  }, []);

  useEffect(() => {
    if (isPending) return;
    if (!visibleCustomers.length) {
      setSelectedCustomerId(null);
      return;
    }
    const exists = visibleCustomers.some((c) => String(c.id) === selectedCustomerId);
    if (!exists) {
      setSelectedCustomerId(String(visibleCustomers[0].id));
    }
  }, [isPending, visibleCustomers, selectedCustomerId]);

  function handleDeleteVehicle(vehicleId: number) {
    const cid = selectedCustomer?.id;
    if (cid == null) return;
    if (typeof window !== "undefined" && !window.confirm(t("deleteVehicleConfirm"))) return;
    deleteVehicle.mutate(
      { dealerCustomerId: cid, vehicleId },
      {
        onSuccess: () => toast.success(t("deleteVehicleSuccess")),
        onError: (err) =>
          toast.error(err instanceof Error ? err.message : t("deleteVehicleError")),
      },
    );
  }

  function handleArchiveCustomer() {
    const id = selectedCustomer?.id;
    if (id == null || selectedCustomer?.archived) return;
    archiveCustomer.mutate(id, {
      onSuccess: () => {
        toast.success(t("archiveSuccess"));
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : t("archiveError"));
      },
    });
  }

  function handleDeleteCustomer() {
    const id = selectedCustomer?.id;
    if (id == null) return;
    if (typeof window !== "undefined" && !window.confirm(t("deleteConfirm"))) return;
    deleteCustomer.mutate(id, {
      onSuccess: () => {
        toast.success(t("deleteSuccess"));
        setSelectedCustomerId(null);
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : t("deleteError"));
      },
    });
  }

  const customerMutationPending =
    archiveCustomer.isPending || deleteCustomer.isPending || deleteVehicle.isPending;

  return (
    <div className="flex min-w-0 flex-col h-full gap-4 overflow-auto">
      <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <h1 className="text-headline-sm font-bold text-foreground">{t("title")}</h1>
        <div className="flex flex-wrap gap-2">
          <Button
            asChild
            variant="brand"
            className="w-full shrink-0 sm:w-auto"
          >
            <Link href={ROUTES.DASHBOARD.CUSTOMERS_ADD} className="flex items-center justify-center gap-2">
              <Plus className="size-4 shrink-0" />
              <span className="truncate">{t("addCustomer")}</span>
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:flex-nowrap sm:items-center sm:gap-2">
        <div className="relative w-full min-w-0 sm:flex-1">
          <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            inputMode="tel"
            autoComplete="tel"
            placeholder={t("searchByPhonePlaceholder")}
            className="h-10 w-full ps-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={dealerId == null}
            aria-label={t("searchByPhoneAria")}
          />
        </div>
        <Button
          type="button"
          variant={includeArchived ? "secondary" : "outline"}
          className={cn(
            "h-10 w-full shrink-0 gap-2 sm:w-auto",
            TABLE_BORDER,
            includeArchived && "bg-primary-container/20",
          )}
          onClick={() => setIncludeArchived((v) => !v)}
          disabled={dealerId == null}
          aria-pressed={includeArchived}
        >
          <Archive className="size-4 shrink-0" />
          {includeArchived ? t("listActiveOnly") : t("listIncludeArchived")}
        </Button>
      </div>

      {dealerId == null && isProfileLoading ? (
        <p className="text-body-sm text-muted-foreground" role="status">
          {t("loadingDealerProfile")}
        </p>
      ) : dealerId == null ? (
        <p className="text-body-sm text-muted-foreground" role="status">
          {t("searchRequiresDealer")}
        </p>
      ) : null}

      {isError ? (
        <ErrorAlert
          message={error instanceof Error ? error.message : t("errorLoadingCustomers")}
          onRetry={() => void refetch()}
          retryLabel={t("retry")}
          className="shrink-0"
        />
      ) : null}

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-auto lg:grid-cols-[minmax(280px,1fr)_minmax(400px,2fr)]">
        <div className="flex min-h-[200px] flex-col gap-2 overflow-hidden rounded-lg bg-card p-2 sm:min-h-0">
          <div className="scrollbar-custom overflow-auto space-y-3">
            {isPending ? (
              <div className="space-y-3" aria-busy="true">
                {Array.from({ length: 6 }).map((_, i) => (
                  <CustomerListItemSkeleton key={i} />
                ))}
              </div>
            ) : visibleCustomers.length === 0 ? (
              <p className="p-4 text-body-md text-muted-foreground">{t("selectCustomer")}</p>
            ) : (
              visibleCustomers.map((customer) => (
                <button
                  key={customer.id}
                  type="button"
                  onClick={() => setSelectedCustomerId(String(customer.id))}
                  className={cn(
                    "relative flex w-full min-w-0 items-start gap-2 rounded-md p-3 text-start transition-colors hover:bg-accent/50 sm:gap-3 sm:p-4",
                    selectedCustomerId === String(customer.id)
                      ? "border border-primary-dark bg-primary-container/20 dark:bg-[#231f1a]"
                      : "border border-transparent bg-muted/20 dark:bg-surface-container",
                  )}
                >
                  {selectedCustomerId === String(customer.id) && (
                    <span
                      className="absolute start-0 top-0 h-full w-2 rounded-full bg-primary-dark"
                      aria-hidden
                    />
                  )}
                  <div
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-full font-semibold text-label-md sm:size-10",
                      INITIAL_COLORS[colorIndexFor(customer)],
                    )}
                  >
                    {customerInitials(customer)}
                  </div>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <p className="font-bold text-foreground">
                      {customer.firstName} {customer.lastName}
                    </p>
                    <p className="truncate text-body-md text-muted-foreground">{customer.email}</p>
                    <p className="mt-1 truncate text-label-sm text-muted-foreground">
                      {customer.phoneNumber}
                    </p>
                  </div>
                </button>
              ))
            )}
            {hasNextPage ? (
              <div className="p-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  disabled={isFetchingNextPage}
                  onClick={() => void fetchNextPage()}
                >
                  {isFetchingNextPage ? t("loadingMore") : t("loadMore")}
                </Button>
              </div>
            ) : null}
          </div>
        </div>

        <div className="scrollbar-custom flex min-h-[280px] min-w-0 flex-col gap-4 overflow-y-auto sm:min-h-0">
          {isPending ? (
            <>
              <CustomerDetailCardSkeleton />
              <CustomerVehiclesSectionSkeleton />
            </>
          ) : selectedCustomer ? (
            <>
              <Card className="rounded-lg border-0 bg-surface-container">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-start">
                    <div
                      className={cn(
                        "mx-auto flex size-12 shrink-0 items-center justify-center rounded-full font-bold text-title-md transition-all duration-200 hover:scale-105 sm:size-16 sm:text-title-lg lg:mx-0",
                        INITIAL_COLORS[colorIndexFor(selectedCustomer)],
                      )}
                    >
                      {customerInitials(selectedCustomer)}
                    </div>
                    <div className="min-w-0 flex-1 text-center lg:text-left">
                      <h2 className="mb-2 truncate whitespace-nowrap text-lg font-bold text-onSurface sm:text-xl md:text-headline-sm">
                        {selectedCustomer.firstName} {selectedCustomer.lastName}
                      </h2>
                      <p className="mb-4 truncate whitespace-nowrap px-2 font-mono text-sm text-secondary-on-surface lg:px-0">
                        {t("uniqueCustomerId")}: {selectedCustomer.dealerCustomerUniqueId}
                      </p>
                      <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-[repeat(auto-fit,minmax(180px,1fr))] sm:gap-4">
                        <CustomerDetailTile
                          icon={Mail}
                          label={t("emailAddress")}
                          value={selectedCustomer.email.toLowerCase()}
                          valueClassName="truncate"
                        />
                        <CustomerDetailTile
                          icon={Phone}
                          label={t("phoneNumber")}
                          value={formatPhoneDisplay(selectedCustomer.phoneNumber)}
                        />
                        <div className="min-w-0">
                          <div className="mb-2 flex min-w-0 items-center gap-2">
                            <CheckCircle2 className="size-3 text-primary-dark sm:size-4" />
                            <span className="min-w-0 truncate whitespace-nowrap text-xs font-medium text-secondary-on-surface sm:text-sm">
                              {t("status")}
                            </span>
                          </div>
                          <div className="flex min-h-10 items-center sm:min-h-12">
                            <Badge
                              className={cn(
                                "max-w-full truncate whitespace-nowrap border-0 px-3 py-1 shadow-none",
                                selectedCustomer.archived
                                  ? "bg-gray-500 text-white"
                                  : "bg-emerald-600 text-white",
                              )}
                            >
                              {selectedCustomer.archived ? t("archivedBadge") : t("activeBadge")}
                            </Badge>
                          </div>
                        </div>
                        <CustomerDetailTile
                          icon={Hash}
                          label={t("uniqueCustomerId")}
                          value={selectedCustomer.dealerCustomerUniqueId}
                          valueClassName="font-mono"
                        />
                        <CustomerDetailTile
                          icon={MapPin}
                          label={t("streetName")}
                          value={selectedCustomer.address?.streetName || "—"}
                        />
                        <CustomerDetailTile
                          icon={Building2}
                          label={t("streetNumber")}
                          value={selectedCustomer.address?.streetNumber || "—"}
                        />
                        <CustomerDetailTile
                          icon={Home}
                          label={t("unitNumber")}
                          value={selectedCustomer.address?.unitNumber ?? "—"}
                        />
                        <CustomerDetailTile
                          icon={MapPin}
                          label={t("city")}
                          value={selectedCustomer.address?.city || "—"}
                        />
                        <CustomerDetailTile
                          icon={MapPin}
                          label={t("province")}
                          value={selectedCustomer.address?.province || "—"}
                        />
                        <CustomerDetailTile
                          icon={MapPin}
                          label={t("country")}
                          value={selectedCustomer.address?.country || "—"}
                        />
                        <CustomerDetailTile
                          icon={Hash}
                          label={t("postalCode")}
                          value={selectedCustomer.address?.postalCode || "—"}
                        />
                        <CustomerDetailTile
                          icon={User}
                          label={t("specialInstructions")}
                          value={selectedCustomer.address?.specialInstructions?.trim() || "—"}
                        />
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-wrap justify-center gap-2 lg:flex-col lg:items-stretch">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="h-9 flex-1 border-[var(--color-tertiary-main-light)] bg-transparent text-[var(--color-tertiary-main-light)] 
                          hover:bg-[var(--color-tertiary-main-dark)] hover:text-white hover:border-[var(--color-tertiary-main-dark)] 
                          transition-all duration-[var(--duration-normal)] sm:flex-initial"
                      >
                        <Link href={ROUTES.DASHBOARD.CUSTOMER_EDIT(String(selectedCustomer.id))}>
                          <Pencil className="size-4 shrink-0" />
                          {t("edit")}
                        </Link>
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-9 flex-1 border-[var(--color-warning-main-light)] bg-transparent text-[var(--color-warning-main-light)] 
                          hover:bg-[var(--color-warning-main-dark)] hover:text-white hover:border-[var(--color-warning-main-dark)] 
                          transition-all duration-[var(--duration-normal)] sm:flex-initial"
                        disabled={selectedCustomer.archived || customerMutationPending}
                        onClick={handleArchiveCustomer}
                      >
                        {archiveCustomer.isPending ? t("loading") : t("archive")}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="flex h-9 flex-1 items-center justify-center gap-2 border-[var(--color-error-main)] bg-transparent text-[var(--color-error-main)] 
                          hover:bg-[var(--color-error-main)] hover:text-white hover:border-[var(--color-error-main)] 
                          transition-all duration-[var(--duration-normal)] sm:flex-initial"
                        disabled={customerMutationPending}
                        onClick={handleDeleteCustomer}
                      >
                        <Trash2 className="size-4 shrink-0" />
                        {deleteCustomer.isPending ? t("loading") : t("delete")}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="min-w-0">
                <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="text-title-md font-semibold text-foreground">{t("vehicles")}</h3>
                  <Button
                    type="button"
                    variant="brand"
                    className="w-full shrink-0 sm:w-auto"
                    disabled={selectedCustomer.archived}
                    onClick={() => {
                      setVehicleToEdit(null);
                      setVehicleModalOpen(true);
                    }}
                  >
                    <Plus className="me-2 size-4 shrink-0" />
                    {t("addVehicle")}
                  </Button>
                </div>
                {vehiclesPending ? (
                  <CustomerVehiclesTableSkeleton />
                ) : vehiclesError ? (
                  <ErrorAlert
                    message={
                      vehiclesErr instanceof Error ? vehiclesErr.message : t("errorLoadingVehicles")
                    }
                    onRetry={() => void refetchVehicles()}
                    retryLabel={t("retry")}
                  />
                ) : customerVehicles.length > 0 ? (
                  <StyledTable
                    isLoading={vehiclesPending}
                    rows={customerVehicles}
                    keyProp={(v) => v.id}
                    emptyText={t("noVehicles")}
                    columns={[
                      {
                        header: t("makeBrand"),
                        className: "min-w-[140px]",
                        render: (v) => (
                          <span className="block max-w-[140px] truncate">{formatTableCell(v.make)}</span>
                        ),
                      },
                      {
                        header: t("model"),
                        className: "min-w-[140px]",
                        render: (v) => (
                          <span className="block max-w-[140px] truncate">{formatTableCell(v.model)}</span>
                        ),
                      },
                      {
                        header: t("year"),
                        className: "min-w-[90px]",
                        render: (v) => formatTableCell(v.year),
                        align: "center",
                      },
                      {
                        header: t("plateNumber"),
                        className: "min-w-[150px]",
                        render: (v) => (
                          <span className="block truncate font-mono text-label-md">
                            {formatTableCell(v.plateNumber)}
                          </span>
                        ),
                        align: "center",
                      },
                      {
                        header: t("vinNumber"),
                        className: "min-w-[180px]",
                        render: (v) => (
                          <span className="block max-w-[180px] truncate font-mono text-label-md">
                            {formatTableCell(v.vin)}
                          </span>
                        ),
                      },
                      {
                        header: t("color"),
                        className: "min-w-[110px]",
                        render: (v) => formatTableCell(v.color),
                        align: "center",
                      },
                      {
                        header: t("odometerKm"),
                        className: "min-w-[140px]",
                        render: (v) => formatTableCell(v.odometerKm),
                        align: "center",
                      },
                      {
                        header: t("actions"),
                        className: "min-w-[180px] sm:min-w-[220px]",
                        render: (v) => (
                          <div className="flex justify-center gap-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 sm:h-9 sm:w-9 rounded-md border border-[var(--color-tertiary-main-light)] bg-transparent text-[var(--color-tertiary-main-light)] 
                                        hover:bg-[var(--color-tertiary-main-dark)] hover:text-white hover:border-[var(--color-tertiary-main-dark)] 
                                        transition-all duration-[var(--duration-normal)]"
                              aria-label={t("viewTireDetails")}
                              onClick={() => {
                                router.push(
                                  `/dashboard/customers/${selectedCustomer.id}/vehicles/${v.id}`
                                );
                              }}
                            >
                              <Eye className="size-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 sm:h-9 sm:w-9 rounded-md border border-[var(--color-tertiary-main-light)] bg-transparent text-[var(--color-tertiary-main-light)] 
                                        hover:bg-[var(--color-tertiary-main-dark)] hover:text-white hover:border-[var(--color-tertiary-main-dark)] 
                                        transition-all duration-[var(--duration-normal)]"
                              disabled={selectedCustomer.archived}
                              aria-label={t("edit")}
                              onClick={() => {
                                setVehicleToEdit(dealerCustomerVehicleToEdit(v));
                                setVehicleModalOpen(true);
                              }}
                            >
                              <Pencil className="size-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 sm:h-9 sm:w-9 rounded-md border border-[var(--color-error-main)] bg-transparent text-[var(--color-error-main)] 
                                        hover:bg-[var(--color-error-main)] hover:text-white hover:border-[var(--color-error-main)] 
                                        transition-all duration-[var(--duration-normal)]"
                              disabled={selectedCustomer.archived || customerMutationPending}
                              aria-label={t("delete")}
                              onClick={() => handleDeleteVehicle(v.id)}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        ),
                      },
                    ]}
                  />
                ) : (
                  <div className="rounded-lg border border-dashed border-border p-6 text-center text-body-md text-muted-foreground">
                    {t("noVehicles")}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-border p-6 text-center text-body-md text-muted-foreground sm:p-12">
              {t("selectCustomer")}
            </div>
          )}
        </div>
      </div>

      {selectedCustomer ? (
        <DealerCustomerVehicleModal
          open={vehicleModalOpen}
          onOpenChange={(open) => {
            setVehicleModalOpen(open);
            if (!open) setVehicleToEdit(null);
          }}
          dealerCustomerId={selectedCustomer.id}
          customerDisplayName={selectedCustomerDisplayName || selectedCustomer.email}
          customerEmail={selectedCustomer.email}
          vehicleToEdit={vehicleToEdit}
        />
      ) : null}
    </div>
  );
}

export default function CustomersPage() {
  return (
    <Suspense fallback={<CustomersPageSkeleton />}>
      <CustomersPageContent />
    </Suspense>
  );
}
