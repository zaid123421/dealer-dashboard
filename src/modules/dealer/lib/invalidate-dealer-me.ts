import type { QueryClient } from "@tanstack/react-query";
import { dealerMeQueryKey } from "@/modules/dealer/hooks/use-dealer-me";

export function invalidateDealerMe(queryClient: QueryClient): Promise<void> {
  return queryClient.invalidateQueries({ queryKey: dealerMeQueryKey }).then(() => undefined);
}
