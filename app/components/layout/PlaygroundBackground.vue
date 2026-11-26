<script setup lang="ts">
/** Sky, sun, drifting clouds and rolling hills behind the playground screens. */
withDefaults(defineProps<{ hills?: boolean }>(), { hills: true })
</script>

<template>
  <div class="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-gradient-to-b from-sky via-[#C9EEFF] to-cream" aria-hidden="true">
    <!-- sun -->
    <div class="absolute -top-10 -right-10 h-48 w-48 rounded-full bg-sunny shadow-[0_0_80px_30px_rgba(255,229,138,0.7)] sm:h-64 sm:w-64" />
    <!-- clouds -->
    <svg v-for="(c, i) in [{ top: '8%', dur: '70s', delay: '-10s', s: 1 }, { top: '22%', dur: '95s', delay: '-50s', s: 0.7 }, { top: '4%', dur: '120s', delay: '-80s', s: 0.5 }]"
      :key="i"
      viewBox="0 0 200 90"
      class="absolute left-0 w-56 animate-drift opacity-90"
      :style="{ top: c.top, animationDuration: c.dur, animationDelay: c.delay, scale: c.s }"
    >
      <path d="M40 80 Q8 80 10 58 Q12 38 38 40 Q42 14 72 14 Q100 12 108 36 Q120 20 142 28 Q162 34 160 52 Q190 52 190 68 Q190 82 168 82 Z" fill="#fff" />
    </svg>
    <!-- hills -->
    <svg v-if="hills" viewBox="0 0 1440 320" preserveAspectRatio="none" class="absolute bottom-0 h-[28vh] w-full">
      <path d="M0 200 Q240 110 480 180 T960 170 T1440 150 V320 H0 Z" fill="#A8E6CF" />
      <path d="M0 250 Q300 170 620 240 T1200 220 T1440 230 V320 H0 Z" fill="#7FD8B0" />
      <g fill="#FFB6C8"><circle cx="180" cy="262" r="8" /><circle cx="520" cy="270" r="7" /><circle cx="900" cy="258" r="8" /><circle cx="1260" cy="268" r="7" /></g>
      <g fill="#FFE58A"><circle cx="330" cy="285" r="6" /><circle cx="720" cy="290" r="7" /><circle cx="1100" cy="284" r="6" /></g>
    </svg>
  </div>
</template>
