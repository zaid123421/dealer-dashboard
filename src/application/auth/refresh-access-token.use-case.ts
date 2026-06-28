import axios from "axios";
import publicApi from "@/lib/public-api";
import TokenService from "@/infrastructure/auth/token-service";
import { pickString, pickNumber, unwrapPayload } from "@/shared/lib/dto-utils";
import { getApiErrorMessage } from "@/lib/api-error";

export class RefreshTokenError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "RefreshTokenError";
  }
}

/**
 * يحدّث التوكنات في الـ cookies ويعيد الـ access token الجديد.
 */
export async function refreshAccessTokenUseCase(): Promise<string> {
  const refreshToken = TokenService.getRefreshToken();
  if (!refreshToken) {
    throw new RefreshTokenError("No refresh token");
  }

  try {
    const { data } = await publicApi.post("/v1/auth/refresh", {
      refreshToken,
    });

    const payload = unwrapPayload(data);
    const accessToken =
      pickString(payload, "accessToken") ?? pickString(payload, "access_token");
    const newRefresh =
      pickString(payload, "refreshToken") ?? pickString(payload, "refresh_token");
    const expiresIn = pickNumber(payload, "expiresIn") || 900;

    if (!accessToken) {
      throw new RefreshTokenError("Invalid refresh response: no access token");
    }

    TokenService.applyRefreshedTokens({
      accessToken,
      refreshToken: newRefresh,
      expiresInSeconds: expiresIn,
    });

    return accessToken;
  } catch (err: unknown) {
    if (err instanceof RefreshTokenError) throw err;
    if (axios.isAxiosError(err)) {
      const status = err.response?.status;
      const msg =
        getApiErrorMessage(err.response?.data) ??
        err.message ??
        "Refresh failed";
      throw new RefreshTokenError(msg, status);
    }
    throw new RefreshTokenError("Unknown refresh error");
  }
}
