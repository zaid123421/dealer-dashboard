import { useAuthStore } from "@/shared/stores/auth-store";

/** Thrown / used when writes are blocked due to inactive subscription. */
export const SUBSCRIPTION_VIEW_ONLY_ERROR =
  "Your subscription is inactive. Renew it to make changes.";

const WRITE_METHODS = new Set(["post", "put", "patch", "delete"]);

function normalizePath(url: string | undefined): string {
  if (!url) return "";
  try {
    if (url.startsWith("http")) return new URL(url).pathname.toLowerCase();
  } catch {
    /* ignore */
  }
  return url.split("?")[0]?.toLowerCase() ?? "";
}

/** Mutations still allowed while the dealer is in view-only mode. */
export function isAllowedWriteWhenViewOnly(url: string | undefined, method: string): boolean {
  const path = normalizePath(url);
  const m = method.toLowerCase();
  if (!WRITE_METHODS.has(m)) return true;

  if (path.includes("/subscriptions/") && path.includes("/renew")) return true;
  if (path.includes("auth/refresh")) return true;
  if (path.includes("auth/logout")) return true;
  if (path.includes("auth/change-password")) return true;
  return false;
}

/**
 * True when dealer profile is loaded and subscription is inactive.
 * While profile is still loading, writes are not blocked.
 */
export function isSubscriptionViewOnlyFromStore(): boolean {
  const profile = useAuthStore.getState().dealerProfile;
  if (!profile) return false;
  const usage = profile.usage;
  // If usage payload is missing, do not lock the app.
  if (!usage) return false;
  return usage.hasActiveSubscription === false;
}

export function assertCanWriteRequest(url: string | undefined, method: string | undefined): void {
  const m = (method ?? "get").toLowerCase();
  if (!WRITE_METHODS.has(m)) return;
  if (!isSubscriptionViewOnlyFromStore()) return;
  if (isAllowedWriteWhenViewOnly(url, m)) return;
  throw new Error(SUBSCRIPTION_VIEW_ONLY_ERROR);
}
