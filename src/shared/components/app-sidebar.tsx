"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  Home,
  Users,
  CircleDot,
  ShoppingCart,
  Mail,
  FileText,
  Settings,
  User,
  Menu,
  type LucideIcon,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { getAllowedNavEntries } from "@/shared/config/permissions";
import { useRole } from "@/shared/hooks/use-can-access";
import TokenService from "@/infrastructure/auth/token-service";
import { useAuthStore } from "@/shared/stores/auth-store";
import { ROLES } from "@/shared/config/roles";
import type { Role } from "@/shared/config/roles";

const KEY_ICON_MAP: Record<string, LucideIcon> = {
  overview: Home,
  customers: Users,
  tireSets: CircleDot,
  orders: ShoppingCart,
  emailInbox: Mail,
  reports: FileText,
  settings: Settings,
};

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

function SidebarHeader() {
  const tNav = useTranslations("nav");
  const tAuth = useTranslations("auth");
  return (
    <header className="flex h-16 shrink-0 items-center justify-center border-b border-surface-container px-4">
      <Link
        href="/dashboard"
        className="flex items-center hover:opacity-90 transition-opacity"
      >
        <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden">
          <Image
            src="/images/logo.png"
            alt={tAuth("logoAlt")}
            width={36}
            height={36}
            className="object-contain"
          />
        </div>
        <span className="font-bold text-foreground text-2xl mt-2">
          Tread<span className="text-primary-dark">X</span>
        </span>
      </Link>
    </header>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const role = useRole();
  const navEntries = getAllowedNavEntries(role);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  function handleLogout() {
    TokenService.removeRefreshToken();
    clearAuth();
    onNavigate?.();
    window.location.href = "/auth";
  }

  const roleLabel = getRoleLabel(role, t);
  const accountName = t("defaultAccountName");

  return (
    <>
      <nav className="flex-1 space-y-1.5 overflow-auto p-3">
        {navEntries.map(({ path, key }) => {
          const Icon = KEY_ICON_MAP[key] ?? Home;
          const isActive =
            key === "overview"
              ? pathname === path
              : pathname === path || pathname.startsWith(path + "/");
          return (
            <Link
              key={path}
              href={path}
              onClick={onNavigate}
              className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "border-primary-dark bg-primary-dark/10 text-primary-dark dark:bg-primary-dark/15"
                  : "border-transparent text-muted-foreground hover:bg-gray-200 hover:text-foreground dark:hover:bg-surface-container dark:hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className="size-5 shrink-0" />
                {t(key)}
              </div>
              {isActive && (
                <span className="text-[10px] font-semibold uppercase tracking-wider text-primary-dark">
                  {t("active")}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto shrink-0 space-y-3 border-t border-surface-container p-3">
        <div className="rounded-lg border-2 border-gray-400 dark:border-border bg-surface-container/50 p-3">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-dark/20 text-primary-dark">
              <User className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">{roleLabel}</p>
              <p className="truncate text-sm font-semibold text-foreground">
                {accountName}
              </p>
              <span className="mt-1 inline-block rounded-full bg-primary-dark px-2 py-0.5 text-[10px] font-medium text-primary-on-container">
                {t("professionalPlan")}
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center justify-center rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-gray-200 hover:text-foreground dark:hover:bg-surface-container dark:hover:text-foreground"
        >
          {t("logout")}
        </button>
      </div>
    </>
  );
}

export function AppSidebar() {
  const t = useTranslations("nav");
  const tAuth = useTranslations("auth");
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const sheetSide = locale === "ar" ? "right" : "left";

  return (
    <>
      {/* Mobile header — visible below sm */}
      <header className="flex sm:hidden h-14 items-center gap-2 border-b border-surface-container bg-surface-light dark:bg-surface-default px-3">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Menu"
          className="flex items-center justify-center rounded-lg p-2 text-muted-foreground transition-colors hover:bg-gray-200 hover:text-foreground dark:hover:bg-surface-container dark:hover:text-foreground"
        >
          <Menu className="size-5" />
        </button>
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-semibold text-foreground hover:underline"
        >
          <Image
            src="/images/logo.png"
            alt={tAuth("logoAlt")}
            width={28}
            height={28}
            className="object-contain"
          />
          {t("appName")}
        </Link>
      </header>

      {/* Mobile drawer */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side={sheetSide}
          className="flex w-[260px] max-w-[85vw] flex-col gap-0 p-0 bg-surface-light dark:bg-surface-default"
          aria-describedby={undefined}
        >
          <SheetTitle className="sr-only">{t("appName")} Menu</SheetTitle>
          <SidebarHeader />
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <SidebarContent onNavigate={() => setOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar — hidden below sm */}
      <aside className="hidden sm:flex h-full w-[260px] shrink-0 flex-col border-e border-surface-container bg-surface-light dark:bg-surface-default text-foreground">
        <SidebarHeader />
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <SidebarContent />
        </div>
      </aside>
    </>
  );
}
