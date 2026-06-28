import { getTranslations } from "next-intl/server";
import { ROUTES } from "@/constants/routes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardPage() {
  const t = await getTranslations("dashboard");
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 break-words">
      <div>
        <h1 className="text-headline-sm font-bold text-foreground">
          {t("title")}
        </h1>
        <p className="mt-1 text-body-md text-subtle">{t("intro")}</p>
      </div>
      <Card className="border-0 bg-surface-container">
        <CardHeader>
          <CardTitle className="text-title-lg text-foreground">
            {t("title")}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {t("intro")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="w-fit rounded-md bg-muted/50 px-2 py-1 font-mono text-sm text-muted-foreground">
            {ROUTES.DASHBOARD.ROOT}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
