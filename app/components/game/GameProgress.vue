<script setup lang="ts">
/** Round tracker: earned rounds turn into stars, the current one pulses. */
defineProps<{ round: number; total: number; finished?: boolean }>()
</script>

<template>
  <div class="flex items-center justify-center gap-2" role="progressbar" :aria-valuemin="0" :aria-valuemax="total" :aria-valuenow="finished ? total : round">
    <template v-for="i in total" :key="i">
      <Motion
        v-if="finished || i - 1 < round"
        as="span"
        :initial="{ scale: 0, rotate: -90 }"
        :animate="{ scale: 1, rotate: 0 }"
        :transition="{ type: 'spring', stiffness: 300, damping: 12 }"
      >
        <ObjectIcon name="star" :size="30" decorative />
      </Motion>
      <span v-else-if="i - 1 === round" class="h-6 w-6 animate-pulse rounded-full border-4 border-sunny-deep bg-sunny" />
      <span v-else class="h-5 w-5 rounded-full bg-ink/10" />
    </template>
  </div>
</template>
