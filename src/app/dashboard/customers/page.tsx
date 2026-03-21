"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ROUTES } from "@/constants/routes";
import {
  Search,
  Download,
  Plus,
  Pencil,
  Trash2,
  Car,
  Archive,
  CircleDot,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  initials: string;
  vehicleCount: number;
  lastVisit: string;
  online: boolean;
  sinceYear: string;
};

type TireSet = {
  id: string;
  vehicle: string;
  season: "winter" | "summer";
  count: number;
  status: "inStorage" | "active";
  date: string;
};

const MOCK_CUSTOMERS: Customer[] = [
  {
    id: "1",
    name: "Ahmed Rashid",
    email: "ahmed.r@example.com",
    phone: "+966 50 123 4567",
    initials: "AR",
    vehicleCount: 3,
    lastVisit: "2025-03-15",
    online: true,
    sinceYear: "2021",
  },
  {
    id: "2",
    name: "Sarah Al-Mutairi",
    email: "sarah.m@example.com",
    phone: "+966 55 987 6543",
    initials: "SM",
    vehicleCount: 2,
    lastVisit: "2025-03-10",
    online: false,
    sinceYear: "2022",
  },
  {
    id: "3",
    name: "Mohammed Khalid",
    email: "m.khalid@example.com",
    phone: "+966 54 456 7890",
    initials: "MK",
    vehicleCount: 5,
    lastVisit: "2025-03-18",
    online: true,
    sinceYear: "2020",
  },
  {
    id: "4",
    name: "Fatima Hassan",
    email: "fatima.h@example.com",
    phone: "+966 53 321 0987",
    initials: "FH",
    vehicleCount: 1,
    lastVisit: "2025-02-28",
    online: false,
    sinceYear: "2023",
  },
  {
    id: "5",
    name: "Omar Al-Sayed",
    email: "omar.s@example.com",
    phone: "+966 56 654 3210",
    initials: "OS",
    vehicleCount: 4,
    lastVisit: "2025-03-20",
    online: true,
    sinceYear: "2019",
  },
];

const MOCK_TIRE_SETS: Record<string, TireSet[]> = {
  "1": [
    {
      id: "TS-001",
      vehicle: "BMW X5",
      season: "winter",
      count: 4,
      status: "inStorage",
      date: "2025-03-01",
    },
    {
      id: "TS-002",
      vehicle: "BMW X5",
      season: "summer",
      count: 4,
      status: "active",
      date: "2025-03-15",
    },
    {
      id: "TS-003",
      vehicle: "Toyota Camry",
      season: "winter",
      count: 4,
      status: "inStorage",
      date: "2025-02-20",
    },
  ],
  "2": [
    {
      id: "TS-004",
      vehicle: "Mercedes C-Class",
      season: "summer",
      count: 4,
      status: "active",
      date: "2025-03-10",
    },
  ],
  "3": [],
  "4": [],
  "5": [
    {
      id: "TS-005",
      vehicle: "Audi A6",
      season: "winter",
      count: 4,
      status: "inStorage",
      date: "2025-03-18",
    },
    {
      id: "TS-006",
      vehicle: "Audi A6",
      season: "summer",
      count: 4,
      status: "active",
      date: "2025-03-20",
    },
  ],
};

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

const INITIAL_COLORS = [
  "bg-primary-dark text-primary-onContainer",
  "bg-tertiary-dark text-tertiary-onContainer",
  "bg-success-dark text-success-onContainer",
  "bg-warning-dark text-warning-onContainer",
  "bg-info-main text-white",
];

