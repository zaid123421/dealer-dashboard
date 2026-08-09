import axios from "axios";
import api from "@/lib/api";

export type DismissHandoverScanPayload = {
  sessionId: number;
  scanId: number;
  note?: string;
};

function messageFromResponseData(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;
  const rec = data as Record<string, unknown>;
  if (typeof rec.message === "string" && rec.message.trim()) return rec.message;
  return undefined;
}

/** POST /v1/dealer/handover/{sessionId}/scans/{scanId}/dismiss */
export async function dismissDealerHandoverScan(
  payload: DismissHandoverScanPayload,
): Promise<void> {
  const note = payload.note?.trim();
  const body = note ? { note } : {};

  try {
    await api.post(
      `/v1/dealer/handover/${payload.sessionId}/scans/${payload.scanId}/dismiss`,
      body,
    );
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const msg =
        messageFromResponseData(err.response?.data) ?? err.message ?? "Request failed";
      throw new Error(msg);
    }
    throw err;
  }
}
