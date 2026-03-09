import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ProfileView from '@/views/ProfileView.vue'

const userStoreMock = {
  user: {
    id: 1,
    firstName: 'John',
    surname: 'Doe',
    role: { name: 'SPECTATOR' },
  },
  roles: ['SPECTATOR'],
  isLoading: false,
  error: null,
  fetchCurrentUser: vi.fn(),
  clearError: vi.fn(),
  hasRole: vi.fn(),
}

vi.mock('@/stores/user', () => ({
  useUserStore: () => userStoreMock,
}))

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
    locale: { value: 'fr' },
  }),
}))

const stubs = {
  'v-container': { template: '<div><slot /></div>' },
  'v-row': { template: '<div><slot /></div>' },
  'v-col': { template: '<div><slot /></div>' },
  'v-card': { template: '<div><slot /></div>' },
  'v-chip': { template: '<div><slot /></div>' },
  'v-divider': { template: '<hr />' },
  'v-btn': { template: '<button><slot /></button>' },
  'v-alert': { template: '<div><slot /></div>' },
  'v-progress-circular': { template: '<div></div>' },
}

describe('ProfileView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches current user on mount', () => {
    mount(ProfileView, { global: { stubs } })

    expect(userStoreMock.fetchCurrentUser).toHaveBeenCalled()
  })

  it('hides role request section for admin', () => {
    userStoreMock.hasRole.mockImplementation((role) => role === 'ADMIN')
    const wrapper = mount(ProfileView, { global: { stubs } })
    const vm = wrapper.vm as unknown as { showRoleRequests: boolean }

    expect(vm.showRoleRequests).toBe(false)
  })
})
