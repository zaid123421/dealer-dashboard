import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createVehicleForCustomerService } from "@/modules/vehicles/services/create-vehicle-for-customer.service";
import type { CreateVehicleRequest } from "@/modules/vehicles/schemas/create-vehicle.schema";
import { dealerCustomersQueryKey } from "@/modules/customers/hooks/use-create-dealer-customer";
import { dealerCustomerDetailQueryKey } from "@/modules/customers/hooks/use-dealer-customer";

export function useCreateVehicleForCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      dealerCustomerId,
      payload,
    }: {
      dealerCustomerId: number;
      payload: CreateVehicleRequest;
    }) => createVehicleForCustomerService(dealerCustomerId, payload),
    onSuccess: (_void, { dealerCustomerId }) => {
      void queryClient.invalidateQueries({ queryKey: dealerCustomersQueryKey });
      void queryClient.invalidateQueries({
        queryKey: dealerCustomerDetailQueryKey(String(dealerCustomerId)),
      });
    },
  });
}
