import axios from "axios";
import api from "@/lib/api";
import {
  normalizePickupSuggestionResponse,
  type NormalizedPickupSuggestionResult,
} from "@/modules/shipment-requests/lib/pickup-suggestion-dto";
import {
  USE_MOCK_PICKUP_SUGGESTIONS,
  getMockPickupSuggestionResult,
  mockCombinePickup,
} from "@/modules/shipment-requests/lib/pickup-suggestion-mock";

/** Temporary fallback when delivery `version` is not available yet. */
export const COMBINE_PICKUP_DELIVERY_VERSION_FALLBACK = 2;

export class PickupSuggestionError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "PickupSuggestionError";
    this.status = status;
  }
}

function messageFromResponseData(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;
  const rec = data as Record<string, unknown>;
  if (typeof rec.message === "string" && rec.message.trim()) return rec.message;
  return undefined;
}

function toPickupSuggestionError(err: unknown): PickupSuggestionError {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status;
    const message =
      messageFromResponseData(err.response?.data) ?? err.message ?? "Request failed";
    return new PickupSuggestionError(message, status);
  }
  if (err instanceof Error) return new PickupSuggestionError(err.message);
  return new PickupSuggestionError("Request failed");
}

/**
 * GET /v1/dealer/shipment-requests/{deliveryRequestId}/pickup-suggestion
 */
export async function getPickupSuggestions(
  deliveryRequestId: number,
): Promise<NormalizedPickupSuggestionResult> {
  if (USE_MOCK_PICKUP_SUGGESTIONS) {
    return getMockPickupSuggestionResult(deliveryRequestId);
  }
  try {
    const { data } = await api.get<unknown>(
      `/v1/dealer/shipment-requests/${deliveryRequestId}/pickup-suggestion`,
    );
    return normalizePickupSuggestionResponse(data, deliveryRequestId);
  } catch (err: unknown) {
    throw toPickupSuggestionError(err);
  }
}

export type CombinePickupPayload = {
  setIds: number[];
  deliveryVersion: number;
};

/**
 * POST /v1/dealer/shipment-requests/{deliveryRequestId}/combine-pickup
 */
export async function combinePickup(
  deliveryRequestId: number,
  payload: CombinePickupPayload,
): Promise<void> {
  if (USE_MOCK_PICKUP_SUGGESTIONS) {
    return mockCombinePickup(deliveryRequestId, payload);
  }
  try {
    await api.post(`/v1/dealer/shipment-requests/${deliveryRequestId}/combine-pickup`, {
      setIds: payload.setIds,
      deliveryVersion: payload.deliveryVersion,
    });
  } catch (err: unknown) {
    throw toPickupSuggestionError(err);
  }
}
