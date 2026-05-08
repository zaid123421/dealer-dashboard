'use client'

import { useEffect, useState, useCallback } from 'react'
import type { TireSetDetail } from '../types'
import {
  listVehicleTireSetsService,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ServerError,
} from '../services/tire-set.service'

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
 * مجموعات الإطارات لمركبة من GET /dealerCustomers/:id/vehicles/:id/tire-sets
 */
export function useVehicleTireSets({
  customerId,
  vehicleId,
}: UseVehicleTireSetsParams): UseVehicleTireSetsResult {
  const [tireSets, setTireSets] = useState<TireSetDetail[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchTireSets = useCallback(async () => {
    if (!customerId || !vehicleId) {
      setTireSets([])
      setIsLoading(false)
      setIsError(false)
      setError(null)
      return
    }

    const customIdNum = Number.parseInt(customerId, 10)
    const vehicleIdNum = Number.parseInt(vehicleId, 10)
    if (Number.isNaN(customIdNum) || Number.isNaN(vehicleIdNum)) {
      setIsError(true)
      setError(new Error('Invalid customer ID or vehicle ID'))
      setTireSets([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setIsError(false)
    setError(null)

    try {
      const data = await listVehicleTireSetsService(customIdNum, vehicleIdNum)
      setTireSets(data)
    } catch (err) {
      const normalized = err instanceof Error ? err : new Error('Unknown error')
      if (
        normalized instanceof AuthenticationError ||
        normalized instanceof AuthorizationError ||
        normalized instanceof NotFoundError ||
        normalized instanceof ServerError
      ) {
        setError(normalized)
      } else {
        setError(normalized)
      }
      setIsError(true)
      setTireSets([])
    } finally {
      setIsLoading(false)
    }
  }, [customerId, vehicleId])

  useEffect(() => {
    void fetchTireSets()
  }, [fetchTireSets])

  return {
    tireSets,
    isLoading,
    isError,
    error,
    refetch: () => void fetchTireSets(),
  }
}
