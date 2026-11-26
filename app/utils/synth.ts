/**
 * Tiny Web Audio synthesiser for DinoLand's sound effects.
 *
 * Effects are generated in code so they work offline with zero assets and
 * always sound soft and friendly (no harsh "wrong" buzzers). A recorded file
 * can replace any effect via SFX_FILES in data/audio.ts.
 */
export type SfxName =
  | 'tap'
  | 'correct'
  | 'tryAgain'
  | 'pop'
  | 'reward'
  | 'star'
  | 'flip'
  | 'drop'
  | 'splash'
  | 'munch'
  | 'whoosh'
  | 'block'
  | 'vroom'
  | 'sparkle'

const NOTE = (semitonesFromA4: number) => 440 * Math.pow(2, semitonesFromA4 / 12)
const C5 = NOTE(3)
const E5 = NOTE(7)
const G5 = NOTE(10)
const C6 = NOTE(15)
const E6 = NOTE(19)
const G6 = NOTE(22)

function tone(
  ctx: AudioContext,
  out: AudioNode,
  { freq, to, start = 0, dur = 0.15, type = 'sine', vol = 0.4 }: { freq: number; to?: number; start?: number; dur?: number; type?: OscillatorType; vol?: number },
) {
  const t = ctx.currentTime + start
  const osc = ctx.createOscillator()
  const g = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t)
  if (to) osc.frequency.exponentialRampToValueAtTime(to, t + dur)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(vol, t + 0.012)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  osc.connect(g).connect(out)
  osc.start(t)
  osc.stop(t + dur + 0.05)
}

let noiseBuffer: AudioBuffer | undefined
function noise(
  ctx: AudioContext,
  out: AudioNode,
  { start = 0, dur = 0.2, vol = 0.3, filter = 'bandpass', freq = 1200, to, q = 1 }: { start?: number; dur?: number; vol?: number; filter?: BiquadFilterType; freq?: number; to?: number; q?: number },
) {
  if (!noiseBuffer || noiseBuffer.sampleRate !== ctx.sampleRate) {
    noiseBuffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate)
    const data = noiseBuffer.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  }
  const t = ctx.currentTime + start
  const src = ctx.createBufferSource()
  src.buffer = noiseBuffer
  const f = ctx.createBiquadFilter()
  f.type = filter
  f.Q.value = q
  f.frequency.setValueAtTime(freq, t)
  if (to) f.frequency.exponentialRampToValueAtTime(to, t + dur)
  const g = ctx.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(vol, t + 0.01)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  src.connect(f).connect(g).connect(out)
  src.start(t)
  src.stop(t + dur + 0.05)
}

export function playSynth(ctx: AudioContext, out: AudioNode, name: SfxName) {
  switch (name) {
    case 'tap':
      tone(ctx, out, { freq: 720, to: 900, dur: 0.08, vol: 0.25 })
      break
    case 'correct':
      ;[C5, E5, G5, C6].forEach((f, i) => tone(ctx, out, { freq: f, start: i * 0.08, dur: 0.22, type: 'triangle', vol: 0.35 }))
      tone(ctx, out, { freq: E6, start: 0.34, dur: 0.35, vol: 0.15 })
      break
    case 'tryAgain':
      // A soft, bouncy "boing" — playful, never a buzzer.
      tone(ctx, out, { freq: 330, to: 520, dur: 0.16, vol: 0.25 })
      tone(ctx, out, { freq: 520, to: 392, start: 0.16, dur: 0.22, vol: 0.2 })
      break
    case 'pop':
      noise(ctx, out, { dur: 0.08, vol: 0.5, freq: 1800, q: 0.8 })
      tone(ctx, out, { freq: 900, to: 220, dur: 0.12, vol: 0.3 })
      break
    case 'reward':
      ;[C5, E5, G5, C6, E6, G6].forEach((f, i) => tone(ctx, out, { freq: f, start: i * 0.09, dur: 0.3, type: 'triangle', vol: 0.3 }))
      ;[0, 0.12, 0.24].forEach((s) => tone(ctx, out, { freq: C6 * 2, start: 0.6 + s, dur: 0.25, vol: 0.12 }))
      break
    case 'star':
      tone(ctx, out, { freq: 1320, dur: 0.12, vol: 0.2 })
      tone(ctx, out, { freq: 1760, start: 0.07, dur: 0.2, vol: 0.18 })
      break
    case 'sparkle':
      ;[0, 0.06, 0.12, 0.18].forEach((s, i) => tone(ctx, out, { freq: 1500 + i * 260, start: s, dur: 0.14, vol: 0.12 }))
      break
    case 'flip':
      noise(ctx, out, { dur: 0.12, vol: 0.25, freq: 2500, to: 800, q: 0.6 })
      break
    case 'whoosh':
      noise(ctx, out, { dur: 0.35, vol: 0.25, freq: 400, to: 2400, q: 0.7 })
      break
    case 'drop':
      tone(ctx, out, { freq: 220, to: 70, dur: 0.18, vol: 0.45 })
      break
    case 'block':
      tone(ctx, out, { freq: 600, to: 420, dur: 0.09, type: 'square', vol: 0.12 })
      tone(ctx, out, { freq: 160, to: 90, dur: 0.12, vol: 0.35 })
      break
    case 'splash':
      noise(ctx, out, { dur: 0.45, vol: 0.35, filter: 'lowpass', freq: 3000, to: 300 })
      break
    case 'munch':
      ;[0, 0.14, 0.28].forEach((s) => noise(ctx, out, { start: s, dur: 0.09, vol: 0.4, filter: 'lowpass', freq: 900 }))
      break
    case 'vroom':
      tone(ctx, out, { freq: 70, to: 180, dur: 0.6, type: 'sawtooth', vol: 0.12 })
      tone(ctx, out, { freq: 140, to: 260, dur: 0.6, type: 'triangle', vol: 0.12 })
      break
  }
}
