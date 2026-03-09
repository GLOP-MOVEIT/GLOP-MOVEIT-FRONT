import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import RoleRequestView from '@/views/RoleRequestView.vue'

const routeParams = { role: 'sportif' }

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

const stubs = {
  'v-container': { template: '<div><slot /></div>' },
  'v-row': { template: '<div><slot /></div>' },
  'v-col': { template: '<div><slot /></div>' },
  'v-card': { template: '<div><slot /></div>' },
  'v-icon': { template: '<i></i>' },
  'v-alert': { template: '<div><slot /></div>' },
  'v-form': { template: '<form><slot /></form>' },
  'v-file-input': { template: '<input type="file" />' },
  'v-checkbox': { template: '<input type="checkbox" />' },
  'v-btn': { template: '<button><slot /></button>' },
  'v-divider': { template: '<hr />' },
}

describe('RoleRequestView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    routeParams.role = 'sportif'
  })

  it('sets sportif mode when role is SPORTIF', () => {
    const wrapper = mount(RoleRequestView, { global: { stubs } })
    const vm = wrapper.vm as unknown as { isSportif: boolean; isSupportedRole: boolean }

    expect(vm.isSportif).toBe(true)
    expect(vm.isSupportedRole).toBe(true)
  })

  it('shows placeholder info when sportif form validates', async () => {
    const wrapper = mount(RoleRequestView, { global: { stubs } })
    const vm = wrapper.vm as unknown as {
      sportifForm: { validate: () => Promise<{ valid: boolean }> }
      submitSportif: () => Promise<void>
      infoMessage: string
    }

    vm.sportifForm = { validate: vi.fn().mockResolvedValue({ valid: true }) }

    await vm.submitSportif()

    expect(vm.infoMessage).toBe('roleRequest.placeholderSubmit')
  })

  it('returns requested role label when unsupported', async () => {
    routeParams.role = 'unknown'
    vi.resetModules()
    const { default: FreshRoleRequestView } = await import('@/views/RoleRequestView.vue')

    const wrapper = mount(FreshRoleRequestView, { global: { stubs } })
    const vm = wrapper.vm as unknown as { roleLabel: string; isSupportedRole: boolean }

    expect(vm.isSupportedRole).toBe(false)
    expect(vm.roleLabel).toBe('UNKNOWN')
  })
})
