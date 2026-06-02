import { useQuery } from '@tanstack/react-query'
import { getVehicleDetailsService } from '@/modules/vehicles/services/get-vehicle-details.service'
import type { VehicleDetails } from '@/modules/vehicles/schemas/dealer-customer-vehicle.schema'

interface UseVehicleDetailsParams {
  customerId: string | undefined
  vehicleId: string | undefined
}

interface UseVehicleDetailsResult {
  vehicle: VehicleDetails | null
  isLoading: boolean
  isError: boolean
  error: Error | null
}

/**
 * Hook to fetch vehicle details
 */
export function useVehicleDetails({
  customerId,
  vehicleId,
}: UseVehicleDetailsParams): UseVehicleDetailsResult {
  const {
    data: vehicle = null,
    isLoading,
    isError,
    error,
  } = useQuery<VehicleDetails, Error>({
    queryKey: ['vehicle-details', customerId, vehicleId],
    queryFn: async () => {
      if (!customerId || !vehicleId) {
        throw new Error('Customer ID and Vehicle ID are required')
      }

      return getVehicleDetailsService(Number(customerId), Number(vehicleId))
    },
    enabled: !!customerId && !!vehicleId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  return {
    vehicle,
    isLoading,
    isError,
    error: error as Error | null,
  }
}
