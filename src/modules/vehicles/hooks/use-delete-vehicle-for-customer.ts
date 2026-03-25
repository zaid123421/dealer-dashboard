import { useMutation, useQueryClient } from "@tanstack/react-query";
import { dealerCustomersQueryKey } from "@/modules/customers/hooks/use-create-dealer-customer";
import { deleteVehicleForCustomerService } from "@/modules/vehicles/services/delete-vehicle-for-customer.service";

export function useDeleteVehicleForCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      dealerCustomerId,
      vehicleId,
    }: {
      dealerCustomerId: number;
      vehicleId: number;
    }) => deleteVehicleForCustomerService(dealerCustomerId, vehicleId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: dealerCustomersQueryKey });
    },
  });
}
