import api from "@/lib/api";
import TokenService from "@/infrastructure/auth/token-service";
import { useAuthStore } from "@/shared/stores/auth-store";
import { ROUTES } from "@/constants/routes";

/**
 * يستدعي تسجيل الخروج على السيرفر ثم يمسح الكوكيز والـ store ويعيد التوجيه.
 * يُستكمل المسح المحلي حتى لو فشل الطلب الشبكي.
 */
export async function performClientLogout(): Promise<void> {
  try {
    if (TokenService.getAccessToken()) {
      await api.post("/v1/auth/logout", {});
    }
  } catch {
    /* تجاهل — نكمّل إبطال الجلسة محلياً */
  }
  TokenService.removeRefreshToken();
  useAuthStore.getState().clearAuth();
  if (typeof window !== "undefined") {
    window.location.href = ROUTES.AUTH.LOGIN;
  }
}
