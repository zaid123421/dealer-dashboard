import { z } from 'zod'

// Enum values for tire set and tire data
const SEASON_TYPES = ['SUMMER', 'WINTER', 'ALL_SEASON'] as const
const TIRE_STATUSES = ['GOOD', 'FAIR', 'POOR', 'CRITICAL'] as const
const WHEEL_POSITIONS = ['FL', 'FR', 'RL', 'RR', ''] as const

// ISO 8601 datetime validation
const isoDatetimeSchema = z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, 'Invalid ISO 8601 datetime'))

// Tire size format validation (e.g., "225/45R17")
const tireSizeFormatSchema = z.string().regex(/^\d+\/\d+[A-Z]\d+$/, 'Invalid tire size format. Expected format: treadWidth/aspectRatioConstructionDiameter (e.g., 225/45R17)')

/**
 * Schema for validating individual tire data
 * Validates all required fields and their types
 */
export const TireDetailSchema = z.object({
  id: z.string().min(1, 'Tire ID must be a non-empty string'),
  vehicleId: z.string().min(1, 'Vehicle ID must be a non-empty string'),
  tireSetId: z.string().min(1, 'Tire set ID must be a non-empty string'),
  wheelPosition: z.enum(WHEEL_POSITIONS),
  tireUniqueId: z.string().min(1, 'Tire unique ID must be a non-empty string'),
  tireType: z.string().min(1, 'Tire type must be a non-empty string'),
  treadWidth: z.string().min(1, 'Tread width must be a non-empty string'),
  aspectRatio: z.string().min(1, 'Aspect ratio must be a non-empty string'),
  construction: z.string().min(1, 'Construction must be a non-empty string'),
  diameter: z.string().min(1, 'Diameter must be a non-empty string'),
  composition: z.string().min(1, 'Composition must be a non-empty string'),
  mileage: z.number().nonnegative('Mileage must be a non-negative number'),
  treadCondition: z.string().min(1, 'Tread condition must be a non-empty string'),
  status: z.enum(TIRE_STATUSES),
  brand: z.string().min(1, 'Brand must be a non-empty string'),
  model: z.string().min(1, 'Model must be a non-empty string'),
  size: z.string().min(1, 'Size must be a non-empty string'),
  description: z.string(),
  scanMetadata: z.any().optional(),
  addedDate: isoDatetimeSchema,
  updatedDate: isoDatetimeSchema,
  createdAt: isoDatetimeSchema,
  updatedAt: isoDatetimeSchema,
  version: z.number().nonnegative('Version must be a non-negative integer')
})

export type TireDetail = z.infer<typeof TireDetailSchema>

/**
 * Schema for validating tire set data
 * Validates tire set structure and metadata
 */
export const TireSetDetailSchema = z.object({
  id: z.string().min(1, 'Tire set ID must be a non-empty string'),
  vehicleId: z.string().min(1, 'Vehicle ID must be a non-empty string'),
  tireCount: z.number().int().positive('Tire count must be a positive integer'),
  seasonType: z.enum(SEASON_TYPES),
  brand: z.string().min(1, 'Brand must be a non-empty string'),
  size: tireSizeFormatSchema,
  displayLabel: z.string().min(1, 'Display label must be a non-empty string'),
  createdAt: isoDatetimeSchema
})

export type TireSetDetail = z.infer<typeof TireSetDetailSchema>

/**
 * Schema for validating an array of tire sets
 */
export const TireSetArraySchema = z.array(TireSetDetailSchema)

export type TireSetArray = z.infer<typeof TireSetArraySchema>

/**
 * Schema for validating an array of tires
 */
export const TireArraySchema = z.array(TireDetailSchema)

export type TireArray = z.infer<typeof TireArraySchema>

/**
 * Schema for validating the complete API response containing tire sets and tires
 */
export const TireSetResponseSchema = z.object({
  tireSets: TireSetArraySchema.optional(),
  tires: TireArraySchema.optional()
})

export type TireSetResponse = z.infer<typeof TireSetResponseSchema>
