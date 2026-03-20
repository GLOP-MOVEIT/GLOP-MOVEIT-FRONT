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

export type TargetType = 'CHAMPIONSHIP' | 'COMPETITION' | 'TRIAL'

export interface VolunteerTask {
  id: number
  targetType: TargetType
  targetId: number
  title: string
  description: string
  taskTypeId: number
  startDate: string
  endDate: string
  maxVolunteers: number
  locationId: number | null
  location?: string
}

export interface VolunteerTaskPayload {
  targetType: TargetType
  targetId: number
  title: string
  description: string
  taskTypeId: number
  startDate: string
  endDate: string
  maxVolunteers: number
  locationId: number | null
  location?: string
}

export interface VolunteerAssignment {
  id: number
  volunteerId: number
  taskId: number
  status: 'PENDING' | 'ACCEPTED' | 'REFUSED'
  comment?: string
}

export interface VolunteerAssignmentPayload {
  volunteerId: number
  taskId: number
}

export interface VolunteerAssignmentResponse {
  volunteerId: number
  hasPreference: boolean
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

  // --- Volunteer Tasks Methods ---

  /**
   * Récupérer toutes les tâches
   */
  async getAllTasks(): Promise<VolunteerTask[]> {
    try {
      const response = await axios.get<VolunteerTask[]>(`${API_URL}/volunteer/tasks`, {
        headers: this.getAuthHeaders(),
      })
      return response.data
    } catch (error) {
      console.error('Get all tasks error:', error)
      throw error
    }
  },

