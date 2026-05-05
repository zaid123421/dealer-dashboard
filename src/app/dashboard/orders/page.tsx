"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, Eye, Pencil, Trash2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PaginationControls } from "@/components/ui/pagination-controls";
import StyledTable from "@/components/ui/styled-table";

const PAGE_SIZE = 10;

// Sample data for demonstration
const sampleOrders = [
  {
    id: 1,
    orderNumber: "ORD-2024-001",
    customerName: "Ahmed Mohammed",
    customerEmail: "ahmed@example.com",
    items: 4,
    totalAmount: 1250.00,
    status: "pending",
    orderDate: "2024-01-15",
    deliveryDate: "2024-01-20",
  },
  {
    id: 2,
    orderNumber: "ORD-2024-002",
    customerName: "Fatima Ali",
    customerEmail: "fatima@example.com",
    items: 2,
    totalAmount: 850.00,
    status: "processing",
    orderDate: "2024-01-16",
    deliveryDate: "2024-01-22",
  },
  {
    id: 3,
    orderNumber: "ORD-2024-003",
    customerName: "Mohammed Hassan",
    customerEmail: "mohammed@example.com",
    items: 6,
    totalAmount: 2100.00,
    status: "completed",
    orderDate: "2024-01-14",
    deliveryDate: "2024-01-18",
  },
  {
    id: 4,
    orderNumber: "ORD-2024-004",
    customerName: "Sara Khalid",
    customerEmail: "sara@example.com",
    items: 3,
    totalAmount: 950.00,
    status: "shipped",
    orderDate: "2024-01-13",
    deliveryDate: "2024-01-19",
  },
  {
    id: 5,
    orderNumber: "ORD-2024-005",
    customerName: "Omar Youssef",
    customerEmail: "omar@example.com",
    items: 1,
    totalAmount: 450.00,
    status: "cancelled",
    orderDate: "2024-01-12",
    deliveryDate: "2024-01-17",
  },
];

function getStatusBadgeColor(status: string) {
  switch (status.toLowerCase()) {
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "processing":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "shipped":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "completed":
      return "bg-green-100 text-green-800 border-green-200";
    case "cancelled":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-300";
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

export default function OrdersPage() {
  const t = useTranslations("dashboard");
  const [page, setPage] = useState(0);

  const totalPages = Math.ceil(sampleOrders.length / PAGE_SIZE);
  const startIndex = page * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const currentOrders = sampleOrders.slice(startIndex, endIndex);

  const canPrev = page > 0;
  const canNext = page < totalPages - 1;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-headline-sm font-bold text-foreground">
            {t("ordersTitle")}
          </h1>
          <p className="mt-1 text-body-md text-muted-foreground">{t("ordersIntro")}</p>
        </div>
        <Button
          type="button"
          className="w-full shrink-0 bg-primary-dark text-primary-onContainer font-bold hover:bg-primary-dark/90 sm:w-auto"
        >
          <Plus className="me-2 size-4 shrink-0" />
          New Order
        </Button>
      </div>

      <StyledTable
        isLoading={false}
        rows={currentOrders}
        keyProp={(order) => order.id}
        emptyText="No orders found"
        columns={[
          {
            header: "Order Number",
            render: (order) => (
              <span className="font-mono text-sm font-medium">{order.orderNumber}</span>
            ),
          },
          {
            header: "Customer",
            render: (order) => (
              <div>
                <div className="font-medium">{order.customerName}</div>
                <div className="text-sm text-muted-foreground">{order.customerEmail}</div>
              </div>
            ),
          },
          {
            header: "Items",
            render: (order) => (
              <div className="flex items-center gap-2">
                <Package className="size-4" />
                <span>{order.items}</span>
              </div>
            ),
            align: "center",
          },
          {
            header: "Total Amount",
            render: (order) => (
              <span className="font-mono text-sm font-medium">
                ${order.totalAmount.toFixed(2)}
              </span>
            ),
            align: "right",
          },
          {
            header: "Status",
            render: (order) => (
              <Badge className={getStatusBadgeColor(order.status)}>
                {order.status}
              </Badge>
            ),
            align: "center",
          },
          {
            header: "Order Date",
            render: (order) => formatDate(order.orderDate),
            align: "center",
          },
          {
            header: "Delivery Date",
            render: (order) => formatDate(order.deliveryDate),
            align: "center",
          },
          {
            header: "Actions",
            className: "min-w-[220px]",
            render: (order) => (
              <div className="flex justify-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-[var(--radius-md)] border border-[var(--color-tertiary-main-light)] bg-transparent text-[var(--color-tertiary-main-light)] 
                            hover:bg-[var(--color-tertiary-main-dark)] hover:text-white hover:border-[var(--color-tertiary-main-dark)] 
                            transition-all duration-[var(--duration-normal)]"
                  title="View order details"
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
                  title="Edit order"
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
                  title="Delete order"
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
