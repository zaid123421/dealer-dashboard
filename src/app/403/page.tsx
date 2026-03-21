import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ROUTES } from "@/constants/routes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function ForbiddenPage() {
  const t = await getTranslations("errors");
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-2 sm:p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-headline-sm font-bold text-foreground">
            403 — {t("forbidden")}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {t("forbiddenMessage")}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button variant="outline" asChild>
            <Link href={ROUTES.DASHBOARD.ROOT}>
              {t("backToDashboard")}
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}