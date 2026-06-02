"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  ChevronDown,
  Home,
  Users,
  UserCog,
  CircleDot,
  ShoppingCart,
  Mail,
  FileText,
  Settings,
  Menu,
  ClipboardList,
  Truck,
  Store,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { ROUTES } from "@/constants/routes";
import { getAllowedNavEntries } from "@/shared/config/permissions";
import { useRole } from "@/shared/hooks/use-can-access";
import { useDealerAccount } from "@/shared/hooks/use-dealer-account";
import { performClientLogout } from "@/application/auth/logout.use-case";

const KEY_ICON_MAP: Record<string, LucideIcon> = {
  overview: Home,
  cart: ShoppingCart,
  pickupCart: ShoppingCart,
  pickupOrders: ShoppingCart,
  customers: Users,
  staff: UserCog,
  tireSets: CircleDot,
  orders: ShoppingCart,
  sessions: ClipboardList,
  emailInbox: Mail,
  reports: FileText,
  settings: Settings,
};

function NavSubItem({
  href,
  active,
  icon: Icon,
  children,
  onNavigate,
}: {
  href: string;
  active: boolean;
  icon: LucideIcon;
  children: ReactNode;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors duration-200",
        active
          ? "bg-primary-dark/10 font-medium text-primary-dark dark:bg-primary-dark/15"
          : "text-muted-foreground hover:bg-muted/55 hover:text-foreground dark:hover:bg-white/[0.06]",
      )}
    >
      <Icon
        className={cn(
          "size-4 shrink-0 transition-opacity",
          active ? "text-primary-dark opacity-100" : "opacity-55 group-hover:opacity-90",
        )}
        aria-hidden
      />
      <span className="min-w-0 flex-1 leading-snug">{children}</span>
    </Link>
  );
}

