// Types pour l'utilisateur
export interface User {
  id: number
  email: string
  firstName: string
  lastName: string
  role?: 'user' | 'admin' | 'commissaire'
  createdAt?: string
}

// Types pour les requêtes d'authentification
export interface LoginRequest {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterRequest {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
  acceptTerms: boolean
  acceptNotifications?: boolean
  acceptLocation?: boolean
}

// Types pour les réponses d'authentification
export interface AuthResponse {
  user: User
  token: string
  refreshToken?: string
}

export interface ApiError {
  message: string
  code?: string
  status?: number
}
