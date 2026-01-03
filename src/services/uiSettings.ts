import type { TextSize, UiPreferences } from '@/types/settings'
import { loadSettings, saveSettings } from './settingsStorage'

const sizeMap: Record<TextSize, string> = {
  small: '14px',
  normal: '16px',
  large: '18px',
}

export const applyTextSize = (root: HTMLElement, size: TextSize) => {
  root.style.fontSize = sizeMap[size]
}

export const applyDyslexiaMode = (root: HTMLElement, enabled: boolean) => {
  root.classList.toggle('dyslexia-mode', enabled)
}

export const readUiPreferences = (): UiPreferences => {
  const stored = loadSettings()
  return {
    textSize: stored.textSize,
    dyslexiaMode: stored.dyslexiaMode,
  }
}

export const saveUiPreferences = (preferences: UiPreferences) => {
  saveSettings(preferences)
}

export const applyUiPreferences = (preferences: UiPreferences) => {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  applyTextSize(root, preferences.textSize)
  applyDyslexiaMode(root, preferences.dyslexiaMode)
}

export const loadAndApplyUiPreferences = (): UiPreferences => {
  const preferences = readUiPreferences()
  applyUiPreferences(preferences)
  return preferences
}
