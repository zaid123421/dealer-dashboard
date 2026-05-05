export interface TireSetDetail {
  id: number
  vehicleId: number
  tireCount: number
  seasonType: 'Summer' | 'Winter' | 'All-Season'
  brand: string
  size: string
  displayLabel: string
  createdAt: string
  tires?: TireDetail[]
}

export interface TireDetail {
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
  status: 'CREATED' | 'GOOD' | 'FAIR' | 'POOR' | 'CRITICAL'
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
}
