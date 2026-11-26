<script setup lang="ts">
import type { ChoiceVisual } from '~/types'
import { colorById } from '~/data/learning'

/** Renders any answer/match visual: number, letter, picture, group, colour or shape. */
const props = withDefaults(defineProps<{ visual: ChoiceVisual; scale?: number }>(), { scale: 1 })

const glyphSize = computed(() => `${4.2 * props.scale}rem`)
const iconSize = computed(() => Math.round(84 * props.scale))
</script>

<template>
  <BigGlyph v-if="visual.kind === 'number'" :value="visual.value" :size="glyphSize" />
  <BigGlyph v-else-if="visual.kind === 'letter'" :value="visual.value" :size="glyphSize" />
  <ObjectIcon v-else-if="visual.kind === 'object'" :name="visual.key" :size="iconSize" />
  <ObjectCounter v-else-if="visual.kind === 'group'" :object="visual.object" :count="visual.count" :size="Math.round((visual.count <= 3 ? 52 : visual.count <= 6 ? 40 : 32) * scale)" />
  <span
    v-else-if="visual.kind === 'color'"
    class="block rounded-full border-4 border-white shadow-pop-sm"
    :class="visual.color === 'white' ? 'ring-2 ring-ink/15' : ''"
    :style="{ width: `${iconSize}px`, height: `${iconSize}px`, background: colorById(visual.color).hex }"
    :aria-label="colorById(visual.color).name"
  />
  <ShapeIcon v-else-if="visual.kind === 'shape'" :shape="visual.shape" :color="visual.color" :size="iconSize" />
</template>
