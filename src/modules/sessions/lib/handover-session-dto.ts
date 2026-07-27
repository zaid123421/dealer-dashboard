import type { HandoverDirection } from "@/modules/shipment-requests/services/dealer-handover.service";
import { formatLocaleDateTime } from "@/lib/format-locale";

export type HandoverSessionStatus = "OPEN" | "CLOSED" | "CANCELLED";

export type NormalizedHandoverTireSet = {
  shipmentRequestId: number | null;
  tireSetId: number | null;
  tireSetLabel: string;
  seasonType: string;
  customerDisplayName: string;
  vehicleLabel: string;
  plate: string;
  scanned: number;
  total: number;
};

export type NormalizedHandoverSession = {
  id: number;
  dealerId: number | null;
  warehouseId: number | null;
  direction: HandoverDirection;
  status: HandoverSessionStatus | string;
  openedByDealerStaffId: number | null;
  openedByName: string;
  openedAt: string | null;
  closedAt: string | null;
  version: number | null;
  matched: number;
  total: number;
  discrepancies: number;
  shipmentRequestIds: number[];
  tireSets: NormalizedHandoverTireSet[];
};

export type HandoverSessionRow = NormalizedHandoverSession & {
  openedAtLabel: string;
  closedAtLabel: string;
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

function normalizeDirection(raw: unknown): HandoverDirection {
  const s = str(raw)?.toUpperCase();
  if (s === "OUTBOUND_PICKUP") return "OUTBOUND_PICKUP";
  return "INBOUND_DELIVERY";
}

function normalizeStatus(raw: unknown): string {
  return str(raw)?.toUpperCase() ?? "OPEN";
}

function normalizeTireSet(raw: unknown): NormalizedHandoverTireSet | null {
  const obj = asRecord(raw);
  if (!obj) return null;
  return {
    shipmentRequestId: num(obj.shipmentRequestId) ?? null,
    tireSetId: num(obj.tireSetId) ?? null,
    tireSetLabel: str(obj.tireSetLabel) ?? "—",
    seasonType: str(obj.seasonType) ?? "—",
    customerDisplayName: str(obj.customerDisplayName) ?? "—",
    vehicleLabel: str(obj.vehicleLabel) ?? "—",
    plate: str(obj.plate) ?? "—",
    scanned: num(obj.scanned) ?? 0,
    total: num(obj.total) ?? 0,
  };
}

/** Accepts one item from GET /v1/dealer/handover/all content[]. */
export function normalizeHandoverSessionDto(raw: unknown): NormalizedHandoverSession | null {
  const obj = asRecord(raw);
  if (!obj) return null;

  const id = num(obj.id);
  if (id == null) return null;

  const tireSets: NormalizedHandoverTireSet[] = [];
  if (Array.isArray(obj.tireSets)) {
    for (const item of obj.tireSets) {
      const ts = normalizeTireSet(item);
      if (ts) tireSets.push(ts);
    }
  }

  const shipmentRequestIds: number[] = [];
  if (Array.isArray(obj.shipmentRequestIds)) {
    for (const item of obj.shipmentRequestIds) {
      const n = num(item);
      if (n != null) shipmentRequestIds.push(n);
    }
  }

  return {
    id,
    dealerId: num(obj.dealerId) ?? null,
    warehouseId: num(obj.warehouseId) ?? null,
    direction: normalizeDirection(obj.direction),
    status: normalizeStatus(obj.status),
    openedByDealerStaffId: num(obj.openedByDealerStaffId) ?? null,
    openedByName: str(obj.openedByName) ?? "—",
    openedAt: str(obj.openedAt) ?? null,
    closedAt: str(obj.closedAt) ?? null,
    version: num(obj.version) ?? null,
    matched: num(obj.matched) ?? 0,
    total: num(obj.total) ?? 0,
    discrepancies: num(obj.discrepancies) ?? 0,
    shipmentRequestIds,
    tireSets,
  };
}

export function toHandoverSessionRow(
  row: NormalizedHandoverSession,
  locale: string,
): HandoverSessionRow {
  return {
    ...row,
    openedAtLabel: formatLocaleDateTime(row.openedAt, locale),
    closedAtLabel: formatLocaleDateTime(row.closedAt, locale),
  };
}
