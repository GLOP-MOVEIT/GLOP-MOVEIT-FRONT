import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import LoginView from '@/views/LoginView.vue'

const pushMock = vi.hoisted(() => vi.fn())
const userStoreMock = vi.hoisted(() => ({
  login: vi.fn(),
  register: vi.fn(),
}))
const isAxiosErrorMock = vi.hoisted(() => vi.fn())

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}))

vi.mock('@/stores/user', () => ({
  useUserStore: () => userStoreMock,
}))

vi.mock('axios', () => ({
  isAxiosError: isAxiosErrorMock,
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
  'v-card-item': { template: '<div><slot /></div>' },
  'v-card-title': { template: '<div><slot /></div>' },
  'v-card-subtitle': { template: '<div><slot /></div>' },
  'v-card-text': { template: '<div><slot /></div>' },
  'v-card-actions': { template: '<div><slot /></div>' },
  'v-icon': { template: '<i></i>' },
  'v-form': { template: '<form><slot /></form>' },
  'v-text-field': { template: '<input />' },
  'v-checkbox': { template: '<input type="checkbox" />' },
  'v-btn': { template: '<button><slot /></button>' },
  'v-divider': { template: '<hr />' },
  'v-alert': { template: '<div><slot /></div>' },
  LanguageSwitcher: { template: '<div></div>' },
  ForgotPasswordDialog: { template: '<div></div>' },
}

describe('LoginView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    globalThis.alert = vi.fn()
  })

  it('logs in and redirects on success', async () => {
    userStoreMock.login.mockResolvedValue({})
    const wrapper = mount(LoginView, { global: { stubs } })
    const vm = wrapper.vm as unknown as {
      form: { validate: () => Promise<{ valid: boolean }> }
      email: string
      password: string
      handleLogin: () => Promise<void>
      loading: boolean
    }

    vm.form = { validate: vi.fn().mockResolvedValue({ valid: true }) }
    vm.email = 'john@example.com'
    vm.password = 'secret'

    await vm.handleLogin()

    expect(userStoreMock.login).toHaveBeenCalledWith({
      email: 'john@example.com',
      password: 'secret',
    })
    expect(pushMock).toHaveBeenCalledWith('/')
    expect(vm.loading).toBe(false)
  })

  it('sets error message on login failure', async () => {
    isAxiosErrorMock.mockReturnValue(true)
    userStoreMock.login.mockRejectedValue({ response: { data: { message: 'Invalid' } } })
    const wrapper = mount(LoginView, { global: { stubs } })
    const vm = wrapper.vm as unknown as {
      form: { validate: () => Promise<{ valid: boolean }> }
      email: string
      password: string
      handleLogin: () => Promise<void>
      errorMessage: string
    }

    vm.form = { validate: vi.fn().mockResolvedValue({ valid: true }) }
    vm.email = 'john@example.com'
    vm.password = 'secret'

    await vm.handleLogin()

    expect(vm.errorMessage).toBe('Invalid')
  })

  it('toggles between login and register forms', async () => {
    const wrapper = mount(LoginView, { global: { stubs } })
    const vm = wrapper.vm as unknown as {
      showRegisterForm: boolean
      toggleForm: () => void
    }

    expect(vm.showRegisterForm).toBe(false)
    vm.toggleForm()
    expect(vm.showRegisterForm).toBe(true)
  })

  it('registers and switches back to login form', async () => {
    userStoreMock.register.mockResolvedValue({})
    const wrapper = mount(LoginView, { global: { stubs } })
    const vm = wrapper.vm as unknown as {
      registerForm: { validate: () => Promise<{ valid: boolean }> }
      registerData: {
        firstName: string
        surname: string
        phoneNumber: string
        email: string
        password: string
        confirmPassword: string
        acceptTerms: boolean
        acceptsNotifications: boolean
        acceptsLocation: boolean
      }
      showRegisterForm: boolean
      handleRegister: () => Promise<void>
      email: string
    }

    vm.showRegisterForm = true
    vm.registerForm = { validate: vi.fn().mockResolvedValue({ valid: true }) }
    vm.registerData.firstName = 'John'
    vm.registerData.surname = 'Doe'
    vm.registerData.phoneNumber = '0123456789'
    vm.registerData.email = 'john@example.com'
    vm.registerData.password = 'secret'
    vm.registerData.confirmPassword = 'secret'
    vm.registerData.acceptTerms = true

    await vm.handleRegister()

    expect(userStoreMock.register).toHaveBeenCalled()
    expect(vm.showRegisterForm).toBe(false)
    expect(vm.email).toBe('john@example.com')
  })
})
