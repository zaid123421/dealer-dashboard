"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { useTranslations } from "next-intl";

/** روابط قديمة: يفتح صفحة العملاء مع نافذة إضافة المركبة */
export default function LegacyAddVehicleRedirectPage() {
  const t = useTranslations("customers");
  const router = useRouter();
  const params = useParams();
  const customerId = params.customerId as string | undefined;

  useEffect(() => {
    if (customerId == null || customerId === "") {
      router.replace(ROUTES.DASHBOARD.CUSTOMERS);
      return;
    }
    const q = new URLSearchParams({ openVehicleModal: customerId });
    router.replace(`${ROUTES.DASHBOARD.CUSTOMERS}?${q.toString()}`);
  }, [router, customerId]);

  return (
    <div className="flex min-h-[200px] items-center justify-center text-body-md text-muted-foreground">
      {t("loading")}
    </div>
  );
}
