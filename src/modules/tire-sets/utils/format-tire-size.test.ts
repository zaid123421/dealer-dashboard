import { describe, it, expect } from 'vitest'
import { formatTireSize } from './format-tire-size'

describe('formatTireSize', () => {
  describe('valid tire size formatting', () => {
    it('should format valid tire size: 225/45R17', () => {
      const result = formatTireSize('225', '45', 'R', '17')
      expect(result).toBe('225/45R17')
    })

    it('should format valid tire size: 205/55R16', () => {
      const result = formatTireSize('205', '55', 'R', '16')
      expect(result).toBe('205/55R16')
    })

    it('should format valid tire size: 235/50R18', () => {
      const result = formatTireSize('235', '50', 'R', '18')
      expect(result).toBe('235/50R18')
    })

    it('should format tire size with different construction types', () => {
      const result = formatTireSize('195', '65', 'B', '15')
      expect(result).toBe('195/65B15')
    })

    it('should handle tire sizes with extra whitespace', () => {
      const result = formatTireSize('  225  ', '  45  ', '  R  ', '  17  ')
      expect(result).toBe('225/45R17')
    })
  })

  describe('missing components', () => {
    it('should return partial format when treadWidth is missing', () => {
      const result = formatTireSize('', '45', 'R', '17')
      expect(result).toBe('45R17')
    })

    it('should return partial format when aspectRatio is missing', () => {
      const result = formatTireSize('225', '', 'R', '17')
      expect(result).toBe('225/R17')
    })

    it('should return partial format when construction is missing', () => {
      const result = formatTireSize('225', '45', '', '17')
      expect(result).toBe('225/4517')
    })

    it('should return partial format when diameter is missing', () => {
      const result = formatTireSize('225', '45', 'R', '')
      expect(result).toBe('225/45R')
    })

    it('should return only treadWidth when other components are missing', () => {
      const result = formatTireSize('225', '', '', '')
      expect(result).toBe('225')
    })

    it('should return only second part when treadWidth is missing', () => {
      const result = formatTireSize('', '45', 'R', '17')
      expect(result).toBe('45R17')
    })
  })

  describe('all components missing', () => {
    it('should return N/A when all components are empty strings', () => {
      const result = formatTireSize('', '', '', '')
      expect(result).toBe('N/A')
    })

    it('should return N/A when all components are null', () => {
      const result = formatTireSize(null, null, null, null)
      expect(result).toBe('N/A')
    })

    it('should return N/A when all components are undefined', () => {
      const result = formatTireSize(undefined, undefined, undefined, undefined)
      expect(result).toBe('N/A')
    })

    it('should return N/A when all components are whitespace only', () => {
      const result = formatTireSize('   ', '   ', '   ', '   ')
      expect(result).toBe('N/A')
    })
  })

  describe('null and undefined handling', () => {
    it('should handle null treadWidth gracefully', () => {
      const result = formatTireSize(null, '45', 'R', '17')
      expect(result).toBe('45R17')
    })

    it('should handle undefined treadWidth gracefully', () => {
      const result = formatTireSize(undefined, '45', 'R', '17')
      expect(result).toBe('45R17')
    })

    it('should handle null aspectRatio gracefully', () => {
      const result = formatTireSize('225', null, 'R', '17')
      expect(result).toBe('225/R17')
    })

    it('should handle undefined aspectRatio gracefully', () => {
      const result = formatTireSize('225', undefined, 'R', '17')
      expect(result).toBe('225/R17')
    })

    it('should handle null construction gracefully', () => {
      const result = formatTireSize('225', '45', null, '17')
      expect(result).toBe('225/4517')
    })

    it('should handle undefined construction gracefully', () => {
      const result = formatTireSize('225', '45', undefined, '17')
      expect(result).toBe('225/4517')
    })

    it('should handle null diameter gracefully', () => {
      const result = formatTireSize('225', '45', 'R', null)
      expect(result).toBe('225/45R')
    })

    it('should handle undefined diameter gracefully', () => {
      const result = formatTireSize('225', '45', 'R', undefined)
      expect(result).toBe('225/45R')
    })

    it('should handle mixed null and undefined values', () => {
      const result = formatTireSize(null, '45', undefined, '17')
      expect(result).toBe('4517')
    })
  })

  describe('edge cases', () => {
    it('should handle single digit values', () => {
      const result = formatTireSize('2', '4', 'R', '1')
      expect(result).toBe('2/4R1')
    })

    it('should handle large numeric values', () => {
      const result = formatTireSize('999', '999', 'R', '999')
      expect(result).toBe('999/999R999')
    })

    it('should handle alphanumeric construction types', () => {
      const result = formatTireSize('225', '45', 'ZR', '17')
      expect(result).toBe('225/45ZR17')
    })

    it('should preserve case of construction type', () => {
      const result = formatTireSize('225', '45', 'r', '17')
      expect(result).toBe('225/45r17')
    })

    it('should handle special characters in components', () => {
      const result = formatTireSize('225-', '45+', 'R', '17*')
      expect(result).toBe('225-/45+R17*')
    })
  })
})
