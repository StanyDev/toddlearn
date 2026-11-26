import type { ActivityDef, ActivityId, CategoryId, ThemeColor } from '../types'

export interface CategoryDef {
  id: CategoryId
  title: string
  to: string
  color: ThemeColor
  voice: string
  icons: string[]
}

export const CATEGORIES: CategoryDef[] = [
  { id: 'numbers', title: 'Numbers', to: '/numbers', color: 'sky', voice: 'hub-numbers', icons: ['apple', 'abacus'] },
  { id: 'alphabet', title: 'ABC', to: '/alphabet', color: 'bubblegum', voice: 'hub-alphabet', icons: ['books', 'cat'] },
  { id: 'colors-shapes', title: 'Colors & Shapes', to: '/colors-shapes', color: 'mint', voice: 'hub-colors-shapes', icons: ['palette', 'shapes'] },
  { id: 'games', title: 'Games', to: '/games', color: 'lavender', voice: 'hub-games', icons: ['balloon', 'puzzle'] },
]

export const ACTIVITIES: ActivityDef[] = [
  // Numbers
  { id: 'numbers-explorer', category: 'numbers', title: 'Explore 1–20', to: '/numbers/explorer', icon: 'magnifier', glyph: '123', color: 'sky', voice: 'tap-a-number' },
  { id: 'numbers-count', category: 'numbers', title: 'Count', to: '/numbers/count', icon: 'abacus', color: 'sunny', voice: 'how-many' },
  { id: 'numbers-find', category: 'numbers', title: 'Find the Number', to: '/numbers/find', icon: 'eyes', color: 'mint', voice: 'find-the-number' },
  { id: 'numbers-match', category: 'numbers', title: 'Match', to: '/numbers/match', icon: 'link', color: 'lavender', voice: 'match-numbers' },
  { id: 'numbers-missing', category: 'numbers', title: 'Missing Number', to: '/numbers/missing', icon: 'question', color: 'peach', voice: 'which-missing-number' },
  { id: 'numbers-more-less', category: 'numbers', title: 'More or Less', to: '/numbers/more-less', icon: 'scales', color: 'bubblegum', voice: 'which-more' },
  { id: 'numbers-trace', category: 'numbers', title: 'Trace', to: '/numbers/trace', icon: 'pencil', color: 'sky', voice: 'trace-number' },

  // Alphabet
  { id: 'alphabet-explorer', category: 'alphabet', title: 'Explore A–Z', to: '/alphabet/explorer', icon: 'magnifier', glyph: 'ABC', color: 'bubblegum', voice: 'tap-a-letter' },
  { id: 'alphabet-find', category: 'alphabet', title: 'Find the Letter', to: '/alphabet/find', icon: 'eyes', color: 'mint', voice: 'find-the-letter' },
  { id: 'alphabet-case-match', category: 'alphabet', title: 'Big & Little', to: '/alphabet/case-match', icon: 'link', glyph: 'Aa', color: 'lavender', voice: 'match-case' },
  { id: 'alphabet-picture-match', category: 'alphabet', title: 'Picture Match', to: '/alphabet/picture-match', icon: 'puzzle', color: 'sunny', voice: 'match-picture' },
  { id: 'alphabet-missing', category: 'alphabet', title: 'Missing Letter', to: '/alphabet/missing', icon: 'question', color: 'peach', voice: 'which-missing-letter' },
  { id: 'alphabet-trace', category: 'alphabet', title: 'Trace', to: '/alphabet/trace', icon: 'pencil', color: 'sky', voice: 'trace-letter' },

  // Colors & shapes
  { id: 'colors-explorer', category: 'colors-shapes', title: 'Colors', to: '/colors-shapes/colors', icon: 'palette', color: 'bubblegum', voice: 'tap-a-color' },
  { id: 'shapes-explorer', category: 'colors-shapes', title: 'Shapes', to: '/colors-shapes/shapes', icon: 'shapes', color: 'sky', voice: 'tap-a-shape' },
  { id: 'colors-find', category: 'colors-shapes', title: 'Find the Color', to: '/colors-shapes/find-color', icon: 'crayon', color: 'sunny', voice: 'can-you-find' },
  { id: 'colors-match', category: 'colors-shapes', title: 'Color Match', to: '/colors-shapes/color-match', icon: 'paint', color: 'lavender', voice: 'match-colors' },
  { id: 'colors-hunt', category: 'colors-shapes', title: 'Color Hunt', to: '/colors-shapes/color-hunt', icon: 'magnifier', color: 'peach', voice: 'find-something' },
  { id: 'shapes-find', category: 'colors-shapes', title: 'Find the Shape', to: '/colors-shapes/find-shape', icon: 'eyes', color: 'mint', voice: 'find-the' },
  { id: 'shapes-match', category: 'colors-shapes', title: 'Shape Match', to: '/colors-shapes/shape-match', icon: 'pizza', color: 'sunny', voice: 'match-shapes' },
  { id: 'colors-shapes-sort', category: 'colors-shapes', title: 'Sort It', to: '/colors-shapes/sort', icon: 'basket', color: 'mint', voice: 'sort-by-color' },

  // Mini games
  { id: 'game-balloons', category: 'games', title: 'Balloon Pop', to: '/games/balloons', icon: 'balloon', color: 'bubblegum', voice: 'pop-balloon' },
  { id: 'game-monster', category: 'games', title: 'Feed the Monster', to: '/games/monster', icon: 'strawberry', color: 'mint', voice: 'feed-me' },
  { id: 'game-fishing', category: 'games', title: 'Letter Fishing', to: '/games/fishing', icon: 'fishing-pole', color: 'sky', voice: 'catch-fish' },
  { id: 'game-memory', category: 'games', title: 'Memory Cards', to: '/games/memory', icon: 'joker', color: 'lavender', voice: 'memory-intro' },
  { id: 'game-race', category: 'games', title: 'Number Race', to: '/games/race', icon: 'flag', color: 'peach', voice: 'race-intro' },
  { id: 'game-treasure', category: 'games', title: 'Treasure Hunt', to: '/games/treasure', icon: 'map', color: 'sunny', voice: 'can-you-find' },
  { id: 'game-tower', category: 'games', title: 'Build a Tower', to: '/games/tower', icon: 'bricks', color: 'bubblegum', voice: 'build-tower' },
]

const byId = new Map(ACTIVITIES.map((a) => [a.id, a]))
export const getActivity = (id: ActivityId) => byId.get(id)!
export const activitiesIn = (c: CategoryId) => ACTIVITIES.filter((a) => a.category === c)
export const categoryOf = (c: CategoryId) => CATEGORIES.find((x) => x.id === c)!

/** Activities that count toward the Counting Champion badge. */
export const COUNTING_ACTIVITIES: ActivityId[] = ['numbers-count', 'numbers-more-less', 'numbers-match', 'game-race', 'game-monster', 'game-tower']
export const TRACING_ACTIVITIES: ActivityId[] = ['numbers-trace', 'alphabet-trace']
export const GAME_ACTIVITIES = ACTIVITIES.filter((a) => a.category === 'games').map((a) => a.id)
