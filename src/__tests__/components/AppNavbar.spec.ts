import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import AppNavbar from '@/components/AppNavbar.vue'

const userStoreMock = vi.hoisted(() => ({
  isAuthenticated: false,
  hasRole: vi.fn(),
  logout: vi.fn(),
}))

vi.mock('@/stores/user', () => ({
  useUserStore: () => userStoreMock,
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
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
  'v-menu': { template: '<div><slot name="activator" :props="{}"></slot><slot /></div>' },
  'v-btn': { template: '<button><slot /></button>' },
  'v-list': { template: '<div><slot /></div>' },
  'v-list-item': { template: '<div><slot /></div>' },
  'v-list-item-title': { template: '<div><slot /></div>' },
  'v-divider': { template: '<hr />' },
  'v-navigation-drawer': { template: '<aside><slot /></aside>' },
  'router-link': { template: '<a><slot /></a>' },
  LanguageSwitcher: { template: '<div></div>' },
}

describe('AppNavbar', () => {
  it('mounts and renders the app title', () => {
    const wrapper = mount(AppNavbar, { global: { stubs } })

    expect(wrapper.text()).toContain('CiblOrgaSport')
  })
})
