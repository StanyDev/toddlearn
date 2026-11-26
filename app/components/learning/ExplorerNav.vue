<script setup lang="ts">
/** Big previous / next arrows for explorers. */
defineProps<{ canPrev: boolean; canNext: boolean }>()
defineEmits<{ prev: []; next: [] }>()
</script>

<template>
  <div class="flex w-full max-w-3xl items-center justify-between gap-4">
    <button type="button" class="toy flex h-20 w-24 items-center justify-center bg-white text-ink disabled:opacity-30 sm:w-28" :disabled="!canPrev" aria-label="Previous" @click="$emit('prev')">
      <svg viewBox="0 0 48 48" class="h-11 w-11" aria-hidden="true"><path d="M30 10 L16 24 L30 38" stroke="currentColor" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round" /></svg>
    </button>
    <slot />
    <button type="button" class="toy flex h-20 w-24 items-center justify-center bg-sunny text-ink disabled:opacity-30 sm:w-28" :disabled="!canNext" aria-label="Next" @click="$emit('next')">
      <svg viewBox="0 0 48 48" class="h-11 w-11" aria-hidden="true"><path d="M18 10 L32 24 L18 38" stroke="currentColor" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round" /></svg>
    </button>
  </div>
</template>
