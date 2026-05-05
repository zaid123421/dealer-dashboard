import axios from 'axios'
import api from '@/lib/api'
import type { TireSetDetail, TireDetail } from '../types'

export class TireSetServiceError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message)
    this.name = 'TireSetServiceError'
  }
}

export class AuthenticationError extends TireSetServiceError {
  constructor(message: string = 'Session expired. Please log in again.') {
    super(message, 401)
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends TireSetServiceError {
  constructor(message: string = 'You do not have permission to access this resource.') {
    super(message, 403)
    this.name = 'AuthorizationError'
  }
}

export class NotFoundError extends TireSetServiceError {
  constructor(message: string = 'The requested resource was not found.') {
    super(message, 404)
    this.name = 'NotFoundError'
  }
}

export class ServerError extends TireSetServiceError {
  constructor(message: string = 'An error occurred while fetching tire details.') {
    super(message)
    this.name = 'ServerError'
  }
}

interface ApiResponse {
  id: number
  vehicleId: number
  tireCount: number
  seasonType: string
  brand: string
  size: string
  displayLabel: string
  createdAt: string
  tires: Array<{
    id: number
    vehicleId: number
    tireSetId: number
    wheelPosition: string | null
    tireUniqueId: string | null
    tireType: string
    treadWidth: string | null
    aspectRatio: string | null
    construction: string | null
    diameter: string | null
    composition: string | null
    mileage: number | null
    treadCondition: string | null
    status: string
    brand: string
    model: string | null
    size: string
    description: string | null
    scanMetadata: Record<string, unknown> | null
    addedDate: string
    updatedDate: string | null
    createdAt: string
    updatedAt: string
    version: number
  }>
}

/**
 * Fetches tire set and tire details from the API
 * @param customerId - The customer ID (number)
 * @param vehicleId - The vehicle ID (number)
 * @param tireSetId - The tire set ID (string)
 * @returns Object containing tire set and tires array
 * @throws AuthenticationError for 401 status
 * @throws AuthorizationError for 403 status
 * @throws NotFoundError for 404 status
 * @throws ServerError for other errors
 */
export async function getTireSetDetailsService(
  customerId: number,
  vehicleId: number,
  tireSetId: string,
): Promise<{ tireSet: TireSetDetail; tires: TireDetail[] }> {
  try {
    const endpoint = `/v1/dealerCustomers/${customerId}/vehicles/${vehicleId}/tire-sets`

    const response = await api.get<ApiResponse[]>(endpoint)

    if (!response.data || !Array.isArray(response.data)) {
      throw new ServerError('Invalid response format from API')
    }

    // Find the tire set matching the requested tireSetId
    const tireSetData = response.data.find((set) => set.id.toString() === tireSetId)

    if (!tireSetData) {
      throw new NotFoundError('Tire set not found')
    }

    // Transform API response to TireSetDetail
    const tireSet: TireSetDetail = {
      id: tireSetData.id,
      vehicleId: tireSetData.vehicleId,
      tireCount: tireSetData.tireCount,
      seasonType: tireSetData.seasonType as 'Summer' | 'Winter' | 'All-Season',
      brand: tireSetData.brand,
      size: tireSetData.size,
      displayLabel: tireSetData.displayLabel,
      createdAt: tireSetData.createdAt,
    }

    // Filter and transform tires belonging to this tire set
    const tires: TireDetail[] = tireSetData.tires
      .filter((tire) => tire.tireSetId === Number(tireSetId))
      .map((tire) => ({
        id: tire.id,
        vehicleId: tire.vehicleId,
        tireSetId: tire.tireSetId,
        wheelPosition: tire.wheelPosition,
        tireUniqueId: tire.tireUniqueId,
        tireType: tire.tireType,
        treadWidth: tire.treadWidth,
        aspectRatio: tire.aspectRatio,
        construction: tire.construction,
        diameter: tire.diameter,
        composition: tire.composition,
        mileage: tire.mileage,
        treadCondition: tire.treadCondition,
        status: (tire.status as 'CREATED' | 'GOOD' | 'FAIR' | 'POOR' | 'CRITICAL') || 'CREATED',
        brand: tire.brand,
        model: tire.model,
        size: tire.size,
        description: tire.description,
        scanMetadata: tire.scanMetadata,
        addedDate: tire.addedDate,
        updatedDate: tire.updatedDate,
        createdAt: tire.createdAt,
        updatedAt: tire.updatedAt,
        version: tire.version,
      }))

    // Validate that at least one tire exists for this set
    if (tires.length === 0) {
      throw new ServerError('No tires found for this tire set')
    }

    return { tireSet, tires }
  } catch (error) {
    // Handle axios errors
    if (axios.isAxiosError(error)) {
      const status = error.response?.status
      const message =
        (error.response?.data as Record<string, unknown>)?.message ||
        error.message ||
        'Request failed'

      if (status === 401) {
        throw new AuthenticationError()
      }
      if (status === 403) {
        throw new AuthorizationError()
      }
      if (status === 404) {
        throw new NotFoundError()
      }
      throw new ServerError(String(message))
    }

    // Re-throw our custom errors
    if (error instanceof TireSetServiceError) {
      throw error
    }

    // Handle unknown errors
    throw new ServerError('An unexpected error occurred')
  }
}
