export type CartStatus =
  | "DRAFT"
  | "IN_CART"
  | "SUBMITTED"
  | "IN_TRANSIT"
  | "RECEIVED"
  | "CANCELLED";

export type CartListQuery = {
  statuses?: CartStatus;
  page?: number;
  size?: number;
  sortBy?: string;
};

export type NormalizedCartSetRow = {
  id: string;
  label: string;
};

export type NormalizedCartRow = {
  id: number;
  version: number;
  status: CartStatus;
  direction: string;
  customerDisplayName: string;
  vehiclePlate: string;
  vehicleVin: string;
  appointmentDate: Date | null;
  notes: string;
  setCount: number;
  tireCount: number;
  sets: NormalizedCartSetRow[];
};

export type CartListMeta = {
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
};

export type CartListResult = {
  rows: NormalizedCartRow[];
  meta: CartListMeta;
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

function parseCartStatus(raw: string | undefined): CartStatus {
  const s = (raw ?? "DRAFT").toUpperCase();
  if (s === "DRAFT") return "DRAFT";
  if (s === "IN_CART") return "IN_CART";
  if (s === "SUBMITTED") return "SUBMITTED";
  if (s === "IN_TRANSIT") return "IN_TRANSIT";
  if (s === "RECEIVED") return "RECEIVED";
  if (s === "CANCELLED") return "CANCELLED";
  return "DRAFT";
}

const DEFAULT_CART_META: CartListMeta = {
  page: 0,
  size: 20,
  totalPages: 0,
  totalElements: 0,
  numberOfElements: 0,
  first: true,
  last: true,
  empty: true,
};

function normalizeSetLine(item: unknown, idx: number): NormalizedCartSetRow {
  const o = asRecord(item);
  if (!o) {
    return { id: String(idx), label: `Set ${idx + 1}` };
  }
  const setName =
    pickString(o, ["setName", "displayLabel", "label", "seasonLabel", "name", "tireSetLabel"]) ??
    "Tire set";
  const tireCount = num(o.tireCount) ?? num(o.tiresCount) ?? num(o.quantity);
  const countSuffix = tireCount != null && tireCount > 0 ? ` (${tireCount} tires)` : "";
  const idVal = o.tireSetId ?? o.setId ?? o.id ?? idx;
  return { id: String(idVal), label: `${setName}${countSuffix}` };
}

function extractSets(raw: Record<string, unknown>): NormalizedCartSetRow[] {
  const arrays = [raw.tireSets, raw.tireSetSummaries, raw.sets, raw.lines, raw.manifestLines];
  for (const a of arrays) {
    if (Array.isArray(a) && a.length) {
      return a.map((item, i) => normalizeSetLine(item, i));
    }
  }
  return [];
}

export function normalizeCartDto(rawUnknown: unknown): NormalizedCartRow | null {
  const raw = asRecord(rawUnknown);
  if (!raw) return null;
  const id = num(raw.id);
  if (id == null) return null;
  const version = num(raw.version) ?? 0;
  const status = parseCartStatus(pickString(raw, ["status", "shipmentStatus"]));
  const direction = (pickString(raw, ["direction", "shipmentDirection"]) ?? "DELIVERY").toUpperCase();
  const customerDisplayName = pickString(raw, ["customerDisplayName", "customerName"]) ?? "—";
  const vehiclePlate = pickString(raw, ["vehiclePlate", "plateNumber"]) ?? "—";
  const vehicleVin = pickString(raw, ["vehicleVin", "vin"]) ?? "—";
  const notes = pickString(raw, ["notes"]) ?? "";
  const appointmentDate = parseAppointment(raw);
  const sets = extractSets(raw);
  const setCount = sets.length;
  const tireCount = sets.reduce((sum, setItem) => {
    const matched = /\((\d+)\s+tires\)/i.exec(setItem.label);
    if (!matched) return sum;
    const found = Number(matched[1]);
    return Number.isFinite(found) ? sum + found : sum;
  }, 0);

  return {
    id,
    version,
    status,
    direction,
    customerDisplayName,
    vehiclePlate,
    vehicleVin,
    appointmentDate,
    notes,
    setCount,
    tireCount,
    sets,
  };
}

export function extractCartListResult(data: unknown): CartListResult {
  const root = asRecord(data);
  if (!root) return { rows: [], meta: DEFAULT_CART_META };
  const content = Array.isArray(root.content) ? root.content : [];
  const rows: NormalizedCartRow[] = [];
  for (const item of content) {
    const row = normalizeCartDto(item);
    if (row) rows.push(row);
  }
  const meta: CartListMeta = {
    page: num(root.number) ?? num(root.page) ?? DEFAULT_CART_META.page,
    size: num(root.size) ?? DEFAULT_CART_META.size,
    totalPages: num(root.totalPages) ?? DEFAULT_CART_META.totalPages,
    totalElements: num(root.totalElements) ?? DEFAULT_CART_META.totalElements,
    numberOfElements: num(root.numberOfElements) ?? rows.length,
    first: Boolean(root.first ?? (num(root.number) ?? 0) === 0),
    last: Boolean(root.last ?? true),
    empty: Boolean(root.empty ?? rows.length === 0),
  };
  return { rows, meta };
}
