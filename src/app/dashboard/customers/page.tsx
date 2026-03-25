"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useAuthUser } from "@/shared/hooks/use-can-access";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { ROUTES } from "@/constants/routes";
import {
  Search,
  Download,
  Plus,
  Pencil,
  Trash2,
  Archive,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
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

function CustomersPageContent() {
  const t = useTranslations("customers");
  const router = useRouter();
  const searchParams = useSearchParams();
  const authUser = useAuthUser();
  const dealerId =
    authUser?.tenantId != null && authUser.tenantId > 0 ? authUser.tenantId : null;

  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  /** يُرسَل كـ includeArchived للـ API مع نفس endpoint البحث */
  const [includeArchived, setIncludeArchived] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedSearch(searchQuery.trim()), 320);
    return () => window.clearTimeout(id);
  }, [searchQuery]);

  /** أرقام فقط في الطلب لتطابق تخزين الهاتف في الـ API */
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

  const handleImportExcel = () => {
    // Placeholder for API
  };

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
    <div className="flex min-w-0 flex-col h-full gap-4 overflow-hidden">
      <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <h1 className="text-headline-sm font-bold text-foreground">{t("title")}</h1>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={handleImportExcel}
            className="w-full shrink-0 border-primary-dark text-primary-dark bg-transparent hover:bg-primary-dark/10 hover:text-primary-dark hover:border-primary-dark sm:w-auto"
          >
            <Download className="size-4 shrink-0" />
            <span className="truncate">{t("importExcel")}</span>
          </Button>
          <Button
            asChild
            className="w-full shrink-0 bg-primary-dark text-primary-onContainer font-bold hover:bg-primary-dark/90 sm:w-auto"
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
            includeArchived && "border-primary-dark/30",
          )}
          onClick={() => setIncludeArchived((v) => !v)}
          disabled={dealerId == null}
          aria-pressed={includeArchived}
        >
          <Archive className="size-4 shrink-0" />
          {includeArchived ? t("listActiveOnly") : t("listIncludeArchived")}
        </Button>
      </div>

      {dealerId == null && authUser != null ? (
        <p className="text-body-sm text-muted-foreground" role="status">
          {t("searchRequiresDealer")}
        </p>
      ) : null}

      {isError ? (
        <div
          className="flex shrink-0 items-center justify-between gap-2 rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-body-sm"
          role="alert"
        >
          <span>{error instanceof Error ? error.message : t("errorLoadingCustomers")}</span>
          <Button type="button" variant="outline" size="sm" onClick={() => void refetch()}>
            {t("retry")}
          </Button>
        </div>
      ) : null}

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-hidden lg:grid-cols-[minmax(280px,1fr)_minmax(400px,2fr)]">
        <div className="flex min-h-[200px] flex-col gap-2 overflow-hidden rounded-lg bg-card p-2 sm:min-h-0">
          <div className="scrollbar-custom overflow-auto space-y-3">
            {isPending ? (
              <p className="p-4 text-body-md text-muted-foreground">{t("loading")}</p>
            ) : visibleCustomers.length === 0 ? (
              <p className="p-4 text-body-md text-muted-foreground">{t("selectCustomer")}</p>
            ) : (
              visibleCustomers.map((customer) => (
                <button
                  key={customer.id}
                  type="button"
                  onClick={() => setSelectedCustomerId(String(customer.id))}
                  className={cn(
                    "relative flex w-full min-w-0 items-start gap-2 rounded-xl p-3 text-start transition-colors hover:bg-accent/50 sm:gap-3 sm:p-4",
                    selectedCustomerId === String(customer.id)
                      ? "border border-primary-dark bg-primary-container/20 dark:bg-[#231f1a]"
                      : "border border-transparent bg-muted/20 dark:bg-surface-container",
                  )}
                >
                  {selectedCustomerId === String(customer.id) && (
                    <span
                      className="absolute start-2.5 top-2.5 bottom-2.5 w-1.5 rounded-full bg-primary-dark"
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

        <div className="scrollbar-custom flex min-h-[280px] flex-col gap-4 overflow-auto border border-border rounded-lg bg-card p-4 sm:min-h-0 sm:p-6">
          {selectedCustomer ? (
            <>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 flex-1 items-start gap-3 sm:gap-4">
                  <div
                    className={cn(
                      "flex size-12 shrink-0 items-center justify-center rounded-full font-bold text-title-md sm:size-16 sm:text-title-lg",
                      INITIAL_COLORS[colorIndexFor(selectedCustomer)],
                    )}
                  >
                    {customerInitials(selectedCustomer)}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-headline-sm font-bold text-foreground">
                      {selectedCustomer.firstName} {selectedCustomer.lastName}
                    </h2>
                    <p className="mt-0.5 break-words text-body-md text-muted-foreground sm:text-body-lg">
                      {selectedCustomer.email.toLowerCase()}
                    </p>
                    <p className="mt-0.5 text-body-md text-muted-foreground">
                      {formatPhoneDisplay(selectedCustomer.phoneNumber)}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge
                        className={cn(
                          "border-0",
                          selectedCustomer.archived
                            ? "bg-muted text-muted-foreground"
                            : "bg-success-container text-success-onContainer",
                        )}
                      >
                        {selectedCustomer.archived ? t("archivedBadge") : t("activeBadge")}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <Button variant="outline" size="sm" asChild className="flex-1 sm:flex-initial">
                    <Link href={ROUTES.DASHBOARD.CUSTOMER_EDIT(String(selectedCustomer.id))}>
                      <Pencil className="size-4 shrink-0" />
                      {t("edit")}
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-error-main text-error-main hover:bg-error-container hover:text-error-main sm:flex-initial"
                    disabled={selectedCustomer.archived || customerMutationPending}
                    onClick={handleArchiveCustomer}
                  >
                    {archiveCustomer.isPending ? t("loading") : t("archive")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex flex-1 items-center justify-center gap-2 border-destructive/60 text-destructive hover:bg-destructive/10 hover:text-destructive sm:flex-initial"
                    disabled={customerMutationPending}
                    onClick={handleDeleteCustomer}
                  >
                    <Trash2 className="size-4 shrink-0" />
                    {deleteCustomer.isPending ? t("loading") : t("delete")}
                  </Button>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-muted/10 p-4 sm:p-5">
                <h3 className="mb-3 text-title-md font-semibold text-foreground">
                  {t("addressDetails")}
                </h3>
                <dl className="grid gap-2 text-body-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-muted-foreground">{t("addressRecordId")}</dt>
                    <dd className="font-medium text-foreground">{selectedCustomer.address.id}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">{t("uniqueCustomerId")}</dt>
                    <dd className="font-mono text-foreground">{selectedCustomer.dealerCustomerUniqueId}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-muted-foreground">{t("streetName")}</dt>
                    <dd className="font-medium text-foreground">{selectedCustomer.address.streetName}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">{t("streetNumber")}</dt>
                    <dd className="font-medium text-foreground">{selectedCustomer.address.streetNumber}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">{t("postalCode")}</dt>
                    <dd className="font-medium text-foreground">{selectedCustomer.address.postalCode}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">{t("city")}</dt>
                    <dd className="font-medium text-foreground">{selectedCustomer.address.city}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">{t("province")}</dt>
                    <dd className="font-medium text-foreground">{selectedCustomer.address.province}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">{t("country")}</dt>
                    <dd className="font-medium text-foreground">{selectedCustomer.address.country}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">{t("unitNumber")}</dt>
                    <dd className="font-medium text-foreground">
                      {selectedCustomer.address.unitNumber ?? "—"}
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-muted-foreground">{t("specialInstructions")}</dt>
                    <dd className="whitespace-pre-wrap text-foreground">
                      {selectedCustomer.address.specialInstructions?.trim() || "—"}
                    </dd>
                  </div>
                </dl>
              </div>

              <div>
                <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="text-title-md font-semibold text-foreground">{t("vehicles")}</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    className="shrink-0"
                    disabled={selectedCustomer.archived}
                    onClick={() => {
                      setVehicleToEdit(null);
                      setVehicleModalOpen(true);
                    }}
                  >
                    <Plus className="size-4" />
                    {t("addVehicle")}
                  </Button>
                </div>
                {vehiclesPending ? (
                  <p className="rounded-lg border border-border p-6 text-center text-body-md text-muted-foreground">
                    {t("loading")}
                  </p>
                ) : vehiclesError ? (
                  <div
                    className="flex flex-col items-stretch justify-between gap-2 rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-3 text-body-sm sm:flex-row sm:items-center"
                    role="alert"
                  >
                    <span>
                      {vehiclesErr instanceof Error ? vehiclesErr.message : t("errorLoadingVehicles")}
                    </span>
                    <Button type="button" variant="outline" size="sm" onClick={() => void refetchVehicles()}>
                      {t("retry")}
                    </Button>
                  </div>
                ) : customerVehicles.length > 0 ? (
                  <div className="scrollbar-custom overflow-x-auto rounded-lg border border-border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("makeBrand")}</TableHead>
                          <TableHead>{t("model")}</TableHead>
                          <TableHead>{t("year")}</TableHead>
                          <TableHead>{t("plateNumber")}</TableHead>
                          <TableHead>{t("vinNumber")}</TableHead>
                          <TableHead>{t("color")}</TableHead>
                          <TableHead>{t("odometerKm")}</TableHead>
                          <TableHead className="w-[88px]">{t("actions")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {customerVehicles.map((v) => (
                          <TableRow key={v.id}>
                            <TableCell className="max-w-[120px] truncate">{v.make}</TableCell>
                            <TableCell className="max-w-[120px] truncate">{v.model}</TableCell>
                            <TableCell>{v.year}</TableCell>
                            <TableCell className="font-mono text-label-md">{v.plateNumber}</TableCell>
                            <TableCell className="max-w-[140px] truncate font-mono text-label-md">
                              {v.vin}
                            </TableCell>
                            <TableCell>{v.color}</TableCell>
                            <TableCell>{v.odometerKm}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon-xs"
                                  className="text-muted-foreground hover:text-foreground"
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
                                  size="icon-xs"
                                  className="text-muted-foreground hover:text-error-main"
                                  disabled={selectedCustomer.archived || customerMutationPending}
                                  aria-label={t("delete")}
                                  onClick={() => handleDeleteVehicle(v.id)}
                                >
                                  <Trash2 className="size-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
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
  const t = useTranslations("customers");
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[200px] items-center justify-center text-body-md text-muted-foreground">
          {t("loading")}
        </div>
      }
    >
      <CustomersPageContent />
    </Suspense>
  );
}
