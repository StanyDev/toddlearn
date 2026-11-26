import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import type { ActivityId, FeedbackState } from '~/types'

export interface GameOptions {
  activityId: ActivityId
  /** Number of rounds; defaults to the parent setting. */
  rounds?: number
  /** Called at the start of every round (0-based) — build the question here. */
  onRound: (round: number) => void
  /** Voice clips for the current instruction (for the replay button). */
  instruction?: () => string[]
  /** Delay before moving on after a correct answer. */
  advanceDelay?: number
  /** Start automatically on mount (default true). */
  autoStart?: boolean
}

/**
 * Shared round-based game engine used by every activity.
 *
 * Rules for toddlers: no timers, no lives, no penalties. A wrong answer only
 * plays a gentle animation + encouragement; every finished round earns a star.
 */
export function useGame(opts: GameOptions) {
  const audio = useAudio()
  const { settings } = useSettings()
  const progressApi = useProgress()
  const rewards = useRewards()

  const totalRounds = ref(opts.rounds ?? settings.value.roundsPerActivity)
  const round = ref(0)
  const feedback = ref<FeedbackState>('idle')
  const busy = ref(false)
  const finished = ref(false)
  const started = ref(false)
  const starsEarned = ref(0)
  const attempts = ref(0)
  /** Bumped on each correct answer — handy as a key for celebration effects. */
  const celebrateKey = ref(0)

  let startedAt = 0
  let release: (() => void) | undefined
  const timers = new Set<ReturnType<typeof setTimeout>>()
  const later = (fn: () => void, ms: number) => {
    const t = setTimeout(() => {
      timers.delete(t)
      fn()
    }, ms)
    timers.add(t)
  }

  function start() {
    timers.forEach(clearTimeout)
    timers.clear()
    release?.()
    release = rewards.hold()
    round.value = 0
    starsEarned.value = 0
    attempts.value = 0
    feedback.value = 'idle'
    busy.value = false
    finished.value = false
    started.value = true
    startedAt = Date.now()
    progressApi.startActivity(opts.activityId)
    opts.onRound(0)
  }

  /** Mark the round as solved. */
  function correct(options: { voice?: string[]; advance?: boolean; delay?: number } = {}) {
    if (busy.value || finished.value) return
    busy.value = true
    feedback.value = 'correct'
    celebrateKey.value++
    starsEarned.value++
    progressApi.addStars(1)
    audio.sfx('correct')
    later(() => audio.sfx('star'), 350)
    void audio.say([...(options.voice ?? []), audio.praise()])
    later(() => {
      feedback.value = 'idle'
      busy.value = false
      if (options.advance !== false) next()
    }, options.delay ?? opts.advanceDelay ?? 1700)
  }

  /** A gentle "try again" — never a penalty. */
  function wrong(options: { voice?: string[] } = {}) {
    if (finished.value || feedback.value === 'correct') return
    attempts.value++
    feedback.value = 'tryAgain'
    audio.sfx('tryAgain')
    void audio.say(options.voice ?? [audio.encourage()])
    later(() => {
      if (feedback.value === 'tryAgain') feedback.value = 'idle'
    }, 1300)
  }

  function next() {
    if (finished.value) return
    if (round.value + 1 >= totalRounds.value) {
      finish()
      return
    }
    round.value++
    attempts.value = 0
    opts.onRound(round.value)
  }

  function finish() {
    if (finished.value) return
    finished.value = true
    feedback.value = 'idle'
    progressApi.completeActivity(opts.activityId, {
      stars: starsEarned.value,
      rounds: totalRounds.value,
      durationMs: Date.now() - startedAt,
    })
    audio.sfx('reward')
    void audio.say('complete')
    // Let the finish screen appear before any badge/dino celebrations.
    later(() => {
      release?.()
      release = undefined
    }, 2600)
  }

  function replayInstruction() {
    const keys = opts.instruction?.()
    if (keys?.length) void audio.say(keys)
  }

  const progress = computed(() => (finished.value ? 1 : round.value / totalRounds.value))

  if (opts.autoStart !== false) onMounted(start)
  onBeforeUnmount(() => {
    timers.forEach(clearTimeout)
    timers.clear()
    release?.()
    audio.stop()
  })

  return {
    activityId: opts.activityId,
    round,
    totalRounds,
    feedback,
    busy,
    finished,
    started,
    starsEarned,
    attempts,
    celebrateKey,
    progress,
    start,
    restart: start,
    correct,
    wrong,
    next,
    finish,
    replayInstruction,
    later,
  }
}

export type GameApi = ReturnType<typeof useGame>
