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



// Mock data for demonstration

const mockTireSets: TireSetDetail[] = [

  {

    id: 1,

    brand: 'Michelin',

    model: 'Pilot Sport 4S',

    size: '245/35R19',

    seasonType: 'summer',

    tireCount: 4,

    treadDepth: 8.5,

    purchaseDate: '2024-01-15',

    purchasePrice: 983.96,

    location: 'Warehouse A - Shelf 1',

    status: 'available',

    customerName: null,

    createdAt: '2024-01-15T10:30:00Z',

    updatedAt: '2024-01-15T10:30:00Z',

    addedDate: '2024-01-15',

    updatedDate: '2024-01-15',

  },

  {

    id: 2,

    brand: 'Bridgestone',

    model: 'Blizzak LM005',

    size: '225/45R17',

    seasonType: 'winter',

    tireCount: 4,

    treadDepth: 9.2,

    purchaseDate: '2024-01-10',

    purchasePrice: 759.96,

    location: 'Warehouse B - Shelf 3',

    status: 'available',

    customerName: null,

    createdAt: '2024-01-10T14:20:00Z',

    updatedAt: '2024-01-10T14:20:00Z',

    addedDate: '2024-01-10',

    updatedDate: '2024-01-10',

  },

  {

    id: 3,

    brand: 'Continental',

    model: 'ContiSportContact 6',

    size: '255/40R18',

    seasonType: 'all_season',

    tireCount: 4,

    treadDepth: 7.8,

    purchaseDate: '2023-12-20',

    purchasePrice: 845.50,

    location: 'Warehouse C - Shelf 2',

    status: 'in_use',

    customerName: 'John Doe',

    createdAt: '2023-12-20T09:15:00Z',

    updatedAt: '2024-01-05T16:45:00Z',

    addedDate: '2023-12-20',

    updatedDate: '2024-01-05',

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

