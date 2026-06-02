import axios from "axios";
import api from "@/lib/api";
import {
  extractCartListResult,
  type CartListQuery,
  type CartListResult,
} from "@/modules/shipment-requests/lib/dealer-cart-dto";

export class CartServiceError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "CartServiceError";
    this.status = status;
  }
}

function messageFromResponseData(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;
  const rec = data as Record<string, unknown>;
  if (typeof rec.message === "string" && rec.message.trim()) return rec.message;
  return undefined;
}

function toCartServiceError(err: unknown): CartServiceError {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status;
    const message =
      messageFromResponseData(err.response?.data) ?? err.message ?? "Request failed";
    return new CartServiceError(message, status);
  }
  if (err instanceof Error) return new CartServiceError(err.message);
  return new CartServiceError("Request failed");
}

export async function listDealerCart(query: CartListQuery = {}): Promise<CartListResult> {
  try {
    const { data } = await api.get<unknown>("/v1/dealer/cart", {
      params: query,
    });
    return extractCartListResult(data);
  } catch (err: unknown) {
    throw toCartServiceError(err);
  }
}

export async function moveCartItemIn(payload: { id: number; version: number }): Promise<void> {
  try {
    await api.post(`/v1/dealer/cart/${payload.id}/move-in`, { version: payload.version });
  } catch (err: unknown) {
    throw toCartServiceError(err);
  }
}

export async function submitCartItem(payload: { id: number; version: number }): Promise<void> {
  try {
    await api.post(`/v1/dealer/cart/${payload.id}/submit`, { version: payload.version });
  } catch (err: unknown) {
    throw toCartServiceError(err);
  }
}

export async function submitAllCartItems(): Promise<void> {
  try {
    await api.post("/v1/dealer/cart/submit-all");
  } catch (err: unknown) {
    throw toCartServiceError(err);
  }
}

/** Mirrors API `CreateDeliveryRequest` (Swagger). */
export type CreateDeliveryRequestPayload = {
  dealerCustomerId: number;
  vehicleId: number;
  swapAppointment: string;
  preferredDeliveryDay?: string;
  setIds?: number[];
  notes?: string;
};

/** Result of POST /v1/dealer/shipment-requests/delivery. */
export type CreateDeliveryRequestResult = {
  id: number;
};

function pickIdFromResponseBody(data: unknown): number | null {
  if (!data || typeof data !== "object") return null;
  const rec = data as Record<string, unknown>;
  const candidates: unknown[] = [rec.id, rec.requestId, rec.shipmentRequestId];
  for (const v of candidates) {
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "string") {
      const n = Number(v.trim());
      if (Number.isFinite(n)) return n;
    }
  }
  return null;
}

function pickIdFromLocationHeader(headers: unknown): number | null {
  if (!headers || typeof headers !== "object") return null;
  const rec = headers as Record<string, unknown>;
  const raw = rec.location ?? rec.Location;
  if (typeof raw !== "string") return null;
  const match = /(\d+)(?:\/?$|\?)/.exec(raw);
  if (!match) return null;
  const n = Number(match[1]);
  return Number.isFinite(n) ? n : null;
}

/** POST /v1/dealer/shipment-requests/delivery — CreateDeliveryRequest body. */
export async function createDeliveryRequest(
  payload: CreateDeliveryRequestPayload,
): Promise<CreateDeliveryRequestResult> {
  try {
    const body: Record<string, unknown> = {
      dealerCustomerId: payload.dealerCustomerId,
      vehicleId: payload.vehicleId,
      swapAppointment: payload.swapAppointment,
    };
    if (payload.preferredDeliveryDay?.trim()) {
      body.preferredDeliveryDay = payload.preferredDeliveryDay.trim();
    }
    if (payload.setIds && payload.setIds.length > 0) {
      body.setIds = payload.setIds;
    }
    if (payload.notes?.trim()) {
      body.notes = payload.notes.trim();
    }
    const response = await api.post<unknown>(
      "/v1/dealer/shipment-requests/delivery",
      body,
    );
    const id =
      pickIdFromResponseBody(response.data) ??
      pickIdFromLocationHeader(response.headers);
    if (id == null) {
      throw new CartServiceError("Server did not return a delivery id");
    }
    return { id };
  } catch (err: unknown) {
    throw toCartServiceError(err);
  }
}

/** Mirrors API `CreatePickupRequest` (Swagger). */
export type CreatePickupRequestPayload = {
  dealerCustomerId: number;
  vehicleId: number;
  setIds: number[];
  preferredDispatchDay?: string;
  notes?: string;
};

/** POST /v1/dealer/shipment-requests/pickup — CreatePickupRequest body. */
export async function createPickupRequest(
  payload: CreatePickupRequestPayload,
): Promise<void> {
  try {
    const body: Record<string, unknown> = {
      dealerCustomerId: payload.dealerCustomerId,
      vehicleId: payload.vehicleId,
      setIds: payload.setIds,
    };
    if (payload.preferredDispatchDay?.trim()) {
      body.preferredDispatchDay = payload.preferredDispatchDay.trim();
    }
    if (payload.notes?.trim()) {
      body.notes = payload.notes.trim();
    }
    await api.post("/v1/dealer/shipment-requests/pickup", body);
  } catch (err: unknown) {
    throw toCartServiceError(err);
  }
}
