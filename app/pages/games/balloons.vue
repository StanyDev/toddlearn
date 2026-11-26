<script setup lang="ts">
import { LETTERS } from '~/data/learning'
import { distractors, randInt, sample, shuffle } from '~/utils/random'

/** Pop the balloon that shows the number or letter Dino asks for. */
const { m } = useI18n()
const audio = useAudio()
const COLORS = ['#FF6B8B', '#3FB5EA', '#F5C842', '#3DBE8B', '#A78BFA', '#FF9F5A']

interface Balloon { id: string; label: string; voice: string; color: string; x: number; y: number; delay: number; dur: number }
const balloons = ref<Balloon[]>([])
const target = ref<Balloon | null>(null)
const popped = ref<string | null>(null)
const wobble = ref<string | null>(null)
const mode = ref<'number' | 'letter'>('number')

function layout(n: number) {
  // Spread balloons across the sky, alternating heights.
  return Array.from({ length: n }, (_, i) => ({ x: ((i + 0.5) / n) * 100, y: i % 2 ? 6 : 36 }))
}

const game = useGame({
  activityId: 'game-balloons',
  onRound(round) {
    mode.value = round % 2 === 0 ? 'number' : 'letter'
    const count = round < 2 ? 4 : 5
    let labels: { label: string; voice: string }[]
    if (mode.value === 'number') {
      const t = randInt(1, round < 2 ? 5 : 10)
      const nums = [t, ...distractors(Array.from({ length: 10 }, (_, i) => i + 1), t, count - 1)]
      labels = nums.map((n) => ({ label: String(n), voice: `numbers/${n}` }))
    } else {
      const letters = sample(LETTERS.map((l) => l.upper), count)
      labels = letters.map((l) => ({ label: l, voice: `letters/${l.toLowerCase()}` }))
    }
    const pos = layout(count)
    const colors = shuffle(COLORS)
    const built = labels.map((l, i) => ({
      id: `${round}-${i}`,
      ...l,
      color: colors[i % colors.length]!,
      x: pos[i]!.x,
      y: pos[i]!.y,
      delay: Math.random() * 1.5,
      dur: 2.6 + Math.random() * 1.4,
    }))
    target.value = built[0]!
    balloons.value = shuffle(built).map((b, i) => ({ ...b, x: pos[i]!.x, y: pos[i]!.y }))
    popped.value = null
    void audio.say(['pop-balloon', target.value.voice])
  },
  instruction: () => (target.value ? ['pop-balloon', target.value.voice] : []),
})

function tap(b: Balloon) {
  if (game.busy.value || popped.value) return
  if (b.id === target.value?.id) {
    popped.value = b.id
    audio.sfx('pop')
    game.correct({ voice: [b.voice] })
  } else {
    wobble.value = b.id
    game.wrong({ voice: [b.voice, audio.encourage()] })
    setTimeout(() => (wobble.value = null), 600)
  }
}
</script>

<template>
  <GameShell :game="game" activity-id="game-balloons" bg="bg-gradient-to-b from-sky to-[#E6F7FF]">
    <div class="flex w-full max-w-5xl flex-1 flex-col items-center gap-4">
      <GameQuestion :text="m.quiz.pop" :voice="target ? ['pop-balloon', target.voice] : []" :hint="target ? (mode === 'number' ? { kind: 'number', value: Number(target.label) } : { kind: 'letter', value: target.label }) : undefined" />

      <div class="relative w-full flex-1" style="min-height: min(60vh, 460px)">
        <template v-for="b in balloons" :key="b.id">
          <Motion
            as="button"
            type="button"
            class="absolute h-[clamp(130px,22vw,190px)] w-[clamp(84px,14vw,120px)] -translate-x-1/2 touch-none"
            :style="{ left: `${b.x}%`, top: `${b.y}%` }"
            :initial="{ y: 500, opacity: 0 }"
            :animate="popped === b.id ? { scale: 1.6, opacity: 0 } : { y: 0, opacity: 1, scale: 1 }"
            :transition="popped === b.id ? { duration: 0.25 } : { type: 'spring', stiffness: 60, damping: 12, delay: b.delay * 0.3 }"
            :aria-label="m.games.balloon(b.label)"
            @click="tap(b)"
          >
            <span class="balloon-bob block h-full w-full" :class="{ 'animate-wiggle': wobble === b.id }" :style="{ animationDuration: `${b.dur}s`, animationDelay: `-${b.delay}s` }">
              <BalloonSprite :label="b.label" :color="b.color" />
            </span>
          </Motion>
          <!-- pop burst -->
          <span v-if="popped === b.id" class="pointer-events-none absolute" :style="{ left: `${b.x}%`, top: `calc(${b.y}% + 60px)` }" aria-hidden="true">
            <span v-for="k in 10" :key="k" class="pop-bit absolute block h-3 w-3 rounded-full" :style="{ background: b.color, '--a': `${k * 36}deg` }" />
          </span>
        </template>
      </div>
    </div>
  </GameShell>
</template>

<style scoped>
.balloon-bob {
  animation-name: balloon-bob;
  animation-iteration-count: infinite;
  animation-timing-function: ease-in-out;
}
@keyframes balloon-bob {
  0%, 100% { transform: translateY(0) rotate(-3deg); }
  50% { transform: translateY(-16px) rotate(3deg); }
}
.pop-bit {
  animation: pop-bit 0.5s ease-out forwards;
}
@keyframes pop-bit {
  from { transform: rotate(var(--a)) translateX(0) scale(1); opacity: 1; }
  to { transform: rotate(var(--a)) translateX(80px) scale(0.3); opacity: 0; }
}
</style>
