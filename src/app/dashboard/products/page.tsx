"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, Eye, Pencil, Trash2, Package, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PaginationControls } from "@/components/ui/pagination-controls";
import StyledTable from "@/components/ui/styled-table";

const PAGE_SIZE = 10;

// Sample data for demonstration
const sampleProducts = [
  {
    id: 1,
    sku: "TIRE-001",
    name: "Michelin Pilot Sport 4S",
    category: "Performance",
    brand: "Michelin",
    price: 245.99,
    stock: 45,
    status: "active",
    description: "High-performance summer tire",
  },
  {
    id: 2,
    sku: "TIRE-002",
    name: "Bridgestone Potenza RE-71R",
    category: "Performance",
    brand: "Bridgestone",
    price: 189.99,
    stock: 32,
    status: "active",
    description: "Track-ready performance tire",
  },
  {
    id: 3,
    sku: "TIRE-003",
    name: "Continental ExtremeContact DWS06",
    category: "All-Season",
    brand: "Continental",
    price: 156.99,
    stock: 67,
    status: "active",
    description: "All-season performance tire",
  },
  {
    id: 4,
    sku: "TIRE-004",
    name: "Goodyear Eagle F1 Asymmetric",
    category: "Performance",
    brand: "Goodyear",
    price: 178.99,
    stock: 0,
    status: "out_of_stock",
    description: "Ultra-high performance tire",
  },
  {
    id: 5,
    sku: "TIRE-005",
    name: "Pirelli P Zero",
    category: "Performance",
    brand: "Pirelli",
    price: 267.99,
    stock: 12,
    status: "active",
    description: "Premium performance tire",
  },
  {
    id: 6,
    sku: "TIRE-006",
    name: "Yokohama Advan Sport",
    category: "Performance",
    brand: "Yokohama",
    price: 198.99,
    stock: 8,
    status: "low_stock",
    description: "Sport performance tire",
  },
];

function getStatusBadgeColor(status: string) {
  switch (status.toLowerCase()) {
    case "active":
      return "bg-green-100 text-green-800 border-green-200";
    case "inactive":
      return "bg-gray-100 text-gray-800 border-gray-300";
    case "out_of_stock":
      return "bg-red-100 text-red-800 border-red-200";
    case "low_stock":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-300";
  }
}

function getStockStatus(stock: number) {
  if (stock === 0) return { status: "out_of_stock", color: "text-red-600" };
  if (stock < 10) return { status: "low_stock", color: "text-yellow-600" };
  return { status: "in_stock", color: "text-green-600" };
}

export default function ProductsPage() {
  const t = useTranslations("dashboard");
  const [page, setPage] = useState(0);

  const totalPages = Math.ceil(sampleProducts.length / PAGE_SIZE);
  const startIndex = page * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const currentProducts = sampleProducts.slice(startIndex, endIndex);

  const canPrev = page > 0;
  const canNext = page < totalPages - 1;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-headline-sm font-bold text-foreground">
            {t("productsTitle")}
          </h1>
          <p className="mt-1 text-body-md text-muted-foreground">{t("productsIntro")}</p>
        </div>
        <Button
          type="button"
          className="w-full shrink-0 bg-primary-dark text-primary-onContainer font-bold hover:bg-primary-dark/90 sm:w-auto"
        >
          <Plus className="me-2 size-4 shrink-0" />
          Add Product
        </Button>
      </div>

      <StyledTable
        isLoading={false}
        rows={currentProducts}
        keyProp={(product) => product.id}
        emptyText="No products found"
        columns={[
          {
            header: "SKU",
            render: (product) => (
              <span className="font-mono text-sm font-medium">{product.sku}</span>
            ),
          },
          {
            header: "Product Name",
            render: (product) => (
              <div>
                <div className="font-medium">{product.name}</div>
                <div className="text-sm text-muted-foreground">{product.description}</div>
              </div>
            ),
          },
          {
            header: "Category",
            render: (product) => (
              <Badge variant="outline">{product.category}</Badge>
            ),
            align: "center",
          },
          {
            header: "Brand",
            render: (product) => product.brand,
            align: "center",
          },
          {
            header: "Price",
            render: (product) => (
              <div className="flex items-center gap-1">
                <DollarSign className="size-4" />
                <span className="font-mono text-sm font-medium">
                  {product.price.toFixed(2)}
                </span>
              </div>
            ),
            align: "right",
          },
          {
            header: "Stock",
            render: (product) => {
              const stockStatus = getStockStatus(product.stock);
              return (
                <div className="flex items-center gap-2">
                  <Package className="size-4" />
                  <span className={`font-medium ${stockStatus.color}`}>
                    {product.stock}
                  </span>
                </div>
              );
            },
            align: "center",
          },
          {
            header: "Status",
            render: (product) => (
              <Badge className={getStatusBadgeColor(product.status)}>
                {product.status.replace("_", " ")}
              </Badge>
            ),
            align: "center",
          },
          {
            header: "Actions",
            className: "min-w-[220px]",
            render: (product) => (
              <div className="flex justify-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-[var(--radius-md)] border border-[var(--color-tertiary-main-light)] bg-transparent text-[var(--color-tertiary-main-light)] 
                            hover:bg-[var(--color-tertiary-main-dark)] hover:text-white hover:border-[var(--color-tertiary-main-dark)] 
                            transition-all duration-[var(--duration-normal)]"
                  title="View product details"
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
                  title="Edit product"
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
                  title="Delete product"
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
