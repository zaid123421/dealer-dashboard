export type ServiceSessionStatus = "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export type ServiceSessionType = "INITIAL_INSPECTION" | "ROTATION" | "REPLACEMENT";

export type NormalizedServiceSession = {
  id: number;
  dealerId?: number;
  vehicleId?: number;
  vin: string;
  plate: string;
  dealerCustomerId?: number;
  customerDisplayName: string;
  dealerStaffId?: number;
  tireSetId?: number;
  tireSetLabel: string;
  tireCount: number;
  seasonType: string;
  sessionType: string;
  status: string;
  version?: number;
  startedAt: string | null;
  endedAt: string | null;
  createdAt: string | null;
};

export type ServiceSessionRow = NormalizedServiceSession & {
  startedAtLabel: string;
  endedAtLabel: string | null;
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

export function formatServiceSessionDateTime(iso: string | null, locale: string): string {
  if (!iso?.trim()) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  try {
    return d.toLocaleString(locale, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

/** Accepts one item from GET /v1/service-sessions/all content[]. */
export function normalizeServiceSessionDto(raw: unknown): NormalizedServiceSession | null {
  const obj = asRecord(raw);
  if (!obj) return null;

  const id = num(obj.id);
  if (id == null) return null;

  return {
    id,
    dealerId: num(obj.dealerId),
    vehicleId: num(obj.vehicleId),
    vin: str(obj.vin) ?? "—",
    plate: str(obj.plate) ?? "—",
    dealerCustomerId: num(obj.dealerCustomerId),
    customerDisplayName: str(obj.customerDisplayName) ?? "—",
    dealerStaffId: num(obj.dealerStaffId),
    tireSetId: num(obj.tireSetId),
    tireSetLabel: str(obj.tireSetLabel) ?? "—",
    tireCount: num(obj.tireCount) ?? 0,
    seasonType: (str(obj.seasonType) ?? "—").toUpperCase(),
    sessionType: (str(obj.sessionType) ?? "—").toUpperCase(),
    status: (str(obj.status) ?? "—").toUpperCase(),
    version: num(obj.version),
    startedAt: str(obj.startedAt) ?? null,
    endedAt: str(obj.endedAt) ?? null,
    createdAt: str(obj.createdAt) ?? null,
  };
}

export function toServiceSessionRow(
  row: NormalizedServiceSession,
  locale: string,
): ServiceSessionRow {
  return {
    ...row,
    startedAtLabel: formatServiceSessionDateTime(row.startedAt, locale),
    endedAtLabel: row.endedAt ? formatServiceSessionDateTime(row.endedAt, locale) : null,
  };
}

export function isServiceSessionStatus(value: string): value is ServiceSessionStatus {
  return value === "IN_PROGRESS" || value === "COMPLETED" || value === "CANCELLED";
}

export function isServiceSessionType(value: string): value is ServiceSessionType {
  return (
    value === "INITIAL_INSPECTION" || value === "ROTATION" || value === "REPLACEMENT"
  );
}
