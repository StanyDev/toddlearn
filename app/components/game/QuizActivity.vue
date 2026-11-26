<script setup lang="ts">
import type { ActivityId, Choice, QuizQuestion } from '~/types'
import type { Generator } from '~/utils/generators'
import { visualLabel } from '~/utils/labels'

/** Generic "pick the right answer" activity driven by a question generator. */
const props = defineProps<{ activityId: ActivityId; generate: Generator }>()
const audio = useAudio()

const question = ref<QuizQuestion | null>(null)
const wrongId = ref<string | null>(null)
const solvedId = ref<string | null>(null)
const recent: unknown[] = []

const game = useGame({
  activityId: props.activityId,
  onRound(round) {
    question.value = props.generate(round, recent)
    wrongId.value = null
    solvedId.value = null
    audio.preload(question.value.choices.flatMap((c) => c.voice ?? []))
    void audio.say(question.value.voice)
  },
  instruction: () => question.value?.voice ?? [],
})

function select(choice: Choice) {
  const q = question.value
  if (!q || game.busy.value || solvedId.value) return
  if (choice.id === q.answerId) {
    solvedId.value = choice.id
    game.correct({ voice: choice.voice })
  } else {
    wrongId.value = choice.id
    game.wrong({ voice: [...(choice.voice ?? []), audio.encourage()] })
    setTimeout(() => {
      if (wrongId.value === choice.id) wrongId.value = null
    }, 600)
  }
}

function stateOf(c: Choice) {
  if (solvedId.value) return c.id === solvedId.value ? 'correct' : 'dim'
  return c.id === wrongId.value ? 'wrong' : 'idle'
}
const revealed = computed(() => {
  const q = question.value
  if (!solvedId.value || !q || q.prompt.kind !== 'sequence') return null
  const v = q.choices.find((c) => c.id === solvedId.value)!.visual
  return v.kind === 'number' ? String(v.value) : v.kind === 'letter' ? v.value : null
})
</script>

<template>
  <GameShell :game="game" :activity-id="activityId">
    <Motion
      v-if="question"
      :key="game.round.value"
      as="div"
      class="flex w-full max-w-4xl flex-col items-center gap-8"
      :initial="{ x: 80, opacity: 0 }"
      :animate="{ x: 0, opacity: 1 }"
      :transition="{ type: 'spring', stiffness: 220, damping: 24 }"
    >
      <GameQuestion :text="question.text" :voice="question.voice" :hint="question.hint" :prompt="question.prompt" :revealed="revealed" />
      <div
        class="flex w-full justify-center gap-4 sm:gap-6"
        :class="question.layout === 'pair' ? 'flex-col sm:flex-row' : 'flex-wrap'"
      >
        <AnswerOption
          v-for="c in question.choices"
          :key="c.id"
          :state="stateOf(c)"
          :size="question.layout === 'pair' ? 'wide' : 'lg'"
          :class="question.layout === 'pair' ? 'sm:flex-1' : ''"
          :label="visualLabel(c.visual)"
          @select="select(c)"
        >
          <ChoiceVisual :visual="c.visual" :scale="question.layout === 'pair' ? 1.25 : 1" />
        </AnswerOption>
      </div>
    </Motion>
  </GameShell>
</template>
