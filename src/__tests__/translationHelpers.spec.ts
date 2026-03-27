import { describe, it, expect } from 'vitest'

describe('Translation helpers', () => {
  it('should normalize text to uppercase with underscores', () => {
    const normalize = (text: string) => text.toUpperCase().replace(/\s+/g, '_')

    expect(normalize('Ice Hockey')).toBe('ICE_HOCKEY')
  })
})

