import axios from 'axios'

const configuredApiUrl = import.meta.env.VITE_API_BASE_URL
const API_URL = configuredApiUrl === undefined ? 'http://localhost:8080' : configuredApiUrl

export interface TaskType {
  id: number
  name: string
  description: string
}

export interface TaskTypePayload {
  name: string
  description: string
}

export interface VolunteerPreference {
  id: number
  userId: number
  taskTypeId: number
}

export interface VolunteerPreferencePayload {
  userId: number
  taskTypeId: number
}

/**
 * Service pour gérer les volontaires et les tâches
 */
export const volunteerService = {
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

  /**
   * Récupérer tous les types de tâches
   */
  async getTaskTypes(): Promise<TaskType[]> {
    try {
      const response = await axios.get<TaskType[]>(`${API_URL}/volunteer/task-types`, {
        headers: this.getAuthHeaders(),
      })
      return response.data
    } catch (error) {
      console.error('Get task types error:', error)
      throw error
    }
  },

  /**
   * Créer un nouveau type de tâche
   */
  async createTaskType(payload: TaskTypePayload): Promise<TaskType> {
    try {
      const response = await axios.post<TaskType>(`${API_URL}/volunteer/task-types`, payload, {
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'application/json',
        },
      })
      return response.data
    } catch (error) {
      console.error('Create task type error:', error)
      throw error
    }
  },

  /**
   * Modifier un type de tâche existant
   */
  async updateTaskType(id: number, payload: TaskTypePayload): Promise<TaskType> {
    try {
      const response = await axios.put<TaskType>(`${API_URL}/volunteer/task-types/${id}`, payload, {
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'application/json',
        },
      })
      return response.data
    } catch (error) {
      console.error('Update task type error:', error)
      throw error
    }
  },

  /**
   * Supprimer un type de tâche
   */
  async deleteTaskType(id: number): Promise<void> {
    try {
      await axios.delete(`${API_URL}/volunteer/task-types/${id}`, {
        headers: this.getAuthHeaders(),
      })
    } catch (error) {
      console.error('Delete task type error:', error)
      throw error
    }
  },

  // --- Volunteer Preferences Methods ---

  /**
   * Créer une préférence de volontaire (ajouter un favori)
   */
  async createPreference(payload: VolunteerPreferencePayload): Promise<VolunteerPreference> {
    try {
      const response = await axios.post<VolunteerPreference>(`${API_URL}/volunteer/preferences`, payload, {
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'application/json',
        },
      })
      return response.data
    } catch (error) {
      console.error('Create preference error:', error)
      throw error
    }
  },

  /**
   * Récupérer une préférence par ID
   */
  async getPreference(id: number): Promise<VolunteerPreference> {
    try {
      const response = await axios.get<VolunteerPreference>(`${API_URL}/volunteer/preferences/${id}`, {
        headers: this.getAuthHeaders(),
      })
      return response.data
    } catch (error) {
      console.error('Get preference error:', error)
      throw error
    }
  },

  /**
   * Mettre à jour une préférence
   */
  async updatePreference(id: number, payload: VolunteerPreferencePayload): Promise<VolunteerPreference> {
    try {
      const response = await axios.put<VolunteerPreference>(`${API_URL}/volunteer/preferences/${id}`, payload, {
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'application/json',
        },
      })
      return response.data
    } catch (error) {
      console.error('Update preference error:', error)
      throw error
    }
  },

  /**
   * Supprimer une préférence (retirer un favori)
   */
  async deletePreference(id: number): Promise<void> {
    try {
      await axios.delete(`${API_URL}/volunteer/preferences/${id}`, {
        headers: this.getAuthHeaders(),
      })
    } catch (error) {
      console.error('Delete preference error:', error)
      throw error
    }
  },

  /**
   * Récupérer toutes les préférences d'un utilisateur
   */
  async getUserPreferences(userId: number): Promise<VolunteerPreference[]> {
    try {
      const response = await axios.get<VolunteerPreference[]>(`${API_URL}/volunteer/preferences/user/${userId}`, {
        headers: this.getAuthHeaders(),
      })
      return response.data
    } catch (error) {
      console.error('Get user preferences error:', error)
      throw error
    }
  },
}

export default volunteerService

