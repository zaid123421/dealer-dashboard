import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteDealerCustomerService } from "@/modules/customers/services/delete-dealer-customer.service";
import { dealerCustomersQueryKey } from "@/modules/customers/hooks/use-create-dealer-customer";
import { dealerCustomerDetailQueryKey } from "@/modules/customers/hooks/use-dealer-customer";

export function useDeleteDealerCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (customerId: number) => deleteDealerCustomerService(customerId),
    onSuccess: (_void, customerId) => {
      void queryClient.invalidateQueries({ queryKey: dealerCustomersQueryKey });
      void queryClient.removeQueries({
        queryKey: dealerCustomerDetailQueryKey(String(customerId)),
      });
    },
  });
}
