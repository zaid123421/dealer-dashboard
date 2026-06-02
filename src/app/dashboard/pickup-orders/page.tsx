"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { ShipmentRequestsOrdersStylePage } from "@/modules/shipment-requests/components/shipment-requests-orders-style-page";
import { DEALER_ORDER_BOOK_STATUSES } from "@/modules/shipment-requests/lib/shipment-request-dto";

export default function PickupOrdersPage() {
  const t = useTranslations("dashboard");
  const tp = useTranslations("pickupOrders");
  const baseQuery = useMemo(
    () => ({
      statuses: [...DEALER_ORDER_BOOK_STATUSES],
      direction: "PICKUP" as const,
      size: 20,
      sortBy: "createdAt",
    }),
    [],
  );

  return (
    <ShipmentRequestsOrdersStylePage
      title={t("pickupOrdersTitle")}
      intro={t("pickupOrdersIntro")}
      baseQuery={baseQuery}
      emptyText={tp("emptyOrders")}
      loadShipmentDetailsOnExpand
    />
  );
}
