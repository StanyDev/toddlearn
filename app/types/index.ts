/** Top-level learning areas shown on the home screen. */
export type CategoryId = 'numbers' | 'alphabet' | 'colors-shapes' | 'games'

export type ThemeColor = 'sky' | 'sunny' | 'bubblegum' | 'mint' | 'lavender' | 'peach'

/** Every playable activity has a stable id used for progress tracking. */
export type ActivityId =
  // numbers
  | 'numbers-explorer'
  | 'numbers-count'
  | 'numbers-find'
  | 'numbers-match'
  | 'numbers-missing'
  | 'numbers-more-less'
  | 'numbers-trace'
  // alphabet
  | 'alphabet-explorer'
  | 'alphabet-find'
  | 'alphabet-case-match'
  | 'alphabet-picture-match'
  | 'alphabet-missing'
  | 'alphabet-trace'
  // colors & shapes
  | 'colors-explorer'
  | 'shapes-explorer'
  | 'colors-find'
  | 'colors-match'
  | 'colors-hunt'
  | 'shapes-find'
  | 'shapes-match'
  | 'colors-shapes-sort'
  // mini games
  | 'game-balloons'
  | 'game-monster'
  | 'game-fishing'
  | 'game-memory'
  | 'game-race'
  | 'game-treasure'
  | 'game-tower'

export interface ActivityDef {
  id: ActivityId
  category: CategoryId
  title: string
  /** Route path for the activity. */
  to: string
  /** Illustration key (see data/objects.ts) or a glyph to show on the tile. */
  icon: string
  /** If set, the tile shows this big glyph instead of an object illustration. */
  glyph?: string
  color: ThemeColor
  /** Audio clip key read aloud when the tile is tapped/hovered. */
  voice: string
}

export type ColorId = 'red' | 'blue' | 'yellow' | 'green' | 'orange' | 'purple' | 'pink' | 'black' | 'white'
export type ShapeId = 'circle' | 'square' | 'triangle' | 'rectangle' | 'star' | 'heart'

export interface NumberInfo {
  value: number
  name: string
  /** Object illustration used to show the quantity. */
  object: string
  /** Plural noun for the counting instruction, e.g. "apples". */
  plural: string
}

export interface LetterInfo {
  upper: string
  lower: string
  word: string
  object: string
}

export interface ColorInfo {
  id: ColorId
  name: string
  hex: string
  /** Text colour that reads well on top of the swatch. */
  onHex: string
  objects: string[]
}

export interface ShapeInfo {
  id: ShapeId
  name: string
  objects: string[]
}

export interface ObjectInfo {
  key: string
  label: string
  emoji: string
  color?: ColorId
  shape?: ShapeId
}

/* ----------------------------- persistence ----------------------------- */

export interface ActivityRecord {
  /** How many times the activity was completed (all rounds). */
  completed: number
  /** How many times the activity was started. */
  played: number
  bestStars: number
  lastPlayedAt: number
}

export interface HistoryEntry {
  activityId: ActivityId
  at: number
  stars: number
  rounds: number
  durationMs: number
}

export interface ProgressState {
  version: 1
  stars: number
  learnedNumbers: number[]
  learnedLetters: string[]
  exploredColors: ColorId[]
  exploredShapes: ShapeId[]
  tracedNumbers: number[]
  tracedLetters: string[]
  activities: Partial<Record<ActivityId, ActivityRecord>>
  history: HistoryEntry[]
  totalTimeMs: number
  /** Learning time per local day, keyed YYYY-MM-DD. */
  dailyTimeMs: Record<string, number>
  firstSeenAt: number
}

export interface SettingsState {
  version: 1
  soundEnabled: boolean
  /** 0..1 */
  voiceVolume: number
  /** 0..1 */
  effectsVolume: number
  /** Use the browser's speech synthesis when a recorded clip is missing. */
  speechFallback: boolean
  /** 'auto' follows the OS setting. */
  reducedMotion: 'auto' | 'on' | 'off'
  /** 4-digit PIN for the parent area; empty = use the grown-up math question. */
  parentPin: string
  /** Number of rounds per activity. */
  roundsPerActivity: number
  /** Language for voice, words and screens. */
  language: import('../locales/index.ts').Locale
}

export interface RewardsState {
  version: 1
  unlockedAchievements: Record<string, number>
  unlockedDinos: string[]
  unlockedDecorations: string[]
  activeDino: string
  activeDecoration: string | null
  /** Items unlocked but not yet celebrated. */
  pendingCelebrations: RewardCelebration[]
}

export interface RewardCelebration {
  kind: 'achievement' | 'dino' | 'decoration'
  id: string
}

export interface AchievementDef {
  id: string
  title: string
  description: string
  icon: string
  color: ThemeColor
  /** Returns 0..1 progress toward the badge. */
  progress: (p: ProgressState) => number
}

export interface DinoDef {
  id: string
  name: string
  body: string
  belly: string
  spots: string
  starsNeeded: number
}

export interface DecorationDef {
  id: DecorationId
  name: string
  starsNeeded: number
}

export type DecorationId = 'party-hat' | 'bow' | 'sunglasses' | 'crown' | 'flower' | 'scarf'

export type DinoMood = 'happy' | 'excited' | 'thinking' | 'cheer' | 'sleepy'

/* ------------------------------- games -------------------------------- */

export type FeedbackState = 'idle' | 'correct' | 'tryAgain'

/** A visual answer choice used by the generic quiz engine. */
export type ChoiceVisual =
  | { kind: 'number'; value: number }
  | { kind: 'letter'; value: string }
  | { kind: 'object'; key: string; label?: string }
  | { kind: 'group'; object: string; count: number }
  | { kind: 'color'; color: ColorId }
  | { kind: 'shape'; shape: ShapeId; color?: string }

export interface Choice {
  id: string
  visual: ChoiceVisual
  /** Voice clip spoken when this choice is tapped (helps learning). */
  voice?: string[]
}

export type PromptVisual =
  | { kind: 'none' }
  | { kind: 'group'; object: string; count: number }
  | { kind: 'sequence'; items: (string | null)[] }
  | { kind: 'number'; value: number }
  | { kind: 'letter'; value: string }
  | { kind: 'object'; key: string }
  | { kind: 'color'; color: ColorId }
  | { kind: 'shape'; shape: ShapeId }

export interface QuizQuestion {
  /** Short on-screen instruction (kept very short for pre-readers). */
  text: string
  /** Big icon/glyph shown with the instruction text. */
  hint?: ChoiceVisual
  /** Sequence of voice clip keys that read the instruction aloud. */
  voice: string[]
  prompt: PromptVisual
  choices: Choice[]
  answerId: string
  /** Layout of the choices: a row of cards or two big groups. */
  layout?: 'row' | 'pair'
}

export interface MatchPair {
  id: string
  left: ChoiceVisual
  right: ChoiceVisual
  voice?: string[]
}

export interface MatchRound {
  text: string
  voice: string[]
  pairs: MatchPair[]
}
