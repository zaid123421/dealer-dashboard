"use client";

import { useMemo } from "react";
import { DeliveryCartPage } from "@/modules/shipment-requests/components/delivery-cart-page";

export default function DeliveryCartRoute() {
  const baseQuery = useMemo(
    () => ({
      statuses: "IN_CART",
      direction: "DELIVERY" as const,
      size: 20,
      sortBy: "createdAt",
    }),
    [],
  );

  return <DeliveryCartPage baseQuery={baseQuery} />;
}
