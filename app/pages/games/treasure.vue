<script setup lang="ts">
import { LETTERS } from '~/data/learning'
import { pick, sample, shuffle } from '~/utils/random'

/** Search the meadow for the hidden number or letter Dino names. */
const { m } = useI18n()
const audio = useAudio()

// Hiding spots (percent of the scene) — by the tree, house, pond, bushes…
const SPOTS = [
  { x: 14, y: 30 }, { x: 25, y: 52 }, { x: 33, y: 82 }, { x: 47, y: 87 }, { x: 58, y: 72 },
  { x: 72, y: 50 }, { x: 70, y: 22 }, { x: 87, y: 80 }, { x: 93, y: 42 }, { x: 6, y: 72 }, { x: 44, y: 46 },
]

interface Token { id: string; glyph: string; voice: string; x: number; y: number; tilt: number }
const tokens = ref<Token[]>([])
const target = ref<Token | null>(null)
const found = ref<Token[]>([])
const flying = ref<string | null>(null)
const wobble = ref<string | null>(null)

function hide() {
  const nums = sample([1, 2, 3, 4, 5, 6, 7, 8, 9], 4).map((n) => ({ glyph: String(n), voice: `numbers/${n}` }))
  const lets = sample(LETTERS, 4).map((l) => ({ glyph: l.upper, voice: `letters/${l.lower}` }))
  const spots = shuffle(SPOTS)
  tokens.value = shuffle([...nums, ...lets]).map((t, i) => ({ ...t, id: `${t.glyph}-${i}`, x: spots[i]!.x, y: spots[i]!.y, tilt: Math.round(Math.random() * 30 - 15) }))
  found.value = []
}

const game = useGame({
  activityId: 'game-treasure',
  onRound(round) {
    if (round === 0) hide()
    target.value = pick(tokens.value)
    flying.value = null
    void audio.say(['can-you-find', target.value.voice])
  },
  instruction: () => (target.value ? ['can-you-find', target.value.voice] : []),
})

function tap(t: Token) {
  if (game.busy.value || flying.value) return
  if (t.id === target.value?.id) {
    flying.value = t.id
    audio.sfx('sparkle')
    game.correct({ voice: [t.voice] })
    setTimeout(() => {
      tokens.value = tokens.value.filter((x) => x.id !== t.id)
      found.value.push(t)
    }, 700)
  } else {
    wobble.value = t.id
    game.wrong({ voice: [t.voice, audio.encourage()] })
    setTimeout(() => (wobble.value = null), 600)
  }
}
</script>

<template>
  <GameShell :game="game" activity-id="game-treasure">
    <div class="flex w-full max-w-6xl flex-col items-center gap-4">
      <div class="flex w-full flex-wrap items-center justify-center gap-4">
        <GameQuestion :text="m.quiz.find" :voice="target ? ['can-you-find', target.voice] : []" :hint="target ? (/\d/.test(target.glyph) ? { kind: 'number', value: Number(target.glyph) } : { kind: 'letter', value: target.glyph }) : undefined" class="w-auto!" />
        <!-- treasure chest -->
        <div class="flex items-center gap-2 rounded-3xl bg-[#A0673C] px-4 py-2 shadow-pop" :aria-label="m.games.treasureChest">
          <ObjectIcon name="gem" :size="40" decorative />
          <div class="flex min-w-24 gap-1">
            <span v-for="f in found" :key="f.id" class="flex h-10 w-10 items-center justify-center rounded-full bg-sunny text-xl font-bold text-ink shadow-pop-sm">{{ f.glyph }}</span>
            <span v-if="!found.length" class="text-lg font-semibold text-white/80">{{ m.games.treasure }}</span>
          </div>
        </div>
      </div>

      <div class="relative aspect-[16/10] w-full overflow-hidden rounded-[2.5rem] shadow-soft">
        <TreasureScene />
        <button
          v-for="t in tokens"
          :key="t.id"
          type="button"
          class="absolute flex h-[clamp(64px,9vw,92px)] w-[clamp(64px,9vw,92px)] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[5px] border-white bg-gradient-to-br from-sunny to-sunny-deep text-[clamp(2rem,4.5vw,3rem)] font-bold text-ink shadow-pop transition-all duration-700"
          :class="[wobble === t.id ? 'animate-wiggle' : '', flying === t.id ? 'scale-150 opacity-0' : '']"
          :style="flying === t.id ? { left: '92%', top: '-10%' } : { left: `${t.x}%`, top: `${t.y}%`, rotate: `${t.tilt}deg` }"
          :aria-label="m.games.treasureItem(t.glyph)"
          @click="tap(t)"
        >
          {{ t.glyph }}
          <span class="absolute -top-1 -right-1 animate-twinkle" aria-hidden="true"><ObjectIcon name="sparkles" :size="22" decorative /></span>
        </button>
      </div>
    </div>
  </GameShell>
</template>
