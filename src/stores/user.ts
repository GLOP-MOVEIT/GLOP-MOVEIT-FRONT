import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import userService from '@/services/userService'
import type { User, LoginRequest, RegisterRequest } from '@/types/user'

export const useUserStore = defineStore('user', () => {
  // État
  const user = ref<User | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => !!user.value)
  const userRole = computed(() => user.value?.role || null)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isCommissaire = computed(() => user.value?.role === 'commissaire')

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
      const response = await userService.register(userData)
      user.value = response.user
      return response
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erreur lors de l\'inscription'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function logout() {
    isLoading.value = true
    error.value = null

    try {
      await userService.logout()
      user.value = null
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erreur lors de la déconnexion'
      console.error('Logout error:', err)
    } finally {
      isLoading.value = false
    }
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
    isCommissaire,
    // Actions
    login,
    register,
    logout,
    fetchCurrentUser,
    clearError,
  }
})
