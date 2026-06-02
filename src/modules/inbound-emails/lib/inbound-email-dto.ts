export type ParseStatus = "matched" | "window_too_short" | "parse_failed" | "no_tires_stored";

export type EmailSuggestion = {
  id: string;
  from: string;
  subject: string;
  receivedAt: string;
  status: ParseStatus;
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

function stringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.map((item) => str(item)).filter((item): item is string => Boolean(item));
}

export function mapInboundStatusToParseStatus(raw: string): ParseStatus {
  const normalized = raw.trim().toUpperCase().replace(/[\s-]+/g, "_");

  if (
    normalized.includes("WINDOW") &&
    (normalized.includes("SHORT") || normalized.includes("TOO"))
  ) {
    return "window_too_short";
  }
  if (normalized.includes("NO_TIRE") || normalized.includes("NOT_STORED")) {
    return "no_tires_stored";
  }
  if (
    normalized.includes("PARSE_FAIL") ||
    normalized.includes("FAILED") ||
    normalized.includes("ERROR") ||
    normalized.includes("REJECT")
  ) {
    return "parse_failed";
  }
  if (
    normalized.includes("MATCH") ||
    normalized.includes("SUCCESS") ||
    normalized.includes("PARSED") ||
    normalized.includes("APPROVED")
  ) {
    return "matched";
  }

  return "parse_failed";
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
    toAddresses: stringArray(obj.toAddresses),
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
  const status = mapInboundStatusToParseStatus(row.rawStatus);
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
    status,
    customerName: "—",
    appointmentDate: "—",
    email: row.fromAddress,
    tireSet: "—",
    vehicle: "—",
    timeWindow: "—",
    windowOk: status !== "window_too_short",
    preview,
    shipmentRequestId: row.shipmentRequestId,
  };
}
