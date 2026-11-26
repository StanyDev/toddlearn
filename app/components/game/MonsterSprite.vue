<script setup lang="ts">
/** A cute, fuzzy, always-hungry monster. */
withDefaults(defineProps<{ mood?: 'hungry' | 'munch' | 'happy'; open?: boolean; color?: string }>(), { mood: 'hungry', open: false, color: '#9B7BF7' })
</script>

<template>
  <svg viewBox="0 0 220 220" class="h-full w-full overflow-visible" aria-hidden="true">
    <ellipse cx="110" cy="208" rx="70" ry="8" fill="#3d3a5c" opacity="0.12" />
    <!-- horns -->
    <path d="M58 52 Q44 14 70 22 Q72 40 76 50 Z" fill="#FFE58A" stroke="#F6C94A" stroke-width="4" stroke-linejoin="round" />
    <path d="M162 52 Q176 14 150 22 Q148 40 144 50 Z" fill="#FFE58A" stroke="#F6C94A" stroke-width="4" stroke-linejoin="round" />
    <!-- feet -->
    <ellipse cx="76" cy="198" rx="24" ry="12" :fill="color" />
    <ellipse cx="144" cy="198" rx="24" ry="12" :fill="color" />
    <!-- fuzzy body -->
    <path
      d="M110 30 C 60 30 26 64 26 112 C 26 160 60 196 110 196 C 160 196 194 160 194 112 C 194 64 160 30 110 30 Z"
      :fill="color"
    />
    <g :fill="color">
      <circle v-for="a in 18" :key="a" :cx="110 + 84 * Math.cos((a * 20 * Math.PI) / 180)" :cy="113 + 82 * Math.sin((a * 20 * Math.PI) / 180)" r="10" />
    </g>
    <ellipse cx="110" cy="140" rx="56" ry="46" fill="#fff" opacity="0.18" />
    <!-- arms -->
    <ellipse cx="30" cy="128" rx="14" ry="24" :fill="color" :transform="`rotate(${mood === 'happy' ? 40 : 20} 30 128)`" />
    <ellipse cx="190" cy="128" rx="14" ry="24" :fill="color" :transform="`rotate(${mood === 'happy' ? -40 : -20} 190 128)`" />
    <!-- eyes -->
    <g v-if="mood !== 'happy'">
      <ellipse cx="82" cy="84" rx="20" ry="22" fill="#fff" />
      <ellipse cx="138" cy="84" rx="20" ry="22" fill="#fff" />
      <circle cx="86" cy="90" r="11" fill="#3d3a5c" /><circle cx="134" cy="90" r="11" fill="#3d3a5c" />
      <circle cx="90" cy="85" r="4" fill="#fff" /><circle cx="138" cy="85" r="4" fill="#fff" />
    </g>
    <g v-else stroke="#3d3a5c" stroke-width="7" fill="none" stroke-linecap="round">
      <path d="M64 88 Q82 68 100 88" /><path d="M120 88 Q138 68 156 88" />
    </g>
    <ellipse cx="62" cy="114" rx="11" ry="7" fill="#FF8FB1" opacity="0.6" />
    <ellipse cx="158" cy="114" rx="11" ry="7" fill="#FF8FB1" opacity="0.6" />
    <!-- mouth -->
    <g :class="{ 'monster-munch': mood === 'munch' }" style="transform-box: fill-box; transform-origin: center">
      <ellipse cx="110" cy="142" rx="44" :ry="open || mood === 'hungry' ? 30 : 14" fill="#5B2333" class="transition-all duration-200" />
      <ellipse cx="110" :cy="open || mood === 'hungry' ? 160 : 150" rx="20" ry="8" fill="#FF7FA1" class="transition-all duration-200" />
      <path d="M82 116 L90 130 L98 116 Z M122 116 L130 130 L138 116 Z" fill="#fff" :opacity="open || mood === 'hungry' ? 1 : 0" />
    </g>
  </svg>
</template>

<style scoped>
.monster-munch {
  animation: munch 0.18s ease-in-out 4 alternate;
}
@keyframes munch {
  from { transform: scaleY(1); }
  to { transform: scaleY(0.35); }
}
</style>
