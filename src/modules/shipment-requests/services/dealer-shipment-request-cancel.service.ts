import axios from "axios";
import api from "@/lib/api";

function messageFromResponseData(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;
  const rec = data as Record<string, unknown>;
  if (typeof rec.message === "string" && rec.message.trim()) return rec.message;
  return undefined;
}

export type CancelShipmentRequestPayload = {
  id: number;
  version: number;
};

/** POST /v1/dealer/shipment-requests/{id}/cancel */
export async function cancelDealerShipmentRequest(
  payload: CancelShipmentRequestPayload,
): Promise<void> {
  try {
    await api.post(`/v1/dealer/shipment-requests/${payload.id}/cancel`, {
      version: payload.version,
    });
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const msg =
        messageFromResponseData(err.response?.data) ?? err.message ?? "Request failed";
      throw new Error(msg);
    }
    throw err;
  }
}