function SidebarHeader() {
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
  const { displayName, roleDisplay, planName, avatarInitials } = useDealerAccount();
  const navEntries = getAllowedNavEntries(role);
  const pickupOrdersEntry = navEntries.find((entry) => entry.key === "pickupOrders");
  const pickupCartEntry = navEntries.find((entry) => entry.key === "pickupCart");
  const rootEntries = navEntries.filter(
    (entry) => entry.key !== "pickupOrders" && entry.key !== "pickupCart",
  );
  const cartGroupActive =
    pathname === ROUTES.DASHBOARD.DELIVERY_CART ||
    pathname.startsWith(ROUTES.DASHBOARD.DELIVERY_CART + "/") ||
    pathname === ROUTES.DASHBOARD.PICKUP_CART ||
    pathname.startsWith(ROUTES.DASHBOARD.PICKUP_CART + "/");
  const ordersGroupActive =
    pathname === ROUTES.DASHBOARD.ORDERS.LIST ||
    pathname.startsWith(ROUTES.DASHBOARD.ORDERS.LIST + "/") ||
    pathname === ROUTES.DASHBOARD.PICKUP_ORDERS ||
    pathname.startsWith(ROUTES.DASHBOARD.PICKUP_ORDERS + "/");
  const [cartOpen, setCartOpen] = useState(cartGroupActive);
  const [ordersOpen, setOrdersOpen] = useState(ordersGroupActive);

  async function handleLogout() {
    onNavigate?.();
    await performClientLogout();
  }

  return (
    <>
      <nav className="flex-1 space-y-1.5 overflow-auto p-3">
        {rootEntries.map(({ path, key }) => {
          const Icon = KEY_ICON_MAP[key] ?? Home;
          if (key === "cart" && pickupCartEntry) {
            const deliveryCartActive =
              pathname === ROUTES.DASHBOARD.DELIVERY_CART ||
              pathname.startsWith(ROUTES.DASHBOARD.DELIVERY_CART + "/");
            const pickupCartActive =
              pathname === ROUTES.DASHBOARD.PICKUP_CART ||
              pathname.startsWith(ROUTES.DASHBOARD.PICKUP_CART + "/");
            return (
              <div key={path} className="space-y-1">
                <button
                  type="button"
                  onClick={() => setCartOpen((v) => !v)}
                  className={`cursor-pointer flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                    cartGroupActive
                      ? "border-primary-dark bg-primary-dark/10 text-primary-dark dark:bg-primary-dark/15"
                      : "border-transparent text-muted-foreground hover:bg-gray-200 hover:text-foreground dark:hover:bg-surface-container dark:hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="size-5 shrink-0" />
                    {t("cart")}
                  </div>
                  <ChevronDown
                    className={`size-4 transition-transform duration-200 ${
                      cartOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ease-out ${
                    cartOpen ? "max-h-56 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="ms-2 mt-1 flex flex-col gap-0.5 py-0.5 ps-2">
                    <NavSubItem
                      href={ROUTES.DASHBOARD.DELIVERY_CART}
                      active={deliveryCartActive}
                      icon={Truck}
                      onNavigate={onNavigate}
                    >
                      {t("deliveryCart")}
                    </NavSubItem>
                    <NavSubItem
                      href={ROUTES.DASHBOARD.PICKUP_CART}
                      active={pickupCartActive}
                      icon={Store}
                      onNavigate={onNavigate}
                    >
                      {t("pickupCart")}
                    </NavSubItem>
                  </div>
                </div>
              </div>
            );
          }
          if (key === "orders" && pickupOrdersEntry) {
            const deliveryActive =
              pathname === ROUTES.DASHBOARD.ORDERS.LIST ||
              pathname.startsWith(ROUTES.DASHBOARD.ORDERS.LIST + "/");
            const pickupActive =
              pathname === ROUTES.DASHBOARD.PICKUP_ORDERS ||
              pathname.startsWith(ROUTES.DASHBOARD.PICKUP_ORDERS + "/");
            return (
              <div key={path} className="space-y-1">
                <button
                  type="button"
                  onClick={() => setOrdersOpen((v) => !v)}
                  className={`cursor-pointer flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                    ordersGroupActive
                      ? "border-primary-dark bg-primary-dark/10 text-primary-dark dark:bg-primary-dark/15"
                      : "border-transparent text-muted-foreground hover:bg-gray-200 hover:text-foreground dark:hover:bg-surface-container dark:hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="size-5 shrink-0" />
                    {t("orders")}
                  </div>
                  <ChevronDown
                    className={`size-4 transition-transform duration-200 ${
                      ordersOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ease-out ${
                    ordersOpen ? "max-h-56 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="ms-2 mt-1 flex flex-col gap-0.5 py-0.5 ps-2">
                    <NavSubItem
                      href={ROUTES.DASHBOARD.ORDERS.LIST}
                      active={deliveryActive}
                      icon={Truck}
                      onNavigate={onNavigate}
                    >
                      {t("deliveryOrders")}
                    </NavSubItem>
                    <NavSubItem
                      href={ROUTES.DASHBOARD.PICKUP_ORDERS}
                      active={pickupActive}
                      icon={Store}
                      onNavigate={onNavigate}
                    >
                      {t("pickupOrders")}
                    </NavSubItem>
                  </div>
                </div>
              </div>
            );
          }
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
        <div className="rounded-lg border border-border bg-surface-container/50 p-3">
          <div className="flex items-center gap-3">
            <div
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-dark/20 text-xs font-bold uppercase tracking-tight text-primary-dark"
              aria-hidden
            >
              {avatarInitials}
            </div>
            <div className="min-w-0 flex-1 space-y-0.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary-dark">
                {roleDisplay}
              </p>
              <p className="truncate text-sm font-semibold text-foreground leading-tight">
                {displayName}
              </p>
              {planName ? (
                <span className="mt-1 inline-block max-w-full truncate rounded-full bg-primary-dark px-2 py-0.5 text-[10px] font-medium text-primary-on-container">
                  {planName}
                </span>
              ) : null}
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
