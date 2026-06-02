import axios from "axios";
import api from "@/lib/api";

function messageFromResponseData(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;
  const rec = data as Record<string, unknown>;
  if (typeof rec.message === "string" && rec.message.trim()) return rec.message;
  return undefined;
}

/** Temporary fallback when list API omits `version`. */
export const SUBMIT_SHIPMENT_REQUEST_VERSION_FALLBACK = 2;

export type SubmitShipmentRequestPayload = {
  id: number;
  version: number;
};

/** POST /v1/dealer/shipment-requests/{id}/submit */
export async function submitDealerShipmentRequest(
  payload: SubmitShipmentRequestPayload,
): Promise<void> {
  try {
    await api.post(`/v1/dealer/shipment-requests/${payload.id}/submit`, {
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

/** POST /v1/dealer/shipment-requests/submit-all */
export async function submitAllDealerShipmentRequests(): Promise<void> {
  try {
    await api.post("/v1/dealer/shipment-requests/submit-all");
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const msg =
        messageFromResponseData(err.response?.data) ?? err.message ?? "Request failed";
      throw new Error(msg);
    }
    throw err;
  }
}
