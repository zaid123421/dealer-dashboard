import { getTranslations } from "next-intl/server";
import { ROUTES } from "@/constants/routes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardPage() {
  const t = await getTranslations("dashboard");
  return (
    <div className="space-y-6 break-words">
      <div>
        <h1 className="text-headline-sm font-bold text-foreground">
          {t("title")}
        </h1>
        <p className="mt-2 text-body-md text-muted-foreground">{t("intro")}</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-title-lg text-foreground">
            {t("title")}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {t("intro")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="font-mono text-sm text-muted-foreground rounded-md bg-muted/50 px-2 py-1 w-fit">
            {ROUTES.DASHBOARD.ROOT}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
