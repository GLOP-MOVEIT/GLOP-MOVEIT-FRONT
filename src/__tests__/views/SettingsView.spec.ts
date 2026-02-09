import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import SettingsView from '@/views/SettingsView.vue'

const loadSettingsMock = vi.hoisted(() => vi.fn())
const saveSettingsMock = vi.hoisted(() => vi.fn())
const applyUiPreferencesMock = vi.hoisted(() => vi.fn())
const saveUiPreferencesMock = vi.hoisted(() => vi.fn())

vi.mock('@/services/settingsStorage', () => ({
  loadSettings: loadSettingsMock,
  saveSettings: saveSettingsMock,
}))

vi.mock('@/services/uiSettings', () => ({
  applyUiPreferences: applyUiPreferencesMock,
  saveUiPreferences: saveUiPreferencesMock,
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
  'v-form': { template: '<form><slot /></form>' },
  'v-switch': { template: '<input type="checkbox" />' },
  'v-select': { template: '<select></select>' },
  'v-text-field': { template: '<input />' },
  'v-alert': { template: '<div><slot /></div>' },
  'v-btn': { template: '<button><slot /></button>' },
}

describe('SettingsView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    loadSettingsMock.mockReturnValue({
      notifications: false,
      location: false,
      textSize: 'normal',
      dyslexiaMode: false,
    })
  })

  it('hydrates settings on mount', () => {
    mount(SettingsView, { global: { stubs } })

    expect(loadSettingsMock).toHaveBeenCalled()
    expect(applyUiPreferencesMock).toHaveBeenCalledWith({
      textSize: 'normal',
      dyslexiaMode: false,
    })
  })

  it('prevents save when passwords mismatch', () => {
    const wrapper = mount(SettingsView, { global: { stubs } })
    const vm = wrapper.vm as unknown as {
      formState: { password: string; confirmPassword: string }
      saveSettings: () => void
      infoMessage: string
    }

    vm.formState.password = 'one'
    vm.formState.confirmPassword = 'two'
    vm.saveSettings()

    expect(vm.infoMessage).toBe('settings.passwordMismatch')
    expect(saveSettingsMock).not.toHaveBeenCalled()
  })

  it('saves settings and clears password fields', () => {
    const wrapper = mount(SettingsView, { global: { stubs } })
    const vm = wrapper.vm as unknown as {
      formState: {
        notifications: boolean
        location: boolean
        password: string
        confirmPassword: string
      }
      saveSettings: () => void
      infoMessage: string
    }

    vm.formState.notifications = true
    vm.formState.location = true
    vm.formState.password = ''
    vm.formState.confirmPassword = ''

    vm.saveSettings()

    expect(saveSettingsMock).toHaveBeenCalledWith({
      notifications: true,
      location: true,
    })
    expect(vm.infoMessage).toBe('settings.saved')
    expect(vm.formState.password).toBe('')
    expect(vm.formState.confirmPassword).toBe('')
  })
})
