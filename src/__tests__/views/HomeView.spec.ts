import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import HomeView from '@/views/HomeView.vue'

const userStoreMock = {
  isAuthenticated: false,
  hasRole: vi.fn(),
}

vi.mock('@/stores/user', () => ({
  useUserStore: () => userStoreMock,
}))

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}))

const stubs = {
  'v-container': { template: '<div><slot /></div>' },
  'v-row': { template: '<div><slot /></div>' },
  'v-col': { template: '<div><slot /></div>' },
  'v-icon': { template: '<i></i>' },
  'v-btn': { template: '<button><slot /></button>' },
}

describe('HomeView', () => {
  it('computes admin role from store', () => {
    userStoreMock.hasRole.mockImplementation((role) => role === 'ADMIN')
    userStoreMock.isAuthenticated = true
    const wrapper = mount(HomeView, { global: { stubs } })
    const vm = wrapper.vm as unknown as { isAdmin: boolean; isCommissaire: boolean }

    expect(vm.isAdmin).toBe(true)
    expect(vm.isCommissaire).toBe(false)
  })
})
