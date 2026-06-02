import { useQuery } from "@tanstack/react-query";
import TokenService from "@/infrastructure/auth/token-service";
import { syncDealerSessionFromMeApi } from "@/application/auth/sync-dealer-session.use-case";
import type { DealerProfile } from "@/modules/dealer/types/dealer-profile";

export const dealerMeQueryKey = ["dealer", "me"] as const;

export function useDealerMe(options?: { enabled?: boolean }) {
  const enabled = (options?.enabled ?? true) && Boolean(TokenService.getAccessToken());

  return useQuery({
    queryKey: dealerMeQueryKey,
    queryFn: async (): Promise<DealerProfile> => {
      const { profile } = await syncDealerSessionFromMeApi();
      return profile;
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
