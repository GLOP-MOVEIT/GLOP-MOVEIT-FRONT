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
  it('renders current year and footer links', () => {
    const currentYear = new Date().getFullYear()
    const wrapper = mount(AppFooter, { global: { stubs } })

    expect(wrapper.text()).toContain(`© ${currentYear}`)
    expect(wrapper.text()).toContain('footer.rightsReserved')
    expect(wrapper.text()).toContain('footer.legal')
    expect(wrapper.text()).toContain('footer.privacy')
    expect(wrapper.text()).toContain('footer.contact')
  })
})
