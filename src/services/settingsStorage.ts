import type { SettingsState } from '@/types/settings'

const STORAGE_KEY = 'userSettings'

const defaultSettings: SettingsState = {
  notifications: false,
  location: false,
  textSize: 'normal',
  dyslexiaMode: false,
}

export const loadSettings = (): SettingsState => {
  if (globalThis.window === undefined) {
    return defaultSettings
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return defaultSettings
    return { ...defaultSettings, ...(JSON.parse(stored) as Partial<SettingsState>) }
  } catch {
    return defaultSettings
  }
}

export const saveSettings = (updates: Partial<SettingsState>) => {
  if (globalThis.window === undefined) {
    return
  }

  const current = loadSettings()
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, ...updates }))
}
