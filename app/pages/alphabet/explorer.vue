<script setup lang="ts">
import { LETTERS } from '~/data/learning'
import { glyphColorFor } from '~/utils/theme'
const { m } = useI18n()

const audio = useAudio()
const { progress, learnLetter, addStars, completeActivity, startActivity, isCompleted } = useProgress()

const index = ref(0)
const info = computed(() => LETTERS[index.value]!)
const celebrate = ref(0)
const heardThisVisit = new Set<string>()
const openedAt = Date.now()

function show(i: number) {
  index.value = Math.max(0, Math.min(LETTERS.length - 1, i))
  const l = LETTERS[index.value]!
  learnLetter(l.upper)
  audio.preload([`letters/${l.lower}`, `letter-words/${l.lower}`])
  void audio.say([`letters/${l.lower}`, `letter-words/${l.lower}`])
}

function onHeard() {
  if (heardThisVisit.has(info.value.upper)) return
  heardThisVisit.add(info.value.upper)
  celebrate.value++
  audio.sfx('star')
  addStars(1)
}

watch(
  () => progress.value.learnedLetters.length,
  (n) => {
    if (n >= 26 && !isCompleted('alphabet-explorer')) completeActivity('alphabet-explorer', { stars: heardThisVisit.size, rounds: 26, durationMs: Date.now() - openedAt })
  },
)

onMounted(() => {
  startActivity('alphabet-explorer')
  show(0)
})
</script>

<template>
  <ExplorerShell activity-id="alphabet-explorer" :celebrate="celebrate" @replay="show(index)">
    <Motion :key="info.upper" as="div" class="w-full" :initial="{ opacity: 0, x: 60 }" :animate="{ opacity: 1, x: 0 }" :transition="{ type: 'spring', stiffness: 240, damping: 24 }">
      <AlphabetCard :info="info" @heard="onHeard" />
    </Motion>

    <ExplorerNav :can-prev="index > 0" :can-next="index < LETTERS.length - 1" @prev="show(index - 1)" @next="show(index + 1)">
      <span class="text-xl font-bold text-ink-soft">{{ index + 1 }} / 26</span>
    </ExplorerNav>

    <nav class="grid w-full max-w-4xl grid-cols-6 gap-2 sm:grid-cols-9 lg:grid-cols-13" :aria-label="m.explorer.allLetters">
      <button
        v-for="(l, i) in LETTERS"
        :key="l.upper"
        type="button"
        class="toy relative flex h-16 items-center justify-center bg-white text-3xl font-bold"
        :class="i === index ? 'ring-4 ring-sunny-deep' : ''"
        :style="{ color: glyphColorFor(l.upper) }"
        :aria-label="m.common.letter(l.upper)"
        :aria-current="i === index"
        @click="show(i)"
      >
        {{ l.upper }}
        <span v-if="progress.learnedLetters.includes(l.upper)" class="absolute -top-1 -right-1"><ObjectIcon name="star" :size="20" decorative /></span>
      </button>
    </nav>
  </ExplorerShell>
</template>
