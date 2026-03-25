import axios from "axios";
import publicApi from "@/lib/public-api";

export interface ActivateDealerAccountInput {
  token: string;
  newPassword: string;
}

export interface ActivateDealerAccountResult {
  success: true;
}

export class ActivateDealerAccountError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "ActivateDealerAccountError";
  }
}

function messageFromResponseData(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;
  const rec = data as Record<string, unknown>;
  if (typeof rec.message === "string" && rec.message.trim()) return rec.message;
  const errors = rec.errors;
  if (Array.isArray(errors) && errors.length > 0) {
    const first = errors[0];
    if (first && typeof first === "object" && "message" in first) {
      const m = (first as { message?: unknown }).message;
      if (typeof m === "string" && m.trim()) return m;
    }
  }
  return undefined;
}

export async function activateDealerAccountUseCase(
  input: ActivateDealerAccountInput,
): Promise<ActivateDealerAccountResult> {
  try {
    await publicApi.post("/dealer-auth/activate-account", {
      token: input.token,
      newPassword: input.newPassword,
    });
    return { success: true };
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const status = err.response?.status;
      const msg =
        messageFromResponseData(err.response?.data) ??
        err.message ??
        "Request failed";
      throw new ActivateDealerAccountError(msg, status);
    }
    throw new ActivateDealerAccountError("Unknown error");
  }
}
