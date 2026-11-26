import { computed, ref, watch, type Ref } from 'vue'
import type { DecorationId, RewardCelebration, RewardsState } from '~/types'
import { ACHIEVEMENTS, DECORATIONS, DINOS, dinoById } from '~/data/rewards'
import { arrOf, isObj, num, str, usePersistedState } from '~/utils/storage'

const DINO_IDS = new Set(DINOS.map((d) => d.id))
const DECOR_IDS = new Set<string>(DECORATIONS.map((d) => d.id))
const BADGE_IDS = new Set(ACHIEVEMENTS.map((a) => a.id))

const freshRewards = (): RewardsState => ({
  version: 1,
  unlockedAchievements: {},
  unlockedDinos: ['dino'],
  unlockedDecorations: [],
  activeDino: 'dino',
  activeDecoration: null,
  pendingCelebrations: [],
})

function sanitizeRewards(raw: unknown): RewardsState {
  const base = freshRewards()
  if (!isObj(raw)) return base
  const badges: Record<string, number> = {}
  if (isObj(raw.unlockedAchievements)) {
    for (const [id, at] of Object.entries(raw.unlockedAchievements)) if (BADGE_IDS.has(id)) badges[id] = num(at, Date.now(), 0)
  }
  const dinos = arrOf(raw.unlockedDinos, (x): x is string => DINO_IDS.has(x as string))
  if (!dinos.includes('dino')) dinos.unshift('dino')
  const decor = arrOf(raw.unlockedDecorations, (x): x is string => DECOR_IDS.has(x as string))
  const activeDino = str(raw.activeDino, 'dino')
  const activeDecoration = typeof raw.activeDecoration === 'string' && decor.includes(raw.activeDecoration) ? raw.activeDecoration : null
  const pending = Array.isArray(raw.pendingCelebrations)
    ? raw.pendingCelebrations.filter(
        (c): c is RewardCelebration =>
          isObj(c) && ['achievement', 'dino', 'decoration'].includes(c.kind as string) && typeof c.id === 'string',
      )
    : []
  return {
    version: 1,
    unlockedAchievements: badges,
    unlockedDinos: dinos,
    unlockedDecorations: decor,
    activeDino: dinos.includes(activeDino) ? activeDino : 'dino',
    activeDecoration,
    pendingCelebrations: pending.slice(0, 20),
  }
}

let state: Ref<RewardsState> | undefined
/** While a game round is in progress, celebrations wait until it ends. */
const holds = ref(0)
let watching = false

export function useRewards() {
  state ??= usePersistedState('dinoland:rewards', sanitizeRewards)
  const rewards = state
  const { progress } = useProgress()

  /** Unlock anything newly earned and queue a celebration for it. */
  function evaluate() {
    const p = progress.value
    const r = rewards.value
    for (const a of ACHIEVEMENTS) {
      if (!r.unlockedAchievements[a.id] && a.progress(p) >= 1) {
        r.unlockedAchievements[a.id] = Date.now()
        r.pendingCelebrations.push({ kind: 'achievement', id: a.id })
      }
    }
    for (const d of DINOS) {
      if (!r.unlockedDinos.includes(d.id) && p.stars >= d.starsNeeded) {
        r.unlockedDinos.push(d.id)
        r.pendingCelebrations.push({ kind: 'dino', id: d.id })
      }
    }
    for (const d of DECORATIONS) {
      if (!r.unlockedDecorations.includes(d.id) && p.stars >= d.starsNeeded) {
        r.unlockedDecorations.push(d.id)
        r.pendingCelebrations.push({ kind: 'decoration', id: d.id })
      }
    }
  }

  if (!watching) {
    watching = true
    watch(() => [progress.value.stars, progress.value.history.length, progress.value.learnedNumbers.length, progress.value.learnedLetters.length, progress.value.exploredColors.length, progress.value.exploredShapes.length], evaluate, { immediate: true })
  }

  const current = computed<RewardCelebration | null>(() => (holds.value > 0 ? null : (rewards.value.pendingCelebrations[0] ?? null)))

  function dismissCurrent() {
    rewards.value.pendingCelebrations.shift()
  }

  function hold() {
    holds.value++
    let released = false
    return () => {
      if (released) return
      released = true
      holds.value = Math.max(0, holds.value - 1)
    }
  }

  function setActiveDino(id: string) {
    if (rewards.value.unlockedDinos.includes(id)) rewards.value.activeDino = id
  }

  function setDecoration(id: DecorationId | null) {
    if (id === null || rewards.value.unlockedDecorations.includes(id)) rewards.value.activeDecoration = id
  }

  const activeDino = computed(() => dinoById(rewards.value.activeDino))
  const activeDecoration = computed(() => rewards.value.activeDecoration as DecorationId | null)

  /** The next thing a child can unlock with stars. */
  const nextUnlock = computed(() => {
    const stars = progress.value.stars
    const items = [
      ...DINOS.map((d) => ({ kind: 'dino' as const, id: d.id, name: d.name, starsNeeded: d.starsNeeded })),
      ...DECORATIONS.map((d) => ({ kind: 'decoration' as const, id: d.id, name: d.name, starsNeeded: d.starsNeeded })),
    ]
      .filter((i) => i.starsNeeded > stars)
      .sort((a, b) => a.starsNeeded - b.starsNeeded)
    return items[0] ?? null
  })

  function reset() {
    rewards.value = freshRewards()
  }

  return {
    rewards,
    evaluate,
    current,
    dismissCurrent,
    hold,
    setActiveDino,
    setDecoration,
    activeDino,
    activeDecoration,
    nextUnlock,
    reset,
  }
}
