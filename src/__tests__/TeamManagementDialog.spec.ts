import { describe, it, expect } from 'vitest'
import type { Team } from '@/types/team'
import type { User } from '@/types/user'

describe('TeamManagementDialog logic', () => {
  const mockAthletes: User[] = [
    {
      userId: 1,
      firstName: 'John',
      surname: 'Doe',
      email: 'john@test.com',
      phoneNumber: '',
      language: 'fr',
      role: { name: 'ATHLETE' },
      acceptsNotifications: true,
      acceptsLocationSharing: true,
    },
    {
      userId: 2,
      firstName: 'Jane',
      surname: 'Smith',
      email: 'jane@test.com',
      phoneNumber: '',
      language: 'fr',
      role: { name: 'ATHLETE' },
      acceptsNotifications: true,
      acceptsLocationSharing: true,
    },
  ]

  it('should prevent athlete from being in multiple teams', () => {
    const mockAthlete = mockAthletes[0]
    if (!mockAthlete) throw new Error('Mock athlete not found')

    const teams: Team[] = [
      {
        teamId: 1,
        name: 'Team A',
        athletes: [mockAthlete],
      },
      {
        teamId: 2,
        name: 'Team B',
        athletes: [],
      },
    ]

    // Logique de filtrage: récupérer les athlètes déjà dans d'autres équipes
    const team = teams[1]
    if (!team) throw new Error('Team not found')

    const teamAthleteIds = team.athletes.map(a => a.userId)
    const athletesInOtherTeams = new Set<number>()
    teams.forEach(t => {
      if (t.teamId !== team.teamId) {
        t.athletes.forEach(a => athletesInOtherTeams.add(a.userId))
      }
    })

    const availableAthletes = mockAthletes.filter(
      a => !teamAthleteIds.includes(a.userId) && !athletesInOtherTeams.has(a.userId)
    )

    // Team B ne devrait pouvoir accéder qu'à Jane (userId: 2)
    expect(availableAthletes.length).toBe(1)
    const firstAvailable = availableAthletes[0]
    expect(firstAvailable).toBeDefined()
    expect(firstAvailable?.userId).toBe(2)
  })

  it('should allow all athletes when no other teams exist', () => {
    const teams: Team[] = [
      {
        teamId: 1,
        name: 'Team A',
        athletes: [],
      },
    ]

    const team = teams[0]
    if (!team) throw new Error('Team not found')

    const athletesInOtherTeams = new Set<number>()
    teams.forEach(t => {
      if (t.teamId !== team.teamId) {
        t.athletes.forEach(a => athletesInOtherTeams.add(a.userId))
      }
    })

    const availableAthletes = mockAthletes.filter(
      a => !athletesInOtherTeams.has(a.userId)
    )

    expect(availableAthletes.length).toBe(2)
  })
})

