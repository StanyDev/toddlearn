<script setup lang="ts">
import type { FeedbackState } from '~/types'
const { m } = useI18n()

/** Dino pops up to cheer (correct) or gently encourage (try again). */
const props = defineProps<{ state: FeedbackState; celebrateKey: number }>()

const text = ref('')
watch(
  () => props.state,
  (s) => {
    const { praise, encourage } = m.value.feedback
    if (s === 'correct') text.value = praise[Math.floor(Math.random() * praise.length)]!
    if (s === 'tryAgain') text.value = encourage[Math.floor(Math.random() * encourage.length)]!
  },
)
</script>

<template>
  <CelebrationAnimation :trigger="celebrateKey" />
  <AnimatePresence>
    <Motion
      v-if="state !== 'idle'"
      :key="state"
      as="div"
      class="pointer-events-none fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-2 z-50 flex items-end gap-1 sm:left-6"
      :initial="{ y: 160, opacity: 0 }"
      :animate="{ y: 0, opacity: 1 }"
      :exit="{ y: 160, opacity: 0 }"
      :transition="{ type: 'spring', stiffness: 260, damping: 20 }"
      role="status"
      aria-live="polite"
    >
      <DinoMascot :size="110" :mood="state === 'correct' ? 'cheer' : 'thinking'" />
      <SpeechBubble class="mb-16" :color="state === 'correct' ? 'bg-mint' : 'bg-sunny'">
        <span class="text-2xl font-bold sm:text-3xl">{{ text }}</span>
      </SpeechBubble>
    </Motion>
  </AnimatePresence>
</template>
