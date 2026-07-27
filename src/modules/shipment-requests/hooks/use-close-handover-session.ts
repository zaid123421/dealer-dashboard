import { useMutation, useQueryClient } from "@tanstack/react-query";
import { closeHandoverSession } from "@/modules/shipment-requests/services/dealer-handover.service";
import { dealerHandoverAllQueryKeyRoot } from "@/modules/sessions/hooks/use-dealer-handover-sessions";

export function useCloseHandoverSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: closeHandoverSession,
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["dealer", "shipment-requests-paged"] });
      await queryClient.invalidateQueries({ queryKey: dealerHandoverAllQueryKeyRoot });
      await queryClient.invalidateQueries({ queryKey: ["dealer", "handover-state"] });
      for (const key of queryClient
        .getQueryCache()
        .findAll({ queryKey: ["dealer", "handover-session-id"] })) {
        if (queryClient.getQueryData<number>(key.queryKey) === variables.sessionId) {
          queryClient.removeQueries({ queryKey: key.queryKey });
        }
      }
      for (const key of queryClient
        .getQueryCache()
        .findAll({ queryKey: ["dealer", "handover-session-version"] })) {
        queryClient.removeQueries({ queryKey: key.queryKey });
      }
    },
  });
}
