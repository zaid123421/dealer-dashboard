import { useQuery } from "@tanstack/react-query";
import {
  listDealerServiceSessionsPaged,
  type DealerServiceSessionsQuery,
} from "@/modules/sessions/services/dealer-service-sessions.service";

export const dealerServiceSessionsQueryKeyRoot = ["dealer", "service-sessions-all"] as const;

export function dealerServiceSessionsQueryKey(query: DealerServiceSessionsQuery) {
  return [...dealerServiceSessionsQueryKeyRoot, query] as const;
}

export function useDealerServiceSessions(
  query: DealerServiceSessionsQuery,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: dealerServiceSessionsQueryKey(query),
    queryFn: () => listDealerServiceSessionsPaged(query),
    enabled: options?.enabled ?? true,
  });
}
