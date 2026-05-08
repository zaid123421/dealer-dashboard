"use client";

import { useTranslations } from "next-intl";
import { Plus, Eye, Pencil, Trash2, Package, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import StyledTable from "@/components/ui/styled-table";

type InventoryRow = {
  id: number;
  productSku: string;
  productName: string;
  location: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  minStockLevel: number;
  lastUpdated: string;
  status: string;
};

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
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function InventoryPage() {
  const t = useTranslations("dashboard");
  const rows: InventoryRow[] = [];

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-headline-sm font-bold text-foreground">{t("inventoryTitle")}</h1>
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
        rows={rows}
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
            render: (item) => <span className="font-mono text-sm font-medium">{item.quantity}</span>,
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
            render: (item) => <span className="font-mono text-sm">{item.minStockLevel}</span>,
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
            render: () => (
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
    </div>
  );
}
