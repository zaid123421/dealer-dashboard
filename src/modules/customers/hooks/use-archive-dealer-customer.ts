import { useMutation, useQueryClient } from "@tanstack/react-query";
import { archiveDealerCustomerService } from "@/modules/customers/services/archive-dealer-customer.service";
import { dealerCustomersQueryKey } from "@/modules/customers/hooks/use-create-dealer-customer";

export function useArchiveDealerCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (customerId: number) => archiveDealerCustomerService(customerId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: dealerCustomersQueryKey });
    },
  });
}
