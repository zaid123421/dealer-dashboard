"use client";

import { useTranslations } from "next-intl";

export default function ProductsPage() {
  const t = useTranslations("dashboard");
  return (
    <div className="space-y-4 break-words">
      <h1 className="text-headline-sm font-bold text-foreground">{t("productsTitle")}</h1>
      <p className="text-body-md text-subtle">{t("productsIntro")}</p>
    </div>
  );
}
