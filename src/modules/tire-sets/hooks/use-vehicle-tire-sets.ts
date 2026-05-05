import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import type { TireSetDetail } from '../types'

interface UseVehicleTireSetsParams {
  customerId: string | undefined
  vehicleId: string | undefined
}

interface UseVehicleTireSetsResult {
  tireSets: TireSetDetail[]
  isLoading: boolean
  isError: boolean
  error: Error | null
  refetch: () => void
}

/**
 * Hook to fetch tire sets for a specific vehicle
 */
export function useVehicleTireSets({
  customerId,
  vehicleId,
}: UseVehicleTireSetsParams): UseVehicleTireSetsResult {
  const {
    data: tireSets = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<TireSetDetail[], Error>({
    queryKey: ['vehicle-tire-sets', customerId, vehicleId],
    queryFn: async () => {
      if (!customerId || !vehicleId) {
        throw new Error('Customer ID and Vehicle ID are required')
      }

      const response = await api.get<TireSetDetail[]>(
        `/v1/dealerCustomers/${customerId}/vehicles/${vehicleId}/tire-sets`
      )

      return response.data
    },
    enabled: !!customerId && !!vehicleId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  return {
    tireSets,
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  }
}
