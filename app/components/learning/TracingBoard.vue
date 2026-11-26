<script setup lang="ts">
import { GLYPH_HEIGHT, GLYPH_STROKES, GLYPH_WIDTH } from '~/data/glyphs'

/**
 * Finger tracing on SVG.
 *
 * Every stroke is sampled into checkpoints. The child must start near the
 * pulsing dot and follow the path in order; the stroke fills with colour as
 * they go. Generous hit radius, no failing — lifting the finger keeps progress.
 */
const props = withDefaults(defineProps<{ glyphs: string[]; color?: string }>(), { color: '#FF7FA1' })
const emit = defineEmits<{ complete: []; stroke: [index: number] }>()
const audio = useAudio()

const PAD = 12
const HIT = 15
const STEP = 5

interface Stroke { d: string; dx: number }
const strokes = computed<Stroke[]>(() =>
  props.glyphs.flatMap((g, i) => (GLYPH_STROKES[g] ?? []).map((d) => ({ d, dx: i * GLYPH_WIDTH }))),
)
const viewBox = computed(() => `${-PAD} ${-PAD + 5} ${props.glyphs.length * GLYPH_WIDTH + PAD * 2} ${GLYPH_HEIGHT + PAD * 2 - 5}`)

const svg = ref<SVGSVGElement | null>(null)
const pathEls = ref<SVGPathElement[]>([])
const checkpoints = ref<{ x: number; y: number }[][]>([])
const lengths = ref<number[]>([])

const current = ref(0)
const reached = ref(0)
const drawing = ref(false)
const trail = ref<string>('')
const done = ref(false)
const nudge = ref(0)
let lastNudge = 0

function measure() {
  checkpoints.value = pathEls.value.map((el, i) => {
    const len = el.getTotalLength()
    const n = Math.max(2, Math.ceil(len / STEP))
    const dx = strokes.value[i]!.dx
    return Array.from({ length: n + 1 }, (_, k) => {
      const p = el.getPointAtLength((len * k) / n)
      return { x: p.x + dx, y: p.y }
    })
  })
  lengths.value = pathEls.value.map((el) => el.getTotalLength())
}

function reset() {
  current.value = 0
  reached.value = 0
  drawing.value = false
  trail.value = ''
  done.value = false
  nextTick(measure)
}
watch(() => props.glyphs.join(''), reset)
onMounted(() => nextTick(measure))

