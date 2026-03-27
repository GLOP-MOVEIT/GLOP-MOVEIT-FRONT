import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { isAxiosError } from 'axios'
import userService from '@/services/userService'
import type { User, LoginRequest, RegisterRequest } from '@/types/user'
import { UserRole, matchesUserRole, normalizeUserRoleName } from '@/types/user'

export const useUserStore = defineStore('user', () => {
  // État - Initialiser depuis le localStorage
  const user = ref<User | null>(userService.getCurrentUser())
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => !!user.value && userService.isAuthenticated())
  const userRole = computed(() => user.value?.role?.name || null)
  const isAdmin = computed(() => hasRole(UserRole.ADMIN))
  const isSpectator = computed(() => hasRole(UserRole.SPECTATOR))
  const isReferee = computed(() => hasRole(UserRole.REFEREE))
  const roles = computed(() => {
    const list = new Set<string>()

    if (user.value?.role?.name) {
      list.add(normalizeUserRoleName(user.value.role.name))
    }

    if (list.size === 0) {
      list.add(UserRole.SPECTATOR)
    }

    return Array.from(list)
  })

  const hasRole = (role: UserRole) => roles.value.some((currentRole) => matchesUserRole(currentRole, role))

  const getErrorMessage = (err: unknown, fallback: string) => {
    if (isAxiosError<{ message?: string }>(err)) {
      return err.response?.data?.message || fallback
    }
    return fallback
  }

  // Actions
  async function login(credentials: LoginRequest) {
    isLoading.value = true
    error.value = null

    try {
      const response = await userService.login(credentials)
      user.value = response.user

      await fetchCurrentUser()

      return response
    } catch (err: unknown) {
      error.value = getErrorMessage(err, 'Erreur lors de la connexion')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function register(userData: RegisterRequest) {
    isLoading.value = true
    error.value = null

    try {
      const registeredUser = await userService.register(userData)
      return { success: true, user: registeredUser }
    } catch (err: unknown) {
      error.value = getErrorMessage(err, 'Erreur lors de l\'inscription')
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
      const userData = await userService.getCurrentUserProfile()
      user.value = userData
    } catch (err: unknown) {
      error.value = getErrorMessage(err, 'Erreur lors de la récupération du profil')
      if (isAxiosError(err) && err.response?.status === 401) {
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
    isReferee,
    roles,
    hasRole,
    // Actions
    login,
    register,
    logout,
    fetchCurrentUser,
    clearError,
  }
})
