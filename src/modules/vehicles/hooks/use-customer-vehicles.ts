import { useQuery } from "@tanstack/react-query";
import { dealerCustomersQueryKey } from "@/modules/customers/hooks/use-create-dealer-customer";
import { getVehiclesForCustomerService } from "@/modules/vehicles/services/get-vehicles-for-customer.service";

export function customerVehiclesQueryKey(customerId: number) {
  return [...dealerCustomersQueryKey, "vehicles", customerId] as const;
}

export function useCustomerVehicles(customerId: number | null) {
  return useQuery({
    queryKey: customerId != null ? customerVehiclesQueryKey(customerId) : ["dealerCustomers", "vehicles", "none"],
    queryFn: () => getVehiclesForCustomerService(customerId!),
    enabled: customerId != null,
  });
}
