import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import AboutView from '@/views/AboutView.vue'

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
  'v-card-text': { template: '<div><slot /></div>' },
  'v-icon': { template: '<i></i>' },
  'v-divider': { template: '<hr />' },
}

describe('AboutView', () => {
  it('mounts and renders headline', () => {
    const wrapper = mount(AboutView, { global: { stubs } })

    expect(wrapper.text()).toContain('CiblOrgaSport')
  })
})
