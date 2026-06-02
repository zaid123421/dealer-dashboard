"use client";

import { useTranslations } from "next-intl";

export default function InventoryPage() {
  const t = useTranslations("dashboard");
  return (
    <div className="space-y-4 break-words">
      <h1 className="text-headline-sm font-bold text-foreground">{t("inventoryTitle")}</h1>
      <p className="text-body-md text-subtle">{t("inventoryIntro")}</p>
    </div>
  );
}
