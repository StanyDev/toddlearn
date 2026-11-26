<script setup lang="ts">
import type { ShapeId } from '~/types'
import { SHAPE_COLORS } from '~/data/learning'

const props = withDefaults(defineProps<{ shape: ShapeId; color?: string; size?: number | string; outline?: boolean }>(), {
  size: 80,
  color: undefined,
  outline: false,
})

const fill = computed(() => props.color ?? SHAPE_COLORS[props.shape])
const dim = computed(() => (typeof props.size === 'number' ? `${props.size}px` : props.size))
const isLight = computed(() => ['#FFFFFF', '#fff', '#ffffff'].includes(fill.value))

const PATHS: Record<ShapeId, string> = {
  circle: 'M50 8 A42 42 0 1 1 49.9 8 Z',
  square: 'M18 10 H82 Q90 10 90 18 V82 Q90 90 82 90 H18 Q10 90 10 82 V18 Q10 10 18 10 Z',
  triangle: 'M50 10 Q54 10 57 15 L92 80 Q95 88 86 88 H14 Q5 88 8 80 L43 15 Q46 10 50 10 Z',
  rectangle: 'M10 28 Q10 22 16 22 H84 Q90 22 90 28 V72 Q90 78 84 78 H16 Q10 78 10 72 Z',
  star: 'M50 6 L61.8 34.5 L92.5 36.9 L69 56.6 L76.3 86.5 L50 70.4 L23.7 86.5 L31 56.6 L7.5 36.9 L38.2 34.5 Z',
  heart: 'M50 88 C 20 68 6 50 8 32 C 10 16 24 8 36 10 C 44 11 48 16 50 22 C 52 16 56 11 64 10 C 76 8 90 16 92 32 C 94 50 80 68 50 88 Z',
}
</script>

<template>
  <svg viewBox="0 0 100 100" :style="{ width: dim, height: dim }" class="shrink-0 overflow-visible" role="img" :aria-label="shape">
    <path
      :d="PATHS[shape]"
      :fill="outline ? 'none' : fill"
      :stroke="outline ? fill : isLight ? '#D6D3E6' : 'rgba(61,58,92,0.18)'"
      :stroke-width="outline ? 6 : 3"
      stroke-linejoin="round"
      :stroke-dasharray="outline ? '10 8' : undefined"
    />
    <ellipse v-if="!outline" cx="34" cy="32" rx="10" ry="6" fill="#fff" opacity="0.45" transform="rotate(-30 34 32)" />
  </svg>
</template>
