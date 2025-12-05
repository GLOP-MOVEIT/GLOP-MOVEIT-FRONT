import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import userService from '@/services/userService'
import type { User, LoginRequest, RegisterRequest } from '@/types/user'
import { UserRole } from '@/types/user'

export const useUserStore = defineStore('user', () => {
  // État - Initialiser depuis le localStorage
  const user = ref<User | null>(userService.getCurrentUser())
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => !!user.value && userService.isAuthenticated())
  const userRole = computed(() => user.value?.role?.name || null)
  const isAdmin = computed(() => user.value?.role?.name === UserRole.ADMIN)
  const isSpectator = computed(() => user.value?.role?.name === UserRole.SPECTATOR)

  // Actions
  async function login(credentials: LoginRequest) {
    isLoading.value = true
    error.value = null

    try {
      const response = await userService.login(credentials)
      user.value = response.user
      return response
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erreur lors de la connexion'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function register(userData: RegisterRequest) {
    isLoading.value = true
    error.value = null

    try {
      // Le backend Spring Boot ne retourne que l'utilisateur, pas de token
      const registeredUser = await userService.register(userData)
      // On ne connecte pas automatiquement l'utilisateur après l'inscription
      // Il devra se connecter manuellement
      return { success: true, user: registeredUser }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erreur lors de l\'inscription'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  function logout() {
    userService.logout()
    user.value = null
  }

  async function fetchCurrentUser() {
    if (!userService.isAuthenticated()) {
      return
    }

    isLoading.value = true
    error.value = null

    try {
      const userData = await userService.getCurrentUser()
      user.value = userData
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erreur lors de la récupération du profil'
      // Si erreur 401, le token est invalide
      if (err.response?.status === 401) {
        user.value = null
      }
    } finally {
      isLoading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  return {
    // State
    user,
    isLoading,
    error,
    // Getters
    isAuthenticated,
    userRole,
    isAdmin,
    isSpectator,
    // Actions
    login,
    register,
    logout,
    fetchCurrentUser,
    clearError,
  }
})
