import { useState, useEffect } from 'react'

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

const mockTireSets: TireSetDetail[] = [
  {
    id: 1,
    vehicleId: 1,
    tireCount: 4,
    seasonType: 'Summer',
    brand: 'Michelin',
    size: '245/35R19',
    displayLabel: 'Summer Performance Set',
    createdAt: '2024-01-15T10:30:00Z',
  },
  {
    id: 2,
    vehicleId: 1,
    tireCount: 4,
    seasonType: 'Winter',
    brand: 'Bridgestone',
    size: '225/45R17',
    displayLabel: 'Winter Safety Set',
    createdAt: '2024-01-10T14:20:00Z',
  },
  {
    id: 3,
    vehicleId: 1,
    tireCount: 4,
    seasonType: 'All-Season',
    brand: 'Continental',
    size: '255/40R18',
    displayLabel: 'All-Season Comfort Set',
    createdAt: '2023-12-20T09:15:00Z',
  },
]



/**

 * Hook to fetch tire sets for a specific vehicle (using mock data)

 */

export function useVehicleTireSets({

  customerId,

  vehicleId,

}: UseVehicleTireSetsParams): UseVehicleTireSetsResult {

  const [tireSets, setTireSets] = useState<TireSetDetail[]>([])

  const [isLoading, setIsLoading] = useState(true)

  const [isError, setIsError] = useState(false)

  const [error, setError] = useState<Error | null>(null)



  const refetch = () => {

    setIsLoading(true)

    setIsError(false)

    setError(null)



    // Simulate API call with timeout

    setTimeout(() => {

      try {

        if (!customerId || !vehicleId) {

          throw new Error('Customer ID and Vehicle ID are required')

        }



        // For demonstration, show empty tire sets for some vehicles

        const vehicleIdNum = parseInt(vehicleId)

        const hasTireSets = vehicleIdNum % 3 !== 0 // Every 3rd vehicle has no tire sets

        

        setTireSets(hasTireSets ? mockTireSets : [])

        setIsLoading(false)

      } catch (err) {

        setIsError(true)

        setError(err instanceof Error ? err : new Error('Unknown error'))

        setIsLoading(false)

      }

    }, 800) // Simulate network delay

  }



  useEffect(() => {

    refetch()

  }, [customerId, vehicleId])



  return {

    tireSets,

    isLoading,

    isError,

    error,

    refetch,

  }

}

