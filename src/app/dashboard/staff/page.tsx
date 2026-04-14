"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Ban, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { useDealerStaff } from "@/modules/staff/hooks/use-dealer-staff";
import { useDisableDealerStaff } from "@/modules/staff/hooks/use-disable-dealer-staff";
import { useDeleteDealerStaff } from "@/modules/staff/hooks/use-delete-dealer-staff";
import { AddStaffModal } from "@/modules/staff/components/add-staff-modal";
import type { DealerStaffMember } from "@/modules/staff/schemas/dealer-staff-page.schema";

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

      <div
        className={`min-h-0 overflow-auto rounded-lg border border-border bg-card ${isPlaceholderData ? "opacity-70" : ""}`}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("name")}</TableHead>
              <TableHead>{t("username")}</TableHead>
              <TableHead>{t("position")}</TableHead>
              <TableHead>{t("role")}</TableHead>
              <TableHead>{t("status")}</TableHead>
              <TableHead>{t("accessLevel")}</TableHead>
              <TableHead className="min-w-[220px] text-end">{t("actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending && !data ? (
              <TableRow>
                <TableCell colSpan={7} className="text-body-md text-muted-foreground">
                  {t("loading")}
                </TableCell>
              </TableRow>
            ) : !data?.content.length ? (
              <TableRow>
                <TableCell colSpan={7} className="text-body-md text-muted-foreground">
                  {t("noStaff")}
                </TableCell>
              </TableRow>
            ) : (
              data.content.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{staffFullName(row)}</TableCell>
                  <TableCell className="max-w-[140px] truncate font-mono text-sm" title={row.username ?? undefined}>
                    {row.username ?? "—"}
                  </TableCell>
                  <TableCell>{row.position ?? "—"}</TableCell>
                  <TableCell className="font-mono text-sm">{row.role}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-normal">
                      {row.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{row.accessLevel}</TableCell>
                  <TableCell className="text-end">
                    <div className="flex justify-end gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        aria-label={t("edit")}
                        onClick={() => {
                          setStaffToEdit(row);
                          setStaffModalOpen(true);
                        }}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8 text-destructive hover:text-destructive"
                        aria-label={t("disable")}
                        disabled={disableStaff.isPending && disableStaff.variables === row.id}
                        onClick={() => handleDisable(row)}
                      >
                        <Ban className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8 text-destructive hover:text-destructive"
                        aria-label={t("delete")}
                        disabled={deleteStaff.isPending && deleteStaff.variables === row.id}
                        onClick={() => handleDelete(row)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {data != null && totalPages > 0 ? (
        <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
          <p className="text-body-sm text-muted-foreground">
            {t("pageInfo", { current: page + 1, total: totalPages })}
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!canPrev}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              {t("paginationPrev")}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!canNext}
              onClick={() => setPage((p) => p + 1)}
            >
              {t("paginationNext")}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
