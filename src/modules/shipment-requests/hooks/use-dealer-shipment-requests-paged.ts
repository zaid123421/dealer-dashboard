import { useQuery } from "@tanstack/react-query";
import {
  listDealerShipmentRequestsPaged,
  type DealerShipmentRequestsPagedQuery,
} from "@/modules/shipment-requests/services/dealer-shipment-requests-paged.service";

export function dealerShipmentRequestsPagedQueryKey(query: DealerShipmentRequestsPagedQuery) {
  return ["dealer", "shipment-requests-paged", query] as const;
}

export function useDealerShipmentRequestsPaged(query: DealerShipmentRequestsPagedQuery) {
  return useQuery({
    queryKey: dealerShipmentRequestsPagedQueryKey(query),
    queryFn: () => listDealerShipmentRequestsPaged(query),
  });
}
