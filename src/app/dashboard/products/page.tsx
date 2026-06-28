"use client";

import { useTranslations } from "next-intl";

export default function ProductsPage() {
  const t = useTranslations("dashboard");
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 break-words">
      <div>
        <h1 className="text-headline-sm font-bold text-foreground">{t("productsTitle")}</h1>
        <p className="mt-1 text-body-md text-subtle">{t("productsIntro")}</p>
      </div>
    </div>
  );
}
