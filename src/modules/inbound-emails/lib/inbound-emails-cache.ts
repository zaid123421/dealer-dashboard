import type { QueryClient } from "@tanstack/react-query";
import { inboundEmailDraftQueryKey } from "@/modules/inbound-emails/hooks/use-inbound-email-draft";
import { dealerInboundEmailsQueryKey } from "@/modules/inbound-emails/hooks/use-dealer-inbound-emails";
import type { DealerInboundEmailsQuery } from "@/modules/inbound-emails/services/dealer-inbound-emails.service";

export function removeInboundEmailFromListCache(
  queryClient: QueryClient,
  inboundEmailId: string,
  query: DealerInboundEmailsQuery,
) {
  queryClient.setQueryData(dealerInboundEmailsQueryKey(query), (current: unknown) => {
    if (!current || typeof current !== "object") return current;
    const page = current as {
      rows: { id: string }[];
      meta: {
        totalElements: number;
        numberOfElements: number;
        empty: boolean;
      };
    };
    const rows = page.rows.filter((row) => row.id !== inboundEmailId);
    return {
      ...page,
      rows,
      meta: {
        ...page.meta,
        totalElements: Math.max(0, page.meta.totalElements - 1),
        numberOfElements: rows.length,
        empty: rows.length === 0,
      },
    };
  });
  queryClient.removeQueries({ queryKey: inboundEmailDraftQueryKey(inboundEmailId) });
}
