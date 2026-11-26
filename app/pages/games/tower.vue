<script setup lang="ts">
import { randInt } from '~/utils/random'

/** Stack exactly N blocks — Dino counts each one out loud. */
const { m } = useI18n()
const audio = useAudio()
const BLOCK_COLORS = ['#FF7FA1', '#3FB5EA', '#F6C94A', '#5CCB9F', '#A78BFA', '#FF9F5A']

const target = ref(3)
const blocks = ref<{ id: number; color: string }[]>([])
let nextId = 0

const game = useGame({
  activityId: 'game-tower',
  onRound(round) {
    target.value = round === 0 ? 3 : randInt(round < 3 ? 2 : 4, round < 3 ? 5 : 8)
    blocks.value = []
    void audio.say(['build-tower', `numbers/${target.value}`, 'blocks'])
  },
  instruction: () => ['build-tower', `numbers/${target.value}`, 'blocks'],
})

function addBlock(color?: string) {
  if (game.busy.value || blocks.value.length >= target.value) return
  const i = blocks.value.length
  blocks.value.push({ id: nextId++, color: color ?? BLOCK_COLORS[i % BLOCK_COLORS.length]! })
  audio.sfx('block')
  const n = blocks.value.length
  if (n === target.value) {
    setTimeout(() => game.correct({ voice: [`numbers/${n}`, 'tower-done'], delay: 2600 }), 350)
  } else {
    void audio.say(`numbers/${n}`)
  }
}

function removeTop() {
  if (game.busy.value || !blocks.value.length) return
  blocks.value.pop()
  audio.sfx('whoosh')
}

const blockSize = computed(() => (target.value > 6 ? 'h-[min(7vh,56px)]' : 'h-[min(9vh,72px)]'))
</script>

<template>
  <GameShell :game="game" activity-id="game-tower">
    <div class="flex w-full max-w-5xl flex-col items-center gap-4 sm:flex-row sm:items-end sm:justify-center sm:gap-10">
      <!-- goal + counter -->
      <div class="flex flex-row items-center gap-4 sm:flex-col">
        <button type="button" class="toy flex flex-col items-center gap-1 bg-white px-6 py-4" :aria-label="m.games.hearHowManyBlocks" @click="game.replayInstruction()">
          <span class="text-xl font-bold text-ink-soft">{{ m.games.build }}</span>
          <BigGlyph :value="target" size="5rem" />
          <span class="text-xl font-bold text-ink-soft">{{ m.games.blocks }}</span>
        </button>
        <div class="flex items-center gap-2 rounded-full bg-white/80 px-5 py-2 text-3xl font-bold text-ink" aria-live="polite">
          <ObjectIcon name="bricks" :size="36" decorative />
          {{ blocks.length }} / {{ target }}
        </div>
      </div>

      <!-- tower -->
      <div class="relative flex w-[min(60vw,260px)] flex-col-reverse items-center" :aria-label="m.games.tower">
        <div class="h-5 w-[130%] rounded-full bg-[#7FD8B0]" aria-hidden="true" />
        <!-- ghost slots show how tall the tower should be -->
        <div class="absolute bottom-5 flex w-full flex-col-reverse" aria-hidden="true">
          <div v-for="i in target" :key="`g-${i}`" class="mt-1 flex w-full items-center justify-center rounded-2xl border-4 border-dashed border-ink/15" :class="blockSize">
            <span class="text-2xl font-bold text-ink/20">{{ i }}</span>
          </div>
        </div>
        <Motion
          v-for="(b, i) in blocks"
          :key="b.id"
          as="button"
          type="button"
          class="relative z-10 mt-1 flex w-full items-center justify-between rounded-2xl px-4 shadow-pop-sm"
          :class="blockSize"
          :style="{ background: b.color }"
          :initial="{ y: -360, rotate: i % 2 ? 6 : -6 }"
          :animate="{ y: 0, rotate: 0 }"
          :transition="{ type: 'spring', stiffness: 380, damping: 18 }"
          :aria-label="i === blocks.length - 1 ? m.games.blockTakeOff(i + 1) : m.games.block(i + 1)"
          @click="i === blocks.length - 1 && removeTop()"
        >
          <span class="h-3 w-3 rounded-full bg-white/50" />
          <span class="text-3xl font-bold text-white drop-shadow">{{ i + 1 }}</span>
          <span class="h-3 w-3 rounded-full bg-white/50" />
        </Motion>
      </div>

      <!-- block pile -->
      <div class="grid grid-cols-3 gap-3 rounded-[2rem] bg-white/70 p-4" :aria-label="m.games.blocksToStack">
        <button
          v-for="c in BLOCK_COLORS"
          :key="c"
          type="button"
          class="toy h-20 w-20 sm:h-24 sm:w-24"
          :style="{ background: c }"
          :aria-label="m.games.addBlock"
          :disabled="blocks.length >= target"
          @click="addBlock(c)"
        >
          <span class="absolute inset-3 rounded-xl border-4 border-white/40" />
        </button>
      </div>
    </div>
  </GameShell>
</template>