const cps = computed(() => checkpoints.value[current.value] ?? [])
const progress = computed(() => (cps.value.length > 1 ? reached.value / (cps.value.length - 1) : 0))
const start = computed(() => cps.value[0])
const arrow = computed(() => {
  const pts = cps.value
  if (pts.length < 3) return null
  const a = pts[0]!
  const b = pts[Math.min(3, pts.length - 1)]!
  return { x: a.x, y: a.y, angle: (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI }
})

function toSvg(e: PointerEvent) {
  const el = svg.value!
  const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(el.getScreenCTM()!.inverse())
  return { x: pt.x, y: pt.y }
}
const dist = (a: { x: number; y: number }, b: { x: number; y: number }) => Math.hypot(a.x - b.x, a.y - b.y)

function down(e: PointerEvent) {
  if (done.value || !cps.value.length) return
  const p = toSvg(e)
  // Resume anywhere close to where the child got to.
  const near = cps.value.slice(reached.value, reached.value + 4).some((c) => dist(c, p) < HIT * 1.3)
  if (!near) {
    nudge.value++
    if (Date.now() - lastNudge > 3000) {
      lastNudge = Date.now()
      void audio.say(reached.value === 0 ? 'start-at-dot' : 'keep-going')
    }
    return
  }
  capturePointer(e)
  drawing.value = true
  trail.value = `M${p.x.toFixed(1)} ${p.y.toFixed(1)}`
  advance(p)
}

function advance(p: { x: number; y: number }) {
  const pts = cps.value
  let best = reached.value
  for (let j = reached.value + 1; j < Math.min(pts.length, reached.value + 6); j++) {
    if (dist(pts[j]!, p) < HIT) best = j
  }
  if (best !== reached.value) reached.value = best
  if (reached.value >= pts.length - 2) finishStroke()
}

function move(e: PointerEvent) {
  if (!drawing.value) return
  const p = toSvg(e)
  trail.value += ` L${p.x.toFixed(1)} ${p.y.toFixed(1)}`
  advance(p)
}

function up() {
  drawing.value = false
}

function finishStroke() {
  drawing.value = false
  trail.value = ''
  emit('stroke', current.value)
  if (current.value + 1 >= strokes.value.length) {
    done.value = true
    reached.value = cps.value.length - 1
    emit('complete')
    return
  }
  audio.sfx('sparkle')
  current.value++
  reached.value = 0
}
</script>

<template>
  <div class="relative w-full">
    <svg
      ref="svg"
      :viewBox="viewBox"
      class="h-full max-h-[calc(100dvh-12rem)] w-full touch-none rounded-[2.5rem] bg-white shadow-soft"
      role="img"
      :aria-label="`Trace ${glyphs.join(' and ')}`"
      @pointerdown="down"
      @pointermove="move"
      @pointerup="up"
      @pointercancel="up"
    >
      <!-- writing lines -->
      <g stroke="#3d3a5c" stroke-opacity="0.08" stroke-width="1.5">
        <line :x1="-PAD" :x2="glyphs.length * 100 + PAD" y1="15" y2="15" />
        <line :x1="-PAD" :x2="glyphs.length * 100 + PAD" y1="55" y2="55" stroke-dasharray="4 5" />
        <line :x1="-PAD" :x2="glyphs.length * 100 + PAD" y1="115" y2="115" stroke-opacity="0.18" />
      </g>

      <!-- lane -->
      <g fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path v-for="(s, i) in strokes" :key="`lane-${i}`" :d="s.d" :transform="`translate(${s.dx} 0)`" stroke="#F1EEFA" stroke-width="22" />
        <!-- dotted guides -->
        <path v-for="(s, i) in strokes" :key="`dot-${i}`" :d="s.d" :transform="`translate(${s.dx} 0)`" stroke="#3d3a5c" stroke-opacity="0.28" stroke-width="5" stroke-dasharray="0.1 9" />
        <!-- measuring + progress paths -->
        <path
          v-for="(s, i) in strokes"
          :key="`p-${i}`"
          :ref="(el) => { if (el) pathEls[i] = el as SVGPathElement }"
          :d="s.d"
          :transform="`translate(${s.dx} 0)`"
          :stroke="color"
          stroke-width="16"
          :stroke-dasharray="lengths[i] ?? 0"
          :stroke-dashoffset="i < current || done ? 0 : i === current ? (lengths[i] ?? 0) * (1 - progress) : (lengths[i] ?? 0)"
          :style="{ opacity: i <= current || done ? 1 : 0 }"
        />
      </g>

      <!-- finger trail -->
      <path v-if="trail" :d="trail" fill="none" :stroke="color" stroke-opacity="0.35" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" />

      <!-- start dot, direction arrow, and a guide star that shows the way -->
      <g v-if="!done && start">
        <g v-if="arrow && reached === 0" :transform="`translate(${arrow.x} ${arrow.y}) rotate(${arrow.angle})`">
          <path d="M14 -7 L26 0 L14 7 Z" fill="#FF9F5A" />
        </g>
        <circle :cx="start.x" :cy="start.y" r="11" fill="#3FB5EA" :class="{ 'trace-pulse': reached === 0 }" :key="nudge" />
        <text :x="start.x" :y="start.y + 4.5" text-anchor="middle" font-size="12" font-weight="700" fill="#fff">{{ current + 1 }}</text>
        <g v-if="reached === 0 && !drawing" :key="`guide-${current}`" :transform="`translate(${strokes[current]?.dx ?? 0} 0)`">
          <circle r="5" fill="#F6C94A" stroke="#fff" stroke-width="2">
            <animateMotion :path="strokes[current]?.d" dur="2.2s" repeatCount="indefinite" />
          </circle>
        </g>
        <circle v-if="reached > 0" :cx="cps[reached]?.x" :cy="cps[reached]?.y" r="9" fill="#fff" :stroke="color" stroke-width="4" />
      </g>
    </svg>
  </div>
</template>

<style scoped>
.trace-pulse {
  transform-box: fill-box;
  transform-origin: center;
  animation: trace-pulse 1.1s ease-in-out infinite;
}
@keyframes trace-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.35); }
}
</style>
