import { useMutation, useQueryClient } from "@tanstack/react-query";
import { dealerHandoverAllQueryKeyRoot } from "@/modules/sessions/hooks/use-dealer-handover-sessions";
import { dealerHandoverSessionStateQueryKey } from "@/modules/sessions/hooks/use-dealer-handover-session-state";
import { dismissDealerHandoverScan } from "@/modules/sessions/services/dismiss-handover-scan.service";

export function useDismissHandoverScan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: dismissDealerHandoverScan,
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: dealerHandoverSessionStateQueryKey(variables.sessionId),
      });
      await queryClient.invalidateQueries({ queryKey: dealerHandoverAllQueryKeyRoot });
    },
  });
}
