import axios from "axios";
import publicApi from "@/lib/public-api";

export interface ForgotPasswordInput {
  email: string;
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

export class ForgotPasswordError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "ForgotPasswordError";
  }
}

/**
 * Requests a password reset email (same as POST …/api/v1/auth/forgot-password).
 */
export async function requestPasswordResetUseCase(input: ForgotPasswordInput): Promise<void> {
  try {
    await publicApi.post("/v1/auth/forgot-password", {
      email: input.email.trim(),
    });
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const status = err.response?.status;
      const msg =
        messageFromResponseData(err.response?.data) ??
        err.message ??
        "Request failed";
      throw new ForgotPasswordError(msg, status);
    }
    if (err instanceof ForgotPasswordError) throw err;
    throw new ForgotPasswordError("Unknown error");
  }
}
