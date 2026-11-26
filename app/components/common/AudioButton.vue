<script setup lang="ts">
/** Round "listen" button that reads one or more voice clips aloud. */
const props = withDefaults(defineProps<{ voice: string[] | string; size?: 'md' | 'lg' | 'xl'; label?: string; color?: string }>(), {
  size: 'lg',
  label: 'Listen',
  color: 'bg-sky-deep',
})
const audio = useAudio()
const playing = ref(false)

async function play() {
  playing.value = true
  audio.sfx('tap')
  await audio.say(props.voice)
  playing.value = false
}
const dims = { md: 'h-16 w-16', lg: 'h-20 w-20', xl: 'h-24 w-24' }
</script>

<template>
  <button type="button" class="toy flex shrink-0 items-center justify-center text-white" :class="[dims[size], color]" :aria-label="label" @click="play">
    <svg viewBox="0 0 48 48" class="h-1/2 w-1/2" aria-hidden="true">
      <path d="M8 18 H16 L27 9 V39 L16 30 H8 Z" fill="currentColor" stroke="currentColor" stroke-width="3" stroke-linejoin="round" />
      <path d="M33 17 Q38 24 33 31" stroke="currentColor" stroke-width="4" fill="none" stroke-linecap="round" :class="{ 'animate-pulse': playing }" />
      <path d="M38 12 Q46 24 38 36" stroke="currentColor" stroke-width="4" fill="none" stroke-linecap="round" :opacity="playing ? 1 : 0.55" :class="{ 'animate-pulse': playing }" />
    </svg>
  </button>
</template>
