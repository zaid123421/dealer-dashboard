/**
 * Mock data for pickup-suggestion when the API is unavailable locally.
 * Set `USE_MOCK_PICKUP_SUGGESTIONS` to `true` in the service to enable.
 */

import {
  normalizePickupSuggestionResponse,
  type NormalizedPickupSuggestionResult,
} from "@/modules/shipment-requests/lib/pickup-suggestion-dto";

/** Toggle in `dealer-pickup-suggestion.service.ts`. */
export const USE_MOCK_PICKUP_SUGGESTIONS = false;

function simulateLatency(ms = 600): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function dayOffsetIso(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

function buildMockRaw(deliveryRequestId: number): unknown {
  return {
    deliveryOrderId: deliveryRequestId,
    windowStart: dayOffsetIso(-2),
    windowEnd: dayOffsetIso(+14),
    candidates: [
      {
        setId: 901,
        tireCount: 4,
        seasonType: "SUMMER",
        displayLabel: "Michelin Pilot Sport 4 — Summer",
        brand: "Michelin",
        model: null,
        size: "225/45R17",
      },
      {
        setId: 902,
        tireCount: 4,
        seasonType: "WINTER",
        displayLabel: "Bridgestone Blizzak — Winter",
        brand: "Bridgestone",
        model: null,
        size: "235/55R19",
      },
    ],
  };
}

export async function getMockPickupSuggestionResult(
  deliveryRequestId: number,
): Promise<NormalizedPickupSuggestionResult> {
  await simulateLatency();
  return normalizePickupSuggestionResponse(buildMockRaw(deliveryRequestId), deliveryRequestId);
}

export async function mockCombinePickup(
  _deliveryRequestId: number,
  _payload: { setIds: number[]; deliveryVersion: number },
): Promise<void> {
  void _deliveryRequestId;
  void _payload;
  await simulateLatency(400);
}
