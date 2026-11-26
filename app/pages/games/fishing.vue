<script setup lang="ts">
import { LETTERS } from '~/data/learning'
import { sample, shuffle } from '~/utils/random'

/** Catch the fish wearing the letter Dino asks for. */
const audio = useAudio()
const FISH_COLORS = [
  ['#FFB547', '#FF8A3D'],
  ['#FF7FA1', '#E8577F'],
  ['#6CC8F5', '#3AA6DE'],
  ['#8BE0B5', '#3DBE8B'],
  ['#C3A8FF', '#9B7BF7'],
]

interface Fish { id: string; letter: string; color: string; fin: string; row: number; dur: number; delay: number }
const fish = ref<Fish[]>([])
const target = ref<Fish | null>(null)
const caught = ref<{ id: string; x: number; y: number; phase: 'drop' | 'reel' } | null>(null)
const wobble = ref<string | null>(null)
const pond = ref<HTMLElement | null>(null)

const game = useGame({
  activityId: 'game-fishing',
  onRound(round) {
    const count = round < 2 ? 3 : 4
    const letters = sample(LETTERS.map((l) => l.upper), count)
    const colors = shuffle(FISH_COLORS)
    const rows = shuffle([0, 1, 2, 3].slice(0, count))
    const list = letters.map((l, i) => ({
      id: `${round}-${l}`,
      letter: l,
      color: colors[i % colors.length]![0]!,
      fin: colors[i % colors.length]![1]!,
      row: rows[i]!,
      dur: 9 + Math.random() * 6,
      delay: -Math.random() * 10,
    }))
    target.value = list[0]!
    fish.value = shuffle(list)
    caught.value = null
    void audio.say(['catch-fish', `letters/${target.value.letter.toLowerCase()}`])
  },
  instruction: () => (target.value ? ['catch-fish', `letters/${target.value.letter.toLowerCase()}`] : []),
})

function tap(f: Fish, e: MouseEvent) {
  if (game.busy.value || caught.value) return
  const key = `letters/${f.letter.toLowerCase()}`
  if (f.id !== target.value?.id) {
    wobble.value = f.id
    game.wrong({ voice: [key, audio.encourage()] })
    setTimeout(() => (wobble.value = null), 600)
    return
  }
  // Freeze the fish where it was tapped, drop the line, then reel it in.
  const box = pond.value!.getBoundingClientRect()
  const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
  caught.value = { id: f.id, x: r.left + r.width / 2 - box.left, y: r.top + r.height / 2 - box.top, phase: 'drop' }
  audio.sfx('whoosh')
  setTimeout(() => {
    if (!caught.value) return
    caught.value.phase = 'reel'
    audio.sfx('splash')
    game.correct({ voice: [key], delay: 2000 })
  }, 450)
}
</script>

<template>
  <GameShell :game="game" activity-id="game-fishing" bg="bg-gradient-to-b from-sky/60 to-cream">
    <div class="flex w-full max-w-5xl flex-1 flex-col items-center gap-4">
      <GameQuestion text="Catch" :voice="target ? ['catch-fish', `letters/${target.letter.toLowerCase()}`] : []" :hint="target ? { kind: 'letter', value: target.letter } : undefined" />

      <div class="relative w-full">
        <!-- dock with Dino fishing -->
        <div class="flex items-end gap-2 pl-4">
          <DinoMascot :size="96" :mood="caught?.phase === 'reel' ? 'cheer' : 'happy'" />
          <ObjectIcon name="fishing-pole" :size="80" decorative class="-ml-6 -scale-x-100" />
        </div>
        <div class="h-4 w-56 rounded-full bg-[#C98E45]" aria-hidden="true" />

        <div ref="pond" class="pond relative mt-1 h-[min(52vh,420px)] w-full overflow-hidden rounded-[2.5rem] bg-gradient-to-b from-[#7FD3F7] to-[#2F9FD8] shadow-soft">
          <svg class="absolute inset-x-0 top-0 h-6 w-full" viewBox="0 0 400 20" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 10 Q25 0 50 10 T100 10 T150 10 T200 10 T250 10 T300 10 T350 10 T400 10 V0 H0 Z" fill="#fff" opacity="0.4" />
          </svg>
          <span v-for="b in 8" :key="b" class="bubble absolute bottom-0 block rounded-full border-2 border-white/60" :style="{ left: `${b * 11}%`, width: `${8 + (b % 3) * 5}px`, height: `${8 + (b % 3) * 5}px`, animationDelay: `${-b * 0.9}s` }" aria-hidden="true" />
          <span class="absolute bottom-0 left-[8%] h-24 w-3 rounded-full bg-[#3DBE8B] [transform-origin:bottom] animate-[wiggle_3s_ease-in-out_infinite]" aria-hidden="true" />
          <span class="absolute bottom-0 left-[84%] h-32 w-3 rounded-full bg-[#5CCB9F] [transform-origin:bottom] animate-[wiggle_4s_ease-in-out_infinite]" aria-hidden="true" />

          <!-- fishing line -->
          <svg v-if="caught" class="pointer-events-none absolute inset-0 z-20 h-full w-full overflow-visible" aria-hidden="true">
            <line :x1="caught.x" y1="0" :x2="caught.x" :y2="caught.phase === 'drop' ? caught.y : -20" stroke="#3d3a5c" stroke-width="3" class="line-anim" />
          </svg>

          <button
            v-for="f in fish"
            :key="f.id"
            type="button"
            class="absolute z-10 h-[clamp(72px,12vw,100px)] w-[clamp(100px,17vw,140px)]"
            :class="caught?.id === f.id ? 'reeling' : 'swim'"
            :style="
              caught?.id === f.id
                ? { left: `${caught.x}px`, top: `${caught.phase === 'drop' ? caught.y : -160}px`, translate: '-50% -50%', rotate: '-70deg' }
                : { top: `${8 + f.row * 23}%`, animationDuration: `${f.dur}s`, animationDelay: `${f.delay}s` }
            "
            :aria-label="`Fish with letter ${f.letter}`"
            @click="tap(f, $event)"
          >
            <span class="block h-full w-full" :class="{ 'animate-wiggle': wobble === f.id }">
              <FishSprite
                :label="f.letter"
                :color="f.color"
                :fin="f.fin"
                :body-class="caught?.id === f.id ? '' : 'flip'"
                :body-style="{ animationDuration: `${f.dur}s`, animationDelay: `${f.delay}s` }"
              />
            </span>
          </button>
        </div>
      </div>
    </div>
  </GameShell>
</template>

<style scoped>
.swim {
  left: 2%;
  animation-name: swim;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
}
@keyframes swim {
  0%, 100% { left: 2%; }
  48%, 50% { left: calc(98% - 140px); }
  98% { left: 2%; }
}
/* Only the body turns around, so the letter is never mirrored. */
:deep(.flip) {
  animation-name: flip;
  animation-timing-function: step-end;
  animation-iteration-count: infinite;
}
@keyframes flip {
  0%, 49% { transform: scaleX(1); }
  49.01%, 98% { transform: scaleX(-1); }
  98.01%, 100% { transform: scaleX(1); }
}
.reeling {
  transition: top 0.9s cubic-bezier(0.5, 0, 0.75, 0), rotate 0.3s;
}
.line-anim {
  transition: y2 0.9s cubic-bezier(0.5, 0, 0.75, 0);
}
.bubble {
  animation: bubble 6s linear infinite;
}
@keyframes bubble {
  from { transform: translateY(0); opacity: 0.8; }
  to { transform: translateY(-440px); opacity: 0; }
}
</style>
