import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import AppNavbar from '@/components/AppNavbar.vue'

const pushMock = vi.fn()
const userStoreMock = {
  isAuthenticated: false,
  hasRole: vi.fn(),
  logout: vi.fn(),
}

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}))

vi.mock('@/stores/user', () => ({
  useUserStore: () => userStoreMock,
}))

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}))

const stubs = {
  'v-app-bar': { template: '<div><slot /></div>' },
  'v-app-bar-nav-icon': { template: '<button><slot /></button>' },
  'v-toolbar-title': { template: '<div><slot /></div>' },
  'v-icon': { template: '<i><slot /></i>' },
  'v-spacer': { template: '<div></div>' },
  'v-menu': {
    template: '<div><slot name="activator" :props="{}"></slot><slot /></div>',
  },
  'v-btn': { template: '<button><slot /></button>' },
  'v-list': { template: '<div><slot /></div>' },
  'v-list-item': { template: '<div><slot /></div>' },
  'v-list-item-title': { template: '<div><slot /></div>' },
  'v-divider': { template: '<hr />' },
  'v-navigation-drawer': { template: '<aside><slot /></aside>' },
  'router-link': { template: '<a><slot /></a>' },
  LanguageSwitcher: { template: '<div data-test="language-switcher"></div>' },
}

describe('AppNavbar', () => {
  it('shows login button when user is not authenticated', () => {
    userStoreMock.isAuthenticated = false
    userStoreMock.hasRole.mockReturnValue(false)

    const wrapper = mount(AppNavbar, {
      global: { stubs },
    })

    expect(wrapper.text()).toContain('nav.login')
    expect(wrapper.find('[data-test="language-switcher"]').exists()).toBe(true)
  })

  it('shows profile menu when user is authenticated', () => {
    userStoreMock.isAuthenticated = true
    userStoreMock.hasRole.mockReturnValue(false)

    const wrapper = mount(AppNavbar, {
      global: { stubs },
    })

    expect(wrapper.text()).toContain('nav.profile')
    expect(wrapper.text()).toContain('nav.settings')
    expect(wrapper.text()).toContain('nav.logout')
  })
})
