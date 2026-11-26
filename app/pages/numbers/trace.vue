<script setup lang="ts">
import { numberInfo } from '~/data/learning'
import { pickFresh, randInt } from '~/utils/random'
import { glyphColorFor } from '~/utils/theme'

const audio = useAudio()
const { traceNumber } = useProgress()
const target = ref(1)
const recent: number[] = []

const game = useGame({
  activityId: 'numbers-trace',
  onRound(round) {
    // Start with single digits, then mix in teens.
    const pool = round < 3 ? [1, 2, 3, 4, 5, 6, 7, 8, 9] : Array.from({ length: 20 }, (_, i) => i + 1)
    target.value = round === 0 ? randInt(1, 5) : pickFresh(pool, recent, 4)
    void audio.say(['trace-number', `numbers/${target.value}`])
  },
  instruction: () => ['trace-number', `numbers/${target.value}`],
})

const glyphs = computed(() => String(target.value).split(''))
const info = computed(() => numberInfo(target.value))

function onComplete() {
  traceNumber(target.value)
  game.correct({ voice: [`numbers/${target.value}`] })
}
</script>

<template>
  <GameShell :game="game" activity-id="numbers-trace">
    <div class="flex w-full max-w-5xl flex-col items-center gap-5 lg:flex-row lg:items-center">
      <div class="flex shrink-0 flex-row items-center gap-4 rounded-[2rem] bg-white/90 p-4 shadow-soft lg:flex-col">
        <BigGlyph :value="target" size="5rem" />
        <span class="text-3xl font-bold" :style="{ color: glyphColorFor(target) }">{{ info.name }}</span>
        <AudioButton :voice="[`numbers/${target}`]" size="md" />
        <ObjectCounter class="hidden sm:flex" :object="info.object" :count="target" :size="target > 10 ? 22 : 30" />
      </div>
      <TracingBoard :key="`${game.round.value}-${target}`" class="flex-1" :glyphs="glyphs" :color="glyphColorFor(target)" @complete="onComplete" />
    </div>
  </GameShell>
</template>
