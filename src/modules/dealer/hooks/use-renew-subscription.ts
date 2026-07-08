import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  renewSubscription,
  type SubscriptionRenewalRequest,
} from "@/modules/dealer/services/renew-subscription.service";
import { invalidateDealerMe } from "@/modules/dealer/lib/invalidate-dealer-me";

type RenewSubscriptionVariables = {
  subscriptionId: number;
  payload: SubscriptionRenewalRequest;
};

export function useRenewSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ subscriptionId, payload }: RenewSubscriptionVariables) =>
      renewSubscription(subscriptionId, payload),
    onSuccess: () => {
      void invalidateDealerMe(queryClient);
    },
  });
}
