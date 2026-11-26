<script setup lang="ts">
withDefaults(defineProps<{ tail?: 'left' | 'bottom'; color?: string }>(), { tail: 'left', color: 'bg-white' })
</script>

<template>
  <div class="relative rounded-[1.75rem] px-5 py-3 text-xl font-semibold text-ink shadow-soft sm:text-2xl" :class="color">
    <span
      class="absolute h-5 w-5 rotate-45"
      :class="[color, tail === 'left' ? 'top-1/2 -left-2 -translate-y-1/2' : '-bottom-2 left-10']"
      aria-hidden="true"
    />
    <span class="relative"><slot /></span>
  </div>
</template>
