import { describe, it, expect } from 'vitest'
import {
  TireDetailSchema,
  TireSetDetailSchema,
  TireArraySchema,
  TireSetArraySchema,
  TireSetResponseSchema
} from './tire-set.schema'

describe('TireSetDetailSchema', () => {
  const validTireSet = {
    id: 'tire-set-1',
    vehicleId: 'vehicle-1',
    tireCount: 4,
    seasonType: 'SUMMER' as const,
    brand: 'Michelin',
    size: '225/45R17',
    displayLabel: 'Summer Tires 2024',
    createdAt: '2024-01-15T10:30:00Z'
  }

  it('should validate a valid tire set', () => {
    const result = TireSetDetailSchema.safeParse(validTireSet)
    expect(result.success).toBe(true)
  })

  it('should reject tire set with empty id', () => {
    const result = TireSetDetailSchema.safeParse({
      ...validTireSet,
      id: ''
    })
    expect(result.success).toBe(false)
  })

  it('should reject tire set with empty vehicleId', () => {
    const result = TireSetDetailSchema.safeParse({
      ...validTireSet,
      vehicleId: ''
    })
    expect(result.success).toBe(false)
  })

  it('should reject tire set with invalid tire count (zero)', () => {
    const result = TireSetDetailSchema.safeParse({
      ...validTireSet,
      tireCount: 0
    })
    expect(result.success).toBe(false)
  })

  it('should reject tire set with negative tire count', () => {
    const result = TireSetDetailSchema.safeParse({
      ...validTireSet,
      tireCount: -1
    })
    expect(result.success).toBe(false)
  })

  it('should reject tire set with invalid season type', () => {
    const result = TireSetDetailSchema.safeParse({
      ...validTireSet,
      seasonType: 'INVALID_SEASON'
    })
    expect(result.success).toBe(false)
  })

  it('should accept all valid season types', () => {
    const seasonTypes = ['SUMMER', 'WINTER', 'ALL_SEASON'] as const
    seasonTypes.forEach(season => {
      const result = TireSetDetailSchema.safeParse({
        ...validTireSet,
        seasonType: season
      })
      expect(result.success).toBe(true)
    })
  })

  it('should reject tire set with invalid tire size format', () => {
    const result = TireSetDetailSchema.safeParse({
      ...validTireSet,
      size: 'invalid-size'
    })
    expect(result.success).toBe(false)
  })

  it('should accept valid tire size formats', () => {
    const validSizes = ['225/45R17', '205/55R16', '235/50R18']
    validSizes.forEach(size => {
      const result = TireSetDetailSchema.safeParse({
        ...validTireSet,
        size
      })
      expect(result.success).toBe(true)
    })
  })

  it('should reject tire set with empty brand', () => {
    const result = TireSetDetailSchema.safeParse({
      ...validTireSet,
      brand: ''
    })
    expect(result.success).toBe(false)
  })

  it('should reject tire set with empty displayLabel', () => {
    const result = TireSetDetailSchema.safeParse({
      ...validTireSet,
      displayLabel: ''
    })
    expect(result.success).toBe(false)
  })

  it('should reject tire set with invalid ISO 8601 datetime', () => {
    const result = TireSetDetailSchema.safeParse({
      ...validTireSet,
      createdAt: 'not-a-date'
    })
    expect(result.success).toBe(false)
  })

  it('should accept valid ISO 8601 datetime formats', () => {
    const validDates = [
      '2024-01-15T10:30:00Z',
      '2024-01-15T10:30:00+00:00',
      '2024-01-15T10:30:00-05:00'
    ]
    validDates.forEach(date => {
      const result = TireSetDetailSchema.safeParse({
        ...validTireSet,
        createdAt: date
      })
      expect(result.success).toBe(true)
    })
  })
})

