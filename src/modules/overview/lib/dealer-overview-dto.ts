export type OverviewDays = 7 | 30 | 90;

export type LabelCount = {
  label: string;
  count: number;
};

export type OrderDirectionStatusCount = {
  direction: string;
  status: string;
  count: number;
};

export type DealerOverviewQuota = {
  dealerId: number;
  alertThresholdPercent: number;
  activeStaff: number;
  activeStaffLimit: number;
  staffUsagePercent: number;
  thresholdBreachedStaff: boolean;
  tireCount: number;
  tireStorageLimit: number;
  tireUsagePercent: number;
  thresholdBreachedTires: boolean;
  hasActiveSubscription: boolean;
};

export type DealerOverviewLive = {
  serviceSessionsInProgress: number;
  serviceSessionsInProgressByType: LabelCount[];
  handoverOpen: number;
  shipmentDrafts: number;
  shipmentsInCart: number;
  shipmentsSubmitted: number;
  shipmentsInTransit: number;
  upcomingSwapAppointments7d: number;
};

export type DealerOverviewFleet = {
  customersActive: number;
  customersArchived: number;
  vehicles: number;
  tireSets: number;
  tires: number;
  tiresByStatus: LabelCount[];
  staffTotal: number;
  staffActive: number;
};

export type DealerOverviewActivity = {
  serviceSessionsStarted: number;
  serviceSessionsByStatus: LabelCount[];
  serviceSessionsByType: LabelCount[];
  handoverOpened: number;
  handoverClosed: number;
  ordersByDirectionStatus: OrderDirectionStatusCount[];
};

export type DealerOverviewAttentionItem = {
  code?: string;
  message?: string;
  severity?: string;
  [key: string]: unknown;
};

export type DealerOverview = {
  dealerId: number;
  generatedAt: string | null;
  activityWindow: {
    from: string | null;
    to: string | null;
    days: number;
  };
  quota: DealerOverviewQuota;
  live: DealerOverviewLive;
  fleet: DealerOverviewFleet;
  activity: DealerOverviewActivity;
  attention: DealerOverviewAttentionItem[];
};

function asRecord(v: unknown): Record<string, unknown> | null {
  if (!v || typeof v !== "object" || Array.isArray(v)) return null;
  return v as Record<string, unknown>;
}

function str(v: unknown): string | undefined {
  if (typeof v === "string" && v.trim()) return v.trim();
  return undefined;
}

