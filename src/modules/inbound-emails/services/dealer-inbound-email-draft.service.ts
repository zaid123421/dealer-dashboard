import axios from "axios";
import api from "@/lib/api";
import {
  normalizeShipmentRequestDetailDto,
  type NormalizedShipmentRequestDetail,
} from "@/modules/shipment-requests/lib/shipment-request-detail-dto";

function messageFromResponseData(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;
  const rec = data as Record<string, unknown>;
  if (typeof rec.message === "string" && rec.message.trim()) return rec.message;
  return undefined;
}

/** GET /v1/dealer/inbound-emails/{inboundEmailId}/draft */
export async function getDealerInboundEmailDraft(
  inboundEmailId: string | number,
): Promise<NormalizedShipmentRequestDetail> {
  try {
    const { data } = await api.get<unknown>(`/v1/dealer/inbound-emails/${inboundEmailId}/draft`);
    const normalized = normalizeShipmentRequestDetailDto(data);
    if (!normalized) throw new Error("Invalid draft response");
    return normalized;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const msg =
        messageFromResponseData(err.response?.data) ?? err.message ?? "Request failed";
      throw new Error(msg);
    }
    throw err;
  }
}
