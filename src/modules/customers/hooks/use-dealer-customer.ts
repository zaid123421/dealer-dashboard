import { useQuery } from "@tanstack/react-query";
import { getDealerCustomerByIdService } from "@/modules/customers/services/get-dealer-customer-by-id.service";
import { dealerCustomersQueryKey } from "@/modules/customers/hooks/use-create-dealer-customer";

export function dealerCustomerDetailQueryKey(customerId: string | undefined) {
  return [...dealerCustomersQueryKey, "detail", customerId ?? ""] as const;
}

export function useDealerCustomer(customerId: string | undefined) {
  const idNum = customerId != null && customerId !== "" ? Number(customerId) : NaN;
  return useQuery({
    queryKey: dealerCustomerDetailQueryKey(customerId),
    queryFn: () => getDealerCustomerByIdService(idNum),
    enabled: Number.isFinite(idNum) && idNum > 0,
  });
}
