<script setup lang="ts">
import type { CategoryDef } from '~/data/activities'
import { THEME } from '~/utils/theme'

/** Big, colourful home-screen card for a learning area. */
const props = defineProps<{ category: CategoryDef; progress: number; index?: number }>()
const audio = useAudio()
const router = useRouter()
const theme = computed(() => THEME[props.category.color])

function open() {
  audio.sfx('tap')
  void audio.say(props.category.voice)
  void router.push(props.category.to)
}
</script>

<template>
  <Motion
    as="button"
    type="button"
    class="toy group relative flex min-h-48 flex-col overflow-hidden p-5 text-left sm:min-h-56"
    :class="theme.bg"
    :initial="{ y: 40, opacity: 0 }"
    :animate="{ y: 0, opacity: 1 }"
    :while-hover="{ y: -4 }"
    :while-press="{ scale: 0.97 }"
    :transition="{ type: 'spring', stiffness: 260, damping: 20, delay: (index ?? 0) * 0.08 }"
    :aria-label="category.title"
    @click="open"
  >
    <span class="absolute -right-8 -bottom-10 h-40 w-40 rounded-full bg-white/30" aria-hidden="true" />
    <span class="absolute top-6 -right-4 h-16 w-16 rounded-full bg-white/25" aria-hidden="true" />

    <!-- art -->
    <span class="relative flex flex-1 items-center justify-center gap-2" aria-hidden="true">
      <template v-if="category.id === 'numbers'">
        <BigGlyph value="1" size="4.5rem" color="#FF6B8B" class="-rotate-12" />
        <BigGlyph value="2" size="5rem" color="#3FB5EA" class="-translate-y-2" />
        <BigGlyph value="3" size="4.5rem" color="#F5A524" class="rotate-12" />
        <ObjectIcon name="apple" :size="56" class="animate-float" />
      </template>
      <template v-else-if="category.id === 'alphabet'">
        <BigGlyph value="A" size="4.5rem" color="#9B7BF7" class="-rotate-12" />
        <BigGlyph value="b" size="5rem" color="#3DBE8B" class="-translate-y-2" />
        <BigGlyph value="C" size="4.5rem" color="#FF8A3D" class="rotate-12" />
        <ObjectIcon name="cat" :size="56" class="animate-float" />
      </template>
      <template v-else-if="category.id === 'colors-shapes'">
        <ShapeIcon shape="circle" color="#FF7FA1" :size="62" class="-rotate-6" />
        <ShapeIcon shape="triangle" color="#3FB5EA" :size="68" class="-translate-y-2" />
        <ShapeIcon shape="star" color="#F6C94A" :size="64" class="rotate-12 animate-float" />
        <ObjectIcon name="palette" :size="52" />
      </template>
      <template v-else>
        <ObjectIcon name="balloon" :size="70" class="animate-float" />
        <ObjectIcon name="joker" :size="58" class="-rotate-12" />
        <ObjectIcon name="fishing-pole" :size="58" />
        <ObjectIcon name="bricks" :size="54" class="rotate-6" />
      </template>
    </span>

    <span class="relative mt-3 flex items-end justify-between gap-3">
      <span class="text-3xl font-bold text-ink drop-shadow-[0_2px_0_rgba(255,255,255,0.6)] sm:text-4xl">{{ category.title }}</span>
      <span class="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white text-ink shadow-pop-sm transition-transform group-hover:translate-x-1">
        <svg viewBox="0 0 48 48" class="h-8 w-8" aria-hidden="true"><path d="M18 10 L32 24 L18 38" stroke="currentColor" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round" /></svg>
      </span>
    </span>
    <span class="relative mt-3 block h-4 overflow-hidden rounded-full bg-white/60" role="progressbar" :aria-valuenow="Math.round(progress * 100)" aria-valuemin="0" aria-valuemax="100" :aria-label="`${category.title} progress`">
      <span class="block h-full rounded-full transition-[width] duration-700" :class="theme.deep" :style="{ width: `${Math.max(4, progress * 100)}%` }" />
    </span>
  </Motion>
</template>
