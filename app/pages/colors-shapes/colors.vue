<script setup lang="ts">
import type { ColorId } from '~/types'
import { COLORS, colorById } from '~/data/learning'

const audio = useAudio()
const { progress, exploreColor, addStars, startActivity, completeActivity, isCompleted } = useProgress()
const selected = ref<ColorId>('red')
const celebrate = ref(0)
const info = computed(() => colorById(selected.value))
const openedAt = Date.now()

function pickColor(id: ColorId) {
  const isNew = !progress.value.exploredColors.includes(id)
  selected.value = id
  exploreColor(id)
  audio.sfx(isNew ? 'sparkle' : 'tap')
  void audio.say(`colors/${id}`)
  if (isNew) {
    celebrate.value++
    addStars(1)
  }
  if (progress.value.exploredColors.length === COLORS.length && !isCompleted('colors-explorer')) {
    completeActivity('colors-explorer', { stars: COLORS.length, rounds: COLORS.length, durationMs: Date.now() - openedAt })
  }
}
function sayObject(key: string) {
  audio.sfx('tap')
  void audio.say([`words/${key}`, `colors/${selected.value}`])
}

onMounted(() => {
  startActivity('colors-explorer')
  void audio.say('tap-a-color')
})
</script>

<template>
  <ExplorerShell activity-id="colors-explorer" :celebrate="celebrate" @replay="audio.say(`colors/${selected}`)">
    <Motion
      :key="selected"
      as="div"
      class="flex w-full max-w-3xl flex-col items-center gap-4 rounded-[2.5rem] p-6 shadow-soft"
      :style="{ background: info.hex, color: info.onHex }"
      :class="selected === 'white' ? 'ring-4 ring-ink/10' : ''"
      :initial="{ scale: 0.85, opacity: 0 }"
      :animate="{ scale: 1, opacity: 1 }"
      :transition="{ type: 'spring', stiffness: 260, damping: 18 }"
    >
      <button type="button" class="flex items-center gap-3 text-5xl font-bold sm:text-6xl" :aria-label="`${info.name}. Tap to hear it`" @click="audio.say(`colors/${selected}`)">
        {{ info.name }}
        <svg viewBox="0 0 48 48" class="h-10 w-10" aria-hidden="true"><path d="M8 18 H16 L27 9 V39 L16 30 H8 Z" fill="currentColor" /><path d="M33 17 Q38 24 33 31 M38 12 Q46 24 38 36" stroke="currentColor" stroke-width="4" fill="none" stroke-linecap="round" /></svg>
      </button>
      <div class="flex flex-wrap justify-center gap-3">
        <button
          v-for="o in info.objects"
          :key="o"
          type="button"
          class="toy flex h-28 w-28 items-center justify-center bg-white sm:h-32 sm:w-32"
          :aria-label="o"
          @click="sayObject(o)"
        >
          <ObjectIcon :name="o" :size="84" />
        </button>
      </div>
    </Motion>

    <nav class="grid w-full max-w-3xl grid-cols-5 gap-3 sm:grid-cols-9 sm:gap-2" aria-label="Colors">
      <button
        v-for="c in COLORS"
        :key="c.id"
        type="button"
        class="toy relative flex aspect-square min-w-16 items-center justify-center rounded-full!"
        :class="[selected === c.id ? 'scale-110 ring-8 ring-white' : '', c.id === 'white' ? 'border-4 border-ink/10' : '']"
        :style="{ background: c.hex }"
        :aria-label="c.name"
        :aria-current="selected === c.id"
        @click="pickColor(c.id)"
      >
        <span class="absolute top-2 left-3 h-4 w-6 -rotate-30 rounded-full bg-white/40" aria-hidden="true" />
        <span v-if="progress.exploredColors.includes(c.id)" class="absolute -top-1 -right-1"><ObjectIcon name="star" :size="22" decorative /></span>
      </button>
    </nav>
  </ExplorerShell>
</template>
