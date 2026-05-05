"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Ban, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PaginationControls } from "@/components/ui/pagination-controls";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { useDealerStaff } from "@/modules/staff/hooks/use-dealer-staff";
import { useDisableDealerStaff } from "@/modules/staff/hooks/use-disable-dealer-staff";
import { useDeleteDealerStaff } from "@/modules/staff/hooks/use-delete-dealer-staff";
import { AddStaffModal } from "@/modules/staff/components/add-staff-modal";
import type { DealerStaffMember } from "@/modules/staff/schemas/dealer-staff-page.schema";
import StyledTable from "@/modules/staff/components/styled-table";

const PAGE_SIZE = 10;
const DEFAULT_SORT = "createdAt" as const;
const DEFAULT_DIRECTION = "desc" as const;

function staffFullName(row: DealerStaffMember): string {
  const parts = [row.firstName?.trim(), row.lastName?.trim()].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : "—";
}

export default function StaffPage() {
  const t = useTranslations("staff");
  const [page, setPage] = useState(0);
  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const [staffToEdit, setStaffToEdit] = useState<DealerStaffMember | null>(null);

  const disableStaff = useDisableDealerStaff();
  const deleteStaff = useDeleteDealerStaff();

  const { data, isPending, isError, error, refetch, isPlaceholderData } = useDealerStaff({
    page,
    size: PAGE_SIZE,
    sortBy: DEFAULT_SORT,
    direction: DEFAULT_DIRECTION,
  });

  const totalPages = data?.totalPages ?? 0;
  const canPrev = page > 0 && !isPending;
  const canNext =
    data != null && !data.last && page < totalPages - 1 && !isPending;

  function handleDisable(row: DealerStaffMember) {
    if (typeof window !== "undefined" && !window.confirm(t("disableConfirm"))) return;
    disableStaff.mutate(row.id, {
      onSuccess: () => {
        toast.success(t("disableStaffSuccess"));
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : t("disableStaffError"));
      },
    });
  }

  function handleDelete(row: DealerStaffMember) {
    if (typeof window !== "undefined" && !window.confirm(t("deleteConfirm"))) return;
    deleteStaff.mutate(row.id, {
      onSuccess: () => {
        toast.success(t("deleteStaffSuccess"));
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
          <p className="mt-1 text-body-md text-muted-foreground">{t("intro")}</p>
        </div>
        <Button
          type="button"
          className="w-full shrink-0 bg-primary-dark text-primary-onContainer font-bold hover:bg-primary-dark/90 sm:w-auto"
          onClick={() => {
            setStaffToEdit(null);
            setStaffModalOpen(true);
          }}
        >
          <Plus className="me-2 size-4 shrink-0" />
          {t("addStaff")}
        </Button>
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
        <div
          className="flex shrink-0 flex-wrap items-center justify-between gap-2 rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-body-sm"
          role="alert"
        >
          <span>{error instanceof Error ? error.message : t("errorLoading")}</span>
          <Button type="button" variant="outline" size="sm" onClick={() => void refetch()}>
            {t("retry")}
          </Button>
        </div>
      ) : null}

      <StyledTable
        isLoading={isPlaceholderData}
        rows={data?.content ?? []}
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
                {row.username ?? "—"}
              </span>
            ),
          },
          { header: t("position"), render: (row: DealerStaffMember) => row.position ?? "—" },
          { header: t("role"), render: (row: DealerStaffMember) => <span className="font-mono text-sm">{row.role}</span> },
          {
            header: t("status"),
            render: (row: DealerStaffMember) => (
              <span className="inline-flex items-center rounded-full bg-emerald-600 px-3 py-1 text-white text-sm">
                {row.status}
              </span>
            ),
          },
          { header: t("accessLevel"), render: (row: DealerStaffMember) => <span className="font-mono text-sm">{row.accessLevel}</span> },
          {
            header: t("actions"),
            className: "min-w-[220px]",
            render: (row: DealerStaffMember) => (
              <div className="flex justify-center gap-2">
                {/* زر التعديل - أزرق لوجستي (Tertiary) */}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-[var(--radius-md)] border border-[var(--color-tertiary-main-light)] bg-transparent text-[var(--color-tertiary-main-light)] 
                            hover:bg-[var(--color-tertiary-main-dark)] hover:text-white hover:border-[var(--color-tertiary-main-dark)] 
                            transition-all duration-[var(--duration-normal)]"
                  aria-label={t("edit")}
                  onClick={() => {
                    setStaffToEdit(row);
                    setStaffModalOpen(true);
                  }}
                >
                  <Pencil className="size-4" />
                </Button>

                {/* زر التعطيل - برتقالي (Warning) */}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-[var(--radius-md)] border border-[var(--color-warning-main-light)] bg-transparent text-[var(--color-warning-main-light)] 
                            hover:bg-[var(--color-warning-main-dark)] hover:text-white hover:border-[var(--color-warning-main-dark)] 
                            transition-all duration-[var(--duration-normal)]"
                  aria-label={t("disable")}
                  disabled={disableStaff.isPending && disableStaff.variables === row.id}
                  onClick={() => handleDisable(row)}
                >
                  <Ban className="size-4" />
                </Button>

                {/* زر الحذف - أحمر (Error) */}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-[var(--radius-md)] border border-[var(--color-error-main)] bg-transparent text-[var(--color-error-main)] 
                            hover:bg-[var(--color-error-main)] hover:text-white hover:border-[var(--color-error-main)] 
                            transition-all duration-[var(--duration-normal)]"
                  aria-label={t("delete")}
                  disabled={deleteStaff.isPending && deleteStaff.variables === row.id}
                  onClick={() => handleDelete(row)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ),
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
    </div>
  );
}
