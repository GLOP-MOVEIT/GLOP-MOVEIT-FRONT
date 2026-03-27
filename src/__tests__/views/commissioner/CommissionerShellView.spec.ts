import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import CommissionerShellView from '@/views/CommissionerShellView.vue'

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}))

const stubs = {
  'v-container': { template: '<div><slot /></div>' },
  AdminLayout: { template: '<div><slot /></div>' },
  'router-view': { template: '<div></div>' },
}

describe('CommissionerShellView', () => {
  it('builds menu items with expected routes', () => {
    const wrapper = mount(CommissionerShellView, { global: { stubs } })
    const vm = wrapper.vm as unknown as { menuItems: Array<{ to?: string }> }

    expect(vm.menuItems).toHaveLength(4)
    expect(vm.menuItems[0].to).toBe('/referee')
    expect(vm.menuItems[1].to).toBe('/referee/demandes')
    expect(vm.menuItems[2].to).toBe('/referee/taches')
    expect(vm.menuItems[3].to).toBe('/referee/resultats')
  })
})
