"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Warehouse,
  User,
  Menu,
  type LucideIcon,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { getAllowedNavEntries } from "@/shared/config/permissions";
import { useRole } from "@/shared/hooks/use-can-access";
import TokenService from "@/infrastructure/auth/token-service";
import { useAuthStore } from "@/shared/stores/auth-store";
import { ThemeSwitcher } from "./theme-switcher";
import { LocaleSwitcher } from "./locale-switcher";

const KEY_ICON_MAP: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  products: Package,
  orders: ShoppingCart,
  inventory: Warehouse,
  profile: User,
};

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

  return (
    <>
      <nav className="flex-1 space-y-1.5 overflow-auto p-2">
        {navEntries.map(({ path, key }) => {
          const Icon = KEY_ICON_MAP[key] ?? LayoutDashboard;
          const isActive =
            pathname === path || pathname.startsWith(path + "/");
          return (
            <Link
              key={path}
              href={path}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-primary hover:text-primary-foreground"
              }`}
            >
              <Icon className="size-5 shrink-0" />
              {t(key)}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-surface-container p-3 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{t("role")}</span>
          <span className="text-xs font-medium text-foreground">
            {role ?? "—"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeSwitcher />
          <LocaleSwitcher />
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center justify-center rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
        >
          {t("logout")}
        </button>
      </div>
    </>
  );
}

export function AppSidebar() {
  const t = useTranslations("nav");
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
          className="flex items-center justify-center rounded-lg p-2 text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
        >
          <Menu className="size-5" />
        </button>
        <Link
          href="/dashboard"
          className="font-semibold text-foreground hover:underline"
        >
          {t("appName")}
        </Link>
      </header>

      {/* Mobile drawer */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side={sheetSide}
          className="flex w-[260px] max-w-[85vw] flex-col p-0"
        >
          <SheetHeader className="h-14 justify-center border-b border-surface-container px-4">
            <SheetTitle className="text-start font-semibold">
              {t("appName")}
            </SheetTitle>
          </SheetHeader>
          <SidebarContent onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar — hidden below sm */}
      <aside className="hidden sm:flex h-full w-[240px] shrink-0 flex-col border-e border-surface-container bg-surface-light dark:bg-surface-default text-foreground">
        <div className="flex h-14 items-center gap-2 border-b border-surface-container px-4">
          <Link
            href="/dashboard"
            className="font-semibold text-foreground hover:underline"
          >
            {t("appName")}
          </Link>
        </div>
        <SidebarContent />
      </aside>
    </>
  );
}
