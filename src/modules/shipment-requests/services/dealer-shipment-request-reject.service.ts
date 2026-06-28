import axios from "axios";
import api from "@/lib/api";

function messageFromResponseData(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;
  const rec = data as Record<string, unknown>;
  if (typeof rec.message === "string" && rec.message.trim()) return rec.message;
  return undefined;
}

export type ShipmentRequestActionInput = {
  shipmentRequestId: number;
  version: number;
};

/** POST /v1/dealer/shipment-requests/{id}/reject */
export async function rejectDealerShipmentRequest({
  shipmentRequestId,
  version,
}: ShipmentRequestActionInput): Promise<void> {
  try {
    await api.post(`/v1/dealer/shipment-requests/${shipmentRequestId}/reject`, {
      version,
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
