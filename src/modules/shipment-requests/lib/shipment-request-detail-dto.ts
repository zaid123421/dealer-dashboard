/** Normalized tire set row from GET /v1/dealer/shipment-requests/:id */
export type NormalizedShipmentRequestDetailSetRow = {
  setId: number;
  tireCount: number;
  seasonType: string;
  brand: string;
  size: string;
  displayLabel: string;
};

import { parseHandoverSessionFields } from "@/modules/shipment-requests/lib/shipment-request-dto";

/** Flexible normalizer for GET /v1/dealer/shipment-requests/:id */
export type NormalizedShipmentRequestDetail = {
  id: number;
  dealerId?: number;
  warehouseId?: number;
  dealerCustomerId?: number;
  customerDisplayName: string;
  /** Make + model when available (e.g. "Toyota Camry"). */
  vehicleLabel: string;
  vehiclePlate: string;
  vehicleVin: string;
  direction: string;
  status: string;
  source?: string;
  swapAppointment: string | null;
  preferredDeliveryDay?: string | null;
  submittedAt?: string | null;
  receivedAt?: string | null;
  notes: string;
  version?: number;
  handoverSessionId?: number;
  createdAt?: string | null;
  sets: NormalizedShipmentRequestDetailSetRow[];
};

function asRecord(v: unknown): Record<string, unknown> | null {
  if (!v || typeof v !== "object" || Array.isArray(v)) return null;
  return v as Record<string, unknown>;
}

function str(v: unknown): string | undefined {
  if (typeof v === "string" && v.trim()) return v;
  return undefined;
}

function num(v: unknown): number | undefined {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const t = v.trim();
    if (!t) return undefined;
    const n = Number(t);
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

function pickString(obj: Record<string, unknown>, keys: string[]): string | undefined {
  for (const k of keys) {
    const found = str(obj[k]);
    if (found) return found;
  }
  return undefined;
}

function normalizeSet(item: unknown, idx: number): NormalizedShipmentRequestDetailSetRow {
  const o = asRecord(item);
  const setId = num(o?.setId ?? o?.tireSetId ?? o?.id) ?? idx;
  const tireCount = num(o?.tireCount) ?? 0;
  return {
    setId,
    tireCount,
    seasonType: pickString(o ?? {}, ["seasonType"]) ?? "",
    brand: pickString(o ?? {}, ["brand"]) ?? "",
    size: pickString(o ?? {}, ["size"]) ?? "",
    displayLabel:
      pickString(o ?? {}, ["displayLabel", "label", "setName"]) ?? `Set ${idx + 1}`,
  };
}

/** Accepts the JSON body from GET /v1/dealer/shipment-requests/:id */
export function normalizeShipmentRequestDetailDto(rawUnknown: unknown): NormalizedShipmentRequestDetail | null {
  const raw = asRecord(rawUnknown);
  if (!raw) return null;
  const id = num(raw.id);
  if (id == null) return null;

  const setsRaw = raw.sets;
  const sets = Array.isArray(setsRaw) ? setsRaw.map((item, i) => normalizeSet(item, i)) : [];

  return {
    id,
    dealerId: num(raw.dealerId),
    warehouseId: num(raw.warehouseId),
    dealerCustomerId: num(raw.dealerCustomerId),
    customerDisplayName: pickString(raw, ["customerDisplayName"]) ?? "—",
    vehicleLabel: (() => {
      const make = pickString(raw, ["vehicleMake", "make"]);
      const model = pickString(raw, ["vehicleModel", "model", "carModel"]);
      return (
        pickString(raw, ["vehicleLabel", "vehicleMakeModel", "makeModel"]) ??
        (make || model ? [make, model].filter(Boolean).join(" ") : "")
      );
    })(),
    vehiclePlate: pickString(raw, ["vehiclePlate", "plateNumber"]) ?? "—",
    vehicleVin: pickString(raw, ["vehicleVin", "vin"]) ?? "—",
    direction: (pickString(raw, ["direction"]) ?? "").toUpperCase(),
    status: (pickString(raw, ["status", "shipmentStatus"]) ?? "").toUpperCase(),
    source: pickString(raw, ["source"]),
    swapAppointment:
      pickString(raw, ["swapAppointment", "appointmentAt", "appointment"]) ?? null,
    preferredDeliveryDay: pickString(raw, ["preferredDeliveryDay"]) ?? null,
    submittedAt: pickString(raw, ["submittedAt"]) ?? null,
    receivedAt: pickString(raw, ["receivedAt"]) ?? null,
    notes: pickString(raw, ["notes"]) ?? "",
    version: num(raw.version),
    ...(() => {
      const { handoverSessionId } = parseHandoverSessionFields(raw);
      return { handoverSessionId };
    })(),
    createdAt: pickString(raw, ["createdAt"]) ?? null,
    sets,
  };
}