export default function CustomersPage() {
  const t = useTranslations("customers");
  const tCommon = useTranslations("common");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    "1"
  );
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");
  const [searchQuery, setSearchQuery] = useState("");
  const [archiveModalOpen, setArchiveModalOpen] = useState(false);
  const [archiveReason, setArchiveReason] = useState<string>("");

  const selectedCustomer = MOCK_CUSTOMERS.find(
    (c) => c.id === selectedCustomerId
  );
  const tireSets = selectedCustomerId
    ? MOCK_TIRE_SETS[selectedCustomerId] ?? []
    : [];

  const handleImportExcel = () => {
    // Placeholder for API
  };



  const handleEdit = () => {
    // Placeholder for API
  };

  const openArchiveModal = () => setArchiveModalOpen(true);
  const closeArchiveModal = () => {
    setArchiveModalOpen(false);
    setArchiveReason("");
  };
  const handleArchiveConfirm = () => {
    // TODO: API integration
    closeArchiveModal();
  };

  return (
    <div className="flex min-w-0 flex-col h-full gap-4 overflow-hidden">
      {/* Header */}
      <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <h1 className="text-headline-sm font-bold text-foreground">
          {t("title")}
        </h1>
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

      {/* Search & Filters */}
      <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:flex-nowrap sm:items-center sm:gap-2">
        <div className="relative w-full min-w-0 sm:flex-1">
          <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("search")}
            className="h-10 w-full ps-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex w-full gap-2 sm:w-auto sm:shrink-0">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-10 flex-1 sm:w-[130px] sm:flex-initial">
              <SelectValue placeholder={t("status")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("all")}</SelectItem>
              <SelectItem value="active">{t("active")}</SelectItem>
              <SelectItem value="inactive">{t("inactive")}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="h-10 flex-1 sm:w-[130px] sm:flex-initial">
              <SelectValue placeholder={t("sort")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">{t("sortByName")}</SelectItem>
              <SelectItem value="lastVisit">{t("sortByLastVisit")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Split Panels */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-hidden lg:grid-cols-[minmax(280px,1fr)_minmax(400px,2fr)]">
        {/* Left Panel - Customer List */}
        <div className="flex min-h-[200px] flex-col gap-2 overflow-hidden rounded-lg bg-card p-2 sm:min-h-0">
          <div className="scrollbar-custom overflow-auto space-y-3">
            {MOCK_CUSTOMERS.map((customer, idx) => (
              <button
                key={customer.id}
                type="button"
                onClick={() => setSelectedCustomerId(customer.id)}
                className={cn(
                  "relative flex w-full min-w-0 items-start gap-2 rounded-xl p-3 text-start transition-colors hover:bg-accent/50 sm:gap-3 sm:p-4",
                  selectedCustomerId === customer.id
                    ? "border border-primary-dark bg-primary-container/20 dark:bg-[#231f1a]"
                    : "border border-transparent bg-muted/20 dark:bg-surface-container"
                )}
              >
                {selectedCustomerId === customer.id && (
                  <span
                    className="absolute start-2.5 top-2.5 bottom-2.5 w-1.5 rounded-full bg-primary-dark"
                    aria-hidden
                  />
                )}
                <div
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-full font-semibold text-label-md sm:size-10",
                    INITIAL_COLORS[idx % INITIAL_COLORS.length]
                  )}
                >
                  {customer.initials}
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="truncate font-bold text-foreground">
                    {customer.name}
                  </p>
                  <p className="truncate text-body-md text-muted-foreground">
                    {customer.email}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
                    <Badge className="flex w-fit max-w-full shrink-0 items-center gap-1.5 rounded-full border-0 bg-primary-dark/25 px-2 py-0.5 text-label-sm text-primary-dark">
                      <Car className="size-2.5 shrink-0" strokeWidth={2} />
                      <span className="truncate">{customer.vehicleCount} {t("vehicles")}</span>
                    </Badge>
                    <span className="shrink-0 text-label-sm text-muted-foreground">
                      {t("lastVisit")} {customer.lastVisit}
                    </span>
                  </div>
                </div>
                <span
                  className={cn(
                    "absolute end-3 top-3 size-2.5 rounded-full",
                    customer.online ? "bg-success-dark" : "bg-muted-foreground"
                  )}
                  aria-hidden
                />
              </button>
            ))}
          </div>
        </div>

        {/* Right Panel - Customer Details */}
        <div className="scrollbar-custom flex min-h-[280px] flex-col gap-4 overflow-auto border border-border rounded-lg bg-card p-4 sm:min-h-0 sm:p-6">
          {selectedCustomer ? (
            <>
              {/* Detail Header */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 flex-1 items-start gap-3 sm:gap-4">
                  <div
                    className={cn(
                      "flex size-12 shrink-0 items-center justify-center rounded-full font-bold text-title-md sm:size-16 sm:text-title-lg",
                      INITIAL_COLORS[
                        MOCK_CUSTOMERS.findIndex((c) => c.id === selectedCustomer.id) %
                          INITIAL_COLORS.length
                      ]
                    )}
                  >
                    {selectedCustomer.initials}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-headline-sm font-bold text-foreground">
                      {selectedCustomer.name}
                    </h2>
                    <p className="mt-0.5 truncate text-body-md text-muted-foreground sm:text-body-lg">
                      {selectedCustomer.email.toLowerCase()}{" · "}
                      {formatPhoneDisplay(selectedCustomer.phone)}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge className="bg-success-container text-success-onContainer border-0">
                        {t("returningCustomer")}
                      </Badge>
                      <Badge variant="outline">
                        {t("since")} {selectedCustomer.sinceYear}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <Button variant="outline" size="sm" asChild className="flex-1 sm:flex-initial">
                    <Link href={ROUTES.DASHBOARD.CUSTOMER_EDIT(selectedCustomer.id)}>
                      <Pencil className="size-4 shrink-0" />
                      {t("edit")}
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-error-main text-error-main hover:bg-error-container hover:text-error-main sm:flex-initial"
                    onClick={openArchiveModal}
                  >
                    {t("archive")}
                  </Button>
                </div>
              </div>

              {/* Vehicles Section */}
              <div className="rounded-lg border-2 border-dashed border-border border-surface-container p-4 sm:p-6">
                <div className="flex flex-col items-center justify-center gap-3 text-center sm:flex-row sm:justify-between sm:text-start">
                  <p className="text-body-md text-muted-foreground">
                    {t("noVehicles")}
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link
                      href={ROUTES.DASHBOARD.CUSTOMER_ADD_VEHICLE(selectedCustomer.id)}
                    >
                      <Plus className="size-4" />
                      {t("addVehicle")}
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Tire Sets Table */}
              <div>
                <h3 className="mb-3 text-title-md font-semibold text-foreground">
                  {t("tireSets")}
                </h3>
                {tireSets.length > 0 ? (
                  <div className="scrollbar-custom overflow-x-auto rounded-lg border border-border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("setId")}</TableHead>
                          <TableHead>{t("vehicle")}</TableHead>
                          <TableHead>{t("season")}</TableHead>
                          <TableHead>{t("count")}</TableHead>
                          <TableHead>{t("status")}</TableHead>
                          <TableHead>{t("date")}</TableHead>
                          <TableHead className="w-[80px]">
                            {t("actions")}
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tireSets.map((set) => (
                          <TableRow key={set.id}>
                            <TableCell className="font-mono text-label-md">
                              {set.id}
                            </TableCell>
                            <TableCell>{set.vehicle}</TableCell>
                            <TableCell>
                              {set.season === "winter"
                                ? t("winter")
                                : t("summer")}
                            </TableCell>
                            <TableCell>{set.count}</TableCell>
                            <TableCell>
                              <Badge
                                className={cn(
                                  "border-0",
                                  set.status === "inStorage"
                                    ? "bg-tertiary-container text-tertiary-onContainer"
                                    : "bg-success-container text-success-onContainer"
                                )}
                              >
                                {set.status === "inStorage"
                                  ? t("inStorage")
                                  : t("active")}
                              </Badge>
                            </TableCell>
                            <TableCell>{set.date}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon-xs"
                                  className="text-muted-foreground hover:text-foreground"
                                  onClick={handleEdit}
                                >
                                  <Pencil className="size-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon-xs"
                                  className="text-muted-foreground hover:text-error-main"
                                  onClick={openArchiveModal}
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
                  <div className="rounded-lg border border-border p-6 text-center text-body-md text-muted-foreground">
                    {t("noTireSets")}
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

      {/* Archive Customer Modal */}
      <Dialog open={archiveModalOpen} onOpenChange={setArchiveModalOpen}>
        <DialogContent className="!left-4 !right-4 !top-1/2 !-translate-y-1/2 translate-x-0 max-h-[90dvh] w-[calc(100vw-2rem)] max-w-md gap-4 overflow-y-auto border border-border bg-surface-light p-4 shadow-xl dark:bg-surface-default sm:!left-1/2 sm:!right-auto sm:!top-1/2 sm:!-translate-x-1/2 sm:!-translate-y-1/2 sm:max-w-lg sm:gap-6 sm:p-6 [&>button]:hidden">
          <DialogHeader className="flex flex-col items-center text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-error-main/20">
              <Archive className="size-7 text-error-main" />
            </div>
            <DialogTitle className="text-xl font-bold">
              {t("archiveCustomer")}
            </DialogTitle>
            <DialogDescription>
              {t("archiveConfirmSubtitle")}
            </DialogDescription>
          </DialogHeader>

          {selectedCustomer && (
            <div className="space-y-4">
              {/* Selected Customer Card */}
              <div className="flex min-w-0 items-center gap-3 rounded-lg border border-border bg-surface-container/50 p-3 sm:gap-4 sm:p-4">
                <div
                  className={cn(
                    "flex size-12 shrink-0 items-center justify-center rounded-full font-semibold text-label-md",
                    INITIAL_COLORS[
                      MOCK_CUSTOMERS.findIndex((c) => c.id === selectedCustomer.id) %
                        INITIAL_COLORS.length
                    ]
                  )}
                >
                  {selectedCustomer.initials}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-foreground">
                    {selectedCustomer.name}
                  </p>
                  <p className="text-body-md text-muted-foreground">
                    {selectedCustomer.email.toLowerCase()}
                  </p>
                </div>
              </div>

              {/* Warning Alert */}
              <div className="flex gap-3 rounded-lg border border-warning-dark/50 bg-warning-container/30 p-4">
                <AlertTriangle className="size-5 shrink-0 text-warning-dark" />
                <p className="text-body-md text-foreground">
                  {t("archiveWarning")}
                </p>
              </div>

              {/* Impact Summary */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
                  <Car className="size-5 shrink-0 text-primary-dark" />
                  <div>
                    <p className="font-semibold text-foreground">
                      {selectedCustomer.vehicleCount} {t("vehicles")}
                    </p>
                    <p className="text-label-sm text-muted-foreground">
                      {t("vehiclesWillBeArchived")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
                  <CircleDot className="size-5 shrink-0 text-primary-dark" />
                  <div>
                    <p className="font-semibold text-foreground">
                      {tireSets.length} {t("tireSets")}
                    </p>
                    <p className="text-label-sm text-muted-foreground">
                      {t("tireSetsAffected")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Reason Select */}
              <div className="space-y-2">
                <label
                  htmlFor="archive-reason"
                  className="text-label-md font-medium text-foreground"
                >
                  {t("reasonForArchiving")}
                </label>
                <Select
                  value={archiveReason}
                  onValueChange={setArchiveReason}
                  name="archiveReason"
                >
                  <SelectTrigger id="archive-reason">
                    <SelectValue placeholder={t("selectReason")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="noLongerActive">
                      {t("archiveReasons.noLongerActive")}
                    </SelectItem>
                    <SelectItem value="customerRequest">
                      {t("archiveReasons.customerRequest")}
                    </SelectItem>
                    <SelectItem value="duplicate">
                      {t("archiveReasons.duplicate")}
                    </SelectItem>
                    <SelectItem value="other">
                      {t("archiveReasons.other")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter className="flex justify-end gap-2 sm:justify-end">
            <Button variant="outline" onClick={closeArchiveModal}>
              {tCommon("cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleArchiveConfirm}
              disabled={!archiveReason}
            >
              {t("archiveCustomer")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
