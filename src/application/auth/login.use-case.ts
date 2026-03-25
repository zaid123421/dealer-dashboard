import axios from "axios";
import publicApi from "@/lib/public-api";
import TokenService from "@/infrastructure/auth/token-service";
import { ROLES, type Role, parseRole } from "@/shared/config/roles";
import type { AuthUser } from "@/shared/types/auth-session";

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

/** يطابق أدوار الـ backend إلى أدوار واجهة الـ dealer dashboard */
function normalizeRole(raw: string): Role | null {
  const u = raw.toUpperCase();
  if (u.includes("TECHNICIAN")) return ROLES.USER;
  if (u.includes("DEALER")) return ROLES.SUPPLIER;
  if (u.includes("SALES") || u === "SYSTEM_ADMIN" || u === "PLATFORM_ADMIN")
    return ROLES.ADMIN;
  const direct = parseRole(raw.toLowerCase());
  if (direct) return direct;
  if (u.includes("ADMIN")) return ROLES.ADMIN;
  if (u.includes("SUPPLIER") || u.includes("VENDOR")) return ROLES.SUPPLIER;
  return null;
}

function extractAppRole(payload: Record<string, unknown>): Role | null {
  const r = pickString(payload, "role") ?? pickString(payload, "userRole");
  if (r) return normalizeRole(r);
  const user = payload.user;
  if (user && typeof user === "object") {
    const role = pickString(user as Record<string, unknown>, "role");
    if (role) return normalizeRole(role);
  }
  return null;
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

function buildAuthUser(payload: Record<string, unknown>): AuthUser {
  const nested =
    payload.user && typeof payload.user === "object" && !Array.isArray(payload.user)
      ? (payload.user as Record<string, unknown>)
      : undefined;

  const str = (key: string): string =>
    (nested ? pickString(nested, key) : undefined) ?? pickString(payload, key) ?? "";

  const tenantId =
    nested !== undefined
      ? pickNumber(nested, "tenantId") || pickNumber(payload, "tenantId")
      : pickNumber(payload, "tenantId");

  return {
    email: str("email"),
    firstName: str("firstName"),
    lastName: str("lastName"),
    backendRole: str("role"),
    tenantType: str("tenantType"),
    tenantId,
    tenantName: str("tenantName"),
    expiresInSeconds:
      pickNumber(payload, "expiresIn") ||
      (nested !== undefined ? pickNumber(nested, "expiresIn") : 0),
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

    const user = buildAuthUser(payload);
    const appRole = extractAppRole(payload) ?? ROLES.SUPPLIER;

    TokenService.persistSession({
      accessToken: access,
      refreshToken: refresh,
      expiresInSeconds: user.expiresInSeconds || 900,
      appRole,
      user,
    });

    return { success: true, role: appRole, user };
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const status = err.response?.status;
      const msg =
        messageFromResponseData(err.response?.data) ??
        err.message ??
        "Request failed";
      throw new LoginError(msg, status);
    }
    if (err instanceof LoginError) throw err;
    throw new LoginError("Unknown error");
  }
}
