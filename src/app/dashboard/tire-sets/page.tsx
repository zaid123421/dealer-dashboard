"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, Eye, Pencil, Trash2, Package, Snowflake, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PaginationControls } from "@/components/ui/pagination-controls";
import StyledTable from "@/components/ui/styled-table";

const PAGE_SIZE = 10;

// Sample data for demonstration
const sampleTireSets = [
  {
    id: 1,
    setId: "TS-2024-001",
    brand: "Michelin",
    model: "Pilot Sport 4S",
    size: "245/35R19",
    seasonType: "summer",
    tireCount: 4,
    treadDepth: 8.5,
    purchaseDate: "2024-01-15",
    purchasePrice: 983.96,
    location: "Warehouse A - Shelf 1",
    status: "available",
    customerName: null,
  },
  {
    id: 2,
    setId: "TS-2024-002",
    brand: "Bridgestone",
    model: "Blizzak LM005",
    size: "225/45R17",
    seasonType: "winter",
    tireCount: 4,
    treadDepth: 9.2,
    purchaseDate: "2024-01-10",
    purchasePrice: 759.96,
    location: "Warehouse B - Shelf 3",
    status: "available",
    customerName: null,
  },
  {
    id: 3,
    setId: "TS-2024-003",
    brand: "Continental",
    model: "ExtremeContact DWS06",
    size: "235/40R18",
    seasonType: "all_season",
    tireCount: 4,
    treadDepth: 7.8,
    purchaseDate: "2024-01-08",
    purchasePrice: 627.96,
    location: "Warehouse A - Shelf 2",
    status: "installed",
    customerName: "Ahmed Mohammed",
  },
  {
    id: 4,
    setId: "TS-2024-004",
    brand: "Pirelli",
    model: "P Zero",
    size: "265/35R20",
    seasonType: "summer",
    tireCount: 4,
    treadDepth: 6.2,
    purchaseDate: "2024-01-05",
    purchasePrice: 1071.96,
    location: "Warehouse C - Shelf 1",
    status: "reserved",
    customerName: "Fatima Ali",
  },
  {
    id: 5,
    setId: "TS-2024-005",
    brand: "Goodyear",
    model: "Eagle F1 Asymmetric",
    size: "255/40R19",
    seasonType: "summer",
    tireCount: 4,
    treadDepth: 4.1,
    purchaseDate: "2023-12-20",
    purchasePrice: 715.96,
    location: "Warehouse B - Shelf 2",
    status: "maintenance",
    customerName: null,
  },
  {
    id: 6,
    setId: "TS-2024-006",
    brand: "Yokohama",
    model: "Advan Sport",
    size: "275/30R21",
    seasonType: "summer",
    tireCount: 2,
    treadDepth: 8.9,
    purchaseDate: "2024-01-12",
    purchasePrice: 397.98,
    location: "Warehouse A - Shelf 4",
    status: "available",
    customerName: null,
  },
];

