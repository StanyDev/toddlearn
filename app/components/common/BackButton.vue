<script setup lang="ts">
/**
 * Big round "go back" button.
 * With `hold`, it must be pressed for a moment (a ring fills up) so a stray
 * tap in the middle of a game doesn't kick a toddler out of the activity.
 */
const { m } = useI18n()
const props = withDefaults(defineProps<{ to: string; hold?: boolean; icon?: 'back' | 'home'; label?: string }>(), {
  hold: false,
  icon: 'back',
})
const router = useRouter()
const audio = useAudio()

const HOLD_MS = 650
const progress = ref(0)
const hint = ref(false)
let raf = 0
let startAt = 0

function go() {
  audio.sfx('whoosh')
  void router.push(props.to)
}

function down(e: PointerEvent) {
  if (!props.hold) return
  capturePointer(e)
  startAt = performance.now()
  const tick = () => {
    progress.value = Math.min(1, (performance.now() - startAt) / HOLD_MS)
    if (progress.value >= 1) {
      progress.value = 0
      go()
      return
    }
    raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)
}

function up() {
  if (!props.hold) return
  cancelAnimationFrame(raf)
  if (progress.value > 0 && progress.value < 1) {
    hint.value = true
    setTimeout(() => (hint.value = false), 1200)
  }
  progress.value = 0
}

function click() {
  if (!props.hold) go()
}
onBeforeUnmount(() => cancelAnimationFrame(raf))

const C = 2 * Math.PI * 30
</script>

<template>
  <div class="relative">
    <button
      type="button"
      class="toy flex h-16 w-16 items-center justify-center bg-white text-ink sm:h-[4.5rem] sm:w-[4.5rem]"
      :class="{ 'animate-wiggle': hint }"
      :aria-label="hold ? m.common.pressAndHold(label ?? m.common.goBack) : (label ?? m.common.goBack)"
      @pointerdown="down"
      @pointerup="up"
      @pointercancel="up"
      @pointerleave="up"
      @click="click"
      @keydown.enter.prevent="go"
      @keydown.space.prevent="go"
    >
      <svg v-if="hold" viewBox="0 0 64 64" class="pointer-events-none absolute inset-0 h-full w-full -rotate-90" aria-hidden="true">
        <circle cx="32" cy="32" r="30" fill="none" stroke="#FF9F5A" stroke-width="4" :stroke-dasharray="C" :stroke-dashoffset="C * (1 - progress)" stroke-linecap="round" />
      </svg>
      <svg v-if="icon === 'back'" viewBox="0 0 48 48" class="h-9 w-9" aria-hidden="true">
        <path d="M28 10 L14 24 L28 38" stroke="currentColor" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      <svg v-else viewBox="0 0 48 48" class="h-9 w-9" aria-hidden="true">
        <path d="M8 22 L24 8 L40 22 V40 Q40 42 38 42 H29 V30 H19 V42 H10 Q8 42 8 40 Z" fill="currentColor" stroke="currentColor" stroke-width="3" stroke-linejoin="round" />
      </svg>
    </button>
    <Transition enter-from-class="opacity-0 -translate-y-1" leave-to-class="opacity-0">
      <span v-if="hint" class="absolute top-full left-1/2 mt-2 -translate-x-1/2 rounded-full bg-ink px-3 py-1 text-sm font-semibold whitespace-nowrap text-white transition">{{ m.common.holdMe }}</span>
    </Transition>
  </div>
</template>
