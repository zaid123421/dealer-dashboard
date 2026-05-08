'use client'

import { useQuery } from '@tanstack/react-query'
import { fetchDealerTireSetsOverview } from '../services/list-dealer-tire-sets-overview.service'

export const dealerTireSetsOverviewQueryKey = ['dealer-tire-sets-overview'] as const

export function useDealerTireSetsOverview() {
  return useQuery({
    queryKey: dealerTireSetsOverviewQueryKey,
    queryFn: fetchDealerTireSetsOverview,
    staleTime: 60 * 1000,
  })
}
