"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, Eye, Pencil, Trash2, Package, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PaginationControls } from "@/components/ui/pagination-controls";
import StyledTable from "@/components/ui/styled-table";

const PAGE_SIZE = 10;

// Sample data for demonstration
const sampleInventory = [
  {
    id: 1,
    productSku: "TIRE-001",
    productName: "Michelin Pilot Sport 4S",
    location: "Warehouse A - Shelf 1",
    quantity: 45,
    reservedQuantity: 5,
    availableQuantity: 40,
    minStockLevel: 10,
    lastUpdated: "2024-01-15",
    status: "healthy",
  },
  {
    id: 2,
    productSku: "TIRE-002",
    productName: "Bridgestone Potenza RE-71R",
    location: "Warehouse A - Shelf 2",
    quantity: 32,
    reservedQuantity: 8,
    availableQuantity: 24,
    minStockLevel: 15,
    lastUpdated: "2024-01-16",
    status: "healthy",
  },
  {
    id: 3,
    productSku: "TIRE-003",
    productName: "Continental ExtremeContact DWS06",
    location: "Warehouse B - Shelf 1",
    quantity: 67,
    reservedQuantity: 12,
    availableQuantity: 55,
    minStockLevel: 20,
    lastUpdated: "2024-01-14",
    status: "healthy",
  },
  {
    id: 4,
    productSku: "TIRE-004",
    productName: "Goodyear Eagle F1 Asymmetric",
    location: "Warehouse B - Shelf 3",
    quantity: 0,
    reservedQuantity: 0,
    availableQuantity: 0,
    minStockLevel: 8,
    lastUpdated: "2024-01-13",
    status: "out_of_stock",
  },
  {
    id: 5,
    productSku: "TIRE-005",
    productName: "Pirelli P Zero",
    location: "Warehouse A - Shelf 4",
    quantity: 12,
    reservedQuantity: 3,
    availableQuantity: 9,
    minStockLevel: 15,
    lastUpdated: "2024-01-12",
    status: "low_stock",
  },
  {
    id: 6,
    productSku: "TIRE-006",
    productName: "Yokohama Advan Sport",
    location: "Warehouse C - Shelf 2",
    quantity: 8,
    reservedQuantity: 2,
    availableQuantity: 6,
    minStockLevel: 10,
    lastUpdated: "2024-01-11",
    status: "critical",
  },
];

function getStatusBadgeColor(status: string) {
  switch (status.toLowerCase()) {
    case "healthy":
      return "bg-green-100 text-green-800 border-green-200";
    case "low_stock":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "critical":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "out_of_stock":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-300";
  }
}

function getStatusIcon(status: string) {
  switch (status.toLowerCase()) {
    case "healthy":
      return <CheckCircle className="size-4 text-green-600" />;
    case "low_stock":
      return <AlertTriangle className="size-4 text-yellow-600" />;
    case "critical":
      return <AlertTriangle className="size-4 text-orange-600" />;
    case "out_of_stock":
      return <AlertTriangle className="size-4 text-red-600" />;
    default:
      return null;
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

export default function InventoryPage() {
  const t = useTranslations("dashboard");
  const [page, setPage] = useState(0);

  const totalPages = Math.ceil(sampleInventory.length / PAGE_SIZE);
  const startIndex = page * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const currentInventory = sampleInventory.slice(startIndex, endIndex);

  const canPrev = page > 0;
  const canNext = page < totalPages - 1;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-headline-sm font-bold text-foreground">
            {t("inventoryTitle")}
          </h1>
          <p className="mt-1 text-body-md text-muted-foreground">{t("inventoryIntro")}</p>
        </div>
        <Button
          type="button"
          className="w-full shrink-0 bg-primary-dark text-primary-onContainer font-bold hover:bg-primary-dark/90 sm:w-auto"
        >
          <Plus className="me-2 size-4 shrink-0" />
          Add Stock
        </Button>
      </div>

      <StyledTable
        isLoading={false}
        rows={currentInventory}
        keyProp={(item) => item.id}
        emptyText="No inventory items found"
        columns={[
          {
            header: "Product",
            render: (item) => (
              <div>
                <div className="font-medium">{item.productName}</div>
                <div className="text-sm text-muted-foreground font-mono">{item.productSku}</div>
              </div>
            ),
          },
          {
            header: "Location",
            render: (item) => (
              <div className="flex items-center gap-2">
                <Package className="size-4" />
                <span>{item.location}</span>
              </div>
            ),
          },
          {
            header: "Total Qty",
            render: (item) => (
              <span className="font-mono text-sm font-medium">{item.quantity}</span>
            ),
            align: "center",
          },
          {
            header: "Reserved",
            render: (item) => (
              <span className="font-mono text-sm text-orange-600">{item.reservedQuantity}</span>
            ),
            align: "center",
          },
          {
            header: "Available",
            render: (item) => (
              <span className="font-mono text-sm font-medium text-green-600">{item.availableQuantity}</span>
            ),
            align: "center",
          },
          {
            header: "Min Level",
            render: (item) => (
              <span className="font-mono text-sm">{item.minStockLevel}</span>
            ),
            align: "center",
          },
          {
            header: "Status",
            render: (item) => (
              <div className="flex items-center gap-2">
                {getStatusIcon(item.status)}
                <Badge className={getStatusBadgeColor(item.status)}>
                  {item.status.replace("_", " ")}
                </Badge>
              </div>
            ),
            align: "center",
          },
          {
            header: "Last Updated",
            render: (item) => formatDate(item.lastUpdated),
            align: "center",
          },
          {
            header: "Actions",
            className: "min-w-[220px]",
            render: (item) => (
              <div className="flex justify-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-[var(--radius-md)] border border-[var(--color-tertiary-main-light)] bg-transparent text-[var(--color-tertiary-main-light)] 
                            hover:bg-[var(--color-tertiary-main-dark)] hover:text-white hover:border-[var(--color-tertiary-main-dark)] 
                            transition-all duration-[var(--duration-normal)]"
                  title="View inventory details"
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
                  title="Edit inventory"
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
                  title="Delete inventory item"
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
