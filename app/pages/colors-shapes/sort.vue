<script setup lang="ts">
import type { ColorId, ShapeId } from '~/types'
import { colorById, shapeById } from '~/data/learning'
import { pick, sample, shuffle } from '~/utils/random'

/** Sort coloured shapes into boxes — by colour, then by shape. */
const audio = useAudio()

interface Item { id: number; shape: ShapeId; color: ColorId }
const mode = ref<'color' | 'shape'>('color')
const bins = ref<string[]>([])
const items = ref<Item[]>([])
const sorted = ref<Record<string, Item[]>>({})
const selected = ref<number | null>(null)
const wrongBin = ref<string | null>(null)
const wrongItem = ref<number | null>(null)

const SORT_COLORS: ColorId[] = ['red', 'blue', 'yellow', 'green', 'purple', 'orange']
const SORT_SHAPES: ShapeId[] = ['circle', 'square', 'triangle', 'star', 'heart']

const game = useGame({
  activityId: 'colors-shapes-sort',
  rounds: 4,
  onRound(round) {
    mode.value = round % 2 === 0 ? 'color' : 'shape'
    const binCount = round === 0 ? 2 : 3
    const itemCount = round === 0 ? 4 : 6
    if (mode.value === 'color') {
      const colors = sample(SORT_COLORS, binCount)
      bins.value = colors
      items.value = shuffle(Array.from({ length: itemCount }, (_, i) => ({ id: i, color: colors[i % binCount]!, shape: pick(SORT_SHAPES) })))
    } else {
      const shapes = sample(SORT_SHAPES, binCount)
      bins.value = shapes
      items.value = shuffle(Array.from({ length: itemCount }, (_, i) => ({ id: i, shape: shapes[i % binCount]!, color: pick(SORT_COLORS) })))
    }
    sorted.value = Object.fromEntries(bins.value.map((b) => [b, []]))
    selected.value = null
    void audio.say(mode.value === 'color' ? 'sort-by-color' : 'sort-by-shape')
  },
  instruction: () => [mode.value === 'color' ? 'sort-by-color' : 'sort-by-shape'],
})

const keyOf = (it: Item) => (mode.value === 'color' ? it.color : it.shape)
const binVoice = (b: string) => (mode.value === 'color' ? `colors/${b}` : `shapes/${b}`)

function place(itemId: number, bin: string) {
  const it = items.value.find((x) => x.id === itemId)
  if (!it || game.busy.value) return
  selected.value = null
  if (keyOf(it) === bin) {
    items.value = items.value.filter((x) => x.id !== itemId)
    sorted.value[bin]!.push(it)
    if (!items.value.length) {
      game.correct({ voice: [binVoice(bin)] })
    } else {
      audio.sfx('pop')
      void audio.say(binVoice(bin))
    }
  } else {
    wrongBin.value = bin
    wrongItem.value = itemId
    game.wrong({ voice: [binVoice(keyOf(it)), audio.encourage()] })
    setTimeout(() => {
      wrongBin.value = null
      wrongItem.value = null
    }, 600)
  }
}

const drag = useDragDrop<number>({
  enabled: () => !game.busy.value,
  onTap(id) {
    selected.value = selected.value === id ? null : id
    audio.sfx('tap')
    const it = items.value.find((x) => x.id === id)
    if (it) void audio.say(binVoice(keyOf(it)))
  },
  onDragStart(id) {
    selected.value = id
  },
  onDrop: (id, bin) => place(id, bin),
})

function tapBin(bin: string) {
  if (selected.value !== null) place(selected.value, bin)
  else void audio.say(binVoice(bin))
}
</script>

<template>
  <GameShell :game="game" activity-id="colors-shapes-sort">
    <div class="flex w-full max-w-4xl flex-col items-center gap-6">
      <GameQuestion :text="mode === 'color' ? 'Sort by color' : 'Sort by shape'" :voice="[mode === 'color' ? 'sort-by-color' : 'sort-by-shape']" />

      <!-- tray -->
      <div class="flex min-h-32 w-full flex-wrap items-center justify-center gap-3 rounded-[2rem] bg-white/70 p-4" aria-label="Things to sort">
        <button
          v-for="it in items"
          :key="it.id"
          type="button"
          class="toy flex h-24 w-24 touch-none items-center justify-center bg-white transition-transform sm:h-28 sm:w-28"
          :class="[selected === it.id ? 'scale-110 ring-8 ring-sunny-deep' : '', wrongItem === it.id ? 'animate-wiggle' : '']"
          :style="drag.styleFor(it.id)"
          :aria-label="`${colorById(it.color).name} ${shapeById(it.shape).name}`"
          v-bind="drag.handlers(it.id)"
          @keydown.enter.prevent="selected = it.id"
        >
          <ShapeIcon :shape="it.shape" :color="colorById(it.color).hex" :size="72" />
        </button>
      </div>

      <!-- bins -->
      <div class="grid w-full gap-4" :class="bins.length === 2 ? 'grid-cols-2' : 'grid-cols-3'">
        <button
          v-for="b in bins"
          :key="b"
          type="button"
          class="toy flex min-h-44 flex-col items-center justify-start gap-2 bg-white p-3 transition-transform"
          :class="[drag.overDrop.value === b ? 'scale-105 ring-8 ring-mint-deep' : '', wrongBin === b ? 'animate-wiggle' : '', selected !== null ? 'ring-4 ring-sunny/60' : '']"
          :data-drop="b"
          :aria-label="`${mode === 'color' ? colorById(b as ColorId).name : shapeById(b as ShapeId).name} box`"
          @click="tapBin(b)"
        >
          <span class="flex h-20 w-full items-center justify-center rounded-2xl" :style="mode === 'color' ? { background: colorById(b as ColorId).hex + '33' } : {}">
            <span v-if="mode === 'color'" class="h-14 w-14 rounded-full border-4 border-white shadow-pop-sm" :style="{ background: colorById(b as ColorId).hex }" />
            <ShapeIcon v-else :shape="b as ShapeId" color="#3d3a5c" outline :size="64" />
          </span>
          <span class="flex flex-wrap justify-center gap-1">
            <Motion v-for="it in sorted[b]" :key="it.id" as="span" :initial="{ scale: 0, y: -40 }" :animate="{ scale: 1, y: 0 }" :transition="{ type: 'spring', stiffness: 400, damping: 15 }">
              <ShapeIcon :shape="it.shape" :color="colorById(it.color).hex" :size="36" />
            </Motion>
          </span>
        </button>
      </div>
    </div>
  </GameShell>
</template>
