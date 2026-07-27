import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cancelDealerShipmentRequest } from "@/modules/shipment-requests/services/dealer-shipment-request-cancel.service";

export function useCancelShipmentRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelDealerShipmentRequest,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["dealer", "shipment-requests-paged"] });
      await queryClient.invalidateQueries({ queryKey: ["dealer", "cart"] });
    },
  });
}
