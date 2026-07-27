"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Ban, CheckCircle2, Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { ErrorAlert } from "@/components/ui/error-alert";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import {
  ConfirmDialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/app-dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PRIMARY_BUTTON_RESPONSIVE } from "@/lib/primary-button-styles";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { DealerQuotaPanel } from "@/modules/dealer/components/dealer-quota-panel";
import { useDealerQuota } from "@/modules/dealer/hooks/use-dealer-quota";
import { useDealerStaff } from "@/modules/staff/hooks/use-dealer-staff";
import { useDisableDealerStaff } from "@/modules/staff/hooks/use-disable-dealer-staff";
import { useReactivateDealerStaff } from "@/modules/staff/hooks/use-reactivate-dealer-staff";
import { useDeleteDealerStaff } from "@/modules/staff/hooks/use-delete-dealer-staff";
import { AddStaffModal } from "@/modules/staff/components/add-staff-modal";
import type { DealerStaffMember } from "@/modules/staff/schemas/dealer-staff-page.schema";
import StyledTable from "@/modules/staff/components/styled-table";

const PAGE_SIZE = 10;
const DEFAULT_SORT = "createdAt" as const;
const DEFAULT_DIRECTION = "desc" as const;

type StatusFilter = "all" | string;
type RoleFilter = "all" | string;

function staffFullName(row: DealerStaffMember): string {
  const parts = [row.firstName?.trim(), row.lastName?.trim()].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : "—";
}

function isStaffDisabled(status: string | null | undefined): boolean {
  const s = (status ?? "").trim().toUpperCase();
  return s === "INACTIVE" || s === "DISABLED" || s === "DEACTIVATED";
}

