<script setup lang="ts">
/** A shiny cartoon balloon with a number or letter on it. */
const props = defineProps<{ label: string; color: string; popped?: boolean }>()
const id = `bl-${Math.random().toString(36).slice(2, 8)}`
const dark = computed(() => props.color)
</script>

<template>
  <svg viewBox="0 0 100 160" class="h-full w-full overflow-visible" aria-hidden="true">
    <defs>
      <radialGradient :id="id" cx="35%" cy="30%" r="75%">
        <stop offset="0%" stop-color="#fff" stop-opacity="0.85" />
        <stop offset="25%" :stop-color="color" stop-opacity="0.95" />
        <stop offset="100%" :stop-color="dark" />
      </radialGradient>
    </defs>
    <path d="M50 108 C 46 120 56 128 50 140 C 44 150 54 156 50 160" stroke="#3d3a5c" stroke-opacity="0.35" stroke-width="2" fill="none" />
    <path d="M50 4 C 20 4 6 28 6 52 C 6 80 30 100 50 106 C 70 100 94 80 94 52 C 94 28 80 4 50 4 Z" :fill="`url(#${id})`" />
    <path d="M44 104 L56 104 L53 112 L47 112 Z" :fill="color" />
    <ellipse cx="32" cy="30" rx="9" ry="15" fill="#fff" opacity="0.5" transform="rotate(25 32 30)" />
    <text x="50" y="68" text-anchor="middle" font-size="44" font-weight="700" fill="#fff" stroke="rgba(61,58,92,0.35)" stroke-width="3" paint-order="stroke" font-family="inherit">{{ label }}</text>
  </svg>
</template>