describe('TireDetailSchema', () => {
  const validTire = {
    id: 'tire-1',
    vehicleId: 'vehicle-1',
    tireSetId: 'tire-set-1',
    wheelPosition: 'FL' as const,
    tireUniqueId: 'unique-1',
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
    description: 'High performance tire',
    addedDate: '2024-01-15T10:30:00Z',
    updatedDate: '2024-01-15T10:30:00Z',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    version: 1
  }

  it('should validate a valid tire', () => {
    const result = TireDetailSchema.safeParse(validTire)
    expect(result.success).toBe(true)
  })

  it('should reject tire with empty id', () => {
    const result = TireDetailSchema.safeParse({
      ...validTire,
      id: ''
    })
    expect(result.success).toBe(false)
  })

  it('should reject tire with invalid wheel position', () => {
    const result = TireDetailSchema.safeParse({
      ...validTire,
      wheelPosition: 'INVALID'
    })
    expect(result.success).toBe(false)
  })

  it('should accept all valid wheel positions', () => {
    const positions = ['FL', 'FR', 'RL', 'RR', '']
    positions.forEach(position => {
      const result = TireDetailSchema.safeParse({
        ...validTire,
        wheelPosition: position
      })
      expect(result.success).toBe(true)
    })
  })

  it('should reject tire with negative mileage', () => {
    const result = TireDetailSchema.safeParse({
      ...validTire,
      mileage: -100
    })
    expect(result.success).toBe(false)
  })

  it('should accept zero mileage', () => {
    const result = TireDetailSchema.safeParse({
      ...validTire,
      mileage: 0
    })
    expect(result.success).toBe(true)
  })

  it('should reject tire with invalid status', () => {
    const result = TireDetailSchema.safeParse({
      ...validTire,
      status: 'UNKNOWN'
    })
    expect(result.success).toBe(false)
  })

  it('should accept all valid tire statuses', () => {
    const statuses = ['GOOD', 'FAIR', 'POOR', 'CRITICAL'] as const
    statuses.forEach(status => {
      const result = TireDetailSchema.safeParse({
        ...validTire,
        status
      })
      expect(result.success).toBe(true)
    })
  })

  it('should accept tread condition as percentage', () => {
    const result = TireDetailSchema.safeParse({
      ...validTire,
      treadCondition: '75%'
    })
    expect(result.success).toBe(true)
  })

  it('should accept tread condition as number', () => {
    const result = TireDetailSchema.safeParse({
      ...validTire,
      treadCondition: '75'
    })
    expect(result.success).toBe(true)
  })

  it('should accept tread condition as descriptive string', () => {
    const result = TireDetailSchema.safeParse({
      ...validTire,
      treadCondition: 'Good condition'
    })
    expect(result.success).toBe(true)
  })

  it('should reject tire with negative version', () => {
    const result = TireDetailSchema.safeParse({
      ...validTire,
      version: -1
    })
    expect(result.success).toBe(false)
  })

  it('should accept zero version', () => {
    const result = TireDetailSchema.safeParse({
      ...validTire,
      version: 0
    })
    expect(result.success).toBe(true)
  })

  it('should reject tire with invalid date format', () => {
    const result = TireDetailSchema.safeParse({
      ...validTire,
      createdAt: 'invalid-date'
    })
    expect(result.success).toBe(false)
  })

  it('should reject tire with empty brand', () => {
    const result = TireDetailSchema.safeParse({
      ...validTire,
      brand: ''
    })
    expect(result.success).toBe(false)
  })

  it('should reject tire with empty model', () => {
    const result = TireDetailSchema.safeParse({
      ...validTire,
      model: ''
    })
    expect(result.success).toBe(false)
  })

  it('should allow optional scanMetadata', () => {
    const result = TireDetailSchema.safeParse({
      ...validTire,
      scanMetadata: undefined
    })
    expect(result.success).toBe(true)
  })

  it('should accept scanMetadata as object', () => {
    const result = TireDetailSchema.safeParse({
      ...validTire,
      scanMetadata: { key: 'value', nested: { data: 123 } }
    })
    expect(result.success).toBe(true)
  })
})

