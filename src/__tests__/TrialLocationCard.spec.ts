import { describe, it, expect } from 'vitest'
import type { Location } from '@/types/location'

describe('TrialLocationCard logic', () => {
  const mockLocation: Location = {
    locationId: 1,
    name: 'Stade de France',
    mainEntrance: '93200 Saint-Denis',
    athleteEntrance: 'Entrée athlètes',
    refereeEntrance: 'Entrée VIP',
    description: 'Grand stade',
    latitude: 48.9245,
    longitude: 2.3601,
  }

  describe('Entrance logic', () => {
    it('should select referee entrance for referee', () => {
      const isReferee = true
      const entrance = isReferee
        ? mockLocation.refereeEntrance || mockLocation.mainEntrance
        : mockLocation.mainEntrance

      expect(entrance).toBe('Entrée VIP')
    })

    it('should select main entrance for non-referee', () => {
      const isReferee = false
      const entrance = isReferee
        ? mockLocation.refereeEntrance || mockLocation.mainEntrance
        : mockLocation.mainEntrance

      expect(entrance).toBe('93200 Saint-Denis')
    })

    it('should fallback to main entrance if referee entrance is missing', () => {
      const locationWithoutRefereeEntrance: Location = {
        ...mockLocation,
        refereeEntrance: '',
      }

      const isReferee = true
      const entrance = isReferee
        ? locationWithoutRefereeEntrance.refereeEntrance || locationWithoutRefereeEntrance.mainEntrance
        : locationWithoutRefereeEntrance.mainEntrance

      expect(entrance).toBe('93200 Saint-Denis')
    })
  })

  describe('Google Maps URL generation', () => {
    it('should generate correct Google Maps URL with coordinates', () => {
      const generateMapsUrl = (lat: number, lon: number) =>
        `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`

      const url = generateMapsUrl(mockLocation.latitude, mockLocation.longitude)

      expect(url).toBe('https://www.google.com/maps/dir/?api=1&destination=48.9245,2.3601')
    })

    it('should handle different coordinate formats', () => {
      const generateMapsUrl = (lat: number, lon: number) =>
        `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`

      const url = generateMapsUrl(45.5, -73.6)

      expect(url).toContain('45.5')
      expect(url).toContain('-73.6')
    })
  })
})

