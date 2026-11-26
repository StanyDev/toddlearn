<script setup lang="ts">
import { LETTERS, letterInfo } from '~/data/learning'
import { pickFresh } from '~/utils/random'
import { glyphColorFor } from '~/utils/theme'

const audio = useAudio()
const { traceLetter } = useProgress()
const letter = ref('A')
const recent: string[] = []

const game = useGame({
  activityId: 'alphabet-trace',
  onRound(round) {
    // Begin with letters made of straight lines, then everything.
    const easy = ['L', 'T', 'I', 'H', 'E', 'F', 'V', 'X', 'A', 'N', 'Z', 'O']
    letter.value = pickFresh(round < 2 ? easy : LETTERS.map((l) => l.upper), recent, 5)
    void audio.say(['trace-letter', `letters/${letter.value.toLowerCase()}`])
  },
  instruction: () => ['trace-letter', `letters/${letter.value.toLowerCase()}`],
})

const info = computed(() => letterInfo(letter.value))
const glyphs = computed(() => [info.value.upper, info.value.lower])

function onComplete() {
  traceLetter(info.value.upper)
  traceLetter(info.value.lower)
  game.correct({ voice: [`letter-words/${info.value.lower}`] })
}
</script>

<template>
  <GameShell :game="game" activity-id="alphabet-trace">
    <div class="flex w-full max-w-5xl flex-col items-center gap-5 lg:flex-row lg:items-center">
      <div class="flex shrink-0 flex-row items-center gap-4 rounded-[2rem] bg-white/90 p-4 shadow-soft lg:flex-col">
        <BigGlyph :value="`${info.upper}${info.lower}`" size="4.5rem" :color="glyphColorFor(info.upper)" />
        <ObjectIcon :name="info.object" :size="80" />
        <span class="text-2xl font-bold text-ink">{{ info.word }}</span>
        <AudioButton :voice="[`letter-words/${info.lower}`]" size="md" />
      </div>
      <TracingBoard :key="`${game.round.value}-${letter}`" class="flex-1" :glyphs="glyphs" :color="glyphColorFor(info.upper)" @complete="onComplete" />
    </div>
  </GameShell>
</template>
