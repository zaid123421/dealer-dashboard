import { useQuery } from "@tanstack/react-query";
import {
  listDealerInboundEmailsPaged,
  type DealerInboundEmailsQuery,
} from "@/modules/inbound-emails/services/dealer-inbound-emails.service";

export function dealerInboundEmailsQueryKey(query: DealerInboundEmailsQuery) {
  return ["dealer", "inbound-emails", query] as const;
}

export function useDealerInboundEmails(query: DealerInboundEmailsQuery = {}) {
  return useQuery({
    queryKey: dealerInboundEmailsQueryKey(query),
    queryFn: () => listDealerInboundEmailsPaged(query),
  });
}
