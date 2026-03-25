import axios from "axios";
import publicApi from "@/lib/public-api";
import TokenService from "@/infrastructure/auth/token-service";

export class RefreshTokenError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "RefreshTokenError";
  }
}

function pickString(obj: Record<string, unknown>, key: string): string | undefined {
  const v = obj[key];
  return typeof v === "string" && v.trim() ? v : undefined;
}

function pickNumber(obj: Record<string, unknown>, key: string): number {
  const v = obj[key];
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return 0;
}

function unwrapPayload(data: unknown): Record<string, unknown> {
  if (!data || typeof data !== "object") return {};
  const root = data as Record<string, unknown>;
  const inner = root.data;
  if (inner && typeof inner === "object" && !Array.isArray(inner)) {
    return inner as Record<string, unknown>;
  }
  return root;
}

function messageFromResponseData(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;
  const rec = data as Record<string, unknown>;
  if (typeof rec.message === "string" && rec.message.trim()) return rec.message;
  return undefined;
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
        messageFromResponseData(err.response?.data) ??
        err.message ??
        "Refresh failed";
      throw new RefreshTokenError(msg, status);
    }
    throw new RefreshTokenError("Unknown refresh error");
  }
}
