<script setup lang="ts">
import type { AchievementDef } from '~/types'
import { THEME } from '~/utils/theme'

/** Round badge with a progress ring; locked badges show how close they are. */
const { m } = useI18n()
const props = withDefaults(defineProps<{ badge: AchievementDef; unlocked: boolean; progress: number; size?: number; showLabel?: boolean }>(), {
  size: 112,
  showLabel: true,
})
const theme = computed(() => THEME[props.badge.color])
const R = 46
const C = 2 * Math.PI * R
</script>

<template>
  <div class="flex flex-col items-center gap-2 text-center" :aria-label="`${badge.title}: ${unlocked ? m.rewards.unlocked : m.rewards.percent(Math.round(progress * 100))}`">
    <div class="relative" :style="{ width: `${size}px`, height: `${size}px` }">
      <svg viewBox="0 0 100 100" class="absolute inset-0 -rotate-90" aria-hidden="true">
        <circle cx="50" cy="50" :r="R" fill="none" stroke="#fff" stroke-width="7" />
        <circle cx="50" cy="50" :r="R" fill="none" :stroke="theme.deepHex" stroke-width="7" stroke-linecap="round" :stroke-dasharray="C" :stroke-dashoffset="C * (1 - (unlocked ? 1 : progress))" class="transition-[stroke-dashoffset] duration-700" />
      </svg>
      <div
        class="absolute inset-[10%] flex items-center justify-center rounded-full shadow-pop-sm"
        :class="unlocked ? theme.bg : 'bg-ink/5'"
      >
        <ObjectIcon :name="badge.icon" :size="size * 0.5" decorative :class="unlocked ? '' : 'opacity-30 grayscale'" />
      </div>
      <span v-if="!unlocked" class="absolute -right-1 -bottom-1 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-pop-sm">
        <ObjectIcon name="lock" :size="22" decorative />
      </span>
      <span v-else class="absolute -top-1 -right-1 animate-twinkle"><ObjectIcon name="sparkles" :size="28" decorative /></span>
    </div>
    <template v-if="showLabel">
      <span class="text-base leading-tight font-bold text-ink sm:text-lg">{{ badge.title }}</span>
      <span class="max-w-36 text-xs leading-tight text-ink-soft sm:text-sm">{{ badge.description }}</span>
    </template>
  </div>
</template>
