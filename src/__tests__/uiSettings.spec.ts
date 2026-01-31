import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as settingsStorage from '@/services/settingsStorage'
import {
  applyDyslexiaMode,
  applyTextSize,
  applyUiPreferences,
  loadAndApplyUiPreferences,
  readUiPreferences,
  saveUiPreferences,
} from '@/services/uiSettings'

describe('uiSettings', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('applies text size to a root element', () => {
    const root = document.createElement('div')

    applyTextSize(root, 'large')

    expect(root.style.fontSize).toBe('18px')
  })

  it('toggles dyslexia mode class on a root element', () => {
    const root = document.createElement('div')

    applyDyslexiaMode(root, true)
    expect(root.classList.contains('dyslexia-mode')).toBe(true)

    applyDyslexiaMode(root, false)
    expect(root.classList.contains('dyslexia-mode')).toBe(false)
  })

  it('reads UI preferences from settings storage', () => {
    vi.spyOn(settingsStorage, 'loadSettings').mockReturnValue({
      notifications: false,
      location: false,
      textSize: 'small',
      dyslexiaMode: true,
    })

    expect(readUiPreferences()).toEqual({ textSize: 'small', dyslexiaMode: true })
  })

  it('saves UI preferences through settings storage', () => {
    const saveSpy = vi.spyOn(settingsStorage, 'saveSettings').mockImplementation(() => {})

    saveUiPreferences({ textSize: 'normal', dyslexiaMode: false })

    expect(saveSpy).toHaveBeenCalledWith({ textSize: 'normal', dyslexiaMode: false })
  })

  it('applies preferences to document root', () => {
    applyUiPreferences({ textSize: 'large', dyslexiaMode: true })

    expect(document.documentElement.style.fontSize).toBe('18px')
    expect(document.documentElement.classList.contains('dyslexia-mode')).toBe(true)
  })

  it('returns early when document is not available', () => {
    const originalDocument = globalThis.document
    Object.defineProperty(globalThis, 'document', {
      value: undefined,
      configurable: true,
    })

    expect(() => applyUiPreferences({ textSize: 'small', dyslexiaMode: false })).not.toThrow()

    Object.defineProperty(globalThis, 'document', {
      value: originalDocument,
      configurable: true,
    })
  })

  it('loads and applies preferences', () => {
    vi.spyOn(settingsStorage, 'loadSettings').mockReturnValue({
      notifications: true,
      location: true,
      textSize: 'small',
      dyslexiaMode: true,
    })

    const preferences = loadAndApplyUiPreferences()

    expect(preferences).toEqual({ textSize: 'small', dyslexiaMode: true })
    expect(document.documentElement.style.fontSize).toBe('14px')
    expect(document.documentElement.classList.contains('dyslexia-mode')).toBe(true)
  })
})
