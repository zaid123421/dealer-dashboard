import { getTranslations } from "next-intl/server";

export default async function TireSetsPage() {
  const t = await getTranslations("dashboard");
  return (
    <div className="space-y-4 break-words">
      <h1 className="text-headline-sm font-bold text-foreground">
        {t("tireSetsTitle")}
      </h1>
      <p className="text-body-md text-muted-foreground">{t("tireSetsIntro")}</p>
    </div>
  );
}
