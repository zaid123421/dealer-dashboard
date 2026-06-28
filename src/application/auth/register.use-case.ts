import axios from "axios";
import publicApi from "@/lib/public-api";
import { getApiErrorMessage } from "@/lib/api-error";

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface RegisterResult {
  success: true;
}

export class RegisterError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "RegisterError";
  }
}

/** POST /v1/auth/register */
export async function registerUseCase(input: RegisterInput): Promise<RegisterResult> {
  try {
    await publicApi.post("/v1/auth/register", {
      email: input.email.trim(),
      password: input.password,
      name: input.name.trim(),
    });
    return { success: true };
  } catch (err: unknown) {
    if (err instanceof RegisterError) throw err;
    if (axios.isAxiosError(err)) {
      const status = err.response?.status;
      const msg =
        getApiErrorMessage(err.response?.data) ??
        err.message ??
        "Request failed";
      throw new RegisterError(msg, status);
    }
    if (err instanceof Error) {
      throw new RegisterError(err.message);
    }
    throw new RegisterError("Unknown error");
  }
}
