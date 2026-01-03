import axios from 'axios'
import type { LoginRequest, RegisterRequest, AuthResponse, User } from '@/types/user'

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

export const userService = {
  /**
   * Connexion d'un utilisateur
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await axios.post<AuthResponse>(`${API_URL}/auth/login`, credentials, {
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
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName,
        surname: userData.surname,
        phoneNumber: userData.phoneNumber,
        acceptsNotifications: userData.acceptsNotifications,
        acceptsLocation: userData.acceptsLocation
      }
      
      const response = await axios.post<User>(`${API_URL}/auth/signup`, registerData, {
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
   * Récupérer le profil de l'utilisateur depuis l'API
   */
  async getProfile(): Promise<User> {
    try {
      const token = this.getToken()
      const response = await axios.get<User>(`${API_URL}/auth/users/me`, {
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
