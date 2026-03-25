import Cookies from "js-cookie";
import type { Role } from "@/shared/config/roles";
import type { AuthUser } from "@/shared/types/auth-session";

const REFRESH_TOKEN_KEY = "refresh-token";
const ACCESS_TOKEN_KEY = "access-token";
/** اسم الـ cookie للدور — يُستخدم في الـ middleware أيضاً */
export const USER_ROLE_KEY = "user-role";
const USER_EMAIL_KEY = "user-email";
const AUTH_PROFILE_KEY = "auth-profile";
const ACCESS_EXPIRES_AT_KEY = "access-expires-at";

const COOKIE_OPTS = { path: "/", sameSite: "lax" as const };

function getRefreshToken() {
  return Cookies.get(REFRESH_TOKEN_KEY);
}

function removeRefreshToken() {
  Cookies.remove(REFRESH_TOKEN_KEY, { path: "/" });
  Cookies.remove(ACCESS_TOKEN_KEY, { path: "/" });
  Cookies.remove(USER_ROLE_KEY, { path: "/" });
  Cookies.remove(USER_EMAIL_KEY, { path: "/" });
  Cookies.remove(AUTH_PROFILE_KEY, { path: "/" });
  Cookies.remove(ACCESS_EXPIRES_AT_KEY, { path: "/" });
}

function setRefreshToken(token: string) {
  Cookies.set(REFRESH_TOKEN_KEY, token, COOKIE_OPTS);
}

function getAccessToken() {
  return Cookies.get(ACCESS_TOKEN_KEY);
}

function setAccessToken(token: string) {
  Cookies.set(ACCESS_TOKEN_KEY, token, COOKIE_OPTS);
}

function removeAccessToken() {
  Cookies.remove(ACCESS_TOKEN_KEY, { path: "/" });
}

function getRole(): Role | null {
  const value = Cookies.get(USER_ROLE_KEY);
  if (value === "admin" || value === "supplier" || value === "user") return value;
  return null;
}

function setRole(role: Role) {
  Cookies.set(USER_ROLE_KEY, role, COOKIE_OPTS);
}

function removeRole() {
  Cookies.remove(USER_ROLE_KEY, { path: "/" });
}

function getAuthProfile(): AuthUser | null {
  const raw = Cookies.get(AUTH_PROFILE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

/** وقت انتهاء صلاحية access token (Unix ms) إن وُجد */
function getAccessExpiresAt(): number | null {
  const v = Cookies.get(ACCESS_EXPIRES_AT_KEY);
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export interface PersistSessionInput {
  accessToken: string;
  refreshToken: string;
  expiresInSeconds: number;
  appRole: Role;
  user: AuthUser;
}

function persistSession(input: PersistSessionInput): void {
  setAccessToken(input.accessToken);
  setRefreshToken(input.refreshToken);
  setRole(input.appRole);
  Cookies.set(USER_EMAIL_KEY, input.user.email, COOKIE_OPTS);
  Cookies.set(AUTH_PROFILE_KEY, JSON.stringify(input.user), COOKIE_OPTS);
  const expiresAt = Date.now() + input.expiresInSeconds * 1000;
  Cookies.set(ACCESS_EXPIRES_AT_KEY, String(expiresAt), COOKIE_OPTS);
}

export interface ApplyRefreshedTokensInput {
  accessToken: string;
  /** إن أعادها الـ backend (تدوير التوكن) */
  refreshToken?: string;
  expiresInSeconds: number;
}

function applyRefreshedTokens(input: ApplyRefreshedTokensInput): void {
  setAccessToken(input.accessToken);
  if (input.refreshToken) {
    setRefreshToken(input.refreshToken);
  }
  const seconds = input.expiresInSeconds > 0 ? input.expiresInSeconds : 900;
  const expiresAt = Date.now() + seconds * 1000;
  Cookies.set(ACCESS_EXPIRES_AT_KEY, String(expiresAt), COOKIE_OPTS);
  const profile = getAuthProfile();
  if (profile) {
    const updated: AuthUser = { ...profile, expiresInSeconds: seconds };
    Cookies.set(AUTH_PROFILE_KEY, JSON.stringify(updated), COOKIE_OPTS);
  }
}

const TokenService = {
  getRefreshToken,
  removeRefreshToken,
  setRefreshToken,
  getAccessToken,
  setAccessToken,
  removeAccessToken,
  getRole,
  setRole,
  removeRole,
  getAuthProfile,
  getAccessExpiresAt,
  persistSession,
  applyRefreshedTokens,
};

export default TokenService;
