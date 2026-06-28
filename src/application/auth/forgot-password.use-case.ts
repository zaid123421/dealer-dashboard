import axios from "axios";
import publicApi from "@/lib/public-api";
import { getApiErrorMessage } from "@/lib/api-error";

export interface ForgotPasswordInput {
  email: string;
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
        getApiErrorMessage(err.response?.data) ??
        err.message ??
        "Request failed";
      throw new ForgotPasswordError(msg, status);
    }
    if (err instanceof ForgotPasswordError) throw err;
    throw new ForgotPasswordError("Unknown error");
  }
}
