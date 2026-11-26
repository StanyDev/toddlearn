<script setup lang="ts">
/**
 * Confetti + star burst. Changing `trigger` fires a new burst.
 * Respects reduced motion (CSS animations are disabled globally).
 */
const props = withDefaults(defineProps<{ trigger: number; pieces?: number; origin?: 'center' | 'top' }>(), { pieces: 36, origin: 'center' })

const COLORS = ['#FF6B8B', '#3FB5EA', '#F5C842', '#5CCB9F', '#A78BFA', '#FF9F5A']
interface Piece { id: number; x: number; y: number; r: number; c: string; s: number; d: number; shape: 'dot' | 'rect' | 'star' }
const bursts = ref<{ key: number; pieces: Piece[] }[]>([])

watch(
  () => props.trigger,
  (t) => {
    if (!t) return
    const pieces: Piece[] = Array.from({ length: props.pieces }, (_, i) => {
      const angle = Math.random() * Math.PI * 2
      const dist = 120 + Math.random() * 240
      return {
        id: i,
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist * 0.8 - 80,
        r: Math.random() * 720 - 360,
        c: COLORS[i % COLORS.length]!,
        s: 10 + Math.random() * 12,
        d: Math.random() * 0.15,
        shape: i % 5 === 0 ? 'star' : i % 2 ? 'dot' : 'rect',
      }
    })
    const key = t
    bursts.value.push({ key, pieces })
    setTimeout(() => (bursts.value = bursts.value.filter((b) => b.key !== key)), 1600)
  },
)
</script>

<template>
  <div class="pointer-events-none absolute inset-0 z-40 overflow-hidden" aria-hidden="true">
    <div v-for="b in bursts" :key="b.key" class="absolute left-1/2" :class="origin === 'top' ? 'top-1/4' : 'top-1/2'">
      <span
        v-for="p in b.pieces"
        :key="p.id"
        class="confetti absolute block"
        :style="{
          '--x': `${p.x}px`,
          '--y': `${p.y}px`,
          '--r': `${p.r}deg`,
          width: `${p.s}px`,
          height: p.shape === 'rect' ? `${p.s * 0.5}px` : `${p.s}px`,
          background: p.shape === 'star' ? 'transparent' : p.c,
          color: p.c,
          borderRadius: p.shape === 'dot' ? '999px' : '3px',
          animationDelay: `${p.d}s`,
        }"
        ><svg v-if="p.shape === 'star'" viewBox="0 0 24 24" class="h-full w-full"><path fill="currentColor" d="M12 1l3.1 7 7.6.6-5.8 5 1.8 7.4L12 17l-6.7 4 1.8-7.4-5.8-5 7.6-.6z" /></svg
      ></span>
    </div>
  </div>
</template>

<style scoped>
.confetti {
  left: 0;
  top: 0;
  opacity: 0;
  animation: burst 1.3s cubic-bezier(0.15, 0.7, 0.3, 1) forwards;
}
@keyframes burst {
  0% { transform: translate(0, 0) rotate(0) scale(0.3); opacity: 1; }
  70% { opacity: 1; }
  100% { transform: translate(var(--x), calc(var(--y) + 140px)) rotate(var(--r)) scale(1); opacity: 0; }
}
</style>
