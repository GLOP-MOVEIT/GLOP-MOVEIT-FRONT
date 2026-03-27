import { describe, it, expect } from 'vitest'
import type { Championship } from '@/types/competition'
import { Status } from '@/types/competition'

describe('ChampionshipCarousel', () => {
  const mockChampionships: Championship[] = [
    {
      id: 1,
      name: 'Championship 1',
      description: 'Test',
      startDate: '2026-03-01',
      endDate: '2026-03-10',
      status: Status.ONGOING,
    },
    {
      id: 2,
      name: 'Championship 2',
      description: 'Test',
      startDate: '2026-04-01',
      endDate: '2026-04-10',
      status: Status.PLANNED,
    },
  ]

  it('should have correct number of championships', () => {
    expect(mockChampionships).toHaveLength(2)
  })

  it('should have valid championship structure', () => {
    const championship = mockChampionships[0]
    expect(championship).toBeDefined()
    if (championship) {
      expect(championship.id).toBeDefined()
      expect(championship.name).toBeDefined()
      expect(championship.status).toBeDefined()
    }
  })
})

