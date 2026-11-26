<script setup lang="ts">
/** Stars that pop in one after another with a sparkle sound. */
const props = withDefaults(defineProps<{ count: number; size?: number; max?: number }>(), { size: 64, max: 10 })
const audio = useAudio()
const shown = computed(() => Math.min(props.count, props.max))

onMounted(() => {
  for (let i = 0; i < shown.value; i++) setTimeout(() => audio.sfx('star'), 450 + i * 180)
})
</script>

<template>
  <div class="flex flex-wrap items-center justify-center gap-1" :aria-label="`${count} stars`">
    <Motion
      v-for="i in shown"
      :key="i"
      as="span"
      :initial="{ scale: 0, rotate: -180, y: 30 }"
      :animate="{ scale: 1, rotate: 0, y: 0 }"
      :transition="{ type: 'spring', stiffness: 260, damping: 12, delay: 0.4 + (i - 1) * 0.18 }"
    >
      <ObjectIcon name="star" :size="size" decorative />
    </Motion>
    <span v-if="count > max" class="ml-2 text-3xl font-bold text-sunny-deep">+{{ count - max }}</span>
  </div>
</template>
