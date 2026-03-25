import { describe, it, expect } from 'vitest'

describe('Helper functions', () => {
  describe('Sport normalization', () => {
    it('should normalize sport names to uppercase', () => {
      const normalize = (text: string) => text.toUpperCase().replace(/\s+/g, '_')

      expect(normalize('cycling')).toBe('CYCLING')
      expect(normalize('Cycling')).toBe('CYCLING')
      expect(normalize('Ice Hockey')).toBe('ICE_HOCKEY')
    })
  })
})

