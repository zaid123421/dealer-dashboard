"use client";

import { useMemo } from "react";
import { PickupCartPage } from "@/modules/shipment-requests/components/pickup-cart-page";

export default function PickupCartRoute() {
  const baseQuery = useMemo(
    () => ({
      statuses: "IN_CART",
      direction: "PICKUP" as const,
      size: 20,
      sortBy: "createdAt",
    }),
    [],
  );

  return <PickupCartPage baseQuery={baseQuery} />;
}
