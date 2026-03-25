import axios, { type InternalAxiosRequestConfig } from "axios";
import TokenService from "@/infrastructure/auth/token-service";
import { ROUTES } from "@/constants/routes";
import { refreshAccessTokenUseCase } from "@/application/auth/refresh-access-token.use-case";
import { useAuthStore } from "@/shared/stores/auth-store";

type RetryableRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean };

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
      config.headers.Authorization = `Bearer ${token}`;
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

    /** 401 = غير مصادق عادةً؛ بعض الـ backends ترجع 403 عند انتهاء/رفض الـ JWT */
    const shouldTryRefresh = status === 401 || status === 403;
    if (!shouldTryRefresh || !originalRequest) {
      return Promise.reject(error);
    }

    if (
      isRefreshRequest(originalRequest) ||
      isLogoutRequest(originalRequest) ||
      originalRequest._retry
    ) {
      clearSessionAndRedirectLogin();
      return Promise.reject(error);
    }

    try {
      const access = await getRefreshedAccessToken();
      originalRequest.headers = originalRequest.headers ?? {};
      originalRequest.headers.Authorization = `Bearer ${access}`;
      originalRequest._retry = true;
      return api.request(originalRequest);
    } catch {
      clearSessionAndRedirectLogin();
      return Promise.reject(error);
    }
  },
);

export default api;
