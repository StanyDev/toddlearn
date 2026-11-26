<script setup lang="ts">
import type { ActivityId } from '~/types'
import { ACTIVITIES } from '~/data/activities'
import { ACTIVITY_ENGINES } from '~/utils/generators'

// Quiz and matching activities share one engine; static pages (explorer,
// trace, sort) take precedence over this dynamic route.
const route = useRoute()
const activity = computed(() => ACTIVITIES.find((a) => a.to === `/numbers/${route.params.activity}`))
const engine = computed(() => (activity.value ? ACTIVITY_ENGINES[activity.value.id as ActivityId] : undefined))
if (!activity.value || !engine.value) {
  throw createError({ statusCode: 404, statusMessage: 'Activity not found', fatal: true })
}
</script>

<template>
  <QuizActivity v-if="engine?.engine === 'quiz'" :key="activity!.id" :activity-id="activity!.id" :generate="engine.generate" />
  <MatchingActivity v-else-if="engine?.engine === 'match'" :key="activity!.id" :activity-id="activity!.id" :generate="engine.generate" />
</template>
