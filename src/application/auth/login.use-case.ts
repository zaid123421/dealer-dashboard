import axios from "axios";
import publicApi from "@/lib/public-api";
import TokenService from "@/infrastructure/auth/token-service";
import { ROLES, type Role } from "@/shared/config/roles";
import type { AuthUser } from "@/shared/types/auth-session";
import { syncDealerSessionFromMeApi } from "@/application/auth/sync-dealer-session.use-case";
import { useAuthStore } from "@/shared/stores/auth-store";
import { clearDealerProfileCache } from "@/modules/dealer/lib/dealer-profile-cache";
import { DealerMeError } from "@/modules/dealer/services/dealer-me.service";
import { pickString, pickNumber, unwrapPayload } from "@/shared/lib/dto-utils";
import { getApiErrorMessage } from "@/lib/api-error";

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginResult {
  success: true;
  role: Role;
  user: AuthUser;
}

export class LoginError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "LoginError";
  }
}

function extractTokensFromPayload(payload: Record<string, unknown>): {
  accessToken?: string;
  refreshToken?: string;
  legacyToken?: string;
} {
  const accessToken =
    pickString(payload, "accessToken") ?? pickString(payload, "access_token");
  const refreshToken =
    pickString(payload, "refreshToken") ?? pickString(payload, "refresh_token");
  const legacyToken = pickString(payload, "token");
  return { accessToken, refreshToken, legacyToken };
}

/** Minimal profile until GET /v1/dealer/me completes. */
function buildTemporaryAuthUser(email: string, expiresInSeconds: number): AuthUser {
  return {
    email,
    firstName: "",
    lastName: "",
    backendRole: "",
    accessLevel: "",
    userActive: true,
    tenantType: "DEALER",
    tenantId: 0,
    tenantName: "",
    expiresInSeconds,
  };
}

export async function loginUseCase(input: LoginInput): Promise<LoginResult> {
  try {
    const { data } = await publicApi.post("/v1/auth/login", {
      email: input.email.trim(),
      password: input.password,
    });

    const payload = unwrapPayload(data);
    const { accessToken, refreshToken, legacyToken } =
      extractTokensFromPayload(payload);

    const access = accessToken ?? null;
    const refresh = refreshToken ?? legacyToken;

    if (!access || !refresh) {
      throw new LoginError("Invalid login response: missing tokens", undefined);
    }

    const expiresInSeconds = pickNumber(payload, "expiresIn") || 900;

    TokenService.persistSession({
      accessToken: access,
      refreshToken: refresh,
      expiresInSeconds,
      appRole: ROLES.SUPPLIER,
      user: buildTemporaryAuthUser(input.email.trim(), expiresInSeconds),
    });

    const { user, role } = await syncDealerSessionFromMeApi();

    return { success: true, role, user };
  } catch (err: unknown) {
    TokenService.removeRefreshToken();
    clearDealerProfileCache();
    useAuthStore.getState().clearAuth();

    if (err instanceof LoginError) throw err;
    if (err instanceof DealerMeError) {
      throw new LoginError(err.message, err.status);
    }
    if (axios.isAxiosError(err)) {
      const status = err.response?.status;
      const msg =
        getApiErrorMessage(err.response?.data) ??
        err.message ??
        "Request failed";
      throw new LoginError(msg, status);
    }
    if (err instanceof Error) {
      throw new LoginError(err.message);
    }
    throw new LoginError("Unknown error");
  }
}
