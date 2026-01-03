export type UiPreferences = {
  textSize: 'small' | 'normal' | 'large'
  dyslexiaMode: boolean
}

const STORAGE_KEY = 'userSettings'

const defaultPreferences: UiPreferences = {
  textSize: 'normal',
  dyslexiaMode: false,
}

export const getUiPreferencesFromSettings = (): UiPreferences => {
  if (typeof window === 'undefined') {
    return defaultPreferences
  }

  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) {
    return defaultPreferences
  }

  try {
    const parsed = JSON.parse(stored)
    return {
      textSize: parsed.textSize || defaultPreferences.textSize,
      dyslexiaMode: Boolean(parsed.dyslexiaMode),
    }
  } catch {
    return defaultPreferences
  }
}

export const applyUiPreferences = (preferences: UiPreferences) => {
  if (typeof document === 'undefined') {
    return
  }

  const root = document.documentElement
  const sizeMap: Record<UiPreferences['textSize'], string> = {
    small: '14px',
    normal: '16px',
    large: '18px',
  }

  root.style.fontSize = sizeMap[preferences.textSize]
  root.classList.toggle('dyslexia-mode', preferences.dyslexiaMode)
}
