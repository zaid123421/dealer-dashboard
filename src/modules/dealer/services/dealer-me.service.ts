import axios from "axios";
import api from "@/lib/api";
import { normalizeDealerMeDto } from "@/modules/dealer/lib/dealer-me-dto";
import type { DealerProfile } from "@/modules/dealer/types/dealer-profile";
import { getApiErrorMessage } from "@/lib/api-error";

export class DealerMeError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "DealerMeError";
  }
}

/** GET /v1/dealer/me */
export async function getDealerMe(): Promise<DealerProfile> {
  try {
    const { data } = await api.get<unknown>("/v1/dealer/me");
    const profile = normalizeDealerMeDto(data);
    if (!profile) {
      throw new DealerMeError("Invalid dealer profile response");
    }
    return profile;
  } catch (err: unknown) {
    if (err instanceof DealerMeError) throw err;
    if (axios.isAxiosError(err)) {
      const status = err.response?.status;
      const msg =
        getApiErrorMessage(err.response?.data) ?? err.message ?? "Request failed";
      throw new DealerMeError(msg, status);
    }
    if (err instanceof Error) throw new DealerMeError(err.message);
    throw new DealerMeError("Request failed");
  }
}
