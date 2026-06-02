import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  submitAllDealerShipmentRequests,
  submitDealerShipmentRequest,
} from "@/modules/shipment-requests/services/dealer-shipment-request-submit.service";

export function useSubmitShipmentRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitDealerShipmentRequest,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["dealer", "shipment-requests-paged"] });
      await queryClient.invalidateQueries({ queryKey: ["dealer", "inbound-emails"] });
      await queryClient.invalidateQueries({ queryKey: ["dealer", "cart"] });
    },
  });
}

export function useSubmitAllShipmentRequests() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitAllDealerShipmentRequests,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["dealer", "shipment-requests-paged"] });
      await queryClient.invalidateQueries({ queryKey: ["dealer", "inbound-emails"] });
      await queryClient.invalidateQueries({ queryKey: ["dealer", "cart"] });
    },
  });
}
