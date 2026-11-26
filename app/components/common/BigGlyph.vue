<script setup lang="ts">
import { glyphColorFor } from '~/utils/theme'

/** A big, chunky, colourful number or letter. */
const props = withDefaults(defineProps<{ value: string | number; size?: string; color?: string; muted?: boolean }>(), {
  size: '4rem',
  color: undefined,
  muted: false,
})

const fill = computed(() => (props.muted ? '#C9C5DD' : (props.color ?? glyphColorFor(String(props.value).length > 2 ? 1 : props.value))))
</script>

<template>
  <span
    class="glyph inline-block font-bold leading-none tracking-tight"
    :style="{ fontSize: size, color: fill, '--glyph-shadow': fill }"
    >{{ value }}</span
  >
</template>

<style scoped>
.glyph {
  font-variation-settings: 'wght' 650;
  -webkit-text-stroke: 0.04em rgb(255 255 255 / 0.6);
  paint-order: stroke fill;
  text-shadow: 0 0.06em 0 rgb(61 58 92 / 0.16);
}
</style>