describe('TireArraySchema', () => {
  const validTire = {
    id: 'tire-1',
    vehicleId: 'vehicle-1',
    tireSetId: 'tire-set-1',
    wheelPosition: 'FL' as const,
    tireUniqueId: 'unique-1',
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
    description: 'High performance tire',
    addedDate: '2024-01-15T10:30:00Z',
    updatedDate: '2024-01-15T10:30:00Z',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    version: 1
  }

  it('should validate an array of valid tires', () => {
    const tires = [validTire, { ...validTire, id: 'tire-2', wheelPosition: 'FR' as const }]
    const result = TireArraySchema.safeParse(tires)
    expect(result.success).toBe(true)
  })

  it('should validate an empty array', () => {
    const result = TireArraySchema.safeParse([])
    expect(result.success).toBe(true)
  })

  it('should reject array with invalid tire', () => {
    const tires = [validTire, { ...validTire, id: '', wheelPosition: 'FR' as const }]
    const result = TireArraySchema.safeParse(tires)
    expect(result.success).toBe(false)
  })
})

describe('TireSetArraySchema', () => {
  const validTireSet = {
    id: 'tire-set-1',
    vehicleId: 'vehicle-1',
    tireCount: 4,
    seasonType: 'SUMMER' as const,
    brand: 'Michelin',
    size: '225/45R17',
    displayLabel: 'Summer Tires 2024',
    createdAt: '2024-01-15T10:30:00Z'
  }

  it('should validate an array of valid tire sets', () => {
    const tireSets = [validTireSet, { ...validTireSet, id: 'tire-set-2' }]
    const result = TireSetArraySchema.safeParse(tireSets)
    expect(result.success).toBe(true)
  })

  it('should validate an empty array', () => {
    const result = TireSetArraySchema.safeParse([])
    expect(result.success).toBe(true)
  })

  it('should reject array with invalid tire set', () => {
    const tireSets = [validTireSet, { ...validTireSet, id: '', tireCount: 0 }]
    const result = TireSetArraySchema.safeParse(tireSets)
    expect(result.success).toBe(false)
  })
})

describe('TireSetResponseSchema', () => {
  const validTireSet = {
    id: 'tire-set-1',
    vehicleId: 'vehicle-1',
    tireCount: 4,
    seasonType: 'SUMMER' as const,
    brand: 'Michelin',
    size: '225/45R17',
    displayLabel: 'Summer Tires 2024',
    createdAt: '2024-01-15T10:30:00Z'
  }

  const validTire = {
    id: 'tire-1',
    vehicleId: 'vehicle-1',
    tireSetId: 'tire-set-1',
    wheelPosition: 'FL' as const,
    tireUniqueId: 'unique-1',
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
    description: 'High performance tire',
    addedDate: '2024-01-15T10:30:00Z',
    updatedDate: '2024-01-15T10:30:00Z',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    version: 1
  }

  it('should validate response with both tireSets and tires', () => {
    const response = {
      tireSets: [validTireSet],
      tires: [validTire]
    }
    const result = TireSetResponseSchema.safeParse(response)
    expect(result.success).toBe(true)
  })

  it('should validate response with only tireSets', () => {
    const response = {
      tireSets: [validTireSet]
    }
    const result = TireSetResponseSchema.safeParse(response)
    expect(result.success).toBe(true)
  })

  it('should validate response with only tires', () => {
    const response = {
      tires: [validTire]
    }
    const result = TireSetResponseSchema.safeParse(response)
    expect(result.success).toBe(true)
  })

  it('should validate empty response', () => {
    const response = {}
    const result = TireSetResponseSchema.safeParse(response)
    expect(result.success).toBe(true)
  })

  it('should reject response with invalid tire set', () => {
    const response = {
      tireSets: [{ ...validTireSet, id: '' }]
    }
    const result = TireSetResponseSchema.safeParse(response)
    expect(result.success).toBe(false)
  })

  it('should reject response with invalid tire', () => {
    const response = {
      tires: [{ ...validTire, id: '' }]
    }
    const result = TireSetResponseSchema.safeParse(response)
    expect(result.success).toBe(false)
  })
})
