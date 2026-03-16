// Enum pour les rôles disponibles
export enum UserRole {
  ADMIN = 'ADMIN',
  SPECTATOR = 'SPECTATOR',
  SPORTIF = 'SPORTIF',
  VOLUNTEER = 'VOLUNTEER',
  REFEREE = 'REFEREE',
}

// Interface pour l'objet Role (API user-service)
export interface Role {
  name: string
}

// Interface User complète (API user-service /users/{id})
export interface User {
  userId: number
  firstName: string
  surname: string
  email: string
  phoneNumber: string
  language: string
  role: Role
  acceptsNotifications: boolean
  acceptsLocationSharing: boolean
}

// Alias pour la réponse du user-service
export type UserProfile = User

// Interface pour le user retourné par /auth/login (structure différente)
export interface AuthUser {
  id: number
  userId: number
  nickname: string
  lastConnectionDate: string
}

// Types pour les requêtes d'authentification
export interface LoginRequest {
  nickname: string
  password: string
}

export interface RegisterRequest {
  nickname: string
  language: string
  email: string
  password: string
  firstName: string
  surname: string
  phoneNumber: string
  acceptsNotifications: boolean
  acceptsLocationSharing: boolean
  confirmPassword?: string
  acceptTerms?: boolean
}

// Réponse de /auth/login
export interface AuthResponse {
  token: string
  expiresIn: number
  user: AuthUser
}

export interface ApiError {
  message: string
  code?: string
  status?: number
}

export interface Pageable {
  offset: number
  pageNumber: number
  pageSize: number
  paged: boolean
  sort: {
    empty: boolean
    sorted: boolean
    unsorted: boolean
  }
  unpaged: boolean
}

export interface PagedResponse<T> {
  content: T[]
  empty: boolean
  first: boolean
  last: boolean
  number: number
  numberOfElements: number
  pageable: Pageable
  size: number
  sort: {
    empty: boolean
    sorted: boolean
    unsorted: boolean
  }
  totalElements: number
  totalPages: number
}
