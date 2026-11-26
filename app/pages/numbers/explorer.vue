<script setup lang="ts">
import { NUMBERS } from '~/data/learning'
import { glyphColorFor } from '~/utils/theme'

const audio = useAudio()
const { progress, learnNumber, addStars, completeActivity, startActivity, isCompleted } = useProgress()

const index = ref(0)
const info = computed(() => NUMBERS[index.value]!)
const celebrate = ref(0)
const countedThisVisit = new Set<number>()
const openedAt = Date.now()

function show(i: number) {
  index.value = Math.max(0, Math.min(NUMBERS.length - 1, i))
  const n = NUMBERS[index.value]!
  learnNumber(n.value)
  audio.preload([`numbers/${n.value}`, `count-the/${n.value}`])
  void audio.say([`numbers/${n.value}`, `count-the/${n.value}`])
}

function onCounted() {
  celebrate.value++
  if (!countedThisVisit.has(info.value.value)) {
    countedThisVisit.add(info.value.value)
    addStars(1)
  }
}

// Exploring every number completes the explorer activity once.
watch(
  () => progress.value.learnedNumbers.length,
  (n) => {
    if (n >= 20 && !isCompleted('numbers-explorer')) completeActivity('numbers-explorer', { stars: countedThisVisit.size, rounds: 20, durationMs: Date.now() - openedAt })
  },
)

onMounted(() => {
  startActivity('numbers-explorer')
  show(0)
})
</script>

<template>
  <ExplorerShell activity-id="numbers-explorer" :celebrate="celebrate" @replay="show(index)">
    <Motion :key="info.value" as="div" class="w-full" :initial="{ opacity: 0, x: 60 }" :animate="{ opacity: 1, x: 0 }" :transition="{ type: 'spring', stiffness: 240, damping: 24 }">
      <NumberCard :info="info" @counted="onCounted" />
    </Motion>

    <ExplorerNav :can-prev="index > 0" :can-next="index < NUMBERS.length - 1" @prev="show(index - 1)" @next="show(index + 1)">
      <span class="text-xl font-bold text-ink-soft">{{ info.value }} / 20</span>
    </ExplorerNav>

    <nav class="grid w-full max-w-3xl grid-cols-5 gap-2 sm:grid-cols-10" aria-label="All numbers">
      <button
        v-for="(n, i) in NUMBERS"
        :key="n.value"
        type="button"
        class="toy relative flex h-16 items-center justify-center bg-white text-3xl font-bold"
        :class="i === index ? 'ring-4 ring-sunny-deep' : ''"
        :style="{ color: glyphColorFor(n.value) }"
        :aria-label="`Number ${n.value}`"
        :aria-current="i === index"
        @click="show(i)"
      >
        {{ n.value }}
        <span v-if="progress.learnedNumbers.includes(n.value)" class="absolute -top-1 -right-1"><ObjectIcon name="star" :size="20" decorative /></span>
      </button>
    </nav>
  </ExplorerShell>
</template>
