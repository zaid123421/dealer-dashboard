import { useQuery } from "@tanstack/react-query";
import { getDealerInboundEmailDraft } from "@/modules/inbound-emails/services/dealer-inbound-email-draft.service";

export function inboundEmailDraftQueryKey(inboundEmailId: string) {
  return ["dealer", "inbound-emails", inboundEmailId, "draft"] as const;
}

export function useInboundEmailDraft(inboundEmailId: string | undefined) {
  return useQuery({
    queryKey: inboundEmailDraftQueryKey(inboundEmailId ?? ""),
    queryFn: () => getDealerInboundEmailDraft(inboundEmailId!),
    enabled: Boolean(inboundEmailId),
  });
}
