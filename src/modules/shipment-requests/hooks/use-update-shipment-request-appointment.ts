import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateDealerShipmentRequestAppointment } from "@/modules/shipment-requests/services/dealer-shipment-request-update-appointment.service";

export function useUpdateShipmentRequestAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateDealerShipmentRequestAppointment,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["dealer", "shipment-requests-paged"] });
      await queryClient.invalidateQueries({ queryKey: ["dealer", "cart"] });
    },
  });
}
