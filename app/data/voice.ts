import { COLORS, LETTERS, NUMBERS, SHAPES } from './learning.ts'
import { OBJECTS } from './objects.ts'

/**
 * Voice clip catalogue.
 *
 * Every clip has a key and the text that is spoken. Recorded files live at
 *   public/audio/voice/<key>.m4a
 * e.g. `numbers/5` → public/audio/voice/numbers/5.m4a
 *
 * The shipped clips are generated with `scripts/generate-voice.sh` (macOS
 * text-to-speech) as development stand-ins. To use a professional voice-over,
 * record files with the same keys and drop them into the same folders — no
 * code changes needed. If a file is missing, useAudio() falls back to the
 * browser's speech synthesis using `text` (configurable in the parent area).
 */

/** Fixed phrases: instructions, praise and encouragement. */
export const PHRASES = {
  'welcome': "Hi! I'm Dino! Let's play and learn together!",
  'welcome-back': 'Yay, you are back! What shall we play?',
  'hub-numbers': "Let's play with numbers!",
  'hub-alphabet': "Let's learn the A B C!",
  'hub-colors-shapes': "Let's play with colors and shapes!",
  'hub-games': 'Pick a fun game!',
  'hub-rewards': 'Look at all your treasures!',
  'tap-a-number': 'Tap a number!',
  'tap-a-letter': 'Tap a letter!',
  'tap-a-color': 'Tap a color!',
  'tap-a-shape': 'Tap a shape!',
  'how-many': 'How many do you see?',
  'find-the-number': 'Find the number',
  'find-the-letter': 'Find the letter',
  'find-the': 'Find the',
  'which-missing-number': 'Which number is missing?',
  'which-missing-letter': 'Which letter is missing?',
  'which-more': 'Which group has more?',
  'which-less': 'Which group has less?',
  'match-numbers': 'Match each number with the right group!',
  'match-case': 'Match the big letter with the little letter!',
  'match-picture': 'Match each letter with its picture!',
  'match-colors': 'Match each thing with its color!',
  'match-shapes': 'Match each shape with something that looks like it!',
  'find-something': 'Find something that is',
  'sort-by-color': 'Put each one in the box with the same color!',
  'sort-by-shape': 'Put each one in the box with the same shape!',
  'trace-number': 'Trace the number with your finger!',
  'trace-letter': 'Trace the letter with your finger!',
  'start-at-dot': 'Start at the big dot!',
  'keep-going': 'Keep going!',
  'pop-balloon': 'Pop the balloon with',
  'feed-me': "I'm hungry! Please feed me",
  'fruits': 'fruits!',
  'yum': 'Yum yum! Thank you!',
  'catch-fish': 'Catch the fish with the letter',
  'memory-intro': 'Flip the cards and find the pairs!',
  'its-a-match': "It's a match!",
  'race-intro': 'Count to make the car go!',
  'finish-line': 'Zoom! We reached the finish line!',
  'can-you-find': 'Can you find',
  'build-tower': "Let's build a tower with",
  'blocks': 'blocks!',
  'tower-done': 'Wow, what a tall tower!',
  'praise-1': 'Great job!',
  'praise-2': 'You did it!',
  'praise-3': 'Awesome!',
  'praise-4': 'Super star!',
  'praise-5': 'Well done!',
  'praise-6': 'Wow, amazing!',
  'encourage-1': 'Oops! Try again!',
  'encourage-2': 'Almost! Try one more time!',
  'encourage-3': 'You can do it!',
  'encourage-4': "Let's try again!",
  'complete': 'Hooray! You finished! Here are your stars!',
  'new-badge': 'You got a new badge!',
  'new-dino': 'You found a new dino friend!',
  'new-decoration': 'You unlocked something new for Dino!',
  'pick-dino': 'Pick your dino friend!',
  'parent-zone': 'This area is for grown-ups.',
  'is-for': 'is for',
  'this-is': 'This is',
  'more': 'more',
  'less': 'less',
} as const

export type PhraseKey = keyof typeof PHRASES

/** Build the full key → text map used by both the app and the generator. */
export function buildVoiceCatalog(): Record<string, string> {
  const map: Record<string, string> = { ...PHRASES }
  for (const n of NUMBERS) {
    map[`numbers/${n.value}`] = n.name
    map[`count-the/${n.value}`] = n.value === 1 ? `Look! One ${n.plural}!` : `Let's count the ${n.plural}!`
  }
  for (const l of LETTERS) {
    map[`letters/${l.lower}`] = l.upper
    map[`letter-words/${l.lower}`] = `${l.upper} is for ${l.word}!`
  }
  for (const c of COLORS) map[`colors/${c.id}`] = c.name
  for (const s of SHAPES) map[`shapes/${s.id}`] = s.name
  for (const o of OBJECTS) map[`words/${o.key}`] = o.label
  return map
}

export const VOICE_CATALOG = buildVoiceCatalog()

export const voicePath = (key: string) => `/audio/voice/${key}.m4a`
