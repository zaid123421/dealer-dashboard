import axios from "axios";
import api from "@/lib/api";
import {
  normalizeHandoverSessionState,
  type NormalizedHandoverSessionState,
} from "@/modules/sessions/lib/handover-session-state-dto";

function messageFromResponseData(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;
  const rec = data as Record<string, unknown>;
  if (typeof rec.message === "string" && rec.message.trim()) return rec.message;
  return undefined;
}

/** GET /v1/dealer/handover/{sessionId}/state */
export async function getDealerHandoverSessionState(
  sessionId: number,
): Promise<NormalizedHandoverSessionState> {
  try {
    const { data } = await api.get<unknown>(`/v1/dealer/handover/${sessionId}/state`);
    const normalized = normalizeHandoverSessionState(data);
    if (!normalized) throw new Error("Invalid handover session state response");
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
