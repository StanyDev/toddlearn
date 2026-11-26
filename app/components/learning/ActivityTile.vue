<script setup lang="ts">
import type { ActivityDef } from '~/types'
import { THEME } from '~/utils/theme'

const props = defineProps<{ activity: ActivityDef; index?: number }>()
const audio = useAudio()
const router = useRouter()
const { progress } = useProgress()
const theme = computed(() => THEME[props.activity.color])
const record = computed(() => progress.value.activities[props.activity.id])

function open() {
  audio.sfx('tap')
  void router.push(props.activity.to)
}
</script>

<template>
  <Motion
    as="button"
    type="button"
    class="toy relative flex aspect-square flex-col items-center justify-center gap-2 overflow-hidden p-3 sm:aspect-[5/4]"
    :class="theme.bg"
    :initial="{ scale: 0.6, opacity: 0 }"
    :animate="{ scale: 1, opacity: 1 }"
    :while-press="{ scale: 0.94 }"
    :transition="{ type: 'spring', stiffness: 300, damping: 18, delay: (index ?? 0) * 0.05 }"
    :aria-label="activity.title"
    @click="open"
  >
    <span class="absolute -top-6 -left-6 h-20 w-20 rounded-full bg-white/30" aria-hidden="true" />
    <span class="relative flex flex-1 items-center justify-center">
      <BigGlyph v-if="activity.glyph" :value="activity.glyph" size="3.4rem" class="sm:text-[4rem]" />
      <ObjectIcon v-else :name="activity.icon" :size="'min(18vw, 84px)'" decorative />
    </span>
    <span class="relative text-center text-lg leading-tight font-bold text-ink sm:text-xl">{{ activity.title }}</span>
    <span v-if="record?.completed" class="absolute top-2 right-2 flex items-center gap-0.5 rounded-full bg-white px-2 py-0.5 text-sm font-bold text-ink shadow-pop-sm">
      <ObjectIcon name="star" :size="18" decorative />{{ record.completed }}
    </span>
  </Motion>
</template>
