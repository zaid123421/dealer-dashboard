import axios from "axios";
import publicApi from "@/lib/public-api";
import TokenService from "@/infrastructure/auth/token-service";
import { ROLES, type Role } from "@/shared/config/roles";
import type { AuthUser } from "@/shared/types/auth-session";
import { syncDealerSessionFromMeApi } from "@/application/auth/sync-dealer-session.use-case";
import { useAuthStore } from "@/shared/stores/auth-store";
import { clearDealerProfileCache } from "@/modules/dealer/lib/dealer-profile-cache";
import { DealerMeError } from "@/modules/dealer/services/dealer-me.service";

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
        messageFromResponseData(err.response?.data) ??
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
