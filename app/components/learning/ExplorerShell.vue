<script setup lang="ts">
import type { ActivityId } from '~/types'
import { categoryOf, getActivity } from '~/data/activities'
import { THEME } from '~/utils/theme'

/** Frame for free-play explorers (no rounds, no exit hold). */
const props = defineProps<{ activityId: ActivityId; celebrate?: number }>()
defineEmits<{ replay: [] }>()
const activity = computed(() => getActivity(props.activityId))
const backTo = computed(() => categoryOf(activity.value.category).to)
useHead({ title: () => `${activity.value.title} · DinoLand` })
</script>

<template>
  <div class="relative flex min-h-dvh flex-col page-pad" :class="THEME[activity.color].soft">
    <div class="pointer-events-none absolute inset-0 dots-bg" aria-hidden="true" />
    <GameHeader class="relative z-10" :title="activity.title" :icon="activity.icon" :back-to="backTo" :hold="false" @replay="$emit('replay')" />
    <main class="relative z-10 flex flex-1 flex-col items-center justify-center gap-5 py-4">
      <slot />
    </main>
    <CelebrationAnimation :trigger="celebrate ?? 0" />
  </div>
</template>
