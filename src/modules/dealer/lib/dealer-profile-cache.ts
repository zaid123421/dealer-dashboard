import type { DealerProfile } from "@/modules/dealer/types/dealer-profile";

const CACHE_KEY = "dealer-profile-snapshot";

export function readDealerProfileCache(): DealerProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DealerProfile;
  } catch {
    return null;
  }
}

export function writeDealerProfileCache(profile: DealerProfile): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(profile));
  } catch {
    /* ignore quota / private mode */
  }
}

export function clearDealerProfileCache(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(CACHE_KEY);
}
