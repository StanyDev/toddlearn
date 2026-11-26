<script setup lang="ts">
import type { ChoiceVisual } from '~/types'
import { ANIMALS } from '~/data/objects'
import { LETTERS, numberInfo } from '~/data/learning'
import { sample, shuffle } from '~/utils/random'
import { visualLabel } from '~/utils/labels'

/** Flip cards to find pairs: animals, numbers ↔ amounts, or big ↔ little letters. */
const { m } = useI18n()
type Deck = 'animals' | 'numbers' | 'letters'
interface Card { uid: number; pair: string; visual: ChoiceVisual; voice: string }

const audio = useAudio()
const { progress } = useProgress()
const deck = ref<Deck | null>(null)
const cards = ref<Card[]>([])
const open = ref<number[]>([])
const found = ref<string[]>([])
const lock = ref(false)

const pairCount = computed(() => ((progress.value.activities['game-memory']?.completed ?? 0) === 0 ? 3 : 4))

function build(d: Deck): Card[] {
  const n = pairCount.value
  let list: Card[] = []
  if (d === 'animals') {
    list = sample(ANIMALS, n).flatMap((a, i) => [0, 1].map((k) => ({ uid: i * 2 + k, pair: a, visual: { kind: 'object', key: a } as ChoiceVisual, voice: `words/${a}` })))
  } else if (d === 'numbers') {
    list = sample([1, 2, 3, 4, 5, 6], n).flatMap((v, i) => [
      { uid: i * 2, pair: String(v), visual: { kind: 'number', value: v } as ChoiceVisual, voice: `numbers/${v}` },
      { uid: i * 2 + 1, pair: String(v), visual: { kind: 'group', object: numberInfo(v).object, count: v } as ChoiceVisual, voice: `numbers/${v}` },
    ])
  } else {
    list = sample(LETTERS, n).flatMap((l, i) => [
      { uid: i * 2, pair: l.upper, visual: { kind: 'letter', value: l.upper } as ChoiceVisual, voice: `letters/${l.lower}` },
      { uid: i * 2 + 1, pair: l.upper, visual: { kind: 'letter', value: l.lower } as ChoiceVisual, voice: `letters/${l.lower}` },
    ])
  }
  return shuffle(list)
}

const game = useGame({
  activityId: 'game-memory',
  rounds: 3,
  autoStart: false,
  advanceDelay: 900,
  onRound(round) {
    if (round === 0 && deck.value) {
      cards.value = build(deck.value)
      open.value = []
      found.value = []
      lock.value = false
      void audio.say('memory-intro')
    }
  },
  instruction: () => ['memory-intro'],
})

function choose(d: Deck) {
  deck.value = d
  audio.sfx('tap')
  game.totalRounds.value = pairCount.value
  game.start()
}

function flip(c: Card) {
  if (lock.value || game.busy.value || open.value.includes(c.uid) || found.value.includes(c.pair)) return
  audio.sfx('flip')
  void audio.say(c.voice)
  open.value.push(c.uid)
  if (open.value.length < 2) return
  const [a, b] = open.value.map((u) => cards.value.find((x) => x.uid === u)!)
  if (a!.pair === b!.pair) {
    found.value.push(a!.pair)
    open.value = []
    setTimeout(() => game.correct({ voice: ['its-a-match'] }), 350)
  } else {
    lock.value = true
    setTimeout(() => {
      open.value = []
      lock.value = false
      audio.sfx('flip')
    }, 1100)
  }
}

const isUp = (c: Card) => open.value.includes(c.uid) || found.value.includes(c.pair)
</script>

<template>
  <GameShell :game="game" activity-id="game-memory">
    <!-- deck picker -->
    <div v-if="!deck" class="flex flex-col items-center gap-6">
      <div class="flex items-center gap-2">
        <DinoMascot :size="120" mood="excited" listen />
        <SpeechBubble><span class="text-2xl font-bold">{{ m.games.pickCards }}</span></SpeechBubble>
      </div>
      <div class="flex flex-wrap justify-center gap-5">
        <button type="button" class="toy flex h-40 w-40 flex-col items-center justify-center gap-2 bg-mint" :aria-label="m.games.animalCards" @click="choose('animals')">
          <span class="flex -space-x-4"><ObjectIcon name="cat" :size="64" /><ObjectIcon name="dog" :size="64" /></span>
          <span class="text-xl font-bold">{{ m.games.animals }}</span>
        </button>
        <button type="button" class="toy flex h-40 w-40 flex-col items-center justify-center gap-2 bg-sky" :aria-label="m.games.numberCards" @click="choose('numbers')">
          <span class="flex items-center gap-2"><BigGlyph value="3" size="3.5rem" /><ObjectCounter object="apple" :count="3" :size="22" /></span>
          <span class="text-xl font-bold">{{ m.games.numbers }}</span>
        </button>
        <button type="button" class="toy flex h-40 w-40 flex-col items-center justify-center gap-2 bg-bubblegum" :aria-label="m.games.letterCards" @click="choose('letters')">
          <BigGlyph value="Aa" size="3.5rem" />
          <span class="text-xl font-bold">{{ m.games.letters }}</span>
        </button>
      </div>
    </div>

    <!-- board -->
    <div v-else class="grid w-full max-w-3xl gap-3 sm:gap-4" :class="cards.length <= 6 ? 'grid-cols-3' : 'grid-cols-4'">
      <button
        v-for="c in cards"
        :key="c.uid"
        type="button"
        class="card aspect-[3/4] min-h-28 [perspective:900px]"
        :aria-label="isUp(c) ? visualLabel(c.visual) : m.games.hiddenCard"
        @click="flip(c)"
      >
        <span class="card-inner relative block h-full w-full transition-transform duration-500 [transform-style:preserve-3d]" :class="{ 'is-up': isUp(c) }">
          <span class="absolute inset-0 flex items-center justify-center rounded-3xl bg-gradient-to-br from-lavender-deep to-bubblegum-deep shadow-pop [backface-visibility:hidden]">
            <span class="flex h-1/2 w-1/2 items-center justify-center rounded-full bg-white/25"><DinoMascot :size="'90%'" :animated="false" :decoration="null" /></span>
          </span>
          <span
            class="absolute inset-0 flex items-center justify-center rounded-3xl bg-white shadow-pop [backface-visibility:hidden] [transform:rotateY(180deg)]"
            :class="found.includes(c.pair) ? 'ring-8 ring-mint-deep/70' : ''"
          >
            <ChoiceVisual :visual="c.visual" :scale="c.visual.kind === 'group' ? 0.7 : 0.95" />
          </span>
        </span>
      </button>
    </div>
  </GameShell>
</template>

<style scoped>
.is-up {
  transform: rotateY(180deg);
}
</style>
