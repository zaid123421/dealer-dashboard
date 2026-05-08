import { TireSetDetail, TireDetail } from './types'

describe('Tire Set Types', () => {
  describe('TireSetDetail', () => {
    it('should have all required properties', () => {
      const tireSet: TireSetDetail = {
        id: 1,
        vehicleId: 1,
        tireCount: 4,
        seasonType: 'Summer',
        brand: 'Michelin',
        size: '225/45R17',
        displayLabel: 'Summer Tires',
        createdAt: '2024-01-01T00:00:00Z',
      }

      expect(tireSet.id).toBe(1)
      expect(tireSet.vehicleId).toBe(1)
      expect(tireSet.tireCount).toBe(4)
      expect(tireSet.seasonType).toBe('Summer')
      expect(tireSet.brand).toBe('Michelin')
      expect(tireSet.size).toBe('225/45R17')
      expect(tireSet.displayLabel).toBe('Summer Tires')
      expect(tireSet.createdAt).toBe('2024-01-01T00:00:00Z')
    })

    it('should support all season types', () => {
      const seasonTypes: Array<TireSetDetail['seasonType']> = ['Summer', 'Winter', 'All-Season']

      seasonTypes.forEach((seasonType) => {
        const tireSet: TireSetDetail = {
          id: 1,
          vehicleId: 1,
          tireCount: 4,
          seasonType,
          brand: 'Michelin',
          size: '225/45R17',
          displayLabel: 'Tires',
          createdAt: '2024-01-01T00:00:00Z',
        }

        expect(tireSet.seasonType).toBe(seasonType)
      })
    })
  })

  describe('TireDetail', () => {
    it('should have all required properties', () => {
      const tire: TireDetail = {
        id: 1,
        vehicleId: 1,
        tireSetId: 1,
        wheelPosition: 'FL',
        tireUniqueId: 'unique-1',
        tireType: 'Summer',
        treadWidth: '225',
        aspectRatio: '45',
        construction: 'R',
        diameter: '17',
        composition: 'Rubber',
        mileage: 1000,
        treadCondition: '80%',
        status: 'GOOD',
        brand: 'Michelin',
        model: 'Pilot Sport',
        size: '225/45R17',
        description: 'High performance tire',
        scanMetadata: {},
        addedDate: '2024-01-01T00:00:00Z',
        updatedDate: '2024-01-01T00:00:00Z',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        version: 1,
      }

      expect(tire.id).toBe(1)
      expect(tire.vehicleId).toBe(1)
      expect(tire.tireSetId).toBe(1)
      expect(tire.wheelPosition).toBe('FL')
      expect(tire.status).toBe('GOOD')
      expect(tire.mileage).toBe(1000)
    })

    it('should support status as free-form API string', () => {
      const statuses: TireDetail['status'][] = ['GOOD', 'FAIR', 'POOR', 'CRITICAL', 'STORED', 'SHIPPED']

      statuses.forEach((status) => {
        const tire: TireDetail = {
          id: 1,
          vehicleId: 1,
          tireSetId: 1,
          wheelPosition: 'FL',
          tireUniqueId: 'unique-1',
          tireType: 'Summer',
          treadWidth: '225',
          aspectRatio: '45',
          construction: 'R',
          diameter: '17',
          composition: 'Rubber',
          mileage: 1000,
          treadCondition: '80%',
          status,
          brand: 'Michelin',
          model: 'Pilot Sport',
          size: '225/45R17',
          description: 'High performance tire',
          scanMetadata: {},
          addedDate: '2024-01-01T00:00:00Z',
          updatedDate: '2024-01-01T00:00:00Z',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          version: 1,
        }

        expect(tire.status).toBe(status)
      })
    })
  })
})
