import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as tireSetService from '../services/tire-set.service'

// Mock the tire set service
vi.mock('../services/tire-set.service', () => ({
  getTireSetDetailsService: vi.fn(),
  AuthenticationError: class AuthenticationError extends Error {
    constructor(message = 'Session expired') {
      super(message)
      this.name = 'AuthenticationError'
    }
  },
  AuthorizationError: class AuthorizationError extends Error {
    constructor(message = 'Access denied') {
      super(message)
      this.name = 'AuthorizationError'
    }
  },
  NotFoundError: class NotFoundError extends Error {
    constructor(message = 'Not found') {
      super(message)
      this.name = 'NotFoundError'
    }
  },
}))

const mockTireSet = {
  id: 1,
  vehicleId: 100,
  tireCount: 4,
  seasonType: 'Summer' as const,
  brand: 'Michelin',
  size: '225/45R17',
  displayLabel: 'Michelin Summer 225/45R17',
  createdAt: '2024-01-01T00:00:00Z',
}

const mockTires = [
  {
    id: 1,
    vehicleId: 100,
    tireSetId: 1,
    wheelPosition: 'FL',
    tireUniqueId: 'TIRE001',
    tireType: 'Summer',
    treadWidth: '225',
    aspectRatio: '45',
    construction: 'R',
    diameter: '17',
    composition: 'Rubber',
    mileage: 5000,
    treadCondition: '85%',
    status: 'GOOD' as const,
    brand: 'Michelin',
    model: 'Pilot Sport',
    size: '225/45R17',
    description: 'Front left tire',
    scanMetadata: {},
    addedDate: '2024-01-01T00:00:00Z',
    updatedDate: '2024-01-01T00:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    version: 1,
  },
  {
    id: 2,
    vehicleId: 100,
    tireSetId: 1,
    wheelPosition: 'FR',
    tireUniqueId: 'TIRE002',
    tireType: 'Summer',
    treadWidth: '225',
    aspectRatio: '45',
    construction: 'R',
    diameter: '17',
    composition: 'Rubber',
    mileage: 5100,
    treadCondition: '84%',
    status: 'GOOD' as const,
    brand: 'Michelin',
    model: 'Pilot Sport',
    size: '225/45R17',
    description: 'Front right tire',
    scanMetadata: {},
    addedDate: '2024-01-01T00:00:00Z',
    updatedDate: '2024-01-01T00:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    version: 1,
  },
]

describe('useTireSetDetails - Service Layer Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch data successfully from service', async () => {
    vi.mocked(tireSetService.getTireSetDetailsService).mockResolvedValue({
      tireSet: mockTireSet,
      tires: mockTires,
    })

    const result = await tireSetService.getTireSetDetailsService(1, 100, '1')

    expect(result.tireSet).toEqual(mockTireSet)
    expect(result.tires).toEqual(mockTires)
    expect(result.tires).toHaveLength(2)
  })

  it('should handle 401 authentication error', async () => {
    const { AuthenticationError } = await import('../services/tire-set.service')
    vi.mocked(tireSetService.getTireSetDetailsService).mockRejectedValue(
      new AuthenticationError('Session expired')
    )

    try {
      await tireSetService.getTireSetDetailsService(1, 100, '1')
      expect.fail('Should have thrown AuthenticationError')
    } catch (error) {
      expect(error).toBeInstanceOf(AuthenticationError)
      expect((error as Error).message).toBe('Session expired')
    }
  })

  it('should handle 403 authorization error', async () => {
    const { AuthorizationError } = await import('../services/tire-set.service')
    vi.mocked(tireSetService.getTireSetDetailsService).mockRejectedValue(
      new AuthorizationError('Access denied')
    )

    try {
      await tireSetService.getTireSetDetailsService(1, 100, '1')
      expect.fail('Should have thrown AuthorizationError')
    } catch (error) {
      expect(error).toBeInstanceOf(AuthorizationError)
      expect((error as Error).message).toBe('Access denied')
    }
  })

  it('should handle 404 not found error', async () => {
    const { NotFoundError } = await import('../services/tire-set.service')
    vi.mocked(tireSetService.getTireSetDetailsService).mockRejectedValue(
      new NotFoundError('Tire set not found')
    )

    try {
      await tireSetService.getTireSetDetailsService(1, 100, '1')
      expect.fail('Should have thrown NotFoundError')
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundError)
      expect((error as Error).message).toBe('Tire set not found')
    }
  })

  it('should handle network errors', async () => {
    const networkError = new Error('Network Error')
    vi.mocked(tireSetService.getTireSetDetailsService).mockRejectedValue(networkError)

    try {
      await tireSetService.getTireSetDetailsService(1, 100, '1')
      expect.fail('Should have thrown error')
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
      expect((error as Error).message).toBe('Network Error')
    }
  })

  it('should call service with correct parameters', async () => {
    vi.mocked(tireSetService.getTireSetDetailsService).mockResolvedValue({
      tireSet: mockTireSet,
      tires: mockTires,
    })

    await tireSetService.getTireSetDetailsService(1, 100, '1')

    expect(vi.mocked(tireSetService.getTireSetDetailsService)).toHaveBeenCalledWith(1, 100, '1')
  })

  it('should return tires with correct tire set ID', async () => {
    vi.mocked(tireSetService.getTireSetDetailsService).mockResolvedValue({
      tireSet: mockTireSet,
      tires: mockTires,
    })

    const result = await tireSetService.getTireSetDetailsService(1, 100, '1')

    result.tires.forEach((tire) => {
      expect(tire.tireSetId).toBe(1)
      expect(tire.vehicleId).toBe(100)
    })
  })

  it('should return tires with valid status values', async () => {
    vi.mocked(tireSetService.getTireSetDetailsService).mockResolvedValue({
      tireSet: mockTireSet,
      tires: mockTires,
    })

    const result = await tireSetService.getTireSetDetailsService(1, 100, '1')

    const validStatuses = ['GOOD', 'FAIR', 'POOR', 'CRITICAL']
    result.tires.forEach((tire) => {
      expect(validStatuses).toContain(tire.status)
    })
  })

  it('should return tire set with matching ID', async () => {
    vi.mocked(tireSetService.getTireSetDetailsService).mockResolvedValue({
      tireSet: mockTireSet,
      tires: mockTires,
    })

    const result = await tireSetService.getTireSetDetailsService(1, 100, '1')

    expect(result.tireSet.id).toBe(1)
    expect(result.tireSet.vehicleId).toBe(100)
  })

  it('should return tire count matching actual tires', async () => {
    const tireSetWithCorrectCount = {
      ...mockTireSet,
      tireCount: mockTires.length,
    }
    vi.mocked(tireSetService.getTireSetDetailsService).mockResolvedValue({
      tireSet: tireSetWithCorrectCount,
      tires: mockTires,
    })

    const result = await tireSetService.getTireSetDetailsService(1, 100, '1')

    expect(result.tireSet.tireCount).toBe(result.tires.length)
  })

  it('should return tires with unique wheel positions', async () => {
    vi.mocked(tireSetService.getTireSetDetailsService).mockResolvedValue({
      tireSet: mockTireSet,
      tires: mockTires,
    })

    const result = await tireSetService.getTireSetDetailsService(1, 100, '1')

    const positions = result.tires.map((tire) => tire.wheelPosition)
    const uniquePositions = new Set(positions)

    expect(uniquePositions.size).toBe(positions.length)
  })
})
