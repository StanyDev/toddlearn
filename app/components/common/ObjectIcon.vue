<script setup lang="ts">
import { getObject } from '~/data/objects'

const props = withDefaults(defineProps<{ name: string; size?: number | string; decorative?: boolean }>(), { size: 64, decorative: false })

const info = computed(() => getObject(props.name))
const baseURL = useRuntimeConfig().app.baseURL
const failed = ref(false)
watch(() => props.name, () => (failed.value = false))
const dim = computed(() => (typeof props.size === 'number' ? `${props.size}px` : props.size))
</script>

<template>
  <span class="inline-flex shrink-0 items-center justify-center" :style="{ width: dim, height: dim }">
    <img
      v-if="!failed"
      :src="`${baseURL}images/objects/${info.key}.svg`"
      :alt="decorative ? '' : info.label"
      draggable="false"
      loading="lazy"
      decoding="async"
      class="pointer-events-none h-full w-full object-contain drop-shadow-[0_3px_0_rgba(61,58,92,0.12)]"
      @error="failed = true"
    />
    <span v-else :aria-label="decorative ? undefined : info.label" class="leading-none" :style="{ fontSize: `calc(${dim} * 0.85)` }">{{ info.emoji }}</span>
  </span>
</template>
