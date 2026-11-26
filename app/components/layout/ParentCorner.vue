<script setup lang="ts">
/**
 * Discreet entrance to the parent area: a small lock that must be held for
 * two seconds. It isn't part of the child's navigation.
 */
const { m } = useI18n()
const router = useRouter()
const HOLD_MS = 2000
const progress = ref(0)
let raf = 0
let start = 0

function down(e: PointerEvent) {
  capturePointer(e)
  start = performance.now()
  const tick = () => {
    progress.value = Math.min(1, (performance.now() - start) / HOLD_MS)
    if (progress.value >= 1) {
      progress.value = 0
      void router.push('/parent')
      return
    }
    raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)
}
function up() {
  cancelAnimationFrame(raf)
  progress.value = 0
}
onBeforeUnmount(() => cancelAnimationFrame(raf))
const C = 2 * Math.PI * 20
</script>

<template>
  <button
    type="button"
    class="relative flex h-12 w-12 items-center justify-center rounded-full bg-white/50 text-ink/40"
    :aria-label="m.gate.cornerAria"
    :title="m.gate.cornerTitle"
    @pointerdown="down"
    @pointerup="up"
    @pointerleave="up"
    @pointercancel="up"
    @keydown.enter.prevent="router.push('/parent')"
  >
    <svg viewBox="0 0 44 44" class="pointer-events-none absolute inset-0 -rotate-90" aria-hidden="true">
      <circle cx="22" cy="22" r="20" fill="none" stroke="#3d3a5c" stroke-opacity="0.5" stroke-width="3" :stroke-dasharray="C" :stroke-dashoffset="C * (1 - progress)" />
    </svg>
    <svg viewBox="0 0 24 24" class="h-5 w-5" aria-hidden="true">
      <rect x="5" y="10" width="14" height="10" rx="2.5" fill="currentColor" />
      <path d="M8 10 V7.5 a4 4 0 0 1 8 0 V10" stroke="currentColor" stroke-width="2.4" fill="none" />
    </svg>
  </button>
</template>
