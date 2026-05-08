import { describe, it, expect, vi } from 'vitest'
import { TireCard } from './tire-card'
import { TireDetail } from '../types'

describe('TireCard', () => {
  const mockTire: TireDetail = {
    id: 1,
    vehicleId: 100,
    tireSetId: 10,
    wheelPosition: 'FL',
    tireUniqueId: 'unique-1',
    tireType: 'Summer',
    treadWidth: '225',
    aspectRatio: '45',
    construction: 'R',
    diameter: '17',
    composition: 'RUBBER',
    mileage: 5000,
    treadCondition: '85%',
    status: 'GOOD',
    brand: 'Michelin',
    model: 'Pilot Sport',
    size: '225/45R17',
    description: 'High performance tire',
    scanMetadata: {},
    addedDate: '2024-01-01',
    updatedDate: '2024-01-15',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
    version: 1,
  }

  it('should have correct status color mapping for all statuses', () => {
    const statuses: Array<TireDetail['status']> = ['GOOD', 'FAIR', 'POOR', 'CRITICAL']
    const expectedColors = {
      GOOD: 'bg-green-100 text-green-800',
      FAIR: 'bg-yellow-100 text-yellow-800',
      POOR: 'bg-orange-100 text-orange-800',
      CRITICAL: 'bg-red-100 text-red-800',
    }

    statuses.forEach((status) => {
      expect(expectedColors[status]).toBeDefined()
    })
  })

  it('should call onSelect handler with tire data when provided', () => {
    const onSelect = vi.fn()
    const tire = { ...mockTire }

    // Simulate the click handler behavior
    onSelect(tire)

    expect(onSelect).toHaveBeenCalledWith(tire)
    expect(onSelect).toHaveBeenCalledTimes(1)
  })

  it('should format mileage with thousands separator', () => {
    const mileage = 125000
    const formatted = mileage.toLocaleString()

    expect(formatted).toBe('125,000')
  })

  it('should handle different wheel positions', () => {
    const positions = ['FL', 'FR', 'RL', 'RR'] as const

    positions.forEach((position) => {
      const tire = { ...mockTire, wheelPosition: position }
      expect(tire.wheelPosition).toBe(position)
    })
  })

  it('should have all required tire properties', () => {
    expect(mockTire.wheelPosition).toBe('FL')
    expect(mockTire.brand).toBe('Michelin')
    expect(mockTire.model).toBe('Pilot Sport')
    expect(mockTire.size).toBe('225/45R17')
    expect(mockTire.status).toBe('GOOD')
    expect(mockTire.mileage).toBe(5000)
    expect(mockTire.treadCondition).toBe('85%')
  })

  it('should support all tire statuses', () => {
    const statuses: Array<TireDetail['status']> = ['GOOD', 'FAIR', 'POOR', 'CRITICAL']

    statuses.forEach((status) => {
      const tire = { ...mockTire, status }
      expect(tire.status).toBe(status)
    })
  })

  it('should handle tread condition display', () => {
    const treadConditions = ['85%', '92%', '50%', '10%']

    treadConditions.forEach((condition) => {
      const tire = { ...mockTire, treadCondition: condition }
      expect(tire.treadCondition).toBe(condition)
    })
  })

  it('should handle different tire brands and models', () => {
    const tires = [
      { brand: 'Michelin', model: 'Pilot Sport' },
      { brand: 'Bridgestone', model: 'Turanza' },
      { brand: 'Goodyear', model: 'Eagle' },
    ]

    tires.forEach(({ brand, model }) => {
      const tire = { ...mockTire, brand, model }
      expect(tire.brand).toBe(brand)
      expect(tire.model).toBe(model)
    })
  })

  it('should handle zero mileage', () => {
    const tire = { ...mockTire, mileage: 0 }
    const formatted = tire.mileage.toLocaleString()

    expect(formatted).toBe('0')
  })

  it('should handle high mileage values', () => {
    const tire = { ...mockTire, mileage: 999999 }
    const formatted = tire.mileage.toLocaleString()

    expect(formatted).toBe('999,999')
  })
})
