import axios, { AxiosHeaders, type InternalAxiosRequestConfig } from "axios";
import TokenService from "@/infrastructure/auth/token-service";
import { ROUTES } from "@/constants/routes";
import { refreshAccessTokenUseCase } from "@/application/auth/refresh-access-token.use-case";
import { useAuthStore } from "@/shared/stores/auth-store";

type RetryableRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean };

function attachBearerToken(config: InternalAxiosRequestConfig, rawToken: string) {
  const token = rawToken.trim();
  if (!token) return;
  const headers = AxiosHeaders.from(config.headers ?? {});
  headers.set("Authorization", `Bearer ${token}`);
  config.headers = headers;
}

const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_BACKEND_URL_FOR_SERVER_REQUESTS ||
    "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

let refreshInFlight: Promise<string> | null = null;

function getRefreshedAccessToken(): Promise<string> {
  if (!refreshInFlight) {
    refreshInFlight = refreshAccessTokenUseCase()
      .then((access) => {
        refreshInFlight = null;
        return access;
      })
      .catch((e) => {
        refreshInFlight = null;
        throw e;
      });
  }
  return refreshInFlight;
}

function isRefreshRequest(config: InternalAxiosRequestConfig): boolean {
  const path = config.url ?? "";
  return path.includes("auth/refresh");
}

function isLogoutRequest(config: InternalAxiosRequestConfig): boolean {
  const path = config.url ?? "";
  return path.includes("auth/logout");
}

/** 401 بسبب كلمة السر الحالية الخاطئة — لا نفترض انتهاء الـ access token ولا نستدعي refresh */
function isWrongCurrentPassword401(error: unknown): boolean {
  if (!axios.isAxiosError(error)) return false;
  if (error.response?.status !== 401) return false;
  const data = error.response.data;
  if (!data || typeof data !== "object") return false;
  const msg = (data as Record<string, unknown>).message;
  if (typeof msg !== "string") return false;
  const lower = msg.toLowerCase();
  return lower.includes("current password") && lower.includes("incorrect");
}

function clearSessionAndRedirectLogin(): void {
  TokenService.removeRefreshToken();
  useAuthStore.getState().clearAuth();
  if (typeof window !== "undefined") {
    window.location.href = ROUTES.AUTH.LOGIN;
  }
}

api.interceptors.request.use(
  (config) => {
    const token = TokenService.getAccessToken();
    if (token) {
      attachBearerToken(config, token);
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const originalRequest = error.config as RetryableRequestConfig | undefined;

    /**
     * 401: غالباً انتهاء أو رفض access token — نحدّث عبر refresh ثم نعيد الطلب.
     * لا نوجّه لتسجيل الدخول إلا بعد فشل الـ refresh أو فشل إعادة المحاولة.
     */
    const shouldTryRefresh = status === 401 || status === 403;
    if (!shouldTryRefresh || !originalRequest) {
      return Promise.reject(error);
    }

    if (status === 401 && isWrongCurrentPassword401(error)) {
      return Promise.reject(error);
    }

    if (isRefreshRequest(originalRequest) || isLogoutRequest(originalRequest)) {
      clearSessionAndRedirectLogin();
      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      clearSessionAndRedirectLogin();
      return Promise.reject(error);
    }

    try {
      const access = await getRefreshedAccessToken();
      attachBearerToken(originalRequest, access);
      originalRequest._retry = true;
      return api.request(originalRequest);
    } catch {
      clearSessionAndRedirectLogin();
      return Promise.reject(error);
    }
  },
);

export default api;
