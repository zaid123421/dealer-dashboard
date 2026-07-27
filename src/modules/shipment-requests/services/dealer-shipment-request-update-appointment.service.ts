import axios from "axios";
import api from "@/lib/api";

function messageFromResponseData(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;
  const rec = data as Record<string, unknown>;
  if (typeof rec.message === "string" && rec.message.trim()) return rec.message;
  return undefined;
}

export type UpdateShipmentRequestAppointmentPayload = {
  id: number;
  swapAppointment: string;
  version: number;
  preferredDeliveryDay?: string;
};

/** PATCH /v1/dealer/shipment-requests/{id}/appointment */
export async function updateDealerShipmentRequestAppointment(
  payload: UpdateShipmentRequestAppointmentPayload,
): Promise<void> {
  const body: Record<string, unknown> = {
    swapAppointment: payload.swapAppointment,
    version: payload.version,
  };
  if (payload.preferredDeliveryDay?.trim()) {
    body.preferredDeliveryDay = payload.preferredDeliveryDay.trim();
  }

  try {
    await api.patch(`/v1/dealer/shipment-requests/${payload.id}/appointment`, body);
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const msg =
        messageFromResponseData(err.response?.data) ?? err.message ?? "Request failed";
      throw new Error(msg);
    }
    throw err;
  }
}
