<script setup lang="ts">
import { FRUITS } from '~/data/objects'
import { pick, randInt } from '~/utils/random'

/** Count out the right number of fruits for the hungry monster. */
const audio = useAudio()

interface Fruit { id: number; key: string }
const target = ref(2)
const basket = ref<Fruit[]>([])
const fed = ref<Fruit[]>([])
const mood = ref<'hungry' | 'munch' | 'happy'>('hungry')
let nextId = 0

const game = useGame({
  activityId: 'game-monster',
  onRound(round) {
    target.value = round === 0 ? 2 : round === 1 ? 3 : randInt(round < 3 ? 1 : 3, round < 3 ? 5 : 8)
    const n = Math.max(8, target.value + 3)
    basket.value = Array.from({ length: n }, () => ({ id: nextId++, key: pick(FRUITS) }))
    fed.value = []
    mood.value = 'hungry'
    void audio.say(['feed-me', `numbers/${target.value}`, 'fruits'])
  },
  instruction: () => ['feed-me', `numbers/${target.value}`, 'fruits'],
})

function feed(id: number) {
  if (game.busy.value || fed.value.length >= target.value) return
  const f = basket.value.find((x) => x.id === id)
  if (!f) return
  basket.value = basket.value.filter((x) => x.id !== id)
  fed.value.push(f)
  mood.value = 'munch'
  audio.sfx('munch')
  const count = fed.value.length
  if (count === target.value) {
    setTimeout(() => {
      mood.value = 'happy'
      game.correct({ voice: [`numbers/${count}`, 'yum'], delay: 2400 })
    }, 500)
  } else {
    void audio.say(`numbers/${count}`)
    setTimeout(() => {
      if (mood.value === 'munch') mood.value = 'hungry'
    }, 700)
  }
}

const drag = useDragDrop<number>({
  enabled: () => !game.busy.value,
  onTap: feed,
  onDrop: (id, zone) => {
    if (zone === 'mouth') feed(id)
  },
})
const mouthOpen = computed(() => drag.dragging.value !== null)
</script>

<template>
  <GameShell :game="game" activity-id="game-monster">
    <div class="flex w-full max-w-5xl flex-1 flex-col items-center gap-4">
      <div class="flex w-full flex-col items-center gap-4 sm:flex-row sm:justify-center">
        <div
          class="relative h-[clamp(190px,32vw,270px)] w-[clamp(190px,32vw,270px)] rounded-full transition-transform"
          :class="drag.overDrop.value === 'mouth' ? 'scale-110' : ''"
          data-drop="mouth"
          role="img"
          aria-label="Hungry monster"
        >
          <MonsterSprite :mood="mood" :open="mouthOpen" />
        </div>
        <div class="flex flex-col items-center gap-3">
          <SpeechBubble color="bg-white">
            <button type="button" class="flex items-center gap-3" aria-label="Hear how many fruits" @click="game.replayInstruction()">
              <span class="text-3xl font-bold">Feed me</span>
              <BigGlyph :value="target" size="4rem" />
              <ObjectIcon name="strawberry" :size="44" decorative />
            </button>
          </SpeechBubble>
          <!-- tummy counter -->
          <div class="flex min-h-20 flex-wrap items-center justify-center gap-2 rounded-3xl bg-white/80 px-4 py-2" aria-live="polite" :aria-label="`${fed.length} fed`">
            <span v-for="i in target" :key="i" class="relative flex h-14 w-14 items-center justify-center rounded-2xl border-4 border-dashed" :class="fed[i - 1] ? 'border-transparent bg-mint/60' : 'border-ink/15'">
              <Motion v-if="fed[i - 1]" as="span" :initial="{ scale: 0 }" :animate="{ scale: 1 }"><ObjectIcon :name="fed[i - 1]!.key" :size="40" decorative /></Motion>
              <span class="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-white text-sm font-bold text-ink shadow-pop-sm">{{ i }}</span>
            </span>
          </div>
        </div>
      </div>

      <!-- basket -->
      <div class="relative mt-auto w-full rounded-t-[3rem] rounded-b-3xl bg-[#E9B872] p-4 shadow-pop" aria-label="Fruit basket">
        <div class="absolute inset-x-6 top-3 h-2 rounded-full bg-[#C98E45]/40" aria-hidden="true" />
        <div class="flex flex-wrap justify-center gap-2 pt-2">
          <button
            v-for="f in basket"
            :key="f.id"
            type="button"
            class="fruit-in flex h-20 w-20 touch-none items-center justify-center rounded-2xl bg-white/50 active:bg-white sm:h-24 sm:w-24"
            :style="drag.styleFor(f.id)"
            :aria-label="`Feed ${f.key}`"
            v-bind="drag.handlers(f.id)"
            @keydown.enter.prevent="feed(f.id)"
          >
            <ObjectIcon :name="f.key" :size="62" decorative />
          </button>
        </div>
      </div>
    </div>
  </GameShell>
</template>

<style scoped>
.fruit-in {
  animation: fruit-in 0.4s cubic-bezier(0.3, 1.6, 0.5, 1) both;
}
@keyframes fruit-in {
  from { scale: 0; }
  to { scale: 1; }
}
</style>
