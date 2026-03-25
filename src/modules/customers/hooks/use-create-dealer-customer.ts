import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createDealerCustomerService } from "@/modules/customers/services/create-dealer-customer.service";
import type { CreateDealerCustomerRequest } from "@/modules/customers/schemas/create-dealer-customer.schema";

export const dealerCustomersQueryKey = ["dealerCustomers"] as const;

export function useCreateDealerCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateDealerCustomerRequest) =>
      createDealerCustomerService(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: dealerCustomersQueryKey });
    },
  });
}
