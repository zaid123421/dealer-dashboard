import { useMutation, useQueryClient } from "@tanstack/react-query";
import { rejectDealerShipmentRequest } from "@/modules/shipment-requests/services/dealer-shipment-request-reject.service";

export function useRejectShipmentRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: rejectDealerShipmentRequest,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["dealer", "inbound-emails"] });
      await queryClient.invalidateQueries({ queryKey: ["dealer", "shipment-requests-paged"] });
      await queryClient.invalidateQueries({ queryKey: ["dealer", "cart"] });
    },
  });
}
