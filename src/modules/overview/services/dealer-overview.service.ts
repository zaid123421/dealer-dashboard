import axios from "axios";
import api from "@/lib/api";
import {
  normalizeDealerOverviewDto,
  type DealerOverview,
  type OverviewDays,
} from "@/modules/overview/lib/dealer-overview-dto";

function messageFromResponseData(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;
  const rec = data as Record<string, unknown>;
  if (typeof rec.message === "string" && rec.message.trim()) return rec.message;
  return undefined;
}

/** GET /v1/dealer/overview?days=7|30|90 */
export async function getDealerOverview(days: OverviewDays): Promise<DealerOverview> {
  try {
    const { data } = await api.get<unknown>(`/v1/dealer/overview`, {
      params: { days },
    });
    const normalized = normalizeDealerOverviewDto(data);
    if (!normalized) throw new Error("Invalid dealer overview response");
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
