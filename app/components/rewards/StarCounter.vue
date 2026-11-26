<script setup lang="ts">
/** Pill showing the child's total stars; bounces whenever a star arrives. */
const { m } = useI18n()
defineProps<{ compact?: boolean }>()
const { progress } = useProgress()
const stars = computed(() => progress.value.stars)
const bump = ref(0)
watch(stars, (n, o) => {
  if (n > o) bump.value++
})
</script>

<template>
  <NuxtLink
    to="/rewards"
    class="toy flex items-center gap-1.5 bg-white py-2 pr-4 pl-2 text-2xl font-bold text-ink"
    :aria-label="m.common.starsOpenRewards(stars)"
  >
    <Motion :key="bump" as="span" :initial="{ scale: bump ? 1.6 : 1, rotate: bump ? -30 : 0 }" :animate="{ scale: 1, rotate: 0 }" :transition="{ type: 'spring', stiffness: 300, damping: 10 }">
      <ObjectIcon name="star" :size="compact ? 36 : 44" decorative />
    </Motion>
    <span class="min-w-[1.5ch] tabular-nums">{{ stars }}</span>
  </NuxtLink>
</template>
