<script setup lang="ts">
import type { ActivityId, MatchPair, MatchRound } from '~/types'
import type { MatchGenerator } from '~/utils/generators'
import { shuffle } from '~/utils/random'
import { visualLabel } from '~/utils/labels'

/**
 * Two columns to connect. Children can tap one item then its partner, or drag
 * a line from one to the other. Matched pairs get joined by a coloured line.
 */
const props = defineProps<{ activityId: ActivityId; generate: MatchGenerator }>()
const audio = useAudio()

type Side = 'left' | 'right'
const PAIR_COLORS = ['#FF7FA1', '#3FB5EA', '#5CCB9F', '#F6C94A', '#A78BFA']

const round = ref<MatchRound | null>(null)
const leftItems = ref<MatchPair[]>([])
const rightItems = ref<MatchPair[]>([])
const matched = ref<string[]>([])
const selected = ref<{ side: Side; id: string } | null>(null)
const wrongFlash = ref<{ side: Side; id: string } | null>(null)

const game = useGame({
  activityId: props.activityId,
  rounds: 3,
  onRound(r) {
    round.value = props.generate(r)
    leftItems.value = shuffle(round.value.pairs)
    rightItems.value = shuffle(round.value.pairs)
    matched.value = []
    selected.value = null
    lines.value = []
    void audio.say(round.value.voice)
    nextTick(updateLines)
  },
  instruction: () => round.value?.voice ?? [],
})

/* ------------------------------ geometry ------------------------------ */
const board = ref<HTMLElement | null>(null)
const lines = ref<{ id: string; x1: number; y1: number; x2: number; y2: number; color: string }[]>([])
const dragLine = ref<{ x1: number; y1: number; x2: number; y2: number } | null>(null)

function anchor(side: Side, id: string) {
  const el = board.value?.querySelector<HTMLElement>(`[data-side="${side}"][data-id="${id}"]`)
  const box = board.value?.getBoundingClientRect()
  if (!el || !box) return null
  const r = el.getBoundingClientRect()
  return { x: (side === 'left' ? r.right : r.left) - box.left, y: r.top + r.height / 2 - box.top }
}
function updateLines() {
  lines.value = matched.value
    .map((id) => {
      const a = anchor('left', id)
      const b = anchor('right', id)
      const idx = round.value?.pairs.findIndex((p) => p.id === id) ?? 0
      return a && b ? { id, x1: a.x, y1: a.y, x2: b.x, y2: b.y, color: PAIR_COLORS[idx % PAIR_COLORS.length]! } : null
    })
    .filter((l): l is NonNullable<typeof l> => !!l)
}
useEventListener('resize', updateLines)

/* ------------------------------ matching ------------------------------ */
function attempt(leftId: string, rightId: string) {
  selected.value = null
  if (leftId === rightId) {
    matched.value.push(leftId)
    nextTick(updateLines)
    const pair = round.value!.pairs.find((p) => p.id === leftId)!
    if (matched.value.length === round.value!.pairs.length) {
      game.correct({ voice: pair.voice })
    } else {
      audio.sfx('sparkle')
      void audio.say(pair.voice ?? [])
    }
  } else {
    wrongFlash.value = { side: 'right', id: rightId }
    game.wrong()
    setTimeout(() => (wrongFlash.value = null), 600)
  }
}

function choose(side: Side, id: string) {
  if (matched.value.includes(id) || game.busy.value) return
  const cur = selected.value
  if (cur && cur.side !== side) {
    attempt(side === 'left' ? id : cur.id, side === 'right' ? id : cur.id)
    return
  }
  selected.value = { side, id }
  audio.sfx('tap')
  const pair = round.value!.pairs.find((p) => p.id === id)
  const v = side === 'left' ? pair?.left : pair?.right
  // Name the item so pre-readers hear what they picked.
  if (v && (v.kind === 'letter' || v.kind === 'number' || v.kind === 'color' || v.kind === 'shape' || v.kind === 'object')) {
    const key =
      v.kind === 'letter' ? `letters/${v.value.toLowerCase()}` : v.kind === 'number' ? `numbers/${v.value}` : v.kind === 'color' ? `colors/${v.color}` : v.kind === 'shape' ? `shapes/${v.shape}` : `words/${v.key}`
    void audio.say(key)
  }
}

/* ------------------------------- dragging ------------------------------ */
let dragFrom: { side: Side; id: string; moved: boolean; x: number; y: number } | null = null

