import { useMutation, useQueryClient } from "@tanstack/react-query";
import { moveDealerShipmentRequestToCart } from "@/modules/shipment-requests/services/dealer-shipment-request-move-to-cart.service";

export function useMoveShipmentRequestToCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: moveDealerShipmentRequestToCart,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["dealer", "inbound-emails"] });
      await queryClient.invalidateQueries({ queryKey: ["dealer", "shipment-requests-paged"] });
      await queryClient.invalidateQueries({ queryKey: ["dealer", "cart"] });
    },
  });
}
