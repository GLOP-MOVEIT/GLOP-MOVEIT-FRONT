import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'
import RoleRequestView from '@/views/RoleRequestView.vue'
import { useUserStore } from '@/stores/user'

const routeParams = { role: 'sportif' }
const roleRequestServiceMocks = vi.hoisted(() => ({
  requestAthletePromotion: vi.fn(),
  requestVolunteerPromotion: vi.fn(),
}))
const roleRequestStateMocks = vi.hoisted(() => ({
  getRoleRequestState: vi.fn(() => null),
  markRoleRequestSubmitted: vi.fn(),
}))

vi.mock('vue-router', () => ({
  useRoute: () => ({
    params: routeParams,
  }),
}))

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}))

vi.mock('@/services/roleRequestService', () => ({
  requestAthletePromotion: roleRequestServiceMocks.requestAthletePromotion,
  requestVolunteerPromotion: roleRequestServiceMocks.requestVolunteerPromotion,
}))

vi.mock('@/services/roleRequestState', () => ({
  getRoleRequestState: roleRequestStateMocks.getRoleRequestState,
  markRoleRequestSubmitted: roleRequestStateMocks.markRoleRequestSubmitted,
}))

const stubs = {
  'v-container': { template: '<div><slot /></div>' },
  'v-row': { template: '<div><slot /></div>' },
  'v-col': { template: '<div><slot /></div>' },
  'v-card': { template: '<div><slot /></div>' },
  'v-icon': { template: '<i></i>' },
  'v-alert': { template: '<div><slot /></div>' },
  'v-form': { template: '<form><slot /></form>' },
  'v-list': { template: '<div><slot /></div>' },
  'v-list-item': { template: '<div><slot /></div>' },
  'v-list-item-title': { template: '<div><slot /></div>' },
  'v-textarea': { template: '<textarea />' },
  'v-checkbox': { template: '<input type="checkbox" />' },
  'v-btn': { template: '<button><slot /></button>' },
  'v-divider': { template: '<hr />' },
}

describe('RoleRequestView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    routeParams.role = 'sportif'
    setActivePinia(createPinia())

    const userStore = useUserStore()
    userStore.user = {
      userId: 1,
      nickname: 'test-user',
      email: 'test@example.com',
      role: { name: 'SPECTATOR' },
    } as never
  })

  it('sets sportif mode when role is SPORTIF', () => {
    const wrapper = mount(RoleRequestView, { global: { stubs } })
    const vm = wrapper.vm as unknown as { isSportif: boolean; isSupportedRole: boolean }

    expect(vm.isSportif).toBe(true)
    expect(vm.isSupportedRole).toBe(true)
  })

  it('submits sportif request when form validates', async () => {
    const wrapper = mount(RoleRequestView, { global: { stubs } })
    const vm = wrapper.vm as unknown as {
      sportifForm: { validate: () => Promise<{ valid: boolean }> }
      submitSportif: () => Promise<void>
      successMessage: string
      alreadySubmitted: boolean
    }

    vm.sportifForm = { validate: vi.fn().mockResolvedValue({ valid: true }) }

    await vm.submitSportif()

    expect(roleRequestServiceMocks.requestAthletePromotion).toHaveBeenCalledWith(1)
    expect(roleRequestStateMocks.markRoleRequestSubmitted).toHaveBeenCalledWith(1, 'SPORTIF')
    expect(vm.successMessage).toBe('roleRequest.successSportif')
    expect(vm.alreadySubmitted).toBe(false)
  })

  it('returns requested role label when unsupported', () => {
    routeParams.role = 'unknown'

    const wrapper = mount(RoleRequestView, { global: { stubs } })
    const vm = wrapper.vm as unknown as { roleLabel: string; isSupportedRole: boolean }

    expect(vm.isSupportedRole).toBe(false)
    expect(vm.roleLabel).toBe('UNKNOWN')
  })
})
