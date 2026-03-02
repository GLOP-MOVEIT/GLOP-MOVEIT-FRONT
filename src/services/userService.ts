import axios from 'axios'
import type { LoginRequest, RegisterRequest, AuthResponse, User, UserProfile } from '@/types/user'

const API_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'
const AUTH_API_URL = import.meta.env.VITE_AUTH_API_BASE_URL ?? API_URL
const USER_API_URL = import.meta.env.VITE_USER_API_BASE_URL ?? API_URL

export const userService = {
  /**
   * Connexion d'un utilisateur
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await axios.post<AuthResponse>(`${AUTH_API_URL}/auth/login`, credentials, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.user))
      }
      
      return response.data
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  },

  /**
   * Inscription d'un nouvel utilisateur
   */
  async register(userData: RegisterRequest): Promise<User> {
    try {
      const registerData = {
        nickname: userData.nickname,
        password: userData.password,
        firstName: userData.firstName,
        surname: userData.surname,
        email: userData.email,
        phoneNumber: userData.phoneNumber,
        language: userData.language,
        acceptsNotifications: userData.acceptsNotifications,
        acceptsLocationSharing: userData.acceptsLocationSharing,
      }

      const response = await axios.post<User>(`${AUTH_API_URL}/auth/signup`, registerData, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      return response.data
    } catch (error) {
      console.error('Register error:', error)
      throw error
    }
  },

  /**
   * Déconnexion de l'utilisateur
   */
  logout(): void {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
  },

  /**
   * Récupérer le profil de l'utilisateur depuis le localStorage
   */
  getCurrentUser(): User | null {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  },

  /**
   * Récupérer le profil de l'utilisateur depuis l'API (ancienne méthode - deprecated)
   */
  async getProfile(): Promise<User> {
    try {
      const token = this.getToken()
      const response = await axios.get<User>(`${AUTH_API_URL}/auth/users/me`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })

      localStorage.setItem('user', JSON.stringify(response.data))

      return response.data
    } catch (error) {
      console.error('Get profile error:', error)
      throw error
    }
  },

  /**
   * Récupérer le profil utilisateur par ID depuis le user-service
   */
  async getUserProfile(userId: number): Promise<UserProfile> {
    try {
      const token = this.getToken()
      const response = await axios.get<UserProfile>(`${USER_API_URL}/users/${userId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })

      return response.data
    } catch (error) {
      console.error('Get user profile error:', error)
      throw error
    }
  },

  /**
   * Récupérer le profil de l'utilisateur connecté depuis le user-service
   */
  async getCurrentUserProfile(): Promise<User> {
    try {
      const currentUser = this.getCurrentUser()
      if (!currentUser?.id && !currentUser?.userId) {
        throw new Error('Aucun utilisateur connecté')
      }

      const userId = currentUser.userId ?? currentUser.id
      if (!userId) {
        throw new Error('ID utilisateur introuvable')
      }

      const userProfile = await this.getUserProfile(userId)
      
      // Convertir UserProfile vers User pour compatibilité
      const user: User = {
        id: userProfile.userId,
        userId: userProfile.userId,
        firstName: userProfile.firstName,
        surname: userProfile.surname,
        email: userProfile.email,
        phoneNumber: userProfile.phoneNumber,
        language: userProfile.language,
        role: userProfile.role,
        acceptsNotifications: userProfile.acceptsNotifications,
        acceptsLocationSharing: userProfile.acceptsLocationSharing,
      }

      localStorage.setItem('user', JSON.stringify(user))
      return user
    } catch (error) {
      console.error('Get current user profile error:', error)
      throw error
    }
  },

  /**
   * Récupérer la liste des utilisateurs (ADMIN) - via user-service
   */
  async getUsers(): Promise<User[]> {
    try {
      const token = this.getToken()
      const response = await axios.get<User[]>(`${USER_API_URL}/users`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })

      return response.data
    } catch (error) {
      console.error('Get users error:', error)
      throw error
    }
  },

  /**
   * Vérifier si un utilisateur est connecté
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken')
  },

  /**
   * Récupérer le token d'authentification
   */
  getToken(): string | null {
    return localStorage.getItem('authToken')
  }
}

export default userService
