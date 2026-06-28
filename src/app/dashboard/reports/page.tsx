import { getTranslations } from "next-intl/server";

export default async function ReportsPage() {
  const t = await getTranslations("dashboard");
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 break-words">
      <div>
        <h1 className="text-headline-sm font-bold text-foreground">
          {t("reportsTitle")}
        </h1>
        <p className="mt-1 text-body-md text-subtle">{t("reportsIntro")}</p>
      </div>
    </div>
  );
}
