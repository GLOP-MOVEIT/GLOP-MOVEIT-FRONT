import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import DefaultLayout from '@/layouts/DefaultLayout.vue'

const stubs = {
  'v-app': { template: '<div><slot /></div>' },
  'v-main': { template: '<main><slot /></main>' },
  'v-container': { template: '<div><slot /></div>' },
  AppNavbar: { template: '<div data-test="navbar"></div>' },
  AppFooter: { template: '<div data-test="footer"></div>' },
  'router-view': { template: '<div></div>' },
}

describe('DefaultLayout', () => {
  it('mounts with navbar and footer', () => {
    const wrapper = mount(DefaultLayout, { global: { stubs } })

    expect(wrapper.find('[data-test="navbar"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="footer"]').exists()).toBe(true)
  })
})
