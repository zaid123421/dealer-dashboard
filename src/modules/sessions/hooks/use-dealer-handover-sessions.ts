import { useQuery } from "@tanstack/react-query";
import {
  listDealerHandoverSessionsPaged,
  type DealerHandoverSessionsQuery,
} from "@/modules/sessions/services/dealer-handover-sessions.service";

export const dealerHandoverAllQueryKeyRoot = ["dealer", "handover-all"] as const;

export function dealerHandoverSessionsQueryKey(query: DealerHandoverSessionsQuery) {
  return [...dealerHandoverAllQueryKeyRoot, query] as const;
}

export function useDealerHandoverSessions(query: DealerHandoverSessionsQuery) {
  return useQuery({
    queryKey: dealerHandoverSessionsQueryKey(query),
    queryFn: () => listDealerHandoverSessionsPaged(query),
  });
}
