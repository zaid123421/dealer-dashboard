import axios from "axios";
import api from "@/lib/api";
import type { NormalizedDeliveryOrderRow } from "@/modules/shipment-requests/lib/shipment-request-dto";
import { getDealerShipmentRequestDetail } from "@/modules/shipment-requests/services/dealer-shipment-request-detail.service";

export type HandoverDirection = "INBOUND_DELIVERY" | "OUTBOUND_PICKUP";

export type OpenHandoverSessionPayload = {
  direction: HandoverDirection;
  shipmentRequestIds: number[];
};

export type OpenHandoverSessionResult = {
  sessionId?: number;
};

export type CloseHandoverSessionPayload = {
  sessionId: number;
  version: number;
};

export class HandoverCloseConflictError extends Error {
  readonly status = 409;

  constructor(message?: string) {
    super(message ?? "Handover session close conflict");
    this.name = "HandoverCloseConflictError";
  }
}

export function isHandoverCloseConflictError(err: unknown): boolean {
  if (err instanceof HandoverCloseConflictError) return true;
  if (!axios.isAxiosError(err) || err.response?.status !== 409) return false;
  const msg = messageFromResponseData(err.response?.data) ?? "";
  return /missing|discrepant|refused|conflict/i.test(msg);
}

const HANDOVER_SESSION_CACHE_KEY = "dealer-handover-session-by-shipment";

export const handoverSessionIdQueryKey = (shipmentRequestId: number) =>
  ["dealer", "handover-session-id", shipmentRequestId] as const;

function messageFromResponseData(data: unknown): string | undefined {
  if (typeof data === "string" && data.trim()) return data.trim();
  if (!data || typeof data !== "object") return undefined;
  const rec = data as Record<string, unknown>;

  if (typeof rec.message === "string" && rec.message.trim()) return rec.message.trim();
  if (typeof rec.detail === "string" && rec.detail.trim()) return rec.detail.trim();
  if (typeof rec.title === "string" && rec.title.trim()) return rec.title.trim();

  const errors = rec.errors;
  if (Array.isArray(errors) && errors.length > 0) {
    const parts: string[] = [];
    for (const item of errors) {
      if (typeof item === "string" && item.trim()) parts.push(item.trim());
      else if (item && typeof item === "object") {
        const o = item as Record<string, unknown>;
        const msg =
          (typeof o.message === "string" && o.message.trim()) ||
          (typeof o.defaultMessage === "string" && o.defaultMessage.trim()) ||
          (typeof o.detail === "string" && o.detail.trim());
        if (msg) parts.push(msg);
      }
    }
    if (parts.length > 0) return parts.join("\n");
  }

  return undefined;
}

