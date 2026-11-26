import { ref, watch } from 'vue'
import { ENCOURAGE_KEYS, PRAISE_KEYS, SFX_FILES } from '~/data/audio'
import { VOICE_CATALOG, voicePath } from '~/data/voice'
import { playSynth, type SfxName } from '~/utils/synth'
import { pick } from '~/utils/random'

/**
 * Shared audio engine.
 *
 * Voice clips and recorded effects are decoded into Web Audio buffers and
 * played through one AudioContext. This keeps sequences ("Find the number"
 * + "seven") gapless and works on iOS once the first tap unlocks audio.
 * Missing clips fall back to speech synthesis (if enabled in settings).
 */

let ctx: AudioContext | undefined
let voiceGain: GainNode | undefined
let sfxGain: GainNode | undefined
let initialised = false

const buffers = new Map<string, Promise<AudioBuffer | null>>()
const speaking = ref(false)
const unlocked = ref(false)

let sequenceToken = 0
let stopCurrent: (() => void) | undefined

function getCtx(): AudioContext | undefined {
  if (ctx) return ctx
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AC) return undefined
  ctx = new AC()
  voiceGain = ctx.createGain()
  sfxGain = ctx.createGain()
  voiceGain.connect(ctx.destination)
  sfxGain.connect(ctx.destination)
  applyVolumes()
  return ctx
}

function applyVolumes() {
  const { settings } = useSettings()
  const s = settings.value
  if (voiceGain) voiceGain.gain.value = s.soundEnabled ? s.voiceVolume : 0
  if (sfxGain) sfxGain.gain.value = s.soundEnabled ? s.effectsVolume : 0
}

function init() {
  if (initialised) return
  initialised = true
  const { settings } = useSettings()
  watch(settings, applyVolumes, { deep: true })
  // Browsers only allow audio after a user gesture: unlock on the first one.
  const unlock = () => {
    const c = getCtx()
    if (c && c.state !== 'running') void c.resume()
    unlocked.value = true
  }
  window.addEventListener('pointerdown', unlock, { capture: true })
  window.addEventListener('keydown', unlock, { capture: true })
}

/** Prefix a public-folder path with the app's base URL (e.g. `/toddlearn/`). */
const withBaseURL = (path: string) => useRuntimeConfig().app.baseURL.replace(/\/$/, '') + path

function loadBuffer(path: string): Promise<AudioBuffer | null> {
  const url = withBaseURL(path)
  let p = buffers.get(url)
  if (!p) {
    p = fetch(url)
      .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(String(r.status)))))
      .then((data) => {
        const c = getCtx()
        if (!c) return null
        return new Promise<AudioBuffer>((resolve, reject) => c.decodeAudioData(data, resolve, reject))
      })
      .catch(() => null)
    buffers.set(url, p)
  }
  return p
}

function playBuffer(buf: AudioBuffer, out: AudioNode, track = true): Promise<void> {
  const c = getCtx()!
  return new Promise((resolve) => {
    const src = c.createBufferSource()
    src.buffer = buf
    src.connect(out)
    let done = false
    const finish = () => {
      if (done) return
      done = true
      clearTimeout(guard)
      resolve()
    }
    // If the context is still locked the clip never "ends": don't hang.
    const guard = setTimeout(finish, buf.duration * 1000 + 800)
    src.onended = finish
    if (track) stopCurrent = () => {
      try {
        src.stop()
      } catch {
        /* already stopped */
      }
      finish()
    }
    src.start()
  })
}

function speakFallback(key: string): Promise<void> {
  const { settings } = useSettings()
  const text = VOICE_CATALOG[key]
  if (!text || !settings.value.speechFallback || !('speechSynthesis' in window)) return Promise.resolve()
  return new Promise((resolve) => {
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'en-US'
    u.rate = 0.9
    u.pitch = 1.15
    u.volume = settings.value.voiceVolume
    const voice = speechSynthesis.getVoices().find((v) => v.lang.startsWith('en'))
    if (voice) u.voice = voice
    const guard = setTimeout(resolve, 6000)
    u.onend = u.onerror = () => {
      clearTimeout(guard)
      resolve()
    }
    stopCurrent = () => {
      speechSynthesis.cancel()
      clearTimeout(guard)
      resolve()
    }
    speechSynthesis.speak(u)
  })
}

async function playVoiceClip(key: string, token: number) {
  if (token !== sequenceToken) return
  const buf = await loadBuffer(voicePath(key))
  if (token !== sequenceToken) return
  if (buf && voiceGain) await playBuffer(buf, voiceGain)
  else await speakFallback(key)
}

export function useAudio() {
  init()
  const { settings } = useSettings()

  /** Stop whatever is being said. */
  function stop() {
    sequenceToken++
    stopCurrent?.()
    stopCurrent = undefined
    speaking.value = false
  }

  /**
   * Say one or more voice clips in order, interrupting anything already
   * playing. Resolves when finished (or when interrupted).
   */
  async function say(keys: string | string[]) {
    const list = (Array.isArray(keys) ? keys : [keys]).filter(Boolean)
    stop()
    if (!settings.value.soundEnabled || !list.length) return
    getCtx()
    const token = sequenceToken
    speaking.value = true
    for (const key of list) {
      await playVoiceClip(key, token)
      if (token !== sequenceToken) return
    }
    if (token === sequenceToken) speaking.value = false
  }

  /** Play a sound effect (never interrupts the voice). */
  async function sfx(name: SfxName) {
    if (!settings.value.soundEnabled) return
    const c = getCtx()
    if (!c || !sfxGain) return
    const file = SFX_FILES[name]
    if (file) {
      const buf = await loadBuffer(file)
      if (buf) {
        void playBuffer(buf, sfxGain, false)
        return
      }
    }
    playSynth(c, sfxGain, name)
  }

  /** Warm the cache so the next clips start instantly. */
  function preload(keys: string[]) {
    for (const k of keys) void loadBuffer(voicePath(k))
  }

  const praise = () => pick(PRAISE_KEYS)
  const encourage = () => pick(ENCOURAGE_KEYS)

  return { say, sfx, stop, preload, praise, encourage, speaking, unlocked }
}
