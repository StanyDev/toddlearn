<script setup lang="ts">
import type { ShapeId } from '~/types'
import { SHAPES, SHAPE_COLORS, shapeById } from '~/data/learning'

const audio = useAudio()
const { progress, exploreShape, addStars, startActivity, completeActivity, isCompleted } = useProgress()
const selected = ref<ShapeId>('circle')
const celebrate = ref(0)
const spin = ref(0)
const info = computed(() => shapeById(selected.value))
const openedAt = Date.now()

function pickShape(id: ShapeId) {
  const isNew = !progress.value.exploredShapes.includes(id)
  selected.value = id
  exploreShape(id)
  audio.sfx(isNew ? 'sparkle' : 'tap')
  void audio.say(`shapes/${id}`)
  if (isNew) {
    celebrate.value++
    addStars(1)
  }
  if (progress.value.exploredShapes.length === SHAPES.length && !isCompleted('shapes-explorer')) {
    completeActivity('shapes-explorer', { stars: SHAPES.length, rounds: SHAPES.length, durationMs: Date.now() - openedAt })
  }
}
function poke() {
  spin.value++
  audio.sfx('pop')
  void audio.say(`shapes/${selected.value}`)
}
function sayObject(key: string) {
  audio.sfx('tap')
  void audio.say([`words/${key}`, `shapes/${selected.value}`])
}

onMounted(() => {
  startActivity('shapes-explorer')
  void audio.say('tap-a-shape')
})
</script>

<template>
  <ExplorerShell activity-id="shapes-explorer" :celebrate="celebrate" @replay="audio.say(`shapes/${selected}`)">
    <div class="flex w-full max-w-4xl flex-col items-center gap-5 sm:flex-row sm:items-stretch">
      <button type="button" class="toy flex flex-col items-center justify-center gap-2 bg-white/90 p-6" :aria-label="`${info.name}. Tap to hear it`" @click="poke">
        <Motion :key="`${selected}-${spin}`" as="span" :initial="{ scale: 0.5, rotate: -45 }" :animate="{ scale: 1, rotate: 0 }" :transition="{ type: 'spring', stiffness: 260, damping: 10 }">
          <ShapeIcon :shape="selected" :size="'clamp(150px, 30vw, 220px)'" />
        </Motion>
        <span class="text-5xl font-bold" :style="{ color: SHAPE_COLORS[selected] }">{{ info.name }}</span>
      </button>
      <div class="flex flex-1 flex-col items-center justify-center gap-3 rounded-[2.5rem] bg-white/90 p-5 shadow-soft">
        <span class="text-2xl font-bold text-ink">Looks like a {{ info.name.toLowerCase() }}!</span>
        <div class="flex flex-wrap justify-center gap-3">
          <button v-for="o in info.objects" :key="o" type="button" class="toy flex h-28 w-28 items-center justify-center bg-cream" :aria-label="o" @click="sayObject(o)">
            <ObjectIcon :name="o" :size="80" />
          </button>
        </div>
      </div>
    </div>

    <nav class="grid w-full max-w-3xl grid-cols-3 gap-4 sm:grid-cols-6" aria-label="Shapes">
      <button
        v-for="s in SHAPES"
        :key="s.id"
        type="button"
        class="toy relative flex aspect-square min-h-20 items-center justify-center bg-white"
        :class="selected === s.id ? 'ring-8 ring-sunny-deep' : ''"
        :aria-label="s.name"
        :aria-current="selected === s.id"
        @click="pickShape(s.id)"
      >
        <ShapeIcon :shape="s.id" :size="'70%'" />
        <span v-if="progress.exploredShapes.includes(s.id)" class="absolute -top-1 -right-1"><ObjectIcon name="star" :size="22" decorative /></span>
      </button>
    </nav>
  </ExplorerShell>
</template>