export function apiErrorMessageFromUnknown(err: unknown): string | undefined {
  if (err instanceof HandoverCloseConflictError) {
    if (err.message && err.message !== "Handover session close conflict") return err.message;
    return undefined;
  }
  if (err instanceof Error && err.message.trim()) return err.message.trim();
  if (axios.isAxiosError(err)) {
    return messageFromResponseData(err.response?.data) ?? err.message;
  }
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

function asRecord(v: unknown): Record<string, unknown> | null {
  if (!v || typeof v !== "object" || Array.isArray(v)) return null;
  return v as Record<string, unknown>;
}

function readHandoverSessionCache(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(HANDOVER_SESSION_CACHE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return parsed as Record<string, number>;
  } catch {
    return {};
  }
}

function writeHandoverSessionCache(map: Record<string, number>): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(HANDOVER_SESSION_CACHE_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
}

export function cacheHandoverSessionId(shipmentRequestId: number, sessionId: number): void {
  const map = readHandoverSessionCache();
  map[String(shipmentRequestId)] = sessionId;
  writeHandoverSessionCache(map);
}

function readCachedHandoverSessionId(shipmentRequestId: number): number | undefined {
  return readHandoverSessionCache()[String(shipmentRequestId)];
}

function parseOpenHandoverResponse(data: unknown): OpenHandoverSessionResult {
  const rec = asRecord(data);
  if (!rec) return {};
  const sessionId =
    extractHandoverSessionIdFromRecord(rec) ?? num(rec.sessionId ?? rec.id);
  return sessionId !== undefined ? { sessionId } : {};
}

function extractHandoverSessionIdFromRecord(raw: Record<string, unknown>): number | undefined {
  const direct = num(
    raw.handoverSessionId ??
      raw.handOverSessionId ??
      raw.handoverId ??
      raw.openHandoverSessionId ??
      raw.sessionId ??
      raw.activeSessionId ??
      raw.activeHandoverSessionId,
  );
  if (direct !== undefined) return direct;

  for (const key of ["handoverSession", "activeSession", "currentSession", "openSession"]) {
    const nested = asRecord(raw[key]);
    if (!nested) continue;
    const id = num(nested.id ?? nested.sessionId);
    if (id !== undefined) return id;
  }

  return undefined;
}

export function extractHandoverSessionId(rawUnknown: unknown): number | undefined {
  const rec = asRecord(rawUnknown);
  if (!rec) return undefined;
  return extractHandoverSessionIdFromRecord(rec);
}

/**
 * sessionId for POST /v1/dealer/handover/{sessionId}/close
 * 1. list row  2. browser cache  3. GET shipment-requests/:id (when list omits it)
 */
export async function findHandoverSessionIdForShipmentRequest(
  shipmentRequestId: number,
  fromRow?: number,
): Promise<number | undefined> {
  if (fromRow != null) {
    cacheHandoverSessionId(shipmentRequestId, fromRow);
    return fromRow;
  }

  const cached = readCachedHandoverSessionId(shipmentRequestId);
  if (cached != null) return cached;

  try {
    const detail = await getDealerShipmentRequestDetail(shipmentRequestId);
    if (detail.handoverSessionId != null) {
      cacheHandoverSessionId(shipmentRequestId, detail.handoverSessionId);
      return detail.handoverSessionId;
    }
  } catch {
    // detail unavailable — fall through
  }

  return undefined;
}

/** Optimistic-lock `version` from GET /v1/dealer/shipment-requests list row. */
export function shipmentRequestVersionFromListRow(
  row: Pick<NormalizedDeliveryOrderRow, "version">,
): number | undefined {
  const v = row.version;
  return typeof v === "number" && Number.isFinite(v) ? v : undefined;
}

export type PrepareCloseHandoverFailure = "missing_session" | "missing_version";

export type PrepareCloseHandoverResult =
  | { ok: true; payload: CloseHandoverSessionPayload }
  | { ok: false; reason: PrepareCloseHandoverFailure };

export async function prepareCloseHandoverSession(
  order: Pick<NormalizedDeliveryOrderRow, "id" | "version" | "handoverSessionId">,
): Promise<PrepareCloseHandoverResult> {
  const sessionId = await findHandoverSessionIdForShipmentRequest(order.id, order.handoverSessionId);
  if (sessionId == null) return { ok: false, reason: "missing_session" };

  const version = shipmentRequestVersionFromListRow(order);
  if (version == null) return { ok: false, reason: "missing_version" };

  return {
    ok: true,
    payload: { sessionId, version },
  };
}

/** POST /v1/dealer/handover */
export async function openHandoverSession(
  payload: OpenHandoverSessionPayload,
): Promise<OpenHandoverSessionResult> {
  try {
    const { data } = await api.post<unknown>("/v1/dealer/handover", payload);
    const result = parseOpenHandoverResponse(data);
    if (result.sessionId != null) {
      for (const shipmentRequestId of payload.shipmentRequestIds) {
        cacheHandoverSessionId(shipmentRequestId, result.sessionId);
      }
    }
    return result;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const msg =
        messageFromResponseData(err.response?.data) ?? err.message ?? "Request failed";
      throw new Error(msg);
    }
    throw err;
  }
}

export function handoverDirectionFromShipmentDirection(
  direction: string,
): HandoverDirection {
  return direction.toUpperCase() === "PICKUP" ? "OUTBOUND_PICKUP" : "INBOUND_DELIVERY";
}

/**
 * POST /v1/dealer/handover/{sessionId}/close
 * Body.version = shipment-request `version` from GET /v1/dealer/shipment-requests list row.
 */
export async function closeHandoverSession(
  payload: CloseHandoverSessionPayload,
): Promise<void> {
  try {
    await api.post(`/v1/dealer/handover/${payload.sessionId}/close`, {
      version: payload.version,
    });
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      if (err.response?.status === 409) {
        throw new HandoverCloseConflictError(messageFromResponseData(err.response?.data));
      }
      const msg =
        messageFromResponseData(err.response?.data) ?? err.message ?? "Request failed";
      throw new Error(msg);
    }
    throw err;
  }
}
