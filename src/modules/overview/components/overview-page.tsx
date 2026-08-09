"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  AlertTriangle,
  CalendarClock,
  ClipboardList,
  Package,
  PackageCheck,
  ShoppingCart,
  Truck,
  Users,
  Car,
  Layers,
  CircleDot,
  UserCog,
  Wrench,
  ArrowUpFromLine,
  ArrowDownToLine,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ErrorAlert } from "@/components/ui/error-alert";
import { Badge } from "@/components/ui/badge";
import { StatTile, StatTileSkeleton } from "@/components/ui/stat-tile";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatLocaleDateTime } from "@/lib/format-locale";
import { RADIUS_PANEL, RADIUS_PILL } from "@/lib/radius";
import { TABLE_BORDER_COLOR } from "@/lib/table-border";
import { useDealerOverview } from "@/modules/overview/hooks/use-dealer-overview";
import {
  formatOverviewLabel,
  type OverviewDays,
} from "@/modules/overview/lib/dealer-overview-dto";
import { ReportsPage } from "@/modules/reports/components/reports-page";

const DAY_OPTIONS: OverviewDays[] = [7, 30, 90];

const CHART_COLORS = [
  "#ea580c",
  "#2563eb",
  "#059669",
  "#d97706",
  "#dc2626",
  "#0d9488",
  "#4f46e5",
  "#64748b",
];

type Translate = (key: string, values?: Record<string, string | number | Date>) => string;

