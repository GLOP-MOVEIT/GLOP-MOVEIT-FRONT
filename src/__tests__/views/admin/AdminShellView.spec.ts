import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import AdminShellView from '@/views/AdminShellView.vue'

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

describe('AdminShellView', () => {
  it('builds menu items with expected routes', () => {
    const wrapper = mount(AdminShellView, { global: { stubs } })
    const vm = wrapper.vm as unknown as { menuItems: Array<{ to?: string }> }

    expect(vm.menuItems).toHaveLength(4)
    expect(vm.menuItems[0].to).toBe('/admin')
    expect(vm.menuItems[1].to).toBe('/admin/users')
  })
})
