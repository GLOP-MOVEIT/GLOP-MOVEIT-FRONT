import { beforeEach, describe, expect, it, vi } from 'vitest'
import { loadSettings, saveSettings } from '@/services/settingsStorage.ts'

const defaultSettings = {
  notifications: false,
  location: false,
  textSize: 'normal',
  dyslexiaMode: false,
}

describe('settingsStorage', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('returns default settings when nothing is stored', () => {
    expect(loadSettings()).toEqual(defaultSettings)
  })

  it('merges stored settings with defaults', () => {
    localStorage.setItem('userSettings', JSON.stringify({ notifications: true }))

    expect(loadSettings()).toEqual({ ...defaultSettings, notifications: true })
  })

  it('returns defaults when stored settings are invalid JSON', () => {
    localStorage.setItem('userSettings', '{not-valid-json')

    expect(loadSettings()).toEqual(defaultSettings)
  })

  it('saves updates merged with current settings', () => {
    localStorage.setItem('userSettings', JSON.stringify({ notifications: true }))

    saveSettings({ textSize: 'large' })

    expect(localStorage.getItem('userSettings')).toBe(
      JSON.stringify({ ...defaultSettings, notifications: true, textSize: 'large' }),
    )
  })

  it('returns defaults when window is not available', async () => {
    const originalWindow = globalThis.window
    Object.defineProperty(globalThis, 'window', {
      value: undefined,
      configurable: true,
    })

    expect(loadSettings()).toEqual(defaultSettings)

    Object.defineProperty(globalThis, 'window', {
      value: originalWindow,
      configurable: true,
    })
  })

  it('does not write when window is not available', () => {
    const originalWindow = globalThis.window
    Object.defineProperty(globalThis, 'window', {
      value: undefined,
      configurable: true,
    })

    saveSettings({ notifications: true })

    Object.defineProperty(globalThis, 'window', {
      value: originalWindow,
      configurable: true,
    })

    expect(localStorage.getItem('userSettings')).toBeNull()
  })
})