function Panel({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "flex min-h-0 flex-col gap-4 border-2 p-4 sm:p-5",
        RADIUS_PANEL,
        TABLE_BORDER_COLOR,
        "bg-surface-lightContainer dark:bg-surface-container",
        className,
      )}
    >
      <div>
        <h2 className="text-body-md font-semibold text-foreground">{title}</h2>
        {description ? (
          <p className="mt-0.5 text-body-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function UsageMeter({
  label,
  used,
  limit,
  percent,
  breached,
  unit,
}: {
  label: string;
  used: number;
  limit: number;
  percent: number;
  breached: boolean;
  unit: string;
}) {
  const pct = Math.min(100, Math.max(0, Math.round(percent)));
  const severity = breached || pct >= 90 ? "full" : pct >= 75 ? "warning" : "ok";
  const styles = {
    ok: {
      bar: "bg-primary-dark",
      track: "bg-primary-dark/15",
      value: "text-primary-dark dark:text-primary",
    },
    warning: {
      bar: "bg-amber-500",
      track: "bg-amber-500/15",
      value: "text-amber-600 dark:text-amber-400",
    },
    full: {
      bar: "bg-destructive",
      track: "bg-destructive/15",
      value: "text-destructive",
    },
  }[severity];

  return (
    <div className="space-y-3 rounded-lg bg-muted/30 p-4 dark:bg-muted/10">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-label-sm font-medium text-muted-foreground">{label}</p>
          <p className={cn("mt-1 text-2xl font-extrabold tabular-nums", styles.value)}>
            {used}
            <span className="ms-1 text-sm font-semibold text-muted-foreground">/ {limit}</span>
          </p>
        </div>
        <Badge
          className={cn(
            "border-0 px-2.5 py-1 text-label-sm font-semibold shadow-none",
            severity === "ok" && "bg-primary-dark/10 text-primary-dark dark:bg-primary-dark/20 dark:text-primary",
            severity === "warning" && "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
            severity === "full" && "bg-destructive/15 text-destructive",
          )}
        >
          {pct}%
        </Badge>
      </div>
      <div className={cn("h-2.5 overflow-hidden rounded-full", styles.track)}>
        <div
          className={cn("h-full rounded-full transition-all duration-700 ease-out", styles.bar)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-label-sm text-muted-foreground">{unit}</p>
    </div>
  );
}

function ChartEmpty({ message }: { message: string }) {
  return (
    <div className="flex h-[240px] items-center justify-center rounded-lg bg-muted/20 text-body-sm text-muted-foreground">
      {message}
    </div>
  );
}

function ChartTooltipBox({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number | string; color?: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className={cn(
        "rounded-lg border-2 bg-card px-3 py-2 shadow-md",
        TABLE_BORDER_COLOR,
      )}
    >
      {label ? <p className="mb-1 text-label-sm font-semibold text-foreground">{label}</p> : null}
      <ul className="space-y-1">
        {payload.map((entry, idx) => (
          <li key={`${entry.name}-${idx}`} className="flex items-center gap-2 text-label-sm">
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: entry.color ?? CHART_COLORS[idx % CHART_COLORS.length] }}
            />
            <span className="text-muted-foreground">{entry.name}</span>
            <span className="ms-auto font-semibold tabular-nums text-foreground">{entry.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function labelize(
  code: string,
  t: Translate,
  map: Record<string, string>,
): string {
  const key = map[code.toUpperCase()];
  if (key) return t(key);
  return formatOverviewLabel(code);
}

const TIRE_STATUS_I18N: Record<string, string> = {
  DAMAGED: "overviewTireStatusDAMAGED",
  INBOUND_EXPECTED: "overviewTireStatusINBOUND_EXPECTED",
  INSTALLATION: "overviewTireStatusINSTALLATION",
  IN_SERVICE: "overviewTireStatusIN_SERVICE",
  SHIPPED: "overviewTireStatusSHIPPED",
  STORED: "overviewTireStatusSTORED",
  READY: "overviewTireStatusREADY",
};

const SESSION_TYPE_I18N: Record<string, string> = {
  INITIAL_INSPECTION: "overviewSessionTypeINITIAL_INSPECTION",
  ROTATION: "overviewSessionTypeROTATION",
  REPLACEMENT: "overviewSessionTypeREPLACEMENT",
  SET_REPLACEMENT: "overviewSessionTypeSET_REPLACEMENT",
};

const SESSION_STATUS_I18N: Record<string, string> = {
  IN_PROGRESS: "overviewSessionStatusIN_PROGRESS",
  COMPLETED: "overviewSessionStatusCOMPLETED",
  CANCELLED: "overviewSessionStatusCANCELLED",
};

const ORDER_DIRECTION_I18N: Record<string, string> = {
  PICKUP: "overviewOrderDirectionPICKUP",
  DELIVERY: "overviewOrderDirectionDELIVERY",
};

const ORDER_STATUS_I18N: Record<string, string> = {
  DRAFT: "overviewOrderStatusDRAFT",
  IN_CART: "overviewOrderStatusIN_CART",
  SUBMITTED: "overviewOrderStatusSUBMITTED",
  RECEIVED: "overviewOrderStatusRECEIVED",
  FULFILLED: "overviewOrderStatusFULFILLED",
  CANCELLED: "overviewOrderStatusCANCELLED",
  IN_TRANSIT: "overviewOrderStatusIN_TRANSIT",
};

export function OverviewPage() {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const [days, setDays] = useState<OverviewDays>(30);

  const { data, isLoading, isError, error, refetch, isFetching } = useDealerOverview(days);
  const loading = isLoading || (isFetching && !data);

  const tiresByStatusChart = useMemo(() => {
    if (!data) return [];
    return data.fleet.tiresByStatus.map((item) => ({
      name: labelize(item.label, t, TIRE_STATUS_I18N),
      value: item.count,
      raw: item.label,
    }));
  }, [data, t]);

  const sessionsByTypeChart = useMemo(() => {
    if (!data) return [];
    return data.activity.serviceSessionsByType.map((item) => ({
      name: labelize(item.label, t, SESSION_TYPE_I18N),
      count: item.count,
      raw: item.label,
    }));
  }, [data, t]);

  const sessionsByStatusChart = useMemo(() => {
    if (!data) return [];
    return data.activity.serviceSessionsByStatus.map((item) => ({
      name: labelize(item.label, t, SESSION_STATUS_I18N),
      count: item.count,
      raw: item.label,
    }));
  }, [data, t]);

  const ordersChart = useMemo(() => {
    if (!data) return [];
    return data.activity.ordersByDirectionStatus.map((item) => ({
      name: `${labelize(item.direction, t, ORDER_DIRECTION_I18N)} · ${labelize(item.status, t, ORDER_STATUS_I18N)}`,
      count: item.count,
      direction: item.direction,
      status: item.status,
    }));
  }, [data, t]);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-headline-sm font-bold text-foreground">{t("overviewTitle")}</h1>
          <p className="mt-1 text-body-md text-subtle">{t("overviewIntro")}</p>
          {data?.generatedAt ? (
            <p className="mt-1 text-label-sm text-muted-foreground">
              {t("overviewGeneratedAt", {
                time: formatLocaleDateTime(data.generatedAt, locale),
              })}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-label-sm font-medium text-muted-foreground">
            {t("overviewWindowLabel")}
          </span>
          <div className="inline-flex rounded-lg border border-border bg-muted/30 p-1">
            {DAY_OPTIONS.map((option) => {
              const active = days === option;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setDays(option)}
                  className={cn(
                    "px-3 py-1.5 text-label-sm font-semibold transition-all",
                    RADIUS_PILL,
                    active
                      ? "bg-primary-dark text-white shadow-sm dark:bg-primary dark:text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                  )}
                >
                  {t("overviewDaysOption", { days: option })}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {isError ? (
        <ErrorAlert
          message={error instanceof Error ? error.message : t("overviewLoadError")}
          onRetry={() => void refetch()}
          retryLabel={t("overviewRetry")}
        />
      ) : null}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <StatTileSkeleton key={i} large />
          ))}
        </div>
      ) : data ? (
        <>
          <Panel title={t("overviewLiveTitle")} description={t("overviewLiveDescription")}>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatTile
                icon={Wrench}
                label={t("overviewLiveServiceInProgress")}
                value={data.live.serviceSessionsInProgress}
                accent="info"
                size="large"
              />
              <StatTile
                icon={PackageCheck}
                label={t("overviewLiveHandoverOpen")}
                value={data.live.handoverOpen}
                accent="primary"
                size="large"
              />
              <StatTile
                icon={ShoppingCart}
                label={t("overviewLiveInCart")}
                value={data.live.shipmentsInCart}
                accent="none"
                size="large"
              />
              <StatTile
                icon={ClipboardList}
                label={t("overviewLiveSubmitted")}
                value={data.live.shipmentsSubmitted}
                accent="success"
                size="large"
              />
              <StatTile
                icon={Truck}
                label={t("overviewLiveInTransit")}
                value={data.live.shipmentsInTransit}
                accent="info"
                size="large"
              />
              <StatTile
                icon={Package}
                label={t("overviewLiveDrafts")}
                value={data.live.shipmentDrafts}
                accent="none"
                size="large"
              />
              <StatTile
                icon={CalendarClock}
                label={t("overviewLiveUpcomingSwaps")}
                value={data.live.upcomingSwapAppointments7d}
                accent="primary"
                size="large"
              />
            </div>
          </Panel>

          <div className="grid gap-5 lg:grid-cols-2">
            <Panel title={t("overviewQuotaTitle")} description={t("overviewQuotaDescription")}>
              <div className="grid gap-4 sm:grid-cols-2">
                <UsageMeter
                  label={t("overviewQuotaStaff")}
                  used={data.quota.activeStaff}
                  limit={data.quota.activeStaffLimit}
                  percent={data.quota.staffUsagePercent}
                  breached={data.quota.thresholdBreachedStaff}
                  unit={t("overviewQuotaStaffUnit")}
                />
                <UsageMeter
                  label={t("overviewQuotaTires")}
                  used={data.quota.tireCount}
                  limit={data.quota.tireStorageLimit}
                  percent={data.quota.tireUsagePercent}
                  breached={data.quota.thresholdBreachedTires}
                  unit={t("overviewQuotaTiresUnit")}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge
                  className={cn(
                    "border-0 px-3 py-1 text-label-sm font-semibold shadow-none",
                    data.quota.hasActiveSubscription
                      ? "bg-emerald-600 text-white"
                      : "bg-destructive text-destructive-foreground",
                  )}
                >
                  {data.quota.hasActiveSubscription
                    ? t("overviewSubscriptionActive")
                    : t("overviewSubscriptionInactive")}
                </Badge>
              </div>
            </Panel>

            <Panel title={t("overviewFleetTitle")} description={t("overviewFleetDescription")}>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <StatTile
                  icon={Users}
                  label={t("overviewFleetCustomersActive")}
                  value={data.fleet.customersActive}
                  accent="success"
                />
                <StatTile
                  icon={Users}
                  label={t("overviewFleetCustomersArchived")}
                  value={data.fleet.customersArchived}
                  accent="none"
                />
                <StatTile
                  icon={Car}
                  label={t("overviewFleetVehicles")}
                  value={data.fleet.vehicles}
                  accent="info"
                />
                <StatTile
                  icon={Layers}
                  label={t("overviewFleetTireSets")}
                  value={data.fleet.tireSets}
                  accent="primary"
                />
                <StatTile
                  icon={CircleDot}
                  label={t("overviewFleetTires")}
                  value={data.fleet.tires}
                  accent="primary"
                />
                <StatTile
                  icon={UserCog}
                  label={t("overviewFleetStaff")}
                  value={`${data.fleet.staffActive}/${data.fleet.staffTotal}`}
                  accent="none"
                />
              </div>
            </Panel>
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            <Panel title={t("overviewTiresByStatusTitle")} description={t("overviewTiresByStatusDescription")}>
              {tiresByStatusChart.length === 0 ? (
                <ChartEmpty message={t("overviewChartEmpty")} />
              ) : (
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={tiresByStatusChart}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={58}
                        outerRadius={96}
                        paddingAngle={2}
                        strokeWidth={0}
                      >
                        {tiresByStatusChart.map((entry, index) => (
                          <Cell
                            key={entry.raw}
                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                            className="outline-none transition-opacity hover:opacity-90"
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<ChartTooltipBox />} />
                      <Legend
                        verticalAlign="bottom"
                        height={48}
                        formatter={(value) => (
                          <span className="text-label-sm text-muted-foreground">{value}</span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Panel>

            <Panel
              title={t("overviewSessionsByTypeTitle")}
              description={t("overviewSessionsByTypeDescription", { days })}
            >
              {sessionsByTypeChart.length === 0 ? (
                <ChartEmpty message={t("overviewChartEmpty")} />
              ) : (
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sessionsByTypeChart} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11 }}
                        className="fill-muted-foreground"
                        interval={0}
                        angle={-18}
                        textAnchor="end"
                        height={56}
                      />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                      <Tooltip content={<ChartTooltipBox />} cursor={{ fill: "hsl(var(--muted) / 0.35)" }} />
                      <Bar dataKey="count" name={t("overviewChartCount")} radius={[6, 6, 0, 0]} maxBarSize={48}>
                        {sessionsByTypeChart.map((entry, index) => (
                          <Cell key={entry.raw} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Panel>
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            <Panel
              title={t("overviewSessionsByStatusTitle")}
              description={t("overviewSessionsByStatusDescription", { days })}
            >
              <div className="mb-3 grid gap-3 sm:grid-cols-3">
                <StatTile
                  icon={Wrench}
                  label={t("overviewActivitySessionsStarted")}
                  value={data.activity.serviceSessionsStarted}
                  accent="primary"
                />
                <StatTile
                  icon={ArrowUpFromLine}
                  label={t("overviewActivityHandoverOpened")}
                  value={data.activity.handoverOpened}
                  accent="info"
                />
                <StatTile
                  icon={ArrowDownToLine}
                  label={t("overviewActivityHandoverClosed")}
                  value={data.activity.handoverClosed}
                  accent="success"
                />
              </div>
              {sessionsByStatusChart.length === 0 ? (
                <ChartEmpty message={t("overviewChartEmpty")} />
              ) : (
                <div className="h-[240px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={sessionsByStatusChart}
                      margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
                      <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={100}
                        tick={{ fontSize: 11 }}
                        className="fill-muted-foreground"
                      />
                      <Tooltip content={<ChartTooltipBox />} cursor={{ fill: "hsl(var(--muted) / 0.35)" }} />
                      <Bar dataKey="count" name={t("overviewChartCount")} radius={[0, 6, 6, 0]} maxBarSize={28}>
                        {sessionsByStatusChart.map((entry, index) => (
                          <Cell
                            key={entry.raw}
                            fill={
                              entry.raw === "COMPLETED"
                                ? "#059669"
                                : entry.raw === "CANCELLED"
                                  ? "#dc2626"
                                  : CHART_COLORS[index % CHART_COLORS.length]
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Panel>

            <Panel
              title={t("overviewOrdersTitle")}
              description={t("overviewOrdersDescription", { days })}
            >
              {ordersChart.length === 0 ? (
                <ChartEmpty message={t("overviewChartEmpty")} />
              ) : (
                <div className="h-[320px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ordersChart} margin={{ top: 8, right: 8, left: 0, bottom: 48 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 10 }}
                        interval={0}
                        angle={-24}
                        textAnchor="end"
                        height={70}
                      />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                      <Tooltip content={<ChartTooltipBox />} cursor={{ fill: "hsl(var(--muted) / 0.35)" }} />
                      <Bar
                        dataKey="count"
                        name={t("overviewChartCount")}
                        fill="#2563eb"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={44}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Panel>
          </div>

          {data.attention.length > 0 ? (
            <Panel title={t("overviewAttentionTitle")} description={t("overviewAttentionDescription")}>
              <ul className="space-y-2">
                {data.attention.map((item, index) => (
                  <li
                    key={`${item.code ?? "attn"}-${index}`}
                    className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-50/80 px-3 py-2.5 dark:bg-amber-950/20"
                  >
                    <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                    <div className="min-w-0">
                      {item.code ? (
                        <p className="text-label-sm font-semibold text-amber-800 dark:text-amber-300">
                          {item.code}
                        </p>
                      ) : null}
                      <p className="text-body-sm text-foreground">
                        {item.message ?? t("overviewAttentionFallback")}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </Panel>
          ) : null}
        </>
      ) : null}

      {loading && !data ? (
        <div className="grid gap-5 xl:grid-cols-2">
          <Skeleton className="h-[320px] w-full rounded-lg" />
          <Skeleton className="h-[320px] w-full rounded-lg" />
        </div>
      ) : null}

      <div className="border-t border-border pt-5">
        <ReportsPage />
      </div>
    </div>
  );
}
