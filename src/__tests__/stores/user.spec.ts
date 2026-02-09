import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

const userServiceMock = {
  getCurrentUser: vi.fn(),
  isAuthenticated: vi.fn(),
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  getProfile: vi.fn(),
}

const isAxiosErrorMock = vi.fn()

vi.mock('@/services/userService', () => ({
  default: userServiceMock,
}))

vi.mock('axios', () => ({
  isAxiosError: isAxiosErrorMock,
}))

describe('user store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('initializes user from local storage', async () => {
    userServiceMock.getCurrentUser.mockReturnValue({ id: 1, role: { name: 'SPECTATOR' } })
    userServiceMock.isAuthenticated.mockReturnValue(true)
    const { useUserStore } = await import('@/stores/user')

    const store = useUserStore()

    expect(store.user?.id).toBe(1)
    expect(store.isAuthenticated).toBe(true)
  })

  it('logs in and stores user', async () => {
    userServiceMock.login.mockResolvedValue({
      user: { id: 2, role: { name: 'ADMIN' } },
    })
    const { useUserStore } = await import('@/stores/user')

    const store = useUserStore()
    const result = await store.login({ email: 'a@b.com', password: 'secret' })

    expect(result.user.id).toBe(2)
    expect(store.user?.id).toBe(2)
    expect(store.isLoading).toBe(false)
    expect(store.error).toBeNull()
  })

  it('sets error on login failure', async () => {
    const error = { response: { data: { message: 'Invalid' } } }
    isAxiosErrorMock.mockReturnValue(true)
    userServiceMock.login.mockRejectedValue(error)
    const { useUserStore } = await import('@/stores/user')

    const store = useUserStore()
    await expect(store.login({ email: 'a@b.com', password: 'bad' })).rejects.toBe(error)

    expect(store.error).toBe('Invalid')
    expect(store.isLoading).toBe(false)
  })

  it('registers a user and returns success', async () => {
    userServiceMock.register.mockResolvedValue({ id: 3 })
    const { useUserStore } = await import('@/stores/user')

    const store = useUserStore()
    const result = await store.register({
      email: 'a@b.com',
      password: 'secret',
      firstName: 'A',
      surname: 'B',
      phoneNumber: '123',
      acceptsNotifications: true,
      acceptsLocation: false,
    })

    expect(result).toEqual({ success: true, user: { id: 3 } })
    expect(store.isLoading).toBe(false)
    expect(store.error).toBeNull()
  })

  it('clears user on logout', async () => {
    userServiceMock.getCurrentUser.mockReturnValue({ id: 1 })
    const { useUserStore } = await import('@/stores/user')

    const store = useUserStore()
    store.logout()

    expect(userServiceMock.logout).toHaveBeenCalled()
    expect(store.user).toBeNull()
  })

  it('does not fetch profile when not authenticated', async () => {
    userServiceMock.isAuthenticated.mockReturnValue(false)
    const { useUserStore } = await import('@/stores/user')

    const store = useUserStore()
    await store.fetchCurrentUser()

    expect(userServiceMock.getProfile).not.toHaveBeenCalled()
  })

  it('clears user on 401 during profile fetch', async () => {
    const error = { response: { status: 401 } }
    userServiceMock.isAuthenticated.mockReturnValue(true)
    userServiceMock.getProfile.mockRejectedValue(error)
    isAxiosErrorMock.mockReturnValue(true)
    const { useUserStore } = await import('@/stores/user')

    const store = useUserStore()
    await store.fetchCurrentUser()

    expect(store.user).toBeNull()
    expect(store.error).toBe('Erreur lors de la récupération du profil')
  })

  it('derives roles and helpers', async () => {
    userServiceMock.getCurrentUser.mockReturnValue({
      role: { name: 'ADMIN' },
      authorities: [{ authority: 'ROLE_EDITOR' }],
    })
    const { useUserStore } = await import('@/stores/user')

    const store = useUserStore()

    expect(store.roles).toEqual(expect.arrayContaining(['ADMIN', 'EDITOR']))
    expect(store.isAdmin).toBe(true)
    expect(store.isSpectator).toBe(false)
    expect(store.hasRole('ADMIN')).toBe(true)
  })
})