function onDown(e: PointerEvent, side: Side, id: string) {
  if (matched.value.includes(id) || game.busy.value) return
  dragFrom = { side, id, moved: false, x: e.clientX, y: e.clientY }
  capturePointer(e)
}
function onMove(e: PointerEvent) {
  if (!dragFrom || !board.value) return
  if (!dragFrom.moved && Math.hypot(e.clientX - dragFrom.x, e.clientY - dragFrom.y) < 12) return
  if (!dragFrom.moved) {
    dragFrom.moved = true
    selected.value = { side: dragFrom.side, id: dragFrom.id }
  }
  const a = anchor(dragFrom.side, dragFrom.id)
  const box = board.value.getBoundingClientRect()
  if (a) dragLine.value = { x1: a.x, y1: a.y, x2: e.clientX - box.left, y2: e.clientY - box.top }
}
function onUp(e: PointerEvent) {
  const from = dragFrom
  dragFrom = null
  dragLine.value = null
  if (!from) return
  if (!from.moved) {
    choose(from.side, from.id)
    return
  }
  const target = document.elementFromPoint(e.clientX, e.clientY)?.closest<HTMLElement>('[data-side]')
  const side = target?.dataset.side as Side | undefined
  const id = target?.dataset.id
  if (target && side && id && side !== from.side && !matched.value.includes(id)) {
    attempt(from.side === 'left' ? from.id : id, from.side === 'left' ? id : from.id)
  } else {
    selected.value = null
  }
}
function onKey(side: Side, id: string) {
  choose(side, id)
}

const pairColor = (id: string) => {
  const idx = round.value?.pairs.findIndex((p) => p.id === id) ?? 0
  return PAIR_COLORS[idx % PAIR_COLORS.length]!
}
const isSel = (side: Side, id: string) => selected.value?.side === side && selected.value.id === id
const isWrong = (side: Side, id: string) => wrongFlash.value?.side === side && wrongFlash.value.id === id
</script>

<template>
  <GameShell :game="game" :activity-id="activityId">
    <div v-if="round" class="flex w-full max-w-3xl flex-col items-center gap-6">
      <GameQuestion :text="round.text" :voice="round.voice" />
      <div ref="board" class="relative grid w-full grid-cols-2 gap-x-16 gap-y-4 sm:gap-x-32" @pointermove="onMove" @pointerup="onUp" @pointercancel="onUp">
        <svg class="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-visible" aria-hidden="true">
          <line v-for="l in lines" :key="l.id" :x1="l.x1" :y1="l.y1" :x2="l.x2" :y2="l.y2" :stroke="l.color" stroke-width="10" stroke-linecap="round" class="match-line" />
          <line v-if="dragLine" v-bind="dragLine" stroke="#3d3a5c" stroke-opacity="0.35" stroke-width="8" stroke-dasharray="4 14" stroke-linecap="round" />
        </svg>
        <template v-for="(side, si) in (['left', 'right'] as const)" :key="side">
          <div class="relative z-10 flex flex-col gap-4" :style="{ gridColumn: si + 1, gridRow: 1 }">
            <button
              v-for="item in side === 'left' ? leftItems : rightItems"
              :key="item.id"
              type="button"
              class="toy flex min-h-28 touch-none items-center justify-center bg-white p-3 transition-[box-shadow,transform] sm:min-h-32"
              :class="[
                isSel(side, item.id) ? 'scale-105 ring-8 ring-sunny-deep' : '',
                isWrong(side, item.id) ? 'animate-wiggle' : '',
              ]"
              :style="matched.includes(item.id) ? { background: pairColor(item.id) + '40', boxShadow: `0 0 0 6px ${pairColor(item.id)}` } : undefined"
              :data-side="side"
              :data-id="item.id"
              :aria-label="visualLabel(side === 'left' ? item.left : item.right)"
              :aria-pressed="isSel(side, item.id)"
              @pointerdown="onDown($event, side, item.id)"
              @keydown.enter.prevent="onKey(side, item.id)"
              @keydown.space.prevent="onKey(side, item.id)"
            >
              <ChoiceVisual :visual="side === 'left' ? item.left : item.right" :scale="0.95" />
            </button>
          </div>
        </template>
      </div>
    </div>
  </GameShell>
</template>

<style scoped>
.match-line {
  stroke-dasharray: 600;
  stroke-dashoffset: 600;
  animation: draw 0.45s ease-out forwards;
}
@keyframes draw {
  to { stroke-dashoffset: 0; }
}
</style>
