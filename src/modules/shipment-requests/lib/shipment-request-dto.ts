export type ShipmentUiStatus =
  | "confirmed"
  | "handover"
  | "completed"
  | "cancelled"
  | "in_progress"
  | "in_cart";

/** Statuses for main order-book lists (delivery & pickup). Excludes DRAFT and IN_CART (cart/email flows). */
export const DEALER_ORDER_BOOK_STATUSES = [
  "SUBMITTED",
  "IN_TRANSIT",
  "RECEIVED",
  "CANCELLED",
  "REJECTED",
] as const;

export type NormalizedTireSetRow = {
  id: string;
  label: string;
  subtitle: string;
  lineStatus: string;
};

/** handoverSessionId from list/detail (IN_TRANSIT orders). */
export function parseHandoverSessionFields(raw: Record<string, unknown>): {
  handoverSessionId?: number;
} {
  const nested = asRecord(raw.handoverSession);
  const handoverSessionId = (() => {
    const direct = num(
      raw.handoverSessionId ??
        raw.handOverSessionId ??
        raw.handoverId ??
        raw.openHandoverSessionId ??
        raw.activeHandoverSessionId,
    );
    if (direct !== undefined) return direct;
    return nested ? num(nested.id ?? nested.sessionId) : undefined;
  })();
  return { handoverSessionId };
}

