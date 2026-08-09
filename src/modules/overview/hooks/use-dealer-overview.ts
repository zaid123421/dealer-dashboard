import { useQuery } from "@tanstack/react-query";
import type { OverviewDays } from "@/modules/overview/lib/dealer-overview-dto";
import { getDealerOverview } from "@/modules/overview/services/dealer-overview.service";

export const dealerOverviewQueryKeyRoot = ["dealer", "overview"] as const;

export function dealerOverviewQueryKey(days: OverviewDays) {
  return [...dealerOverviewQueryKeyRoot, days] as const;
}

export function useDealerOverview(days: OverviewDays) {
  return useQuery({
    queryKey: dealerOverviewQueryKey(days),
    queryFn: () => getDealerOverview(days),
    staleTime: 60_000,
  });
}
