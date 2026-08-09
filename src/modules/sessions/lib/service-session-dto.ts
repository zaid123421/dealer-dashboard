import { formatLocaleDateTime } from "@/lib/format-locale";

export type ServiceSessionStatus = "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
export type ServiceSessionType =
  | "INITIAL_INSPECTION"
  | "ROTATION"
  | "REPLACEMENT"
  | "SET_REPLACEMENT";

export type NormalizedServiceSession = {
  id: number;
  dealerId: number | null;
  vehicleId: number | null;
  vin: string;
  plate: string;
  dealerCustomerId: number | null;
  customerDisplayName: string;
  dealerStaffId: number | null;
  dealerStaffName: string;
  tireSetId: number | null;
  tireSetLabel: string;
  tireCount: number;
  seasonType: string;
  sessionType: string;
  status: string;
  version: number | null;
  startedAt: string | null;
  endedAt: string | null;
  createdAt: string | null;
};

export type ServiceSessionRow = NormalizedServiceSession & {
  startedAtLabel: string;
  endedAtLabel: string;
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

/** Accepts one item from GET /v1/service-sessions/all content[]. */
export function normalizeServiceSessionDto(raw: unknown): NormalizedServiceSession | null {
  const obj = asRecord(raw);
  if (!obj) return null;

  const id = num(obj.id);
  if (id == null) return null;

  return {
    id,
    dealerId: num(obj.dealerId) ?? null,
    vehicleId: num(obj.vehicleId) ?? null,
    vin: str(obj.vin) ?? "—",
    plate: str(obj.plate) ?? "—",
    dealerCustomerId: num(obj.dealerCustomerId) ?? null,
    customerDisplayName: str(obj.customerDisplayName) ?? "—",
    dealerStaffId: num(obj.dealerStaffId) ?? null,
    dealerStaffName: str(obj.dealerStaffName) ?? "—",
    tireSetId: num(obj.tireSetId) ?? null,
    tireSetLabel: str(obj.tireSetLabel) ?? "",
    tireCount: num(obj.tireCount) ?? 0,
    seasonType: str(obj.seasonType)?.toUpperCase() ?? "—",
    sessionType: str(obj.sessionType)?.toUpperCase() ?? "—",
    status: str(obj.status)?.toUpperCase() ?? "—",
    version: num(obj.version) ?? null,
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
    startedAtLabel: formatLocaleDateTime(row.startedAt, locale),
    endedAtLabel: formatLocaleDateTime(row.endedAt, locale),
  };
}

export function truncateVin(vin: string, keep = 8): string {
  if (!vin || vin === "—") return "—";
  if (vin.length <= keep) return vin;
  return `${vin.slice(0, keep)}…`;
}
