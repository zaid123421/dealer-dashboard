export type InboundStatusTone = "success" | "warning" | "error" | "info";

export type EmailSuggestion = {
  id: string;
  from: string;
  subject: string;
  receivedAt: string;
  status: string;
  customerName: string;
  appointmentDate: string;
  email: string;
  tireSet: string;
  vehicle: string;
  timeWindow: string;
  windowOk: boolean;
  preview: string;
  shipmentRequestId: number | null;
};

export type NormalizedInboundEmail = {
  id: string;
  messageId: string | null;
  fromAddress: string;
  toAddresses: string[];
  subject: string;
  receivedAt: string | null;
  rawStatus: string;
  shipmentRequestId: number | null;
  failureReason: string | null;
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

function parseToAddresses(v: unknown): string[] {
  if (Array.isArray(v)) {
    return v.map((item) => str(item)).filter((item): item is string => Boolean(item));
  }
  const asText = str(v);
  if (!asText) return [];
  return asText
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

const INBOUND_STATUS_TONE_MAP: Record<string, InboundStatusTone> = {
  PROCESSED: "success",
  MATCHED: "success",
  PARSED: "success",
  PARSE_SUCCESS: "success",
  APPROVED: "success",
  WINDOW_TOO_SHORT: "warning",
  NO_TIRES_STORED: "info",
  PARSE_FAILED: "error",
  FAILED: "error",
  REJECTED: "error",
  ERROR: "error",
};

export function getInboundStatusTone(raw: string): InboundStatusTone {
  const normalized = raw.trim().toUpperCase().replace(/[\s-]+/g, "_");
  const exact = INBOUND_STATUS_TONE_MAP[normalized];
  if (exact) return exact;

  if (
    normalized.includes("WINDOW") &&
    (normalized.includes("SHORT") || normalized.includes("TOO"))
  ) {
    return "warning";
  }
  if (normalized.includes("NO_TIRE") || normalized.includes("NOT_STORED")) {
    return "info";
  }
  if (
    normalized.includes("PARSE_FAIL") ||
    normalized === "FAILED" ||
    normalized.endsWith("_FAILED") ||
    normalized.includes("ERROR") ||
    normalized.includes("REJECT")
  ) {
    return "error";
  }
  if (
    normalized.includes("PROCESSED") ||
    normalized.includes("MATCH") ||
    normalized.includes("SUCCESS") ||
    normalized.includes("PARSED") ||
    normalized.includes("APPROVED")
  ) {
    return "success";
  }

  return "error";
}

export function isInboundStatusFailed(raw: string): boolean {
  return getInboundStatusTone(raw) === "error";
}

export function formatReceivedAt(iso: string | null, locale: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  try {
    return d.toLocaleString(locale, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

/** Accepts one item from GET /v1/dealer/inbound-emails content[]. */
export function normalizeInboundEmailDto(raw: unknown): NormalizedInboundEmail | null {
  const obj = asRecord(raw);
  if (!obj) return null;

  const id = num(obj.id);
  if (id == null) return null;

  return {
    id: String(id),
    messageId: str(obj.messageId) ?? null,
    fromAddress: str(obj.fromAddress) ?? "—",
    toAddresses: parseToAddresses(obj.toAddresses),
    subject: str(obj.subject) ?? "",
    receivedAt: str(obj.receivedAt) ?? null,
    rawStatus: str(obj.status) ?? "UNKNOWN",
    shipmentRequestId: num(obj.shipmentRequestId) ?? null,
    failureReason: str(obj.failureReason) ?? null,
  };
}

export function inboundEmailToSuggestion(
  row: NormalizedInboundEmail,
  locale: string,
): EmailSuggestion {
  const preview =
    row.failureReason?.trim() ||
    (row.shipmentRequestId != null
      ? `Shipment request #${row.shipmentRequestId}`
      : row.messageId?.trim() || "—");

  return {
    id: row.id,
    from: row.fromAddress,
    subject: row.subject.trim() || "(No subject)",
    receivedAt: formatReceivedAt(row.receivedAt, locale),
    status: row.rawStatus,
    customerName: "—",
    appointmentDate: "—",
    email: row.fromAddress,
    tireSet: "—",
    vehicle: "—",
    timeWindow: "—",
    windowOk: getInboundStatusTone(row.rawStatus) !== "warning",
    preview,
    shipmentRequestId: row.shipmentRequestId,
  };
}