function getSeasonBadgeColor(season: string) {
  switch (season.toLowerCase()) {
    case "winter":
      return "bg-blue-100 text-blue-900 border-blue-200";
    case "summer":
      return "bg-yellow-50 text-yellow-900 border-yellow-200";
    case "all_season":
    case "all season":
      return "bg-gray-100 text-gray-800 border-gray-300";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

function getSeasonIcon(season: string) {
  switch (season.toLowerCase()) {
    case "winter":
      return <Snowflake className="size-4 text-blue-600" />;
    case "summer":
      return <Sun className="size-4 text-yellow-600" />;
    case "all_season":
    case "all season":
      return <Package className="size-4 text-gray-600" />;
    default:
      return <Package className="size-4" />;
  }
}

function getStatusBadgeColor(status: string) {
  switch (status.toLowerCase()) {
    case "available":
      return "bg-green-100 text-green-800 border-green-200";
    case "installed":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "reserved":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "maintenance":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "sold":
      return "bg-gray-100 text-gray-800 border-gray-300";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function TireSetsPage() {
  const t = useTranslations("dashboard");
  const [page, setPage] = useState(0);

  const totalPages = Math.ceil(sampleTireSets.length / PAGE_SIZE);
  const startIndex = page * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const currentTireSets = sampleTireSets.slice(startIndex, endIndex);

  const canPrev = page > 0;
  const canNext = page < totalPages - 1;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-headline-sm font-bold text-foreground">
            {t("tireSetsTitle")}
          </h1>
          <p className="mt-1 text-body-md text-muted-foreground">{t("tireSetsIntro")}</p>
        </div>
        <Button
          type="button"
          className="w-full shrink-0 bg-primary-dark text-primary-onContainer font-bold hover:bg-primary-dark/90 sm:w-auto"
        >
          <Plus className="me-2 size-4 shrink-0" />
          Add Tire Set
        </Button>
      </div>

      <StyledTable
        isLoading={false}
        rows={currentTireSets}
        keyProp={(tireSet) => tireSet.id}
        emptyText="No tire sets found"
        columns={[
          {
            header: "Set ID",
            render: (tireSet) => (
              <span className="font-mono text-sm font-medium">{tireSet.setId}</span>
            ),
          },
          {
            header: "Brand & Model",
            render: (tireSet) => (
              <div>
                <div className="font-medium">{tireSet.brand}</div>
                <div className="text-sm text-muted-foreground">{tireSet.model}</div>
              </div>
            ),
          },
          {
            header: "Size",
            render: (tireSet) => (
              <span className="font-mono text-sm">{tireSet.size}</span>
            ),
            align: "center",
          },
          {
            header: "Season",
            render: (tireSet) => (
              <div className="flex items-center gap-2">
                {getSeasonIcon(tireSet.seasonType)}
                <Badge className={getSeasonBadgeColor(tireSet.seasonType)}>
                  {tireSet.seasonType.replace("_", " ")}
                </Badge>
              </div>
            ),
            align: "center",
          },
          {
            header: "Tire Count",
            render: (tireSet) => (
              <div className="flex items-center gap-2">
                <Package className="size-4" />
                <span className="font-medium">{tireSet.tireCount}</span>
              </div>
            ),
            align: "center",
          },
          {
            header: "Tread Depth",
            render: (tireSet) => (
              <span className="font-mono text-sm">{tireSet.treadDepth} mm</span>
            ),
            align: "center",
          },
          {
            header: "Purchase Price",
            render: (tireSet) => (
              <span className="font-mono text-sm font-medium">
                ${tireSet.purchasePrice.toFixed(2)}
              </span>
            ),
            align: "right",
          },
          {
            header: "Status",
            render: (tireSet) => (
              <div>
                <Badge className={getStatusBadgeColor(tireSet.status)}>
                  {tireSet.status}
                </Badge>
                {tireSet.customerName && (
                  <div className="text-sm text-muted-foreground mt-1">
                    {tireSet.customerName}
                  </div>
                )}
              </div>
            ),
            align: "center",
          },
          {
            header: "Actions",
            className: "min-w-[220px]",
            render: (tireSet) => (
              <div className="flex justify-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-[var(--radius-md)] border border-[var(--color-tertiary-main-light)] bg-transparent text-[var(--color-tertiary-main-light)] 
                            hover:bg-[var(--color-tertiary-main-dark)] hover:text-white hover:border-[var(--color-tertiary-main-dark)] 
                            transition-all duration-[var(--duration-normal)]"
                  title="View tire set details"
                >
                  <Eye className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-[var(--radius-md)] border border-[var(--color-tertiary-main-light)] bg-transparent text-[var(--color-tertiary-main-light)] 
                            hover:bg-[var(--color-tertiary-main-dark)] hover:text-white hover:border-[var(--color-tertiary-main-dark)] 
                            transition-all duration-[var(--duration-normal)]"
                  title="Edit tire set"
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-[var(--radius-md)] border border-[var(--color-error-main)] bg-transparent text-[var(--color-error-main)] 
                            hover:bg-[var(--color-error-main)] hover:text-white hover:border-[var(--color-error-main)] 
                            transition-all duration-[var(--duration-normal)]"
                  title="Delete tire set"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ),
          },
        ]}
      />

      {totalPages > 0 ? (
        <PaginationControls
          canPrevious={canPrev}
          canNext={canNext}
          previousLabel="Previous"
          nextLabel="Next"
          pageLabel={`Page ${page + 1} of ${totalPages}`}
          pageText={`${page + 1}/${totalPages}`}
          onPrevious={() => setPage((p) => Math.max(0, p - 1))}
          onNext={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
        />
      ) : null}
    </div>
  );
}
