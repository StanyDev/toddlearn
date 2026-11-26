<script setup lang="ts">
import type { ActivityId } from '~/types'
import type { GameApi } from '~/composables/useGame'
import { categoryOf, getActivity } from '~/data/activities'
import { THEME } from '~/utils/theme'

/**
 * Frame shared by every activity: header, round progress, feedback, and the
 * finish screen. Put the actual play area in the default slot.
 */
const props = withDefaults(defineProps<{ game: GameApi; activityId: ActivityId; showProgress?: boolean; bg?: string }>(), {
  showProgress: true,
  bg: undefined,
})

const activity = computed(() => getActivity(props.activityId))
const backTo = computed(() => categoryOf(activity.value.category).to)
const tint = computed(() => props.bg ?? THEME[activity.value.color].soft)
useHead({ title: () => `${activity.value.title} · DinoLand` })
</script>

<template>
  <div class="relative flex min-h-dvh flex-col page-pad" :class="tint">
    <div class="pointer-events-none absolute inset-0 dots-bg" aria-hidden="true" />
    <GameHeader class="relative z-10" :title="activity.title" :icon="activity.icon" :back-to="backTo" @replay="game.replayInstruction()" />
    <GameProgress v-if="showProgress" class="relative z-10 mt-3" :round="game.round.value" :total="game.totalRounds.value" :finished="game.finished.value" />
    <main class="relative z-10 flex flex-1 flex-col items-center justify-center py-4">
      <slot />
    </main>
    <GameFeedback :state="game.feedback.value" :celebrate-key="game.celebrateKey.value" />
    <GameComplete v-if="game.finished.value" :stars="game.starsEarned.value" :back-to="backTo" :title="activity.title" @again="game.restart()" />
  </div>
</template>