export type NormalizedDeliveryOrderRow = {
  id: number;
  /** Optimistic lock from GET /v1/dealer/shipment-requests (`version` on each row). */
  version?: number;
  /** Active handover session when status is IN_TRANSIT. */
  handoverSessionId?: number;
  orderLabel: string;
  direction: string;
  rawStatus: string;
  uiStatus: ShipmentUiStatus;
  appointmentDate: Date | null;
  customerCount: number;
  setCount: number;
  customerNames: string[];
  sets: NormalizedTireSetRow[];
  /** Primary customer display name (from customerDisplayName field when available). */
  primaryCustomerName: string;
  /** Vehicle plate number extracted from the order-level response. */
  vehiclePlate: string;
  /** Vehicle label: make + model when available (e.g. "Toyota Camry"). */
  vehicleLabel: string;
  /** Free-text notes on the order. */
  notes: string;
  /** Delivery/customer address when returned by the API. */
  address: string;
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

function parseAppointment(raw: Record<string, unknown>): Date | null {
  const s = pickString(raw, [
    "swapAppointment",
    "appointmentAt",
    "appointment",
    "appointmentDateTime",
    "desiredDeliveryAt",
    "scheduledDeliveryAt",
    "deliveryAppointment",
    "deliveryDate",
  ]);
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function mapRawStatusToUi(status: string): ShipmentUiStatus {
  const s = status.toUpperCase();
  if (s === "IN_CART") return "in_cart";
  if (s === "RECEIVED") return "completed";
  if (s === "IN_TRANSIT") return "handover";
  if (s === "SUBMITTED") return "confirmed";
  if (s === "CANCELLED" || s === "REJECTED") return "cancelled";
  return "in_progress";
}

function fixFormatOrderLabel(id: number, appointment: Date | null): string {
  const refYear = appointment?.getFullYear() ?? new Date().getFullYear();
  return `DEL-${refYear}-${String(id).padStart(3, "0")}`;
}

function normalizeSetLine(item: unknown, idx: number): NormalizedTireSetRow {
  const o = asRecord(item);
  if (!o) {
    return {
      id: String(idx),
      label: `Set ${idx + 1}`,
      subtitle: "",
      lineStatus: "Ready",
    };
  }
  const setName =
    pickString(o, ["setName", "displayLabel", "label", "seasonLabel", "name", "tireSetLabel"]) ??
    "Tire set";
  const tireCount = num(o.tireCount) ?? num(o.tiresCount) ?? num(o.quantity);
  const countSuffix = tireCount != null && tireCount > 0 ? ` (${tireCount} tires)` : "";
  const customer = pickString(o, ["customerName", "dealerCustomerName", "customer", "ownerName"]);
  const make = pickString(o, ["vehicleMake", "make"]);
  const model = pickString(o, ["vehicleModel", "model", "carModel"]);
  const vehicle =
    pickString(o, ["vehicleLabel", "vehicle", "makeModel"]) ??
    (make || model ? [make, model].filter(Boolean).join(" ") : undefined);
  const plate = pickString(o, ["plateNumber", "licensePlate", "plate"]);
  const subtitle = [customer, vehicle, plate].filter(Boolean).join(" — ");
  const lineStatus =
    pickString(o, ["lineStatus", "readiness", "preparationStatus"]) ??
    str(o.status) ??
    "Ready";
  const idVal = o.tireSetId ?? o.setId ?? o.id ?? idx;
  return {
    id: String(idVal),
    label: `${setName}${countSuffix}`,
    subtitle,
    lineStatus,
  };
}

function extractSets(raw: Record<string, unknown>): NormalizedTireSetRow[] {
  const arrays = [raw.tireSets, raw.tireSetSummaries, raw.sets, raw.lines, raw.manifestLines];
  for (const a of arrays) {
    if (Array.isArray(a) && a.length) {
      return a.map((item, i) => normalizeSetLine(item, i));
    }
  }
  return [];
}

function collectCustomerNames(raw: Record<string, unknown>, sets: NormalizedTireSetRow[]): string[] {
  const fromField = raw.customerNames;
  if (Array.isArray(fromField)) {
    const names = fromField.map((x) => str(x)).filter(Boolean) as string[];
    if (names.length) return [...new Set(names)];
  }
  const single = pickString(raw, ["customerName", "primaryCustomerName"]);
  if (single) return [single];
  const fromSets = sets
    .map((s) => s.subtitle.split(" — ")[0]?.trim())
    .filter((n): n is string => Boolean(n));
  return [...new Set(fromSets)];
}

/** Accepts one list item from GET /v1/dealer/shipment-requests (flexible DTO). */
export function normalizeShipmentRequestDto(rawUnknown: unknown): NormalizedDeliveryOrderRow | null {
  const raw = asRecord(rawUnknown);
  if (!raw) return null;
  const id = num(raw.id);
  if (id == null) return null;

  const direction = (pickString(raw, ["direction", "shipmentDirection"]) ?? "DELIVERY").toUpperCase();
  const rawStatus = (pickString(raw, ["status", "shipmentStatus"]) ?? "DRAFT").toUpperCase();
  const appointmentDate = parseAppointment(raw);
  const sets = extractSets(raw);

  const orderLabel =
    pickString(raw, ["publicReference", "referenceCode", "orderCode", "humanReadableId"]) ??
    fixFormatOrderLabel(id, appointmentDate);

  let customerCount = num(raw.customerCount) ?? num(raw.customersCount);
  let setCount = num(raw.setCount) ?? num(raw.tireSetCount) ?? num(raw.setsCount);

  const customerNames = collectCustomerNames(raw, sets);
  if (customerCount == null) {
    customerCount = customerNames.length > 0 ? customerNames.length : sets.length > 0 ? sets.length : 0;
  }
  if (setCount == null) {
    setCount = sets.length > 0 ? sets.length : num(raw.lineCount) ?? 1;
  }

  const version = num(raw.version ?? raw.shipmentRequestVersion);
  const { handoverSessionId } = parseHandoverSessionFields(raw);

  const primaryCustomerName =
    pickString(raw, ["customerDisplayName", "customerName", "primaryCustomerName"]) ??
    (customerNames.length > 0 ? customerNames[0] : "—");

  const vehiclePlate = pickString(raw, ["vehiclePlate", "plateNumber", "licensePlate"]) ?? "";
  const make = pickString(raw, ["vehicleMake", "make"]);
  const model = pickString(raw, ["vehicleModel", "model", "carModel"]);
  const vehicleLabel =
    pickString(raw, ["vehicleLabel", "vehicleMakeModel", "makeModel"]) ??
    (make || model ? [make, model].filter(Boolean).join(" ") : "");

  const notes = pickString(raw, ["notes"]) ?? "";

  const address =
    pickString(raw, [
      "deliveryAddress",
      "address",
      "streetAddress",
      "warehouseAddress",
      "customerAddress",
    ]) ?? "";

  return {
    id,
    version,
    handoverSessionId,
    orderLabel,
    direction,
    rawStatus,
    uiStatus: mapRawStatusToUi(rawStatus),
    appointmentDate,
    customerCount,
    setCount,
    customerNames,
    sets,
    primaryCustomerName,
    vehiclePlate,
    vehicleLabel,
    notes,
    address,
  };
}

export function extractShipmentRequestListPayload(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== "object") return [];
  const root = data as Record<string, unknown>;
  if (Array.isArray(root.data)) return root.data;
  if (Array.isArray(root.content)) return root.content;
  const inner = asRecord(root.data);
  if (inner && Array.isArray(inner.content)) return inner.content;
  return [];
}
