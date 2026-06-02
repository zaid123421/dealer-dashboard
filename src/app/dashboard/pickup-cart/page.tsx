"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddPickupItemModal } from "@/modules/shipment-requests/components/add-pickup-item-modal";
import { ShipmentRequestsOrdersStylePage } from "@/modules/shipment-requests/components/shipment-requests-orders-style-page";

export default function PickupCartPage() {
  const t = useTranslations("dashboard");
  const tp = useTranslations("pickupOrders");
  const tc = useTranslations("pickupCart");
  const [addItemOpen, setAddItemOpen] = useState(false);

  const baseQuery = useMemo(
    () => ({
      statuses: "IN_CART",
      direction: "PICKUP" as const,
      size: 20,
      sortBy: "createdAt",
    }),
    [],
  );

  return (
    <>
      <ShipmentRequestsOrdersStylePage
        title={t("pickupCartTitle")}
        intro={t("pickupCartIntro")}
        baseQuery={baseQuery}
        emptyText={tp("empty")}
        loadShipmentDetailsOnExpand
        actionsVariant="soft"
        headerActions={
          <Button
            type="button"
            variant="brand"
            onClick={() => setAddItemOpen(true)}
            className="w-full shrink-0 gap-2 sm:w-auto"
          >
            <Plus className="size-4 shrink-0" />
            <span className="truncate">{tc("addItem")}</span>
          </Button>
        }
      />
      <AddPickupItemModal open={addItemOpen} onOpenChange={setAddItemOpen} />
    </>
  );
}
