"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { formatLocaleDate } from "@/lib/format-locale";
import { Eye, Package, Search, Snowflake, Sun } from "lucide-react";
import { ErrorAlert } from "@/components/ui/error-alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PaginationControls } from "@/components/ui/pagination-controls";
import StyledTable from "@/components/ui/styled-table";
import { useDealerTireSetsOverview } from "@/modules/tire-sets/hooks/use-dealer-tire-sets-overview";
import { DealerQuotaPanel } from "@/modules/dealer/components/dealer-quota-panel";
import type { DealerTireSetOverviewRow } from "@/modules/tire-sets/types";

const PAGE_SIZE = 10;

type SeasonFilter = "all" | string;

function getSeasonBadgeClass(season: string) {
  switch (season) {
    case "Winter":
      return "bg-blue-100 text-blue-900 border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30";
    case "Summer":
      return "bg-yellow-50 text-yellow-900 border-yellow-200 dark:bg-yellow-500/15 dark:text-yellow-300 dark:border-yellow-500/30";
    case "All-Season":
      return "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-500/15 dark:text-gray-300 dark:border-gray-500/30";
    default:
      return "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-500/15 dark:text-gray-300 dark:border-gray-500/30";
  }
}

function SeasonIcon({ season }: { season: string }) {
  switch (season) {
    case "Winter":
      return <Snowflake className="size-4 text-blue-600 dark:text-blue-400" />;
    case "Summer":
      return <Sun className="size-4 text-yellow-600 dark:text-yellow-400" />;
    default:
      return <Package className="size-4 text-gray-600 dark:text-gray-400" />;
  }
}

export default function TireSetsPage() {
  const t = useTranslations("dashboard");
  const ts = useTranslations("staff");
  const locale = useLocale();
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [seasonFilter, setSeasonFilter] = useState<SeasonFilter>("all");
  const [filterSnapshot, setFilterSnapshot] = useState({
    searchQuery: "",
    seasonFilter: "all" as SeasonFilter,
  });

  if (
    filterSnapshot.searchQuery !== searchQuery ||
    filterSnapshot.seasonFilter !== seasonFilter
  ) {
    setFilterSnapshot({ searchQuery, seasonFilter });
    setPage(0);
  }

  const { data = [], isLoading, isError, error, refetch } = useDealerTireSetsOverview();

  const seasonOptions = useMemo(() => {
    const seasons = new Set<string>();
    for (const row of data) {
      if (row.seasonType?.trim()) seasons.add(row.seasonType.trim());
    }
    return Array.from(seasons).sort();
  }, [data]);

  const filteredData = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return data.filter((row) => {
      if (seasonFilter !== "all" && row.seasonType !== seasonFilter) return false;
      if (!q) return true;
      const hay = [
        row.customerDisplayName,
        row.brand,
        row.size,
        row.seasonType,
        row.displayLabel,
        String(row.id),
        String(row.vehicleId),
        String(row.dealerCustomerId),
        String(row.tireCount),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [data, searchQuery, seasonFilter]);

  const totalPages =
    filteredData.length === 0 ? 0 : Math.ceil(filteredData.length / PAGE_SIZE);

  const effectivePage =
    totalPages === 0 ? 0 : Math.min(page, totalPages - 1);

  const currentRows = useMemo(() => {
    const startIndex = effectivePage * PAGE_SIZE;
    return filteredData.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredData, effectivePage]);

  const canPrev = effectivePage > 0;
  const canNext = totalPages > 0 && effectivePage < totalPages - 1;

  const detailHref = (row: DealerTireSetOverviewRow) =>
    `/dashboard/customers/${row.dealerCustomerId}/vehicles/${row.vehicleId}/tire-sets/${row.id}`;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-headline-sm font-bold text-foreground">{t("tireSetsTitle")}</h1>
          <p className="mt-1 text-body-md text-subtle">{t("tireSetsIntro")}</p>
        </div>
      </div>

      <DealerQuotaPanel filter="tires" variant="full" />

      <div className="flex shrink-0 flex-col gap-3 py-1 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="relative min-w-0 flex-1 sm:min-w-[220px]">
          <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t("tireSetsSearchPlaceholder")}
            className="w-full ps-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label={t("tireSetsSearchPlaceholder")}
          />
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <span className="text-label-sm font-medium text-muted-foreground sm:me-1">
            {t("tireSetsFilterSeasonLabel")}
          </span>
          <Select value={seasonFilter} onValueChange={(v) => setSeasonFilter(v)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("tireSetsFilterAllSeasons")}</SelectItem>
              {seasonOptions.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <p className="w-full text-end text-body-md text-muted-foreground sm:ms-auto sm:w-auto">
          {t("tireSetsShowingCount", { count: filteredData.length })}
        </p>
      </div>

      {isError ? (
        <ErrorAlert
          message={error instanceof Error ? error.message : t("tireSetsError")}
          onRetry={() => void refetch()}
          retryLabel={ts("retry")}
          className="shrink-0"
        />
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
            render: (row) => (
              <span className="text-sm text-muted-foreground">
                {formatLocaleDate(row.createdAt, locale)}
              </span>
            ),
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
                  className="h-9 w-9 rounded-md border border-[var(--color-tertiary-main-light)] bg-transparent text-[var(--color-tertiary-main-light)]
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

      {!isLoading && filteredData.length > 0 ? (
        <PaginationControls
          canPrevious={canPrev}
          canNext={canNext}
          previousLabel={ts("paginationPrev")}
          nextLabel={ts("paginationNext")}
          pageLabel={ts("pageInfo", { current: effectivePage + 1, total: totalPages })}
          pageText={ts("pageCompact", { current: effectivePage + 1, total: totalPages })}
          onPrevious={() => setPage((p) => Math.max(0, p - 1))}
          onNext={() =>
            setPage((p) => (totalPages > 0 ? Math.min(totalPages - 1, p + 1) : p))
          }
        />
      ) : null}
    </div>
  );
}
