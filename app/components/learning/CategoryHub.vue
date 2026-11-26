<script setup lang="ts">
import type { CategoryId } from '~/types'
import { activitiesIn, categoryOf } from '~/data/activities'
import { THEME } from '~/utils/theme'

/** Hub screen for a learning area: Dino + a grid of activity tiles. */
const { m } = useI18n()
const props = defineProps<{ category: CategoryId }>()
const audio = useAudio()
const def = computed(() => categoryOf(props.category))
const activities = computed(() => activitiesIn(props.category))
const theme = computed(() => THEME[def.value.color])
useHead({ title: () => `${def.value.title} · DinoLand` })

onMounted(() => {
  if (audio.unlocked.value) void audio.say(def.value.voice)
})
</script>

<template>
  <div class="relative min-h-dvh page-pad" :class="theme.soft">
    <div class="pointer-events-none absolute inset-0 dots-bg" aria-hidden="true" />
    <header class="relative flex items-center gap-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
      <BackButton to="/" icon="home" :label="m.common.home" />
      <h1 class="flex-1 truncate text-3xl font-bold text-ink sm:text-4xl">{{ def.title }}</h1>
      <StarCounter />
    </header>

    <div class="relative mx-auto mt-4 flex max-w-5xl items-center gap-2">
      <button type="button" :aria-label="m.common.talkToDino" class="shrink-0" @click="audio.say(def.voice)">
        <DinoMascot :size="'min(28vw, 150px)'" mood="excited" listen />
      </button>
      <SpeechBubble>
        <span class="text-2xl font-bold sm:text-3xl">{{ m.hubs[category] }}</span>
      </SpeechBubble>
    </div>

    <section class="relative mx-auto mt-6 grid max-w-5xl grid-cols-2 gap-4 pb-8 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4" :aria-label="m.common.activities">
      <ActivityTile v-for="(a, i) in activities" :key="a.id" :activity="a" :index="i" />
    </section>
  </div>
</template>
