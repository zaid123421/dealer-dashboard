import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  cacheHandoverSessionVersion,
  handoverSessionIdQueryKey,
  handoverSessionVersionQueryKey,
  openHandoverSession,
} from "@/modules/shipment-requests/services/dealer-handover.service";

export function useOpenHandoverSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: openHandoverSession,
    onSuccess: async (result, variables) => {
      if (result.sessionId != null) {
        for (const shipmentRequestId of variables.shipmentRequestIds) {
          queryClient.setQueryData(
            handoverSessionIdQueryKey(shipmentRequestId),
            result.sessionId,
          );
          if (result.handoverSessionVersion != null) {
            cacheHandoverSessionVersion(shipmentRequestId, result.handoverSessionVersion);
            queryClient.setQueryData(
              handoverSessionVersionQueryKey(shipmentRequestId),
              result.handoverSessionVersion,
            );
          }
        }
      }
      await queryClient.invalidateQueries({ queryKey: ["dealer", "shipment-requests-paged"] });
    },
  });
}
