import { computed, type Ref } from 'vue'
import type { ActivityId, ActivityRecord, CategoryId, ColorId, HistoryEntry, ProgressState, ShapeId } from '~/types'
import { ACTIVITIES, activitiesIn } from '~/data/activities'
import { COLORS, SHAPES } from '~/data/learning'
import { arrOf, isObj, num, usePersistedState } from '~/utils/storage'

const ACTIVITY_IDS = new Set<string>(ACTIVITIES.map((a) => a.id))
const COLOR_IDS = new Set<string>(COLORS.map((c) => c.id))
const SHAPE_IDS = new Set<string>(SHAPES.map((s) => s.id))
const MAX_HISTORY = 200

const isNumIn = (min: number, max: number) => (x: unknown): x is number => Number.isInteger(x) && (x as number) >= min && (x as number) <= max
const isLetter = (x: unknown): x is string => typeof x === 'string' && /^[A-Z]$/.test(x)

const freshProgress = (): ProgressState => ({
  version: 1,
  stars: 0,
  learnedNumbers: [],
  learnedLetters: [],
  exploredColors: [],
  exploredShapes: [],
  tracedNumbers: [],
  tracedLetters: [],
  activities: {},
  history: [],
  totalTimeMs: 0,
  dailyTimeMs: {},
  firstSeenAt: Date.now(),
})

function sanitizeProgress(raw: unknown): ProgressState {
  const base = freshProgress()
  if (!isObj(raw)) return base
  const activities: ProgressState['activities'] = {}
  if (isObj(raw.activities)) {
    for (const [id, rec] of Object.entries(raw.activities)) {
      if (!ACTIVITY_IDS.has(id) || !isObj(rec)) continue
      activities[id as ActivityId] = {
        completed: Math.round(num(rec.completed, 0, 0)),
        played: Math.round(num(rec.played, 0, 0)),
        bestStars: Math.round(num(rec.bestStars, 0, 0)),
        lastPlayedAt: num(rec.lastPlayedAt, 0, 0),
      }
    }
  }
  const history: HistoryEntry[] = Array.isArray(raw.history)
    ? raw.history
        .filter((h): h is Record<string, unknown> => isObj(h) && ACTIVITY_IDS.has(h.activityId as string))
        .map((h) => ({
          activityId: h.activityId as ActivityId,
          at: num(h.at, 0, 0),
          stars: num(h.stars, 0, 0),
          rounds: num(h.rounds, 0, 0),
          durationMs: num(h.durationMs, 0, 0),
        }))
        .slice(-MAX_HISTORY)
    : []
  const daily: Record<string, number> = {}
  if (isObj(raw.dailyTimeMs)) {
    for (const [day, ms] of Object.entries(raw.dailyTimeMs)) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(day)) daily[day] = num(ms, 0, 0)
    }
  }
  return {
    version: 1,
    stars: Math.round(num(raw.stars, 0, 0)),
    learnedNumbers: arrOf(raw.learnedNumbers, isNumIn(1, 20)),
    learnedLetters: arrOf(raw.learnedLetters, isLetter),
    exploredColors: arrOf(raw.exploredColors, (x): x is ColorId => COLOR_IDS.has(x as string)),
    exploredShapes: arrOf(raw.exploredShapes, (x): x is ShapeId => SHAPE_IDS.has(x as string)),
    tracedNumbers: arrOf(raw.tracedNumbers, isNumIn(0, 20)),
    tracedLetters: arrOf(raw.tracedLetters, (x): x is string => typeof x === 'string' && /^[A-Za-z]$/.test(x)),
    activities,
    history,
    totalTimeMs: num(raw.totalTimeMs, 0, 0),
    dailyTimeMs: daily,
    firstSeenAt: num(raw.firstSeenAt, base.firstSeenAt, 0),
  }
}

export const todayKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

let state: Ref<ProgressState> | undefined

export function useProgress() {
  state ??= usePersistedState('dinoland:progress', sanitizeProgress)
  const progress = state

  const addUnique = <T>(list: T[], v: T) => {
    if (!list.includes(v)) list.push(v)
  }

  const learnNumber = (n: number) => addUnique(progress.value.learnedNumbers, n)
  const learnLetter = (l: string) => addUnique(progress.value.learnedLetters, l.toUpperCase())
  const exploreColor = (c: ColorId) => addUnique(progress.value.exploredColors, c)
  const exploreShape = (s: ShapeId) => addUnique(progress.value.exploredShapes, s)
  const traceNumber = (n: number) => addUnique(progress.value.tracedNumbers, n)
  const traceLetter = (l: string) => addUnique(progress.value.tracedLetters, l)

  function addStars(n = 1) {
    progress.value.stars += n
  }

  function record(id: ActivityId): ActivityRecord {
    const list = progress.value.activities
    return (list[id] ??= { completed: 0, played: 0, bestStars: 0, lastPlayedAt: 0 })
  }

  function startActivity(id: ActivityId) {
    const r = record(id)
    r.played++
    r.lastPlayedAt = Date.now()
  }

  function completeActivity(id: ActivityId, result: { stars: number; rounds: number; durationMs: number }) {
    const r = record(id)
    r.completed++
    r.bestStars = Math.max(r.bestStars, result.stars)
    r.lastPlayedAt = Date.now()
    progress.value.history.push({ activityId: id, at: Date.now(), ...result })
    if (progress.value.history.length > MAX_HISTORY) progress.value.history.splice(0, progress.value.history.length - MAX_HISTORY)
  }

  function addTime(ms: number) {
    progress.value.totalTimeMs += ms
    const key = todayKey()
    progress.value.dailyTimeMs[key] = (progress.value.dailyTimeMs[key] ?? 0) + ms
  }

  function reset() {
    progress.value = freshProgress()
  }

  const isCompleted = (id: ActivityId) => (progress.value.activities[id]?.completed ?? 0) > 0
  const totalCompleted = computed(() => Object.values(progress.value.activities).reduce((s, a) => s + (a?.completed ?? 0), 0))

  /** 0..1 progress for a home-screen category. */
  function categoryProgress(c: CategoryId): number {
    const p = progress.value
    const acts = activitiesIn(c)
    const doneActs = acts.filter((a) => isCompleted(a.id)).length / acts.length
    switch (c) {
      case 'numbers':
        return (p.learnedNumbers.length / 20 + doneActs) / 2
      case 'alphabet':
        return (p.learnedLetters.length / 26 + doneActs) / 2
      case 'colors-shapes':
        return ((p.exploredColors.length + p.exploredShapes.length) / 15 + doneActs) / 2
      case 'games':
        return doneActs
    }
  }

  const overallProgress = computed(() => {
    const cats: CategoryId[] = ['numbers', 'alphabet', 'colors-shapes', 'games']
    return cats.reduce((s, c) => s + categoryProgress(c), 0) / cats.length
  })

  return {
    progress,
    learnNumber,
    learnLetter,
    exploreColor,
    exploreShape,
    traceNumber,
    traceLetter,
    addStars,
    startActivity,
    completeActivity,
    addTime,
    reset,
    isCompleted,
    totalCompleted,
    categoryProgress,
    overallProgress,
  }
}
