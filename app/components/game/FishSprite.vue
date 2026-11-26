<script setup lang="ts">
/**
 * A round, friendly fish wearing a letter. The body can be flipped (via
 * `bodyClass` / `bodyStyle`) while the letter always stays readable.
 */
defineProps<{ label: string; color: string; fin: string; bodyClass?: string; bodyStyle?: Record<string, string> }>()
</script>

<template>
  <span class="relative block h-full w-full">
    <svg viewBox="0 0 140 100" class="h-full w-full overflow-visible" :class="bodyClass" :style="bodyStyle" aria-hidden="true">
      <path d="M22 50 L4 24 Q2 50 4 76 Z" :fill="fin" />
      <path d="M60 18 Q72 0 92 12 L80 24 Z" :fill="fin" />
      <ellipse cx="74" cy="50" rx="54" ry="38" :fill="color" />
      <ellipse cx="60" cy="36" rx="24" ry="9" fill="#fff" opacity="0.3" transform="rotate(-12 60 36)" />
      <path d="M66 84 Q74 96 84 84 Z" :fill="fin" />
      <circle cx="110" cy="42" r="10" fill="#fff" />
      <circle cx="113" cy="44" r="5.5" fill="#3d3a5c" />
      <circle cx="115" cy="41" r="2" fill="#fff" />
      <path d="M122 60 Q127 64 123 68" stroke="#3d3a5c" stroke-width="3" fill="none" stroke-linecap="round" />
    </svg>
    <span class="absolute top-1/2 left-1/2 flex aspect-square w-[34%] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[clamp(1.4rem,3.2vw,2rem)] font-bold text-ink">{{ label }}</span>
  </span>
</template>
