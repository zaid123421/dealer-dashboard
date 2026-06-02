"use client";

import React, { Fragment } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useScrollbarDetection } from "@/hooks/use-scrollbar-detection";

type Column<T> = {
  header: React.ReactNode;
  render: (row: T) => React.ReactNode;
  className?: string;
  align?: "left" | "center" | "right";
};

export type StyledTableDetailRowProps<T> = {
  isExpanded: (row: T) => boolean;
  render: (row: T) => React.ReactNode;
};

interface StyledTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  keyProp: (row: T) => number | string;
  isLoading?: boolean;
  emptyText?: string;
  footer?: React.ReactNode;
  detailRow?: StyledTableDetailRowProps<T>;
}

export function StyledTable<T>({
  columns,
  rows,
  keyProp,
  isLoading = false,
  emptyText = "No items",
  footer,
  detailRow,
}: StyledTableProps<T>) {
  const borderColor =
    "border-[var(--color-surface-light-container)] dark:border-[var(--color-surface-container-high)]";
  const containerRef = useScrollbarDetection();

  return (
    <div
      ref={containerRef}
      className={`min-h-0 flex-1 overflow-auto scrollbar-custom rounded-lg border-2 ${borderColor} bg-card ${isLoading ? "opacity-70" : ""}`}
    >
      <Table className="w-full caption-bottom border-separate border-spacing-0">
        <TableHeader>
          <TableRow className="bg-[var(--color-surface-light-container)] dark:bg-[var(--color-surface-container-high)]">
            {columns.map((col, idx) => (
              <TableHead
                key={idx}
                className={cn(
                  col.className ?? "",
                  col.align === "right"
                    ? "text-right"
                    : col.align === "left"
                    ? "text-left"
                    : "text-center",
                  "text-foreground text-body-sm font-semibold tracking-wide py-3 px-4 border-b-2",
                  borderColor,
                )}
              >
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading && rows.length === 0 ? (
            <>
              {Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i} className="hover:bg-transparent">
                  {columns.map((col, ci) => (
                    <TableCell
                      key={ci}
                      className={cn(
                        "px-4 py-3.5",
                        col.align === "center" ? "text-center" : col.align === "right" ? "text-right" : "text-left",
                        i < 5 ? `border-b-2 ${borderColor}` : "",
                      )}
                    >
                      <Skeleton
                        className={cn(
                          "h-4 rounded-md",
                          col.align === "center" ? "mx-auto w-[60%]" : "w-full",
                          ci === 0 ? "w-[75%]" : "",
                        )}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </>
          ) : rows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-32 text-center text-body-md text-muted-foreground"
              >
                {emptyText}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row, rowIndex) => {
              const expanded = Boolean(detailRow?.isExpanded(row));
              const isLast = rowIndex === rows.length - 1;

              /*
               * Border logic:
               *  collapsed → main-row gets the separator
               *  expanded  → detail-row gets the separator (seamless join between main & detail)
               */
              const detailMode = Boolean(detailRow);
              /* Separator between logical rows: when expand/collapse exists, keep the bottom
               * border on the detail row cell only so it doesn't snap while the collapse animates. */
              const mainCellBorder =
                detailMode || expanded || isLast ? "" : `border-b-2 ${borderColor}`;
              const detailCellBorder =
                detailMode && !isLast ? `border-b-2 ${borderColor}` : "";

              return (
                <Fragment key={String(keyProp(row))}>
                  {/* ── main row ── */}
                  <TableRow className="transition-colors hover:bg-[var(--color-surface-light)] dark:hover:bg-[var(--color-surface-bright)]/10">
                    {columns.map((col, ci) => (
                      <TableCell
                        key={ci}
                        className={cn(
                          col.className ?? "",
                          col.align === "right"
                            ? "text-right"
                            : col.align === "left"
                            ? "text-left"
                            : "text-center",
                          "text-foreground py-3 px-4 align-middle text-sm",
                          mainCellBorder,
                          /* yellow left accent on the first cell of an expanded row */
                          ci === 0 && expanded
                            ? "border-l-[3px] border-l-warning-dark"
                            : "",
                        )}
                      >
                        {col.render(row)}
                      </TableCell>
                    ))}
                  </TableRow>

                  {/* ── detail row (always rendered, animated) ── */}
                  {detailRow ? (
                    <TableRow className="hover:bg-transparent">
                      <TableCell
                        colSpan={columns.length}
                        className={cn(
                          "p-0 align-top",
                          detailCellBorder,
                          expanded
                            ? "bg-[var(--color-surface-light-container)]/80 dark:bg-[var(--color-surface-container-high)]/40"
                            : "",
                        )}
                      >
                        {/* Height-only collapse: avoids opacity vs max-height "two-phase" close */}
                        <div
                          className={cn(
                            "grid overflow-hidden transition-[grid-template-rows] duration-300 ease-out",
                            expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                          )}
                        >
                          <div className="min-h-0 overflow-hidden">
                            {detailRow.render(row)}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : null}
                </Fragment>
              );
            })
          )}
        </TableBody>

        {footer != null ? (
          <TableFooter
            className={cn(
              "border-t-2 bg-[var(--color-surface-light-container)]/80 font-medium dark:bg-[var(--color-surface-container-high)]/40",
              borderColor,
              "[&>tr]:border-0 hover:[&>tr]:bg-transparent",
            )}
          >
            <TableRow className="border-0 hover:bg-transparent">
              <TableCell
                colSpan={columns.length}
                className="border-0 px-4 py-3 text-body-sm"
              >
                {footer}
              </TableCell>
            </TableRow>
          </TableFooter>
        ) : null}
      </Table>
    </div>
  );
}

export default StyledTable;
