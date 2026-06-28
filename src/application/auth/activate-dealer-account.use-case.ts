import axios from "axios";
import publicApi from "@/lib/public-api";
import { getApiErrorMessage } from "@/lib/api-error";

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
        getApiErrorMessage(err.response?.data) ??
        err.message ??
        "Request failed";
      throw new ActivateDealerAccountError(msg, status);
    }
    throw new ActivateDealerAccountError("Unknown error");
  }
}
