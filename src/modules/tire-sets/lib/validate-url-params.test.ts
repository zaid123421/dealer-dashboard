import { validateUrlParams } from './validate-url-params'

describe('validateUrlParams', () => {
  describe('valid parameters', () => {
    it('should pass validation with valid customerId, vehicleId, and tireSetId', () => {
      const result = validateUrlParams('123', '456', '789')
      expect(result.isValid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should pass validation with UUID-like strings', () => {
      const result = validateUrlParams(
        'a844ea5d-291e-41ce-ab19-aa372b34f668',
        'b955fb6e-392f-52df-bc2a-bb483c45g779',
        'c066gc7f-4a3g-63eg-cd3b-cc594d56h88a'
      )
      expect(result.isValid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should pass validation with alphanumeric strings', () => {
      const result = validateUrlParams('cust123', 'veh456', 'tire789')
      expect(result.isValid).toBe(true)
      expect(result.error).toBeUndefined()
    })
  })

  describe('invalid customerId', () => {
    it('should fail validation with undefined customerId', () => {
      const result = validateUrlParams(undefined, '456', '789')
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Invalid or missing customer ID')
    })

    it('should fail validation with null customerId', () => {
      const result = validateUrlParams(null, '456', '789')
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Invalid or missing customer ID')
    })

    it('should fail validation with empty string customerId', () => {
      const result = validateUrlParams('', '456', '789')
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Invalid or missing customer ID')
    })

    it('should fail validation with whitespace-only customerId', () => {
      const result = validateUrlParams('   ', '456', '789')
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Invalid or missing customer ID')
    })

    it('should fail validation with non-string customerId', () => {
      const result = validateUrlParams(123, '456', '789')
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Invalid or missing customer ID')
    })
  })

  describe('invalid vehicleId', () => {
    it('should fail validation with undefined vehicleId', () => {
      const result = validateUrlParams('123', undefined, '789')
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Invalid or missing vehicle ID')
    })

    it('should fail validation with null vehicleId', () => {
      const result = validateUrlParams('123', null, '789')
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Invalid or missing vehicle ID')
    })

    it('should fail validation with empty string vehicleId', () => {
      const result = validateUrlParams('123', '', '789')
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Invalid or missing vehicle ID')
    })

    it('should fail validation with whitespace-only vehicleId', () => {
      const result = validateUrlParams('123', '   ', '789')
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Invalid or missing vehicle ID')
    })

    it('should fail validation with non-string vehicleId', () => {
      const result = validateUrlParams('123', 456, '789')
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Invalid or missing vehicle ID')
    })
  })

  describe('invalid tireSetId', () => {
    it('should fail validation with undefined tireSetId', () => {
      const result = validateUrlParams('123', '456', undefined)
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Invalid or missing tire set ID')
    })

    it('should fail validation with null tireSetId', () => {
      const result = validateUrlParams('123', '456', null)
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Invalid or missing tire set ID')
    })

    it('should fail validation with empty string tireSetId', () => {
      const result = validateUrlParams('123', '456', '')
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Invalid or missing tire set ID')
    })

    it('should fail validation with whitespace-only tireSetId', () => {
      const result = validateUrlParams('123', '456', '   ')
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Invalid or missing tire set ID')
    })

    it('should fail validation with non-string tireSetId', () => {
      const result = validateUrlParams('123', '456', 789)
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Invalid or missing tire set ID')
    })
  })

  describe('multiple invalid parameters', () => {
    it('should fail validation with all parameters undefined', () => {
      const result = validateUrlParams(undefined, undefined, undefined)
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Invalid or missing customer ID')
    })

    it('should fail validation with all parameters empty strings', () => {
      const result = validateUrlParams('', '', '')
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Invalid or missing customer ID')
    })

    it('should fail validation with customerId and vehicleId invalid', () => {
      const result = validateUrlParams('', '', '789')
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Invalid or missing customer ID')
    })

    it('should fail validation with vehicleId and tireSetId invalid', () => {
      const result = validateUrlParams('123', '', '')
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Invalid or missing vehicle ID')
    })
  })
})
