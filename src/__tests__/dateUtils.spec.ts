import { describe, it, expect } from 'vitest'
import { formatTimeRange, formatDate } from '@/utils/date'

describe('date utils - new functions', () => {
  describe('formatTimeRange', () => {
    it('should format time range in French', () => {
      const start = new Date('2026-03-25T14:30:00')
      const end = new Date('2026-03-25T16:45:00')

      const result = formatTimeRange(start, end, 'fr-FR')

      expect(result).toContain('14:30')
      expect(result).toContain('16:45')
      expect(result).toContain('→')
    })

    it('should format time range in English', () => {
      const start = new Date('2026-03-25T14:30:00')
      const end = new Date('2026-03-25T16:45:00')

      const result = formatTimeRange(start, end, 'en-US')

      expect(result).toContain('→')
      // English format might be 2:30 PM or 14:30 depending on locale
      expect(result).toBeTruthy()
    })

    it('should handle string dates', () => {
      const result = formatTimeRange('2026-03-25T14:30:00', '2026-03-25T16:45:00', 'fr-FR')

      expect(result).toContain('14:30')
      expect(result).toContain('16:45')
    })

    it('should handle midnight times', () => {
      const result = formatTimeRange('2026-03-25T00:00:00', '2026-03-25T23:59:00', 'fr-FR')

      expect(result).toContain('00:00')
      expect(result).toContain('23:59')
    })
  })

  describe('formatDate', () => {
    it('should format date in French', () => {
      const date = new Date('2026-03-25')

      const result = formatDate(date, 'fr-FR')

      expect(result).toContain('2026')
      expect(result).toContain('mars')
      expect(result).toContain('25')
    })

    it('should format date in English', () => {
      const date = new Date('2026-03-25')

      const result = formatDate(date, 'en-US')

      expect(result).toContain('2026')
      expect(result).toContain('March')
      expect(result).toContain('25')
    })

    it('should handle string dates', () => {
      const result = formatDate('2026-03-25T14:30:00', 'fr-FR')

      expect(result).toContain('2026')
      expect(result).toContain('mars')
    })

    it('should format date object', () => {
      const date = new Date('2026-12-31')

      const result = formatDate(date, 'fr-FR')

      expect(result).toContain('2026')
      expect(result).toContain('décembre')
      expect(result).toContain('31')
    })
  })
})

