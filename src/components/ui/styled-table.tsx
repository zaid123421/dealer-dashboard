"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useScrollbarDetection } from "@/hooks/use-scrollbar-detection";

type Column<T> = {
  header: React.ReactNode;
  render: (row: T) => React.ReactNode;
  className?: string;
  align?: "left" | "center" | "right";
};

interface StyledTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  keyProp: (row: T) => number | string;
  isLoading?: boolean;
  emptyText?: string;
}

export function StyledTable<T>({
  columns,
  rows,
  keyProp,
  isLoading = false,
  emptyText = "No items",
}: StyledTableProps<T>) {
  const borderColor = "border-[var(--color-surface-light-container)] dark:border-[var(--color-surface-container-high)]";
  const containerRef = useScrollbarDetection();

  return (
    <div 
      ref={containerRef}
      className={`min-h-0 flex-1 overflow-auto scrollbar-custom rounded-[var(--radius-xl)] border-2 ${borderColor} bg-card ${isLoading ? "opacity-70" : ""}`}
    >
      <Table className="w-full border-separate border-spacing-0">
        <TableHeader>
          <TableRow className="bg-[var(--color-surface-light-container)] dark:bg-[var(--color-surface-container-high)]">
            {columns.map((col, idx) => (
              <TableHead
                key={idx}
                className={`${col.className ?? ""} ${
                  col.align === "right" ? "text-right" : 
                  col.align === "left" ? "text-left" : "text-center"
                } text-foreground text-body-sm font-semibold tracking-wide py-3 px-4 border-b-2 ${borderColor}`}
              >
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-body-md text-muted-foreground h-32 text-center border-b-2 ${borderColor}">
                Loading...
              </TableCell>
            </TableRow>
          ) : rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-body-md text-muted-foreground h-32 text-center border-b-2 ${borderColor}">
                {emptyText}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow 
                key={String(keyProp(row))} 
                className="hover:bg-[var(--color-surface-light)] dark:hover:bg-[var(--color-surface-bright)]/10 transition-colors"
              >
                {columns.map((col, ci) => (
                  <TableCell 
                    key={ci} 
                    className={`${col.className ?? ""} ${
                      col.align === "right" ? "text-right" : 
                      col.align === "left" ? "text-left" : "text-center"
                    } text-foreground py-3 px-4 align-middle border-b-2 ${borderColor} text-sm`}
                  > 
                    {col.render(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export default StyledTable;
