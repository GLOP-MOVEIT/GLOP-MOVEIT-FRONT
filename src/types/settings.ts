export type TextSize = 'small' | 'normal' | 'large'

export interface UiPreferences {
  textSize: TextSize
  dyslexiaMode: boolean
}

export interface UserPreferences {
  notifications: boolean
  location: boolean
}

export interface SettingsState extends UiPreferences, UserPreferences {}
