import { useQuery } from "@tanstack/react-query";
import { getDealerHandoverSessionState } from "@/modules/sessions/services/dealer-handover-session-state.service";

export function dealerHandoverSessionStateQueryKey(sessionId: number) {
  return ["dealer", "handover-state", sessionId] as const;
}

export function useDealerHandoverSessionState(sessionId: number | null, enabled = true) {
  return useQuery({
    queryKey: dealerHandoverSessionStateQueryKey(sessionId ?? 0),
    queryFn: () => getDealerHandoverSessionState(sessionId!),
    enabled: enabled && sessionId != null && sessionId > 0,
    staleTime: 15_000,
  });
}
