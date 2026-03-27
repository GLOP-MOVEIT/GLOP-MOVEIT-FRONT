import { describe, it, expect, vi, beforeEach } from 'vitest'
import teamService from '@/services/teamService'
import apiClient from '@/services/api'
import type { Team, CreateTeamPayload } from '@/types/team'

vi.mock('@/services/api')

describe('teamService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAllTeams', () => {
    it('should return teams from paginated response', async () => {
      const mockTeams: Team[] = [
        { teamId: 1, name: 'Team A', athletes: [] },
        { teamId: 2, name: 'Team B', athletes: [] },
      ]
      const mockResponse = { data: { content: mockTeams } }
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      const result = await teamService.getAllTeams()

      expect(result).toEqual(mockTeams)
      expect(apiClient.get).toHaveBeenCalledWith('/teams?page=0&size=100')
    })

    it('should return teams from array response', async () => {
      const mockTeams: Team[] = [
        { teamId: 1, name: 'Team A', athletes: [] },
      ]
      const mockResponse = { data: mockTeams }
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      const result = await teamService.getAllTeams()

      expect(result).toEqual(mockTeams)
    })

    it('should return empty array if response is invalid', async () => {
      const mockResponse = { data: null }
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      const result = await teamService.getAllTeams()

      expect(result).toEqual([])
    })

    it('should handle custom pagination params', async () => {
      const mockResponse = { data: { content: [] } }
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      await teamService.getAllTeams(2, 50, ['name,asc'])

      expect(apiClient.get).toHaveBeenCalledWith('/teams?page=2&size=50&sort=name%2Casc')
    })
  })

  describe('getTeamById', () => {
    it('should return a team by id', async () => {
      const mockTeam: Team = { teamId: 1, name: 'Team A', athletes: [] }
      const mockResponse = { data: mockTeam }
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      const result = await teamService.getTeamById(1)

      expect(result).toEqual(mockTeam)
      expect(apiClient.get).toHaveBeenCalledWith('/teams/1')
    })
  })

  describe('createTeam', () => {
    it('should create a new team', async () => {
      const payload: CreateTeamPayload = { name: 'New Team' }
      const mockTeam: Team = { teamId: 3, name: 'New Team', athletes: [] }
      const mockResponse = { data: mockTeam }
      vi.mocked(apiClient.post).mockResolvedValue(mockResponse)

      const result = await teamService.createTeam(payload)

      expect(result).toEqual(mockTeam)
      expect(apiClient.post).toHaveBeenCalledWith('/teams', payload)
    })
  })

  describe('deleteTeam', () => {
    it('should delete a team', async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({ data: undefined })

      await teamService.deleteTeam(1)

      expect(apiClient.delete).toHaveBeenCalledWith('/teams/1')
    })
  })

  describe('addAthleteToTeam', () => {
    it('should add an athlete to a team', async () => {
      const mockTeam: Team = {
        teamId: 1,
        name: 'Team A',
        athletes: [{ userId: 5, firstName: 'John', surname: 'Doe', email: 'john@test.com', phoneNumber: '', language: 'fr', role: { name: 'ATHLETE' }, acceptsNotifications: true, acceptsLocationSharing: true }],
      }
      const mockResponse = { data: mockTeam }
      vi.mocked(apiClient.post).mockResolvedValue(mockResponse)

      const result = await teamService.addAthleteToTeam(1, 5)

      expect(result).toEqual(mockTeam)
      expect(apiClient.post).toHaveBeenCalledWith('/teams/1/athletes/5')
    })
  })

  describe('removeAthleteFromTeam', () => {
    it('should remove an athlete from a team', async () => {
      const mockTeam: Team = { teamId: 1, name: 'Team A', athletes: [] }
      const mockResponse = { data: mockTeam }
      vi.mocked(apiClient.delete).mockResolvedValue(mockResponse)

      const result = await teamService.removeAthleteFromTeam(1, 5)

      expect(result).toEqual(mockTeam)
      expect(apiClient.delete).toHaveBeenCalledWith('/teams/1/athletes/5')
    })
  })

  describe('getTeamsByAthlete', () => {
    it('should return teams for an athlete', async () => {
      const mockTeams: Team[] = [
        { teamId: 1, name: 'Team A', athletes: [] },
      ]
      const mockResponse = { data: mockTeams }
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      const result = await teamService.getTeamsByAthlete(5)

      expect(result).toEqual(mockTeams)
      expect(apiClient.get).toHaveBeenCalledWith('/teams/athletes/5')
    })
  })
})

