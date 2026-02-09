import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import AppFooter from '@/components/AppFooter.vue'

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}))

const stubs = {
  'v-footer': { template: '<footer><slot /></footer>' },
  'v-container': { template: '<div><slot /></div>' },
  'v-row': { template: '<div><slot /></div>' },
  'v-col': { template: '<div><slot /></div>' },
  'v-btn': { template: '<button><slot /></button>' },
}

describe('AppFooter', () => {
  it('mounts and renders footer copy', () => {
    const wrapper = mount(AppFooter, { global: { stubs } })

    expect(wrapper.text()).toContain('CiblOrgaSport')
    expect(wrapper.text()).toContain('footer.rightsReserved')
  })
})
