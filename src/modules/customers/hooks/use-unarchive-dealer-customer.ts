import { useMutation, useQueryClient } from "@tanstack/react-query";
import { unarchiveDealerCustomerService } from "@/modules/customers/services/unarchive-dealer-customer.service";
import { dealerCustomersQueryKey } from "@/modules/customers/hooks/use-create-dealer-customer";

export function useUnarchiveDealerCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (customerId: number) => unarchiveDealerCustomerService(customerId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: dealerCustomersQueryKey });
    },
  });
}
