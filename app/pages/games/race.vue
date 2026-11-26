<script setup lang="ts">
import type { Choice, QuizQuestion } from '~/types'
import { countObjects } from '~/utils/generators'
import { visualLabel } from '~/utils/labels'

/** Count correctly to drive Dino's car to the finish line. */
const audio = useAudio()
const question = ref<QuizQuestion | null>(null)
const solved = ref<string | null>(null)
const wrongId = ref<string | null>(null)
const moving = ref(false)
const recent: unknown[] = []

const game = useGame({
  activityId: 'game-race',
  advanceDelay: 2000,
  onRound(round) {
    question.value = countObjects(round, recent)
    solved.value = null
    wrongId.value = null
    void audio.say(round === 0 ? ['race-intro', 'how-many'] : ['how-many'])
  },
  instruction: () => ['how-many'],
})

const steps = computed(() => game.totalRounds.value)
const position = computed(() => {
  if (game.finished.value) return 1
  return (game.round.value + (solved.value ? 1 : 0)) / steps.value
})

function select(c: Choice) {
  const q = question.value
  if (!q || solved.value || game.busy.value) return
  if (c.id === q.answerId) {
    solved.value = c.id
    moving.value = true
    audio.sfx('vroom')
    setTimeout(() => (moving.value = false), 1200)
    const last = game.round.value + 1 >= steps.value
    game.correct({ voice: [...(c.voice ?? []), ...(last ? ['finish-line'] : [])], delay: last ? 3200 : 2000 })
  } else {
    wrongId.value = c.id
    game.wrong({ voice: [...(c.voice ?? []), audio.encourage()] })
    setTimeout(() => (wrongId.value = null), 600)
  }
}
const stateOf = (c: Choice) => (solved.value ? (c.id === solved.value ? 'correct' : 'dim') : c.id === wrongId.value ? 'wrong' : 'idle')
</script>

<template>
  <GameShell :game="game" activity-id="game-race" :show-progress="false">
    <div class="flex w-full max-w-5xl flex-col items-center gap-5">
      <!-- race track -->
      <div class="relative w-full rounded-[2rem] bg-mint/70 px-4 pt-4 pb-2 shadow-soft" role="progressbar" :aria-valuenow="Math.round(position * 100)" aria-valuemin="0" aria-valuemax="100" aria-label="Race progress">
        <div class="relative h-[clamp(110px,16vw,150px)]">
          <div class="absolute inset-x-0 bottom-0 h-10 rounded-full bg-ink/70">
            <div class="absolute inset-x-4 top-1/2 h-1.5 -translate-y-1/2 bg-[repeating-linear-gradient(90deg,#fff_0_24px,transparent_24px_48px)]" />
          </div>
          <!-- checkpoints -->
          <span
            v-for="i in steps"
            :key="i"
            class="absolute bottom-12 flex h-8 w-8 -translate-x-1/2 items-center justify-center"
            :style="{ left: `calc(5.5rem + (100% - 9.5rem) * ${i / steps})` }"
            aria-hidden="true"
          >
            <ObjectIcon v-if="i === steps" name="flag" :size="46" />
            <ObjectIcon v-else name="star" :size="30" :class="position * steps >= i ? '' : 'opacity-30 grayscale'" />
          </span>
          <div
            class="absolute bottom-3 h-[clamp(90px,13vw,120px)] w-[clamp(140px,20vw,190px)] -translate-x-1/2 transition-[left] duration-[1200ms] ease-[cubic-bezier(.3,1.3,.5,1)]"
            :style="{ left: `calc(5.5rem + (100% - 9.5rem) * ${position})` }"
          >
            <RaceCar :moving="moving" />
          </div>
        </div>
      </div>

      <template v-if="question">
        <GameQuestion :text="question.text" :voice="question.voice" :prompt="question.prompt" />
        <div class="flex flex-wrap justify-center gap-4">
          <AnswerOption v-for="c in question.choices" :key="`${game.round.value}-${c.id}`" :state="stateOf(c)" size="md" :label="visualLabel(c.visual)" @select="select(c)">
            <ChoiceVisual :visual="c.visual" />
          </AnswerOption>
        </div>
      </template>
    </div>
  </GameShell>
</template>
