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
  id?: number
  name: UserRole | string
  description?: string
  createdAt?: string
  updatedAt?: string
}

// Interface pour le profil utilisateur retourné par l'API user-service
export interface UserProfile {
  userId: number
  firstName: string
  surname: string
  email: string
  phoneNumber: string
  language: string
  role: {
    name: string
  }
  acceptsNotifications: boolean
  acceptsLocationSharing: boolean
}

export interface Authority {
  authority: string
}

// Types pour l'utilisateur - compatible avec l'ancienne structure et la nouvelle
export interface User {
  id?: number
  userId?: number  // Nouveau champ de l'API user-service
  email: string
  firstName: string
  surname: string
  phoneNumber?: string
  language?: string
  role?: Role
  createdAt?: string
  updatedAt?: string
  acceptsNotifications?: boolean
  acceptsLocationSharing?: boolean
  acceptsLocation?: boolean
  authorities?: Authority[]
  username?: string
  nickname?: string
}

// Types pour les requêtes d'authentification (correspond aux DTOs du backend)
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

// Interface pour les réponses paginées de l'API
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

