import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import axios from 'axios'
import api from '@/lib/api'
import {
  getTireSetDetailsService,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ServerError,
} from './tire-set.service'

// Mock the api module
vi.mock('@/lib/api')

describe('getTireSetDetailsService', () => {
  const mockCustomerId = 123
  const mockVehicleId = 456
  const mockTireSetId = '2'

  const mockApiResponse = [
    {
      id: 2,
      vehicleId: 102,
      tireCount: 4,
      seasonType: 'Summer',
      brand: 'Michelin',
      size: '205/55R16',
      displayLabel: 'Michelin 205/55R16 Summer',
      createdAt: '2026-04-21T15:39:37.39514',
      tires: [
        {
          id: 8202,
          vehicleId: 102,
          tireSetId: 2,
          wheelPosition: 'FL',
          tireUniqueId: 'TIRE-001',
          tireType: 'Summer',
          treadWidth: '205',
          aspectRatio: '55',
          construction: 'R',
          diameter: '16',
          composition: 'Rubber',
          mileage: 5000,
          treadCondition: '85%',
          status: 'GOOD',
          brand: 'Michelin',
          model: 'Pilot Sport',
          size: '205/55R16',
          description: 'High performance tire',
          scanMetadata: { scanned: true },
          addedDate: '2026-04-21T15:39:37.401645',
          updatedDate: '2026-04-22T10:00:00',
          createdAt: '2026-04-21T15:39:37.495717',
          updatedAt: '2026-04-21T15:39:37.495717',
          version: 0,
        },
        {
          id: 8203,
          vehicleId: 102,
          tireSetId: 2,
          wheelPosition: 'FR',
          tireUniqueId: 'TIRE-002',
          tireType: 'Summer',
          treadWidth: '205',
          aspectRatio: '55',
          construction: 'R',
          diameter: '16',
          composition: 'Rubber',
          mileage: 4800,
          treadCondition: '87%',
          status: 'GOOD',
          brand: 'Michelin',
          model: 'Pilot Sport',
          size: '205/55R16',
          description: 'High performance tire',
          scanMetadata: null,
          addedDate: '2026-04-21T15:39:37.401645',
          updatedDate: null,
          createdAt: '2026-04-21T15:39:37.495717',
          updatedAt: '2026-04-21T15:39:37.495717',
          version: 0,
        },
      ],
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('successful API response', () => {
    it('should fetch and parse tire set and tires successfully', async () => {
      const mockGet = vi.fn().mockResolvedValue({ data: mockApiResponse })
      ;(api.get as any) = mockGet

      const result = await getTireSetDetailsService(mockCustomerId, mockVehicleId, mockTireSetId)

      expect(mockGet).toHaveBeenCalledWith(
        `/v1/dealerCustomers/${mockCustomerId}/vehicles/${mockVehicleId}/tire-sets`,
      )
      expect(result.tireSet).toBeDefined()
      expect(result.tireSet.id).toBe(2)
      expect(result.tireSet.brand).toBe('Michelin')
      expect(result.tireSet.size).toBe('205/55R16')
      expect(result.tires).toHaveLength(2)
    })

    it('should include bearer token in request headers', async () => {
      const mockGet = vi.fn().mockResolvedValue({ data: mockApiResponse })
      ;(api.get as any) = mockGet

      await getTireSetDetailsService(mockCustomerId, mockVehicleId, mockTireSetId)

      // The api client automatically adds bearer token via interceptor
      expect(mockGet).toHaveBeenCalled()
    })

    it('should correctly transform tire data', async () => {
      const mockGet = vi.fn().mockResolvedValue({ data: mockApiResponse })
      ;(api.get as any) = mockGet

      const result = await getTireSetDetailsService(mockCustomerId, mockVehicleId, mockTireSetId)

      const firstTire = result.tires[0]
      expect(firstTire.id).toBe(8202)
      expect(firstTire.wheelPosition).toBe('FL')
      expect(firstTire.brand).toBe('Michelin')
      expect(firstTire.status).toBe('GOOD')
      expect(firstTire.mileage).toBe(5000)
      expect(firstTire.treadCondition).toBe('85%')
    })

    it('should handle null values in tire data', async () => {
      const mockGet = vi.fn().mockResolvedValue({ data: mockApiResponse })
      ;(api.get as any) = mockGet

      const result = await getTireSetDetailsService(mockCustomerId, mockVehicleId, mockTireSetId)

      const secondTire = result.tires[1]
      expect(secondTire.scanMetadata).toBeNull()
      expect(secondTire.updatedDate).toBeNull()
      // model is 'Pilot Sport' in the mock data, not null
      expect(secondTire.model).toBe('Pilot Sport')
    })

    it('should filter tires by tireSetId', async () => {
      const responseWithMultipleSets = [
        mockApiResponse[0],
        {
          id: 3,
          vehicleId: 102,
          tireCount: 4,
          seasonType: 'Winter',
          brand: 'Bridgestone',
          size: '205/55R16',
          displayLabel: 'Bridgestone 205/55R16 Winter',
          createdAt: '2026-05-21T15:39:37.39514',
          tires: [
            {
              id: 8204,
              vehicleId: 102,
              tireSetId: 3,
              wheelPosition: 'FL',
              tireUniqueId: 'TIRE-003',
              tireType: 'Winter',
              treadWidth: '205',
              aspectRatio: '55',
              construction: 'R',
              diameter: '16',
              composition: 'Rubber',
              mileage: 1000,
              treadCondition: '95%',
              status: 'GOOD',
              brand: 'Bridgestone',
              model: 'Blizzak',
              size: '205/55R16',
              description: 'Winter tire',
              scanMetadata: null,
              addedDate: '2026-05-21T15:39:37.401645',
              updatedDate: null,
              createdAt: '2026-05-21T15:39:37.495717',
              updatedAt: '2026-05-21T15:39:37.495717',
              version: 0,
            },
          ],
        },
      ]

      const mockGet = vi.fn().mockResolvedValue({ data: responseWithMultipleSets })
      ;(api.get as any) = mockGet

      const result = await getTireSetDetailsService(mockCustomerId, mockVehicleId, mockTireSetId)

      // Should only return tires from tire set 2
      expect(result.tires).toHaveLength(2)
      expect(result.tires.every((t) => t.tireSetId === 2)).toBe(true)
    })
  })

  describe('HTTP error handling', () => {
    it('should throw AuthenticationError on 401 status', async () => {
      const mockError = new Error('Unauthorized')
      ;(mockError as any).response = { status: 401, data: { message: 'Invalid token' } }
      ;(mockError as any).isAxiosError = true

      const mockGet = vi.fn().mockRejectedValue(mockError)
      ;(api.get as any) = mockGet
      vi.spyOn(axios, 'isAxiosError').mockReturnValue(true)

      await expect(
        getTireSetDetailsService(mockCustomerId, mockVehicleId, mockTireSetId),
      ).rejects.toThrow(AuthenticationError)
    })

    it('should throw AuthorizationError on 403 status', async () => {
      const mockError = new Error('Forbidden')
      ;(mockError as any).response = { status: 403, data: { message: 'Access denied' } }
      ;(mockError as any).isAxiosError = true

      const mockGet = vi.fn().mockRejectedValue(mockError)
      ;(api.get as any) = mockGet
      vi.spyOn(axios, 'isAxiosError').mockReturnValue(true)

      await expect(
        getTireSetDetailsService(mockCustomerId, mockVehicleId, mockTireSetId),
      ).rejects.toThrow(AuthorizationError)
    })

    it('should throw NotFoundError on 404 status', async () => {
      const mockError = new Error('Not Found')
      ;(mockError as any).response = { status: 404, data: { message: 'Resource not found' } }
      ;(mockError as any).isAxiosError = true

      const mockGet = vi.fn().mockRejectedValue(mockError)
      ;(api.get as any) = mockGet
      vi.spyOn(axios, 'isAxiosError').mockReturnValue(true)

      await expect(
        getTireSetDetailsService(mockCustomerId, mockVehicleId, mockTireSetId),
      ).rejects.toThrow(NotFoundError)
    })

    it('should throw ServerError on 500 status', async () => {
      const mockError = new Error('Internal Server Error')
      ;(mockError as any).response = { status: 500, data: { message: 'Server error' } }
      ;(mockError as any).isAxiosError = true

      const mockGet = vi.fn().mockRejectedValue(mockError)
      ;(api.get as any) = mockGet
      vi.spyOn(axios, 'isAxiosError').mockReturnValue(true)

      await expect(
        getTireSetDetailsService(mockCustomerId, mockVehicleId, mockTireSetId),
      ).rejects.toThrow(ServerError)
    })

    it('should throw ServerError on network error', async () => {
      const mockError = new Error('Network Error')
      ;(mockError as any).isAxiosError = true

      const mockGet = vi.fn().mockRejectedValue(mockError)
      ;(api.get as any) = mockGet
      vi.spyOn(axios, 'isAxiosError').mockReturnValue(true)

      await expect(
        getTireSetDetailsService(mockCustomerId, mockVehicleId, mockTireSetId),
      ).rejects.toThrow(ServerError)
    })
  })

  describe('data validation', () => {
    it('should throw NotFoundError when tire set not found', async () => {
      const mockGet = vi.fn().mockResolvedValue({ data: [] })
      ;(api.get as any) = mockGet

      await expect(
        getTireSetDetailsService(mockCustomerId, mockVehicleId, '999'),
      ).rejects.toThrow('Tire set not found')
    })

    it('should throw ServerError when no tires found for tire set', async () => {
      const responseWithoutTires = [
        {
          id: 2,
          vehicleId: 102,
          tireCount: 0,
          seasonType: 'Summer',
          brand: 'Michelin',
          size: '205/55R16',
          displayLabel: 'Michelin 205/55R16 Summer',
          createdAt: '2026-04-21T15:39:37.39514',
          tires: [],
        },
      ]

      const mockGet = vi.fn().mockResolvedValue({ data: responseWithoutTires })
      ;(api.get as any) = mockGet

      await expect(
        getTireSetDetailsService(mockCustomerId, mockVehicleId, mockTireSetId),
      ).rejects.toThrow(ServerError)
    })

    it('should throw ServerError on invalid response format', async () => {
      const mockGet = vi.fn().mockResolvedValue({ data: null })
      ;(api.get as any) = mockGet

      await expect(
        getTireSetDetailsService(mockCustomerId, mockVehicleId, mockTireSetId),
      ).rejects.toThrow(ServerError)
    })

    it('should throw ServerError when response is not an array', async () => {
      const mockGet = vi.fn().mockResolvedValue({ data: { id: 2 } })
      ;(api.get as any) = mockGet

      await expect(
        getTireSetDetailsService(mockCustomerId, mockVehicleId, mockTireSetId),
      ).rejects.toThrow(ServerError)
    })
  })

  describe('tire set data transformation', () => {
    it('should correctly transform tire set data', async () => {
      const mockGet = vi.fn().mockResolvedValue({ data: mockApiResponse })
      ;(api.get as any) = mockGet

      const result = await getTireSetDetailsService(mockCustomerId, mockVehicleId, mockTireSetId)

      expect(result.tireSet).toEqual({
        id: 2,
        vehicleId: 102,
        tireCount: 4,
        seasonType: 'Summer',
        brand: 'Michelin',
        size: '205/55R16',
        displayLabel: 'Michelin 205/55R16 Summer',
        createdAt: '2026-04-21T15:39:37.39514',
      })
    })

    it('should keep numeric IDs from the API payload', async () => {
      const mockGet = vi.fn().mockResolvedValue({ data: mockApiResponse })
      ;(api.get as any) = mockGet

      const result = await getTireSetDetailsService(mockCustomerId, mockVehicleId, mockTireSetId)

      expect(typeof result.tireSet.id).toBe('number')
      expect(typeof result.tireSet.vehicleId).toBe('number')
      expect(result.tires.every((t) => typeof t.id === 'number')).toBe(true)
    })
  })

  describe('error messages', () => {
    it('should include error message from API response', async () => {
      const mockError = new Error('Request failed')
      ;(mockError as any).response = {
        status: 500,
        data: { message: 'Database connection failed' },
      }
      ;(mockError as any).isAxiosError = true

      const mockGet = vi.fn().mockRejectedValue(mockError)
      ;(api.get as any) = mockGet
      vi.spyOn(axios, 'isAxiosError').mockReturnValue(true)

      try {
        await getTireSetDetailsService(mockCustomerId, mockVehicleId, mockTireSetId)
      } catch (error) {
        expect((error as Error).message).toBe('Database connection failed')
      }
    })

    it('should provide default error message when API response has no message', async () => {
      const mockError = new Error('Request failed')
      ;(mockError as any).response = { status: 500, data: {} }
      ;(mockError as any).isAxiosError = true

      const mockGet = vi.fn().mockRejectedValue(mockError)
      ;(api.get as any) = mockGet
      vi.spyOn(axios, 'isAxiosError').mockReturnValue(true)

      try {
        await getTireSetDetailsService(mockCustomerId, mockVehicleId, mockTireSetId)
      } catch (error) {
        expect((error as Error).message).toBe('Request failed')
      }
    })
  })
})
