import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  closeHandoverSession,
  handoverSessionIdQueryKey,
} from "@/modules/shipment-requests/services/dealer-handover.service";

export function useCloseHandoverSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: closeHandoverSession,
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["dealer", "shipment-requests-paged"] });
      for (const key of queryClient
        .getQueryCache()
        .findAll({ queryKey: ["dealer", "handover-session-id"] })) {
        if (queryClient.getQueryData<number>(key.queryKey) === variables.sessionId) {
          queryClient.removeQueries({ queryKey: key.queryKey });
        }
      }
    },
  });
}
