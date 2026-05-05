import { useInfiniteQuery } from "@tanstack/react-query";
import { searchDealerCustomersService } from "@/modules/customers/services/search-dealer-customers.service";
import type { MyDealerCustomersParams } from "@/modules/customers/schemas/dealer-customer-page.schema";
import { dealerCustomersQueryKey } from "@/modules/customers/hooks/use-create-dealer-customer";

export type MyDealerCustomersFilters = Pick<
  MyDealerCustomersParams,
  "size" | "sortBy" | "direction" | "includeArchived"
> & {
  startsWith?: boolean;
};

export type DealerCustomersInfiniteOptions = MyDealerCustomersFilters & {
  dealerId: number | null;
  searchTerm: string;
};

export function dealerCustomersSearchInfiniteQueryKey(
  dealerId: number,
  searchTerm: string,
  filters: MyDealerCustomersFilters,
) {
  return [...dealerCustomersQueryKey, "dealer-search", dealerId, searchTerm, filters] as const;
}

export function useDealerCustomersInfinite(options: DealerCustomersInfiniteOptions) {
  const {
    dealerId,
    searchTerm,
    size,
    sortBy,
    direction,
    includeArchived,
    startsWith = true,
  } = options;
  const pageSize = size;

  const filters: MyDealerCustomersFilters = {
    size,
    sortBy,
    direction,
    includeArchived,
    startsWith,
  };

  return useInfiniteQuery({
    queryKey: dealerCustomersSearchInfiniteQueryKey(dealerId ?? 0, searchTerm, filters),
    queryFn: ({ pageParam }) => {
      if (dealerId == null || dealerId <= 0) {
        return Promise.reject(new Error("Missing dealer id"));
      }
      return searchDealerCustomersService(dealerId, {
        page: pageParam as number,
        size: pageSize,
        sortBy,
        direction,
        includeArchived,
        searchTerm,
        startsWith,
      });
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => (lastPage.last ? undefined : lastPage.number + 1),
    enabled: dealerId != null && dealerId > 0,
  });
}
