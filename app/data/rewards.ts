import type { AchievementDef, ActivityId, DecorationDef, DinoDef, ProgressState } from '../types'
import { COUNTING_ACTIVITIES, GAME_ACTIVITIES, TRACING_ACTIVITIES } from './activities.ts'
import { localize } from '../locales/index.ts'
import { ID_ACHIEVEMENTS, ID_DECORATIONS } from '../locales/id.ts'

const completions = (p: ProgressState, ids: ActivityId[]) => ids.reduce((sum, id) => sum + (p.activities[id]?.completed ?? 0), 0)
const totalCompletions = (p: ProgressState) => Object.values(p.activities).reduce((s, a) => s + (a?.completed ?? 0), 0)
const ratio = (have: number, need: number) => Math.min(1, have / need)

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'first-star', title: 'First Star', description: 'Earn your very first star', icon: 'star', color: 'sunny', progress: (p) => ratio(p.stars, 1) },
  { id: 'number-explorer', title: 'Number Explorer', description: 'Explore numbers 1 to 10', icon: 'abacus', color: 'sky', progress: (p) => ratio(p.learnedNumbers.filter((n) => n <= 10).length, 10) },
  { id: 'number-master', title: 'Number Master', description: 'Explore all numbers 1 to 20', icon: 'rocket', color: 'sky', progress: (p) => ratio(p.learnedNumbers.length, 20) },
  { id: 'alphabet-explorer', title: 'Alphabet Explorer', description: 'Learn every letter A to Z', icon: 'books', color: 'bubblegum', progress: (p) => ratio(p.learnedLetters.length, 26) },
  { id: 'counting-champion', title: 'Counting Champion', description: 'Finish 10 counting activities', icon: 'trophy', color: 'peach', progress: (p) => ratio(completions(p, COUNTING_ACTIVITIES), 10) },
  { id: 'memory-master', title: 'Memory Master', description: 'Finish 3 memory games', icon: 'brain', color: 'lavender', progress: (p) => ratio(p.activities['game-memory']?.completed ?? 0, 3) },
  { id: 'super-learner', title: 'Super Learner', description: 'Finish 5 activities', icon: 'medal', color: 'mint', progress: (p) => ratio(totalCompletions(p), 5) },
  { id: 'rainbow-friend', title: 'Rainbow Friend', description: 'Explore all 9 colors', icon: 'rainbow', color: 'bubblegum', progress: (p) => ratio(p.exploredColors.length, 9) },
  { id: 'shape-spotter', title: 'Shape Spotter', description: 'Explore all 6 shapes', icon: 'shapes', color: 'mint', progress: (p) => ratio(p.exploredShapes.length, 6) },
  { id: 'little-artist', title: 'Little Artist', description: 'Finish 3 tracing activities', icon: 'crayon', color: 'sunny', progress: (p) => ratio(completions(p, TRACING_ACTIVITIES), 3) },
  { id: 'game-champ', title: 'Game Champ', description: 'Play every mini game', icon: 'joker', color: 'lavender', progress: (p) => ratio(GAME_ACTIVITIES.filter((id) => (p.activities[id]?.completed ?? 0) > 0).length, GAME_ACTIVITIES.length) },
  { id: 'star-collector', title: 'Star Collector', description: 'Collect 100 stars', icon: 'glowing-star', color: 'sunny', progress: (p) => ratio(p.stars, 100) },
]

export const DINOS: DinoDef[] = [
  { id: 'dino', name: 'Dino', body: '#7ED957', belly: '#FFF3B0', spots: '#4CB944', starsNeeded: 0 },
  { id: 'rosie', name: 'Rosie', body: '#FF9EBB', belly: '#FFE4EC', spots: '#FF6F98', starsNeeded: 10 },
  { id: 'sky', name: 'Skye', body: '#6CC8F5', belly: '#E3F6FF', spots: '#3AA6DE', starsNeeded: 25 },
  { id: 'sunny', name: 'Sunny', body: '#FFD54F', belly: '#FFF8DC', spots: '#F5B700', starsNeeded: 45 },
  { id: 'lulu', name: 'Lulu', body: '#B79CFF', belly: '#F0E9FF', spots: '#8E6CF0', starsNeeded: 70 },
  { id: 'ember', name: 'Ember', body: '#FF9F5A', belly: '#FFE9D6', spots: '#F57C2B', starsNeeded: 100 },
  { id: 'minty', name: 'Minty', body: '#6EE0B8', belly: '#E6FFF6', spots: '#2FBF8F', starsNeeded: 140 },
]

export const DECORATIONS: DecorationDef[] = [
  { id: 'party-hat', name: 'Party Hat', starsNeeded: 5 },
  { id: 'bow', name: 'Bow', starsNeeded: 15 },
  { id: 'sunglasses', name: 'Sunglasses', starsNeeded: 35 },
  { id: 'flower', name: 'Flower', starsNeeded: 55 },
  { id: 'scarf', name: 'Scarf', starsNeeded: 85 },
  { id: 'crown', name: 'Crown', starsNeeded: 120 },
]

localize(ACHIEVEMENTS, 'title', { id: (a) => ID_ACHIEVEMENTS[a.id]?.title })
localize(ACHIEVEMENTS, 'description', { id: (a) => ID_ACHIEVEMENTS[a.id]?.description })
localize(DECORATIONS, 'name', { id: (d) => ID_DECORATIONS[d.id] })

export const dinoById = (id: string) => DINOS.find((d) => d.id === id) ?? DINOS[0]!
