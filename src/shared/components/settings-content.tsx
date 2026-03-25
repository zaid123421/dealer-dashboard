"use client";

import { User } from "lucide-react";
import { useTranslations } from "next-intl";
import { ThemeSwitcher } from "./theme-switcher";
import { LocaleSwitcher } from "./locale-switcher";
import { useAuthUser, useRole } from "@/shared/hooks/use-can-access";
import { ROLES } from "@/shared/config/roles";
import type { Role } from "@/shared/config/roles";

function getRoleLabel(role: Role | null | undefined, t: (key: string) => string): string {
  if (!role) return "—";
  switch (role) {
    case ROLES.ADMIN:
      return t("roleAdmin");
    case ROLES.SUPPLIER:
      return t("roleSupplier");
    case ROLES.USER:
      return t("roleUser");
    default:
      return role;
  }
}

export function SettingsContent() {
  const t = useTranslations("settings");
  const tNav = useTranslations("nav");
  const role = useRole();
  const user = useAuthUser();
  const roleLabel = getRoleLabel(role, tNav);
  const accountName = (() => {
    if (!user) return tNav("defaultAccountName");
    const name = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
    return name || user.email || tNav("defaultAccountName");
  })();

  return (
    <div className="space-y-6 break-words">
      <div>
        <h1 className="text-headline-sm font-bold text-foreground">
          {t("title")}
        </h1>
        <p className="mt-2 text-body-md text-muted-foreground">
          {t("subtitle")}
        </p>
      </div>

      <div className="space-y-6">
        {/* Account Section */}
        <section className="rounded-lg border border-border bg-card p-4 sm:p-6">
          <h2 className="text-title-md font-semibold text-foreground mb-4">
            {t("accountSection")}
          </h2>
          <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary-dark/20 text-primary-dark">
              <User className="size-7" />
            </div>
            <div className="min-w-0">
              <p className="text-label-md text-muted-foreground">{roleLabel}</p>
              <p className="text-title-md font-semibold text-foreground">
                {accountName}
              </p>
              {user?.email ? (
                <p className="mt-1 truncate text-body-sm text-muted-foreground">{user.email}</p>
              ) : null}
              {user?.tenantName ? (
                <p className="mt-0.5 truncate text-body-sm text-muted-foreground">
                  {user.tenantName}
                  {user.backendRole ? (
                    <span className="text-muted-foreground/80"> · {user.backendRole}</span>
                  ) : null}
                </p>
              ) : null}
              <span className="mt-2 inline-block rounded-full bg-primary-dark px-2.5 py-0.5 text-label-sm font-medium text-primary-onContainer">
                {tNav("professionalPlan")}
              </span>
            </div>
          </div>
        </section>

        {/* Appearance Section */}
        <section className="rounded-lg border border-border bg-card p-4 sm:p-6">
          <h2 className="text-title-md font-semibold text-foreground mb-4">
            {t("appearanceSection")}
          </h2>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
            <div className="flex flex-col gap-1">
              <span className="text-label-md text-foreground">
                {t("themeLabel")}
              </span>
              <ThemeSwitcher />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-label-md text-foreground">
                {t("languageLabel")}
              </span>
              <LocaleSwitcher />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
