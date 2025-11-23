import apiClient from './api'
import type { LoginRequest, RegisterRequest, AuthResponse, User } from '@/types/user'

class UserService {
  /**
   * Connexion d'un utilisateur
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', credentials)
      
      // Stocker le token dans le localStorage
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token)
        if (response.data.refreshToken) {
          localStorage.setItem('refreshToken', response.data.refreshToken)
        }
      }
      
      return response.data
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  /**
   * Inscription d'un nouvel utilisateur
   */
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/register', userData)
      
      // Stocker le token dans le localStorage après inscription
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token)
        if (response.data.refreshToken) {
          localStorage.setItem('refreshToken', response.data.refreshToken)
        }
      }
      
      return response.data
    } catch (error) {
      console.error('Register error:', error)
      throw error
    }
  }

  /**
   * Déconnexion de l'utilisateur
   */
  async logout(): Promise<void> {
    try {
      // Appel API optionnel pour invalider le token côté serveur
      await apiClient.post('/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Nettoyer le localStorage dans tous les cas
      localStorage.removeItem('authToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
    }
  }

  /**
   * Récupérer le profil de l'utilisateur connecté
   */
  async getCurrentUser(): Promise<User> {
    try {
      const response = await apiClient.get<User>('/auth/me')
      return response.data
    } catch (error) {
      console.error('Get current user error:', error)
      throw error
    }
  }

  /**
   * Vérifier si un utilisateur est connecté
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken')
  }

  /**
   * Récupérer le token d'authentification
   */
  getToken(): string | null {
    return localStorage.getItem('authToken')
  }
}

// Export d'une instance unique (singleton)
export default new UserService()
