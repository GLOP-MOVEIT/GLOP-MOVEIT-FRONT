// Enum pour les rôles disponibles
export enum UserRole {
  ADMIN = 'ADMIN',
  SPECTATOR = 'SPECTATOR',
  SPORTIF = 'SPORTIF',
  VOLUNTEER = 'VOLUNTEER',
  COMMISSIONER = 'COMMISSIONER',
}

// Interface pour l'objet role complet du backend
export interface Role {
  id: number
  name: UserRole
  description?: string
  createdAt?: string
  updatedAt?: string
}

export interface Authority {
  authority: string
}

// Types pour l'utilisateur 
export interface User {
  id: number
  email: string
  firstName: string
  surname: string
  phoneNumber?: string
  role?: Role
  createdAt?: string
  updatedAt?: string
  acceptsNotifications?: boolean
  acceptsLocation?: boolean
  authorities?: Authority[]
  username?: string
}

// Types pour les requêtes d'authentification (correspond aux DTOs du backend)
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  firstName: string
  surname: string
  phoneNumber: string
  acceptsNotifications: boolean
  acceptsLocation: boolean
  confirmPassword?: string
  acceptTerms?: boolean
}

// Types pour les réponses d'authentification (correspond à LoginResponse du backend)
export interface AuthResponse {
  user: User
  token: string
  expiresIn: number
}

export interface ApiError {
  message: string
  code?: string
  status?: number
}
