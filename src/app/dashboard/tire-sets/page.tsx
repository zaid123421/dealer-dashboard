"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Eye, Package, Snowflake, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PaginationControls } from "@/components/ui/pagination-controls";
import StyledTable from "@/components/ui/styled-table";
import { useDealerTireSetsOverview } from "@/modules/tire-sets/hooks/use-dealer-tire-sets-overview";
import type { DealerTireSetOverviewRow } from "@/modules/tire-sets/types";

const PAGE_SIZE = 10;

function getSeasonBadgeClass(season: string) {
  switch (season) {
    case "Winter":
      return "bg-blue-100 text-blue-900 border-blue-200";
    case "Summer":
      return "bg-yellow-50 text-yellow-900 border-yellow-200";
    case "All-Season":
      return "bg-gray-100 text-gray-800 border-gray-300";
    default:
      return "bg-gray-100 text-gray-800 border-gray-300";
  }
}

function SeasonIcon({ season }: { season: string }) {
  switch (season) {
    case "Winter":
      return <Snowflake className="size-4 text-blue-600" />;
    case "Summer":
      return <Sun className="size-4 text-yellow-600" />;
    default:
      return <Package className="size-4 text-gray-600" />;
  }
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function TireSetsPage() {
  const t = useTranslations("dashboard");
  const [page, setPage] = useState(0);

  const { data = [], isLoading, isError, error, refetch } = useDealerTireSetsOverview();

  const totalPages =
    data.length === 0 ? 0 : Math.ceil(data.length / PAGE_SIZE);

  const effectivePage =
    totalPages === 0 ? 0 : Math.min(page, totalPages - 1);

  const currentRows = useMemo(() => {
    const startIndex = effectivePage * PAGE_SIZE;
    return data.slice(startIndex, startIndex + PAGE_SIZE);
  }, [data, effectivePage]);

  const canPrev = effectivePage > 0;
  const canNext = totalPages > 0 && effectivePage < totalPages - 1;

  const detailHref = (row: DealerTireSetOverviewRow) =>
    `/dashboard/customers/${row.dealerCustomerId}/vehicles/${row.vehicleId}/tire-sets/${row.id}`;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-headline-sm font-bold text-foreground">{t("tireSetsTitle")}</h1>
          <p className="mt-1 text-body-md text-muted-foreground">{t("tireSetsIntro")}</p>
        </div>
      </div>

      {isError ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-body-md text-destructive">
          <p>{error instanceof Error ? error.message : "Failed to load tire sets"}</p>
          <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : null}

      <StyledTable
        isLoading={isLoading}
        rows={currentRows}
        keyProp={(row) => `${row.dealerCustomerId}-${row.vehicleId}-${row.id}`}
        emptyText="No tire sets found"
        columns={[
          {
            header: "Customer",
            render: (row) => (
              <span className="font-medium">{row.customerDisplayName || "—"}</span>
            ),
          },
          {
            header: "Vehicle ID",
            render: (row) => <span className="font-mono text-sm">{row.vehicleId}</span>,
            align: "center",
          },
          {
            header: "Set ID",
            render: (row) => <span className="font-mono text-sm font-medium">{row.id}</span>,
            align: "center",
          },
          {
            header: "Brand",
            render: (row) => <span className="font-medium">{row.brand}</span>,
          },
          {
            header: "Size",
            render: (row) => <span className="font-mono text-sm">{row.size}</span>,
            align: "center",
          },
          {
            header: "Season",
            render: (row) => (
              <div className="flex items-center justify-center gap-2">
                <SeasonIcon season={row.seasonType} />
                <Badge className={getSeasonBadgeClass(row.seasonType)} variant="outline">
                  {row.seasonType}
                </Badge>
              </div>
            ),
            align: "center",
          },
          {
            header: "Tires",
            render: (row) => (
              <div className="flex items-center justify-center gap-2">
                <Package className="size-4 text-muted-foreground" />
                <span className="font-medium">{row.tireCount}</span>
              </div>
            ),
            align: "center",
          },
          {
            header: "Display label",
            render: (row) => (
              <span className="text-muted-foreground text-sm">{row.displayLabel || "—"}</span>
            ),
          },
          {
            header: "Created",
            render: (row) => <span className="text-sm text-muted-foreground">{formatDate(row.createdAt)}</span>,
            align: "center",
          },
          {
            header: "Actions",
            className: "min-w-[100px]",
            render: (row) => (
              <div className="flex justify-center">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-[var(--radius-md)] border border-[var(--color-tertiary-main-light)] bg-transparent text-[var(--color-tertiary-main-light)]
                            hover:bg-[var(--color-tertiary-main-dark)] hover:text-white hover:border-[var(--color-tertiary-main-dark)]
                            transition-all duration-[var(--duration-normal)]"
                  title="View tire set details"
                  asChild
                >
                  <Link href={detailHref(row)}>
                    <Eye className="size-4" />
                  </Link>
                </Button>
              </div>
            ),
          },
        ]}
      />

      {!isLoading && data.length > 0 ? (
        <PaginationControls
          canPrevious={canPrev}
          canNext={canNext}
          previousLabel="Previous"
          nextLabel="Next"
          pageLabel={`Page ${effectivePage + 1} of ${totalPages}`}
          pageText={`${effectivePage + 1}/${totalPages}`}
          onPrevious={() => setPage((p) => Math.max(0, p - 1))}
          onNext={() =>
            setPage((p) => (totalPages > 0 ? Math.min(totalPages - 1, p + 1) : p))
          }
        />
      ) : null}
    </div>
  );
}
