import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateVehicleForCustomerService } from "@/modules/vehicles/services/update-vehicle-for-customer.service";
import type { CreateVehicleRequest } from "@/modules/vehicles/schemas/create-vehicle.schema";
import { dealerCustomersQueryKey } from "@/modules/customers/hooks/use-create-dealer-customer";
import { dealerCustomerDetailQueryKey } from "@/modules/customers/hooks/use-dealer-customer";

export function useUpdateVehicleForCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      dealerCustomerId,
      vehicleId,
      payload,
    }: {
      dealerCustomerId: number;
      vehicleId: number;
      payload: CreateVehicleRequest;
    }) => updateVehicleForCustomerService(dealerCustomerId, vehicleId, payload),
    onSuccess: (_void, { dealerCustomerId }) => {
      void queryClient.invalidateQueries({ queryKey: dealerCustomersQueryKey });
      void queryClient.invalidateQueries({
        queryKey: dealerCustomerDetailQueryKey(String(dealerCustomerId)),
      });
    },
  });
}
