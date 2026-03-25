import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateDealerCustomerService } from "@/modules/customers/services/update-dealer-customer.service";
import type { CreateDealerCustomerRequest } from "@/modules/customers/schemas/create-dealer-customer.schema";
import { dealerCustomersQueryKey } from "@/modules/customers/hooks/use-create-dealer-customer";
import { dealerCustomerDetailQueryKey } from "@/modules/customers/hooks/use-dealer-customer";

export function useUpdateDealerCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      customerId,
      payload,
    }: {
      customerId: number;
      payload: CreateDealerCustomerRequest;
    }) => updateDealerCustomerService(customerId, payload),
    onSuccess: (_void, { customerId }) => {
      void queryClient.invalidateQueries({ queryKey: dealerCustomersQueryKey });
      void queryClient.invalidateQueries({
        queryKey: dealerCustomerDetailQueryKey(String(customerId)),
      });
    },
  });
}
