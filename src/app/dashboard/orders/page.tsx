"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { ShipmentRequestsOrdersStylePage } from "@/modules/shipment-requests/components/shipment-requests-orders-style-page";
import { DEALER_ORDER_BOOK_STATUSES } from "@/modules/shipment-requests/lib/shipment-request-dto";

export default function OrdersPage() {
  const t = useTranslations("dashboard");
  const baseQuery = useMemo(
    () => ({
      statuses: [...DEALER_ORDER_BOOK_STATUSES],
      direction: "DELIVERY" as const,
      size: 20,
      sortBy: "createdAt",
    }),
    [],
  );

  return (
    <ShipmentRequestsOrdersStylePage
      title={t("ordersTitle")}
      intro={t("ordersIntro")}
      baseQuery={baseQuery}
      loadShipmentDetailsOnExpand
      enableBulkHandover
      actionsVariant="soft"
    />
  );
}
