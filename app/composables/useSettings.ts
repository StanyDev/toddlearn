import type { Ref } from 'vue'
import type { SettingsState } from '~/types'
import { bool, isObj, num, oneOf, str, usePersistedState } from '~/utils/storage'

export const DEFAULT_SETTINGS: SettingsState = {
  version: 1,
  soundEnabled: true,
  voiceVolume: 1,
  effectsVolume: 0.7,
  speechFallback: true,
  reducedMotion: 'auto',
  parentPin: '',
  roundsPerActivity: 5,
}

function sanitizeSettings(raw: unknown): SettingsState {
  const d = DEFAULT_SETTINGS
  if (!isObj(raw)) return { ...d }
  const pin = str(raw.parentPin, '')
  return {
    version: 1,
    soundEnabled: bool(raw.soundEnabled, d.soundEnabled),
    voiceVolume: num(raw.voiceVolume, d.voiceVolume, 0, 1),
    effectsVolume: num(raw.effectsVolume, d.effectsVolume, 0, 1),
    speechFallback: bool(raw.speechFallback, d.speechFallback),
    reducedMotion: oneOf(raw.reducedMotion, ['auto', 'on', 'off'] as const, d.reducedMotion),
    parentPin: /^\d{4}$/.test(pin) ? pin : '',
    roundsPerActivity: Math.round(num(raw.roundsPerActivity, d.roundsPerActivity, 3, 10)),
  }
}

let state: Ref<SettingsState> | undefined

export function useSettings() {
  state ??= usePersistedState('dinoland:settings', sanitizeSettings)
  const settings = state

  function update(patch: Partial<SettingsState>) {
    settings.value = sanitizeSettings({ ...settings.value, ...patch })
  }

  function reset() {
    settings.value = { ...DEFAULT_SETTINGS }
  }

  return { settings, update, reset }
}
