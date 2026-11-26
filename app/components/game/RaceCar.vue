<script setup lang="ts">
/** Dino's little race car. */
withDefaults(defineProps<{ moving?: boolean; color?: string }>(), { moving: false, color: '#FF6B8B' })
</script>

<template>
  <div class="relative h-full w-full" :class="{ 'car-bounce': moving }">
    <!-- Dino peeking out of the car -->
    <div class="absolute bottom-[38%] left-[30%] w-[46%]">
      <DinoMascot :size="'100%'" :animated="false" :mood="moving ? 'cheer' : 'happy'" />
    </div>
    <svg viewBox="0 0 200 110" class="absolute inset-x-0 bottom-0 w-full overflow-visible" aria-hidden="true">
      <path d="M14 78 Q10 50 40 46 L70 44 Q86 24 120 26 L150 30 Q186 34 190 70 L190 80 Q190 88 182 88 L22 88 Q14 88 14 78 Z" :fill="color" />
      <path d="M78 46 Q90 32 116 32 L140 36 L146 52 L78 52 Z" fill="#E6F7FF" opacity="0.9" />
      <rect x="20" y="62" width="168" height="8" rx="4" fill="#fff" opacity="0.35" />
      <circle cx="180" cy="62" r="6" fill="#FFE58A" />
      <g :class="{ 'wheel-spin': moving }" style="transform-box: fill-box; transform-origin: center">
        <circle cx="54" cy="88" r="18" fill="#3d3a5c" /><circle cx="54" cy="88" r="7" fill="#D6D3E6" />
        <rect x="52" y="72" width="4" height="32" fill="#D6D3E6" opacity="0.6" />
      </g>
      <g :class="{ 'wheel-spin': moving }" style="transform-box: fill-box; transform-origin: center">
        <circle cx="152" cy="88" r="18" fill="#3d3a5c" /><circle cx="152" cy="88" r="7" fill="#D6D3E6" />
        <rect x="150" y="72" width="4" height="32" fill="#D6D3E6" opacity="0.6" />
      </g>
    </svg>
    <span v-if="moving" class="absolute bottom-2 -left-6 flex gap-1" aria-hidden="true">
      <span v-for="i in 3" :key="i" class="puff block h-4 w-4 rounded-full bg-white/80" :style="{ animationDelay: `${i * 0.1}s` }" />
    </span>
  </div>
</template>

<style scoped>
.wheel-spin {
  animation: spin 0.35s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
.car-bounce {
  animation: car-bounce 0.25s ease-in-out infinite alternate;
}
@keyframes car-bounce {
  to { transform: translateY(-3px); }
}
.puff {
  animation: puff 0.6s ease-out infinite;
}
@keyframes puff {
  from { transform: translateX(0) scale(0.6); opacity: 0.9; }
  to { transform: translateX(-24px) scale(1.4); opacity: 0; }
}
</style>
