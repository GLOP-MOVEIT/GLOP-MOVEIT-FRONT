import apiClient from '@/services/api'
import type { Team, CreateTeamPayload } from '@/types/team'

interface PagedResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
}

const teamService = {
  /**
   * Récupérer toutes les équipes avec pagination
   */
  async getAllTeams(page = 0, size = 100, sort: string[] = []): Promise<Team[]> {
    const params = new URLSearchParams()
    params.append('page', String(page))
    params.append('size', String(size))
    sort.forEach((s) => params.append('sort', s))

    const { data } = await apiClient.get<PagedResponse<Team> | Team[]>(`/teams?${params.toString()}`)

    if (data && typeof data === 'object' && 'content' in data) {
      return data.content as Team[]
    }

    return Array.isArray(data) ? data : []
  },

  /**
   * Récupérer une équipe par ID
   */
  async getTeamById(teamId: number): Promise<Team> {
    const { data } = await apiClient.get<Team>(`/teams/${teamId}`)
    return data
  },

  /**
   * Créer une nouvelle équipe vide
   */
  async createTeam(payload: CreateTeamPayload): Promise<Team> {
    const { data } = await apiClient.post<Team>('/teams', payload)
    return data
  },

  /**
   * Supprimer une équipe
   */
  async deleteTeam(teamId: number): Promise<void> {
    await apiClient.delete(`/teams/${teamId}`)
  },

  /**
   * Ajouter un athlète à une équipe
   */
  async addAthleteToTeam(teamId: number, athleteId: number): Promise<Team> {
    const { data } = await apiClient.post<Team>(`/teams/${teamId}/athletes/${athleteId}`)
    return data
  },

  /**
   * Retirer un athlète d'une équipe
   */
  async removeAthleteFromTeam(teamId: number, athleteId: number): Promise<Team> {
    const { data } = await apiClient.delete<Team>(`/teams/${teamId}/athletes/${athleteId}`)
    return data
  },

  /**
   * Récupérer toutes les équipes d'un athlète
   */
  async getTeamsByAthlete(athleteId: number): Promise<Team[]> {
    const { data } = await apiClient.get<Team[]>(`/teams/athletes/${athleteId}`)
    return data
  },
}

export default teamService