  /**
   * Créer une nouvelle tâche
   */
  async createTask(payload: VolunteerTaskPayload): Promise<VolunteerTask> {
    try {
      const response = await axios.post<VolunteerTask>(`${API_URL}/volunteer/tasks`, payload, {
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'application/json',
        },
      })
      return response.data
    } catch (error) {
      console.error('Create task error:', error)
      throw error
    }
  },

  /**
   * Récupérer une tâche par ID
   */
  async getTask(id: number): Promise<VolunteerTask> {
    try {
      const response = await axios.get<VolunteerTask>(`${API_URL}/volunteer/tasks/${id}`, {
        headers: this.getAuthHeaders(),
      })
      return response.data
    } catch (error) {
      console.error('Get task error:', error)
      throw error
    }
  },

  /**
   * Mettre à jour une tâche
   */
  async updateTask(id: number, payload: VolunteerTaskPayload): Promise<VolunteerTask> {
    try {
      const response = await axios.put<VolunteerTask>(`${API_URL}/volunteer/tasks/${id}`, payload, {
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'application/json',
        },
      })
      return response.data
    } catch (error) {
      console.error('Update task error:', error)
      throw error
    }
  },

  /**
   * Supprimer une tâche
   */
  async deleteTask(id: number): Promise<void> {
    try {
      await axios.delete(`${API_URL}/volunteer/tasks/${id}`, {
        headers: this.getAuthHeaders(),
      })
    } catch (error) {
      console.error('Delete task error:', error)
      throw error
    }
  },

  /**
   * Récupérer les tâches pour une cible (CHAMPIONSHIP, COMPETITION, TRIAL)
   */
  async getTasksByTarget(targetType: TargetType, targetId: number): Promise<VolunteerTask[]> {
    try {
      const response = await axios.get<VolunteerTask[]>(
        `${API_URL}/volunteer/tasks/target/${targetType}/${targetId}`,
        {
          headers: this.getAuthHeaders(),
        }
      )
      return response.data
    } catch (error) {
      console.error('Get tasks by target error:', error)
      throw error
    }
  },

  /**
   * Récupérer les tâches par type de tâche
   */
  async getTasksByType(taskTypeId: number): Promise<VolunteerTask[]> {
    try {
      const response = await axios.get<VolunteerTask[]>(`${API_URL}/volunteer/tasks/type/${taskTypeId}`, {
        headers: this.getAuthHeaders(),
      })
      return response.data
    } catch (error) {
      console.error('Get tasks by type error:', error)
      throw error
    }
  },

  // --- Volunteer Assignments Methods ---

  /**
   * Assigner un volontaire à une tâche
   */
  async createAssignment(payload: VolunteerAssignmentPayload): Promise<VolunteerAssignment> {
    try {
      const response = await axios.post<VolunteerAssignment>(`${API_URL}/volunteer/assignments`, payload, {
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'application/json',
        },
      })
      return response.data
    } catch (error) {
      console.error('Create assignment error:', error)
      throw error
    }
  },

  /**
   * Récupérer une assignation par ID
   */
  async getAssignment(id: number): Promise<VolunteerAssignment> {
    try {
      const response = await axios.get<VolunteerAssignment>(`${API_URL}/volunteer/assignments/${id}`, {
        headers: this.getAuthHeaders(),
      })
      return response.data
    } catch (error) {
      console.error('Get assignment error:', error)
      throw error
    }
  },

  /**
   * Supprimer une assignation
   */
  async deleteAssignment(id: number): Promise<void> {
    try {
      await axios.delete(`${API_URL}/volunteer/assignments/${id}`, {
        headers: this.getAuthHeaders(),
      })
    } catch (error) {
      console.error('Delete assignment error:', error)
      throw error
    }
  },

  /**
   * Récupérer les assignations pour une tâche
   */
  async getAssignmentsByTask(taskId: number): Promise<VolunteerAssignment[]> {
    try {
      const response = await axios.get<VolunteerAssignment[]>(`${API_URL}/volunteer/assignments/task/${taskId}`, {
        headers: this.getAuthHeaders(),
      })
      return response.data
    } catch (error) {
      console.error('Get assignments by task error:', error)
      throw error
    }
  },

  /**
   * Récupérer les volontaires disponibles pour une tâche
   */
  async getAvailableVolunteers(taskId: number, volunteerIds: number[]): Promise<number[]> {
    try {
      const response = await axios.post<number[]>(
        `${API_URL}/volunteer/assignments/task/${taskId}/available-volunteers`,
        { volunteerIds },
        {
          headers: {
            ...this.getAuthHeaders(),
            'Content-Type': 'application/json',
          },
        }
      )
      return response.data
    } catch (error) {
      console.error('Get available volunteers error:', error)
      throw error
    }
  },

  /**
   * Récupérer les volontaires disponibles avec leurs préférences
   */
  async getAvailableVolunteersWithPreference(
    taskId: number,
    volunteerIds: number[]
  ): Promise<VolunteerAssignmentResponse[]> {
    try {
      const response = await axios.post<VolunteerAssignmentResponse[]>(
        `${API_URL}/volunteer/assignments/task/${taskId}/available-volunteers-with-preference`,
        { volunteerIds },
        {
          headers: {
            ...this.getAuthHeaders(),
            'Content-Type': 'application/json',
          },
        }
      )
      return response.data
    } catch (error) {
      console.error('Get available volunteers with preference error:', error)
      throw error
    }
  },

  /**
   * Récupérer les assignations d'un volontaire
   */
  async getAssignmentsByVolunteer(volunteerId: number): Promise<VolunteerAssignment[]> {
    try {
      const response = await axios.get<VolunteerAssignment[]>(
        `${API_URL}/volunteer/assignments/volunteer/${volunteerId}`,
        {
          headers: this.getAuthHeaders(),
        }
      )
      return response.data
    } catch (error) {
      console.error('Get assignments by volunteer error:', error)
      throw error
    }
  },

  /**
   * Récupérer les assignations par statut
   */
  async getAssignmentsByStatus(status: 'PENDING' | 'ACCEPTED' | 'REFUSED'): Promise<VolunteerAssignment[]> {
    try {
      const response = await axios.get<VolunteerAssignment[]>(`${API_URL}/volunteer/assignments/status/${status}`, {
        headers: this.getAuthHeaders(),
      })
      return response.data
    } catch (error) {
      console.error('Get assignments by status error:', error)
      throw error
    }
  },

  /**
   * Répondre à une assignation (accepter ou refuser)
   */
  async respondToAssignment(
    id: number,
    payload: { volunteerId: number; status: 'ACCEPTED' | 'REFUSED'; comment?: string }
  ): Promise<VolunteerAssignment> {
    try {
      const response = await axios.patch<VolunteerAssignment>(
        `${API_URL}/volunteer/assignments/${id}/volunteer-response`,
        payload,
        {
          headers: {
            ...this.getAuthHeaders(),
            'Content-Type': 'application/json',
          },
        }
      )
      return response.data
    } catch (error) {
      console.error('Respond to assignment error:', error)
      throw error
    }
  },
}

export default volunteerService

