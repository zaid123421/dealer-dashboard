'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getTireSetDetailsService, AuthenticationError, AuthorizationError, NotFoundError } from '../services/tire-set.service'
import type { TireSetDetail, TireDetail } from '../types'

interface UseTireSetDetailsReturn {
  tireSet: TireSetDetail | null
  tires: TireDetail[]
  isLoading: boolean
  error: Error | null
}

/**
 * Hook to fetch tire set and tire details
 * Handles loading, error, and success states
 * Manages authentication errors and redirects to login
 * Implements error handling for 401, 403, 404, and network errors
 *
 * @param customerId - The customer ID (can be undefined)
 * @param vehicleId - The vehicle ID (can be undefined)
 * @param tireSetId - The tire set ID (can be undefined)
 * @returns Object with tireSet, tires, isLoading, and error
 */
export function useTireSetDetails(
  customerId: string | undefined,
  vehicleId: string | undefined,
  tireSetId: string | undefined,
): UseTireSetDetailsReturn {
  const router = useRouter()
  const [tireSet, setTireSet] = useState<TireSetDetail | null>(null)
  const [tires, setTires] = useState<TireDetail[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    // Don't fetch if parameters are undefined
    if (!customerId || !vehicleId || !tireSetId) {
      setTireSet(null)
      setTires([])
      setError(null)
      return
    }

    const fetchData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const customIdNum = parseInt(customerId, 10)
        const vehicleIdNum = parseInt(vehicleId, 10)

        if (isNaN(customIdNum) || isNaN(vehicleIdNum)) {
          throw new Error('Invalid customer ID or vehicle ID')
        }

        const result = await getTireSetDetailsService(customIdNum, vehicleIdNum, tireSetId)
        setTireSet(result.tireSet)
        setTires(result.tires)
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error occurred')

        // Handle authentication error - redirect to login
        if (error instanceof AuthenticationError) {
          setError(error)
          router.push('/login')
          return
        }

        // Handle authorization error
        if (error instanceof AuthorizationError) {
          setError(new Error('Access denied'))
          return
        }

        // Handle not found error
        if (error instanceof NotFoundError) {
          setError(new Error('Tire set not found'))
          return
        }

        // Handle network errors
        if (error.message.includes('Network') || error.message.includes('ECONNREFUSED')) {
          setError(new Error('Connection error'))
          return
        }

        // Handle other errors
        setError(error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [customerId, vehicleId, tireSetId, router])

  return {
    tireSet,
    tires,
    isLoading,
    error,
  }
}
