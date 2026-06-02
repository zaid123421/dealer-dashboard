import axios from "axios";
import api from "@/lib/api";
import {
  normalizeShipmentRequestDetailDto,
  type NormalizedShipmentRequestDetail,
} from "@/modules/shipment-requests/lib/shipment-request-detail-dto";

export class ShipmentRequestDetailError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ShipmentRequestDetailError";
  }
}

function messageFromResponseData(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;
  const rec = data as Record<string, unknown>;
  if (typeof rec.message === "string" && rec.message.trim()) return rec.message;
  return undefined;
}

function toDetailError(err: unknown): Error {
  if (axios.isAxiosError(err)) {
    const message =
      messageFromResponseData(err.response?.data) ?? err.message ?? "Request failed";
    return new ShipmentRequestDetailError(message);
  }
  if (err instanceof Error) return err;
  return new ShipmentRequestDetailError("Request failed");
}

export async function getDealerShipmentRequestDetail(
  id: number,
): Promise<NormalizedShipmentRequestDetail> {
  try {
    const { data } = await api.get<unknown>(`/v1/dealer/shipment-requests/${id}`);
    const row = normalizeShipmentRequestDetailDto(data);
    if (!row) throw new ShipmentRequestDetailError("Invalid shipment response");
    return row;
  } catch (err: unknown) {
    throw toDetailError(err);
  }
}