export default function StaffPage() {
  const t = useTranslations("staff");
  const tCommon = useTranslations("common");
  const { canAddStaff, isViewOnly } = useDealerQuota();
  const [page, setPage] = useState(0);
  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const [staffToEdit, setStaffToEdit] = useState<DealerStaffMember | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [disableTarget, setDisableTarget] = useState<DealerStaffMember | null>(null);
  const [enableTarget, setEnableTarget] = useState<DealerStaffMember | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DealerStaffMember | null>(null);

  const disableStaff = useDisableDealerStaff();
  const reactivateStaff = useReactivateDealerStaff();
  const deleteStaff = useDeleteDealerStaff();

  const { data, isPending, isError, error, refetch, isPlaceholderData } = useDealerStaff({
    page,
    size: PAGE_SIZE,
    sortBy: DEFAULT_SORT,
    direction: DEFAULT_DIRECTION,
  });

  const rows = useMemo(() => data?.content ?? [], [data?.content]);

  const roleOptions = useMemo(() => {
    const roles = new Set<string>();
    for (const row of rows) {
      if (row.role?.trim()) roles.add(row.role.trim());
    }
    return Array.from(roles).sort();
  }, [rows]);

  const statusOptions = useMemo(() => {
    const statuses = new Set<string>();
    for (const row of rows) {
      if (row.status?.trim()) statuses.add(row.status.trim());
    }
    return Array.from(statuses).sort();
  }, [rows]);

  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return rows.filter((row) => {
      if (statusFilter !== "all" && row.status !== statusFilter) return false;
      if (roleFilter !== "all" && row.role !== roleFilter) return false;
      if (!q) return true;
      const hay = [
        staffFullName(row),
        row.email,
        row.username,
        row.position,
        row.role,
        row.accessLevel,
        row.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [rows, searchQuery, statusFilter, roleFilter]);

  const totalPages = data?.totalPages ?? 0;
  const canPrev = page > 0 && !isPending;
  const canNext =
    data != null && !data.last && page < totalPages - 1 && !isPending;
  const canAddNewStaff = canAddStaff() && !isViewOnly;

  function confirmDisable() {
    if (!disableTarget) return;
    disableStaff.mutate(disableTarget.id, {
      onSuccess: () => {
        toast.success(t("disableStaffSuccess"));
        setDisableTarget(null);
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : t("disableStaffError"));
      },
    });
  }

  function confirmEnable() {
    if (!enableTarget) return;
    reactivateStaff.mutate(enableTarget.id, {
      onSuccess: () => {
        toast.success(t("enableStaffSuccess"));
        setEnableTarget(null);
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : t("enableStaffError"));
      },
    });
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    deleteStaff.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success(t("deleteStaffSuccess"));
        setDeleteTarget(null);
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : t("deleteStaffError"));
      },
    });
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-headline-sm font-bold text-foreground">{t("title")}</h1>
          <p className="mt-1 text-body-md text-subtle">{t("intro")}</p>
        </div>
        <Button
          type="button"
          variant="brand"
          className={`shrink-0 ${PRIMARY_BUTTON_RESPONSIVE}`}
          disabled={!canAddNewStaff}
          onClick={() => {
            setStaffToEdit(null);
            setStaffModalOpen(true);
          }}
        >
          <Plus className="me-2 size-4 shrink-0" />
          {t("addStaff")}
        </Button>
      </div>

      <DealerQuotaPanel filter="staff" showRoles variant="full" />

      <div className="flex shrink-0 flex-col gap-3 py-1 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="relative min-w-0 flex-1 sm:min-w-[220px]">
          <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t("searchPlaceholder")}
            className="w-full ps-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label={t("searchPlaceholder")}
          />
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <span className="text-label-sm font-medium text-muted-foreground sm:me-1">
            {t("status")}
          </span>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("filterAllStatus")}</SelectItem>
              {statusOptions.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <span className="text-label-sm font-medium text-muted-foreground sm:me-1">
            {t("role")}
          </span>
          <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v)}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("filterAllRoles")}</SelectItem>
              {roleOptions.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <p className="w-full text-end text-body-md text-muted-foreground sm:ms-auto sm:w-auto">
          {t("showingCount", { count: filteredRows.length })}
        </p>
      </div>

      <AddStaffModal
        open={staffModalOpen}
        onOpenChange={(open) => {
          setStaffModalOpen(open);
          if (!open) setStaffToEdit(null);
        }}
        staffToEdit={staffToEdit}
      />

      {isError ? (
        <ErrorAlert
          message={error instanceof Error ? error.message : t("errorLoading")}
          onRetry={() => void refetch()}
          retryLabel={t("retry")}
          className="shrink-0"
        />
      ) : null}

      <StyledTable
        isLoading={isPlaceholderData}
        rows={filteredRows}
        keyProp={(r) => r.id}
        emptyText={t("noStaff")}
        columns={[
          {
            header: t("name"),
            render: (row: DealerStaffMember) => <span className="font-medium">{staffFullName(row)}</span>,
          },
          {
            header: t("email"),
            render: (row: DealerStaffMember) => (
              <span className="max-w-[140px] truncate font-mono text-sm" title={row.email ?? undefined}>
                {row.email ?? row.username ?? "—"}
              </span>
            ),
          },
          { header: t("position"), render: (row: DealerStaffMember) => row.position ?? "—" },
          { header: t("role"), render: (row: DealerStaffMember) => <span className="font-mono text-sm">{row.role}</span> },
          {
            header: t("status"),
            render: (row: DealerStaffMember) => {
              const disabled = isStaffDisabled(row.status);
              return (
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-3 py-1 text-sm text-white",
                    disabled ? "bg-gray-500" : "bg-emerald-600",
                  )}
                >
                  {row.status}
                </span>
              );
            },
          },
          { header: t("accessLevel"), render: (row: DealerStaffMember) => <span className="font-mono text-sm">{row.accessLevel}</span> },
          {
            header: t("actions"),
            className: "min-w-[220px]",
            render: (row: DealerStaffMember) => {
              const disabled = isStaffDisabled(row.status);
              return (
              <div className="flex justify-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-md border border-[var(--color-tertiary-main-light)] bg-transparent text-[var(--color-tertiary-main-light)] 
                            hover:bg-[var(--color-tertiary-main-dark)] hover:text-white hover:border-[var(--color-tertiary-main-dark)] 
                            transition-all duration-[var(--duration-normal)]"
                  aria-label={t("edit")}
                  disabled={isViewOnly}
                  onClick={() => {
                    setStaffToEdit(row);
                    setStaffModalOpen(true);
                  }}
                >
                  <Pencil className="size-4" />
                </Button>

                {disabled ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-md border border-[var(--color-success-main-light)] bg-transparent text-[var(--color-success-main-light)] 
                              hover:bg-[var(--color-success-main-dark)] hover:text-white hover:border-[var(--color-success-main-dark)] 
                              transition-all duration-[var(--duration-normal)]"
                    aria-label={t("enable")}
                    disabled={isViewOnly || (reactivateStaff.isPending && reactivateStaff.variables === row.id)}
                    onClick={() => setEnableTarget(row)}
                  >
                    <CheckCircle2 className="size-4" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-md border border-[var(--color-warning-main-light)] bg-transparent text-[var(--color-warning-main-light)] 
                              hover:bg-[var(--color-warning-main-dark)] hover:text-white hover:border-[var(--color-warning-main-dark)] 
                              transition-all duration-[var(--duration-normal)]"
                    aria-label={t("disable")}
                    disabled={isViewOnly || (disableStaff.isPending && disableStaff.variables === row.id)}
                    onClick={() => setDisableTarget(row)}
                  >
                    <Ban className="size-4" />
                  </Button>
                )}

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-md border border-[var(--color-error-main)] bg-transparent text-[var(--color-error-main)] 
                            hover:bg-[var(--color-error-main)] hover:text-white hover:border-[var(--color-error-main)] 
                            transition-all duration-[var(--duration-normal)]"
                  aria-label={t("delete")}
                  disabled={isViewOnly || (deleteStaff.isPending && deleteStaff.variables === row.id)}
                  onClick={() => setDeleteTarget(row)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
              );
            },
          },
        ]}
      />

      {data != null && totalPages > 0 ? (
        <PaginationControls
          canPrevious={canPrev}
          canNext={canNext}
          previousLabel={t("paginationPrev")}
          nextLabel={t("paginationNext")}
          pageLabel={t("pageInfo", { current: page + 1, total: totalPages })}
          pageText={t("pageCompact", { current: page + 1, total: totalPages })}
          onPrevious={() => setPage((p) => Math.max(0, p - 1))}
          onNext={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
        />
      ) : null}

      <Dialog open={disableTarget != null} onOpenChange={(open) => !open && setDisableTarget(null)}>
        <ConfirmDialogContent>
          <div className="space-y-2 text-start">
            <DialogTitle className="text-lg font-semibold leading-tight text-foreground">
              {t("disable")}
            </DialogTitle>
            <DialogDescription className="text-body-sm leading-relaxed text-muted-foreground">
              {t("disableConfirm")}
            </DialogDescription>
          </div>
          <DialogFooter className="mt-6 flex-col-reverse gap-2 sm:flex-row sm:justify-end [&>button]:w-full sm:[&>button]:w-auto">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDisableTarget(null)}
              disabled={disableStaff.isPending}
            >
              {tCommon("cancel")}
            </Button>
            <Button
              type="button"
              variant="brand"
              disabled={disableStaff.isPending}
              onClick={confirmDisable}
            >
              {disableStaff.isPending ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  {t("loading")}
                </span>
              ) : (
                t("disable")
              )}
            </Button>
          </DialogFooter>
        </ConfirmDialogContent>
      </Dialog>

      <Dialog open={enableTarget != null} onOpenChange={(open) => !open && setEnableTarget(null)}>
        <ConfirmDialogContent>
          <div className="space-y-2 text-start">
            <DialogTitle className="text-lg font-semibold leading-tight text-foreground">
              {t("enable")}
            </DialogTitle>
            <DialogDescription className="text-body-sm leading-relaxed text-muted-foreground">
              {t("enableConfirm")}
            </DialogDescription>
          </div>
          <DialogFooter className="mt-6 flex-col-reverse gap-2 sm:flex-row sm:justify-end [&>button]:w-full sm:[&>button]:w-auto">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEnableTarget(null)}
              disabled={reactivateStaff.isPending}
            >
              {tCommon("cancel")}
            </Button>
            <Button
              type="button"
              variant="brand"
              disabled={reactivateStaff.isPending}
              onClick={confirmEnable}
            >
              {reactivateStaff.isPending ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  {t("loading")}
                </span>
              ) : (
                t("enable")
              )}
            </Button>
          </DialogFooter>
        </ConfirmDialogContent>
      </Dialog>

      <Dialog open={deleteTarget != null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <ConfirmDialogContent>
          <div className="space-y-2 text-start">
            <DialogTitle className="text-lg font-semibold leading-tight text-foreground">
              {t("delete")}
            </DialogTitle>
            <DialogDescription className="text-body-sm leading-relaxed text-muted-foreground">
              {t("deleteConfirm")}
            </DialogDescription>
          </div>
          <DialogFooter className="mt-6 flex-col-reverse gap-2 sm:flex-row sm:justify-end [&>button]:w-full sm:[&>button]:w-auto">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={deleteStaff.isPending}
            >
              {tCommon("cancel")}
            </Button>
            <Button
              type="button"
              className="border-0 bg-[var(--color-error-main)] font-semibold text-white shadow-none hover:bg-[var(--color-error-main)]/90"
              disabled={deleteStaff.isPending}
              onClick={confirmDelete}
            >
              {deleteStaff.isPending ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  {t("loading")}
                </span>
              ) : (
                t("delete")
              )}
            </Button>
          </DialogFooter>
        </ConfirmDialogContent>
      </Dialog>
    </div>
  );
}
