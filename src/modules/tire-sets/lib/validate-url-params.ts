/**
 * Validates URL parameters for the tire details page
 * Ensures customerId, vehicleId, and tireSetId are non-empty strings
 */

export interface ValidationResult {
  isValid: boolean
  error?: string
}

/**
 * Validates URL parameters for tire details page
 * @param customerId - The customer ID from URL
 * @param vehicleId - The vehicle ID from URL
 * @param tireSetId - The tire set ID from URL
 * @returns ValidationResult with isValid flag and optional error message
 */
export function validateUrlParams(
  customerId: unknown,
  vehicleId: unknown,
  tireSetId: unknown
): ValidationResult {
  // Validate customerId
  if (!customerId || typeof customerId !== 'string' || customerId.trim() === '') {
    return {
      isValid: false,
      error: 'Invalid or missing customer ID'
    }
  }

  // Validate vehicleId
  if (!vehicleId || typeof vehicleId !== 'string' || vehicleId.trim() === '') {
    return {
      isValid: false,
      error: 'Invalid or missing vehicle ID'
    }
  }

  // Validate tireSetId
  if (!tireSetId || typeof tireSetId !== 'string' || tireSetId.trim() === '') {
    return {
      isValid: false,
      error: 'Invalid or missing tire set ID'
    }
  }

  return {
    isValid: true
  }
}
