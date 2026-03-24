import axios from 'axios'
import type { Championship, Competition, CompetitionPayload, CompetitionTreeResult, Event, Trial } from '@/types/competition'
import { formatDateForBackend } from '@/utils/date'

const configuredApiUrl = import.meta.env.VITE_API_BASE_URL
const API_URL = configuredApiUrl === undefined ? 'http://localhost:8080' : configuredApiUrl

const ensureArray = <T>(value: T | T[] | undefined): T[] => {
  if (Array.isArray(value)) {
    return value
  }

  return value ? [value] : []
}

/**
 * Service pour gérer les championnats, compétitions et épreuves
 */
export const championshipService = {
  /**
   * Récupérer le token d'authentification
   */
  getToken(): string | null {
    return localStorage.getItem('authToken')
  },

  getAuthHeaders() {
    const token = this.getToken()
    return token ? { Authorization: `Bearer ${token}` } : {}
  },

  // --- Championship Methods ---
  /**
   * Récupérer tous les championnats
   */
  async getAllChampionships(): Promise<Championship[]> {
    try {
      const response = await axios.get<Championship[]>(`${API_URL}/championships`, {
        headers: this.getAuthHeaders(),
      })
      return response.data
    } catch (error) {
      console.error('Get all championships error:', error)
      throw error
    }
  },

  /**
   * Récupérer un championnat par ID
   */
  async getChampionshipById(id: number): Promise<Championship> {
    try {
      const response = await axios.get<Championship>(`${API_URL}/championships/${id}`, {
        headers: this.getAuthHeaders(),
      })
      return response.data
    } catch (error) {
      console.error(`Get championship ${id} error:`, error)
      throw error
    }
  },

  /**
   * Créer un nouveau championnat (Admin)
   */
  async createChampionship(championship: Omit<Championship, 'id' | 'competitions'>): Promise<Championship> {
    try {
      // Formater les dates pour le backend
      const formattedChampionship = {
        ...championship,
        startDate: formatDateForBackend(championship.startDate),
        endDate: formatDateForBackend(championship.endDate),
      }

      const response = await axios.post<Championship>(`${API_URL}/championships`, formattedChampionship, {
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'application/json',
        },
      })
      return response.data
    } catch (error) {
      console.error('Create championship error:', error)
      throw error
    }
  },

  /**
   * Mettre à jour un championnat (Admin)
   */
  async updateChampionship(id: number, championship: Partial<Championship>): Promise<Championship> {
    try {
      // Formater les dates pour le backend si elles sont présentes
      const formattedChampionship = { ...championship }
      if (championship.startDate) {
        formattedChampionship.startDate = formatDateForBackend(championship.startDate)
      }
      if (championship.endDate) {
        formattedChampionship.endDate = formatDateForBackend(championship.endDate)
      }

      const response = await axios.put<Championship>(`${API_URL}/championships/${id}`, formattedChampionship, {
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'application/json',
        },
      })
      return response.data
    } catch (error) {
      console.error(`Update championship ${id} error:`, error)
      throw error
    }
  },

  /**
   * Supprimer un championnat (Admin)
   */
  async deleteChampionship(id: number): Promise<void> {
    try {
      await axios.delete(`${API_URL}/championships/${id}`, {
        headers: this.getAuthHeaders(),
      })
    } catch (error) {
      console.error(`Delete championship ${id} error:`, error)
      throw error
    }
  },

  // --- Competition Methods ---
  /**
   * Récupérer toutes les compétitions
   */
  async getAllCompetitions(): Promise<Competition[]> {
    try {
      const response = await axios.get<Competition[]>(
        `${API_URL}/championships/competitions`,
        {
          headers: this.getAuthHeaders(),
        }
      )
      return response.data
    } catch (error) {
      console.error('Get all competitions error:', error)
      throw error
    }
  },

  /**
   * Récupérer une compétition par ID
   */
  async getCompetitionById(id: number): Promise<Competition> {
    try {
      const response = await axios.get<Competition>(`${API_URL}/championships/competitions/${id}`, {
        headers: this.getAuthHeaders(),
      })
      return response.data
    } catch (error) {
      console.error(`Get competition ${id} error:`, error)
      throw error
    }
  },

  /**
   * Créer une nouvelle compétition
   */
  async createCompetition(competition: CompetitionPayload): Promise<Competition> {
    try {
      const formattedCompetition = {
        ...competition,
        competitionStartDate: competition.competitionStartDate ? formatDateForBackend(competition.competitionStartDate) : competition.competitionStartDate,
        competitionEndDate: competition.competitionEndDate ? formatDateForBackend(competition.competitionEndDate) : competition.competitionEndDate,
      }

      const response = await axios.post<Competition>(`${API_URL}/championships/competitions`, formattedCompetition, {
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'application/json',
        },
      })
      return response.data
    } catch (error) {
      console.error('Create competition error:', error)
      throw error
    }
  },

  /**
   * Mettre à jour une compétition
   */
  async updateCompetition(id: number, competition: Partial<Competition>): Promise<Competition> {
    try {
      // Formater les dates pour le backend si elles sont présentes
      const formattedCompetition = { ...competition }
      if (competition.competitionStartDate) {
        formattedCompetition.competitionStartDate = formatDateForBackend(competition.competitionStartDate)
      }
      if (competition.competitionEndDate) {
        formattedCompetition.competitionEndDate = formatDateForBackend(competition.competitionEndDate)
      }

      const response = await axios.put<Competition>(`${API_URL}/championships/competitions/${id}`, formattedCompetition, {
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'application/json',
        },
      })
      return response.data
    } catch (error) {
      console.error(`Update competition ${id} error:`, error)
      throw error
    }
  },

  /**
   * Supprimer une compétition
   */
  async deleteCompetition(id: number): Promise<void> {
    try {
      await axios.delete(`${API_URL}/championships/competitions/${id}`, {
        headers: this.getAuthHeaders(),
      })
    } catch (error) {
      console.error(`Delete competition ${id} error:`, error)
      throw error
    }
  },

  /**
   * Récupérer tous les types de compétition
   */
  async getCompetitionTypes(): Promise<string[]> {
    try {
      const response = await axios.get<string[]>(`${API_URL}/championships/competitions/types`, {
        headers: this.getAuthHeaders(),
      })
      return response.data
    } catch (error) {
      console.error('Get competition types error:', error)
      throw error
    }
  },

  /**
   * Générer l'arbre de la compétition
   */
  async generateCompetitionTree(competitionId: number, participantIds: number[] | number[][]): Promise<CompetitionTreeResult> {
    try {
      const response = await axios.post<CompetitionTreeResult>(
        `${API_URL}/championships/competitions/${competitionId}/generate-tree`,
        participantIds,
        {
          headers: {
            ...this.getAuthHeaders(),
            'Content-Type': 'application/json',
          },
        },
      )

      return response.data
    } catch (error) {
      console.error(`Generate competition tree ${competitionId} error:`, error)
      throw error
    }
  },

  /**
   * Récupérer une manche par ID
   */
  async getTrialById(id: number): Promise<Trial> {
    try {
      const response = await axios.get<Trial>(`${API_URL}/trials/${id}`, {
        headers: this.getAuthHeaders(),
      })
      return response.data
    } catch (error) {
      console.error(`Get trial ${id} error:`, error)
      throw error
    }
  },

  /**
   * Récupérer toutes les manches d'une compétition
   */
  async getTrialsByCompetition(competitionId: number): Promise<Trial[]> {
    try {
      const response = await axios.get<Trial | Trial[]>(
        `${API_URL}/trials/competition/${competitionId}`,
        { headers: this.getAuthHeaders() },
      )
      return Array.isArray(response.data) ? response.data : [response.data]
    } catch (error) {
      console.error(`Get trials for competition ${competitionId} error:`, error)
      throw error
    }
  },

  /**
   * Mettre à jour une manche (date, lieu, etc.)
   */
  async updateTrial(id: number, payload: Partial<Trial>): Promise<Trial> {
    try {
      const response = await axios.put<Trial>(`${API_URL}/trials/${id}`, payload, {
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'application/json',
        },
      })
      return response.data
    } catch (error) {
      console.error(`Update trial ${id} error:`, error)
      throw error
    }
  },

  // --- Event Methods ---
  /**
   * Récupérer toutes les épreuves d'une compétition
   */
  async getEventsByCompetition(competitionId: number): Promise<Event[]> {
    try {
      const response = await axios.get<Event[]>(
        `${API_URL}/competitions/${competitionId}/events`,
        {
          headers: this.getAuthHeaders(),
        }
      )
      return response.data
    } catch (error) {
      console.error(`Get events for competition ${competitionId} error:`, error)
      throw error
    }
  },

  /**
   * Récupérer une épreuve par ID
   */
  async getEventById(id: number): Promise<Event> {
    try {
      const response = await axios.get<Event>(`${API_URL}/events/${id}`, {
        headers: this.getAuthHeaders(),
      })
      return response.data
    } catch (error) {
      console.error(`Get event ${id} error:`, error)
      throw error
    }
  },

  /**
   * Créer une nouvelle épreuve
   */
  async createEvent(event: Omit<Event, 'id'>): Promise<Event> {
    try {
      const formattedEvent = {
        ...event,
        startDate: event.startDate ? formatDateForBackend(event.startDate) : event.startDate,
        endDate: event.endDate ? formatDateForBackend(event.endDate) : event.endDate,
      }

      const response = await axios.post<Event>(`${API_URL}/events`, formattedEvent, {
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'application/json',
        },
      })
      return response.data
    } catch (error) {
      console.error('Create event error:', error)
      throw error
    }
  },

  /**
   * Mettre à jour une épreuve
   */
  async updateEvent(id: number, event: Partial<Event>): Promise<Event> {
    try {
      const formattedEvent = { ...event }
      if (event.startDate) {
        formattedEvent.startDate = formatDateForBackend(event.startDate)
      }
      if (event.endDate) {
        formattedEvent.endDate = formatDateForBackend(event.endDate)
      }
      const response = await axios.put<Event>(`${API_URL}/events/${id}`, formattedEvent, {
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'application/json',
        },
      })
      return response.data
    } catch (error) {
      console.error(`Update event ${id} error:`, error)
      throw error
    }
  },

  /**
   * Récupérer toutes les manches d'un athlète
   */
  async getTrialsByAthlete(athleteId: number): Promise<Trial[]> {
    try {
      const response = await axios.get<Trial[]>(`${API_URL}/trials/athlete/${athleteId}`, {
        headers: this.getAuthHeaders(),
      })
      return ensureArray(response.data)
    } catch (error) {
      console.error(`Get trials for athlete ${athleteId} error:`, error)
      throw error
    }
  },

  /**
   * Supprimer une épreuve
   */
  async deleteEvent(id: number): Promise<void> {
    try {
      await axios.delete(`${API_URL}/events/${id}`, {
        headers: this.getAuthHeaders(),
      })
    } catch (error) {
      console.error(`Delete event ${id} error:`, error)
      throw error
    }
  },

  /**
   * Qualifier une liste de participants vers la manche suivante
   */
  async advanceQualifiedParticipants(trialId: number, participantIds: number[]): Promise<Trial> {
    try {
      const response = await axios.post<Trial>(`${API_URL}/trials/${trialId}/advance-qualified`, participantIds, {
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'application/json',
        },
      })
      return response.data
    } catch (error) {
      console.error(`Advance qualified participants for trial ${trialId} error:`, error)
      throw error
    }
  },

  /**
   * Mettre à jour une épreuve
   */
  async updateTrial(trial: Trial): Promise<Trial> {
    try {
      const response = await axios.put<Trial>(`${API_URL}/trials/${trial.trialId}`, trial, {
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'application/json',
        },
      })
      return response.data
    } catch (error) {
      console.error(`Update trial ${trial.trialId} error:`, error)
      throw error
    }
  },
}

export default championshipService