function num(v: unknown): number | undefined {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = Number(v.trim());
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

function bool(v: unknown, fallback = false): boolean {
  if (typeof v === "boolean") return v;
  return fallback;
}

function labelCounts(raw: unknown): LabelCount[] {
  if (!Array.isArray(raw)) return [];
  const out: LabelCount[] = [];
  for (const item of raw) {
    const rec = asRecord(item);
    if (!rec) continue;
    const label = str(rec.label) ?? "—";
    const count = num(rec.count) ?? 0;
    out.push({ label, count });
  }
  return out;
}

function orderDirectionStatusCounts(raw: unknown): OrderDirectionStatusCount[] {
  if (!Array.isArray(raw)) return [];
  const out: OrderDirectionStatusCount[] = [];
  for (const item of raw) {
    const rec = asRecord(item);
    if (!rec) continue;
    out.push({
      direction: str(rec.direction) ?? "—",
      status: str(rec.status) ?? "—",
      count: num(rec.count) ?? 0,
    });
  }
  return out;
}

function normalizeQuota(raw: unknown): DealerOverviewQuota {
  const o = asRecord(raw) ?? {};
  return {
    dealerId: num(o.dealerId) ?? 0,
    alertThresholdPercent: num(o.alertThresholdPercent) ?? 90,
    activeStaff: num(o.activeStaff) ?? 0,
    activeStaffLimit: num(o.activeStaffLimit) ?? 0,
    staffUsagePercent: num(o.staffUsagePercent) ?? 0,
    thresholdBreachedStaff: bool(o.thresholdBreachedStaff),
    tireCount: num(o.tireCount) ?? 0,
    tireStorageLimit: num(o.tireStorageLimit) ?? 0,
    tireUsagePercent: num(o.tireUsagePercent) ?? 0,
    thresholdBreachedTires: bool(o.thresholdBreachedTires),
    hasActiveSubscription: bool(o.hasActiveSubscription, true),
  };
}

function normalizeLive(raw: unknown): DealerOverviewLive {
  const o = asRecord(raw) ?? {};
  return {
    serviceSessionsInProgress: num(o.serviceSessionsInProgress) ?? 0,
    serviceSessionsInProgressByType: labelCounts(o.serviceSessionsInProgressByType),
    handoverOpen: num(o.handoverOpen) ?? 0,
    shipmentDrafts: num(o.shipmentDrafts) ?? 0,
    shipmentsInCart: num(o.shipmentsInCart) ?? 0,
    shipmentsSubmitted: num(o.shipmentsSubmitted) ?? 0,
    shipmentsInTransit: num(o.shipmentsInTransit) ?? 0,
    upcomingSwapAppointments7d: num(o.upcomingSwapAppointments7d) ?? 0,
  };
}

function normalizeFleet(raw: unknown): DealerOverviewFleet {
  const o = asRecord(raw) ?? {};
  return {
    customersActive: num(o.customersActive) ?? 0,
    customersArchived: num(o.customersArchived) ?? 0,
    vehicles: num(o.vehicles) ?? 0,
    tireSets: num(o.tireSets) ?? 0,
    tires: num(o.tires) ?? 0,
    tiresByStatus: labelCounts(o.tiresByStatus),
    staffTotal: num(o.staffTotal) ?? 0,
    staffActive: num(o.staffActive) ?? 0,
  };
}

function normalizeActivity(raw: unknown): DealerOverviewActivity {
  const o = asRecord(raw) ?? {};
  return {
    serviceSessionsStarted: num(o.serviceSessionsStarted) ?? 0,
    serviceSessionsByStatus: labelCounts(o.serviceSessionsByStatus),
    serviceSessionsByType: labelCounts(o.serviceSessionsByType),
    handoverOpened: num(o.handoverOpened) ?? 0,
    handoverClosed: num(o.handoverClosed) ?? 0,
    ordersByDirectionStatus: orderDirectionStatusCounts(o.ordersByDirectionStatus),
  };
}

function normalizeAttention(raw: unknown): DealerOverviewAttentionItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => asRecord(item))
    .filter((item): item is Record<string, unknown> => item != null)
    .map((item) => ({
      ...item,
      code: str(item.code),
      message: str(item.message),
      severity: str(item.severity),
    }));
}

/** Accepts `{ data: {...} }` or bare overview payload. */
export function normalizeDealerOverviewDto(raw: unknown): DealerOverview | null {
  if (!raw || typeof raw !== "object") return null;
  const root = raw as Record<string, unknown>;
  const obj =
    root.data && typeof root.data === "object" && !Array.isArray(root.data)
      ? (root.data as Record<string, unknown>)
      : root;

  const windowRec = asRecord(obj.activityWindow) ?? {};

  return {
    dealerId: num(obj.dealerId) ?? 0,
    generatedAt: str(obj.generatedAt) ?? null,
    activityWindow: {
      from: str(windowRec.from) ?? null,
      to: str(windowRec.to) ?? null,
      days: num(windowRec.days) ?? 30,
    },
    quota: normalizeQuota(obj.quota),
    live: normalizeLive(obj.live),
    fleet: normalizeFleet(obj.fleet),
    activity: normalizeActivity(obj.activity),
    attention: normalizeAttention(obj.attention),
  };
}

/** Humanize API enum labels for display fallbacks. */
export function formatOverviewLabel(label: string): string {
  const key = label.trim();
  if (!key) return "—";
  return key
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
