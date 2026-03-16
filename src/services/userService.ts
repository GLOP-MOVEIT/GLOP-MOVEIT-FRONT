import axios from 'axios'
import type { LoginRequest, RegisterRequest, AuthResponse, User, UserProfile, PagedResponse } from '@/types/user'

const API_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'
const AUTH_API_URL = import.meta.env.VITE_AUTH_API_BASE_URL ?? API_URL
const USER_API_URL = import.meta.env.VITE_USER_API_BASE_URL ?? API_URL

export const userService = {
  /**
   * Connexion d'un utilisateur
   * 1. Appelle /auth/login pour obtenir le token et l'AuthUser (id, nickname, lastConnectionDate)
   * 2. Utilise l'id pour récupérer le profil complet depuis /users/{id}
   */
  async login(credentials: LoginRequest): Promise<{ token: string; expiresIn: number; user: User }> {
    try {
      const response = await axios.post<AuthResponse>(`${AUTH_API_URL}/auth/login`, credentials, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token)
        const userId = response.data.user.userId ?? response.data.user.id
        const userProfile = await this.getUserProfile(userId)
        localStorage.setItem('user', JSON.stringify(userProfile))

        return {
          token: response.data.token,
          expiresIn: response.data.expiresIn,
          user: userProfile,
        }
      }

      throw new Error('Token non reçu')
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
   * Récupérer/rafraîchir le profil de l'utilisateur connecté depuis le user-service
   */
  async getCurrentUserProfile(): Promise<User> {
    try {
      const currentUser = this.getCurrentUser()
      if (!currentUser?.userId) {
        throw new Error('Aucun utilisateur connecté')
      }

      // Rafraîchir le profil depuis l'API
      const userProfile = await this.getUserProfile(currentUser.userId)
      localStorage.setItem('user', JSON.stringify(userProfile))

      return userProfile
    } catch (error) {
      console.error('Get current user profile error:', error)
      throw error
    }
  },

  /**
   * Récupérer la liste des utilisateurs (ADMIN) - via user-service
   * L'API retourne une réponse paginée avec la structure: { content: User[], pageable: {...}, ... }
   */
  async getUsers(): Promise<User[]> {
    try {
      const token = this.getToken()
      const response = await axios.get<PagedResponse<UserProfile>>(`${USER_API_URL}/users`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })

      const data = response.data

      if (data?.content && Array.isArray(data.content)) {
        return data.content.map((profile) => ({
          userId: profile.userId,
          firstName: profile.firstName,
          surname: profile.surname,
          email: profile.email,
          phoneNumber: profile.phoneNumber,
          language: profile.language,
          role: profile.role,
          acceptsNotifications: profile.acceptsNotifications,
          acceptsLocationSharing: profile.acceptsLocationSharing,
        }))
      }

      console.error('Format de réponse inattendu, content non trouvé:', data)
      return []
    } catch (error) {
      console.error('Get users error:', error)
      throw error
    }
  },

  /**
   * Promouvoir un utilisateur au rôle de commissaire via le endpoint backend existant.
   */
  async promoteToCommissioner(userId: number): Promise<void> {
    try {
      const token = this.getToken()
      await axios.post(`${API_URL}/requests/referee/${userId}`, null, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
    } catch (error) {
      console.error('Promote to commissioner error:', error)
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
