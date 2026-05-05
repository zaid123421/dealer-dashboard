import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'

interface UseVehicleDetailsParams {
  customerId: string | undefined
  vehicleId: string | undefined
}

interface VehicleDetails {
  id: number
  vin: string
  year: number
  make: string
  model: string
  plateNumber: string
  color: string
  odometerKm: number
  customerId: number
  createdAt: string
  updatedAt: string
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

      const response = await api.get<VehicleDetails>(
        `/v1/dealerCustomers/${customerId}/vehicles/${vehicleId}`
      )

      return response.data
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
