import type { ActivityId, Choice, ColorId, MatchRound, QuizQuestion, ShapeId } from '~/types'
import { COLORS, LETTERS, NUMBERS, SHAPES, SHAPE_COLORS, colorById, letterInfo, numberInfo } from '~/data/learning'
import { messages } from '~/composables/useI18n'
import { distractors, nearbyNumbers, pick, pickFresh, randInt, sample, shuffle } from '~/utils/random'

/**
 * Question generators for every quiz-style and matching activity.
 * `level` grows with the round so each session starts easy.
 */

const COUNTABLES = ['apple', 'duck', 'star', 'balloon', 'flower', 'fish', 'car', 'butterfly', 'cookie', 'strawberry', 'ladybug', 'frog', 'chick', 'bee', 'cupcake']
const ALL_LETTERS = LETTERS.map((l) => l.upper)
const ALL_COLORS = COLORS.map((c) => c.id)
const ALL_SHAPES = SHAPES.map((s) => s.id)

const numChoice = (n: number): Choice => ({ id: String(n), visual: { kind: 'number', value: n }, voice: [`numbers/${n}`] })
const letterChoice = (l: string, lower = false): Choice => ({
  id: l,
  visual: { kind: 'letter', value: lower ? l.toLowerCase() : l },
  voice: [`letters/${l.toLowerCase()}`],
})

export type Generator = (round: number, recent: unknown[]) => QuizQuestion
export type MatchGenerator = (round: number) => MatchRound

/* -------------------------------- numbers -------------------------------- */

const countObjects: Generator = (round, recent) => {
  const max = round < 2 ? 5 : 10
  const n = pickFresh(Array.from({ length: max }, (_, i) => i + 1), recent as number[])
  const object = pick(COUNTABLES)
  const options = shuffle([n, ...nearbyNumbers(n, 2, 1, Math.max(max, n + 2))])
  return {
    text: messages().quiz.howMany,
    voice: ['how-many'],
    prompt: { kind: 'group', object, count: n },
    choices: options.map(numChoice),
    answerId: String(n),
  }
}

const findNumber: Generator = (round, recent) => {
  const max = round < 2 ? 10 : 20
  const n = pickFresh(Array.from({ length: max }, (_, i) => i + 1), recent as number[])
  const count = round < 2 ? 3 : 4
  const options = shuffle([n, ...nearbyNumbers(n, count - 1, 1, max, 5)])
  return {
    text: messages().quiz.find,
    hint: { kind: 'group', object: numberInfo(n).object, count: n },
    voice: ['find-the-number', `numbers/${n}`],
    prompt: { kind: 'none' },
    choices: options.map(numChoice),
    answerId: String(n),
  }
}

const missingNumber: Generator = (round) => {
  const len = 4
  const startMax = round < 2 ? 6 : 20 - len + 1
  const start = randInt(1, startMax)
  const seq = Array.from({ length: len }, (_, i) => start + i)
  const hole = randInt(1, len - 1)
  const answer = seq[hole]!
  const options = shuffle([answer, ...nearbyNumbers(answer, 2, 1, 20).filter((x) => !seq.includes(x) || x === answer).slice(0, 2)])
  while (options.length < 3) {
    const x = randInt(1, 20)
    if (!options.includes(x) && !seq.includes(x)) options.push(x)
  }
  return {
    text: messages().quiz.whatMissing,
    voice: ['which-missing-number'],
    prompt: { kind: 'sequence', items: seq.map((x, i) => (i === hole ? null : String(x))) },
    choices: shuffle(options).map(numChoice),
    answerId: String(answer),
  }
}

const moreOrLess: Generator = (round) => {
  const askMore = round % 3 !== 2 // mostly "more", sometimes "less"
  const max = round < 2 ? 6 : 9
  let a = randInt(1, max)
  let b = randInt(1, max)
  while (Math.abs(a - b) < (round < 2 ? 3 : 2)) {
    a = randInt(1, max)
    b = randInt(1, max)
  }
  const object = pick(COUNTABLES)
  const answer = askMore ? (a > b ? 'a' : 'b') : a < b ? 'a' : 'b'
  return {
    text: askMore ? messages().quiz.whichMore : messages().quiz.whichLess,
    voice: [askMore ? 'which-more' : 'which-less'],
    prompt: { kind: 'none' },
    layout: 'pair',
    choices: [
      { id: 'a', visual: { kind: 'group', object, count: a }, voice: [`numbers/${a}`] },
      { id: 'b', visual: { kind: 'group', object, count: b }, voice: [`numbers/${b}`] },
    ],
    answerId: answer,
  }
}

const matchNumbers: MatchGenerator = (round) => {
  const pool = round < 2 ? [1, 2, 3, 4, 5] : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  const nums = sample(pool, 3)
  return {
    text: messages().quiz.match,
    voice: ['match-numbers'],
    pairs: nums.map((n) => ({
      id: String(n),
      left: { kind: 'number', value: n },
      right: { kind: 'group', object: numberInfo(n).object, count: n },
      voice: [`numbers/${n}`],
    })),
  }
}

/* -------------------------------- alphabet ------------------------------- */

const findLetter: Generator = (round, recent) => {
  const l = pickFresh(ALL_LETTERS, recent as string[], 5)
  const count = round < 2 ? 3 : 4
  const options = shuffle([l, ...distractors(ALL_LETTERS, l, count - 1)])
  return {
    text: messages().quiz.find,
    hint: { kind: 'object', key: letterInfo(l).object },
    voice: ['find-the-letter', `letters/${l.toLowerCase()}`],
    prompt: { kind: 'none' },
    choices: options.map((x) => letterChoice(x)),
    answerId: l,
  }
}

const missingLetter: Generator = (round) => {
  const len = 4
  const start = randInt(0, round < 2 ? 8 : 26 - len)
  const seq = ALL_LETTERS.slice(start, start + len)
  const hole = randInt(1, len - 1)
  const answer = seq[hole]!
  const options = shuffle([answer, ...distractors(ALL_LETTERS.filter((x) => !seq.includes(x)), answer, 2)])
  return {
    text: messages().quiz.whatMissing,
    voice: ['which-missing-letter'],
    prompt: { kind: 'sequence', items: seq.map((x, i) => (i === hole ? null : x)) },
    choices: options.map((x) => letterChoice(x)),
    answerId: answer,
  }
}

const matchCase: MatchGenerator = (round) => {
  const letters = sample(round < 2 ? ALL_LETTERS.slice(0, 10) : ALL_LETTERS, 3)
  return {
    text: messages().quiz.bigLittle,
    voice: ['match-case'],
    pairs: letters.map((l) => ({
      id: l,
      left: { kind: 'letter', value: l },
      right: { kind: 'letter', value: l.toLowerCase() },
      voice: [`letters/${l.toLowerCase()}`],
    })),
  }
}

const matchPicture: MatchGenerator = () => {
  const letters = sample(ALL_LETTERS, 3)
  return {
    text: messages().quiz.letterPicture,
    voice: ['match-picture'],
    pairs: letters.map((l) => ({
      id: l,
      left: { kind: 'letter', value: l },
      right: { kind: 'object', key: letterInfo(l).object },
      voice: [`letter-words/${l.toLowerCase()}`],
    })),
  }
}

/* ----------------------------- colors & shapes ---------------------------- */

const BASIC_COLORS: ColorId[] = ['red', 'blue', 'yellow', 'green']

const findColor: Generator = (round, recent) => {
  const pool = round < 2 ? BASIC_COLORS : ALL_COLORS
  const c = pickFresh(pool, recent as ColorId[])
  const options = shuffle([c, ...distractors(pool, c, round < 2 ? 2 : 3)])
  return {
    text: messages().quiz.find,
    hint: { kind: 'object', key: colorById(c).objects[0]! },
    voice: ['can-you-find', `colors/${c}`],
    prompt: { kind: 'none' },
    choices: options.map((x) => ({ id: x, visual: { kind: 'color', color: x }, voice: [`colors/${x}`] })),
    answerId: c,
  }
}

const colorHunt: Generator = (_round, recent) => {
  const c = pickFresh(ALL_COLORS, recent as ColorId[])
  const others = distractors(ALL_COLORS, c, 2)
  const options = shuffle([c, ...others]).map((color) => ({ color, object: pick(colorById(color).objects) }))
  return {
    text: messages().quiz.findSomething,
    hint: { kind: 'color', color: c },
    voice: ['find-something', `colors/${c}`],
    prompt: { kind: 'none' },
    choices: options.map((o) => ({ id: o.color, visual: { kind: 'object', key: o.object }, voice: [`words/${o.object}`, `colors/${o.color}`] })),
    answerId: c,
  }
}

const matchColors: MatchGenerator = () => {
  const colors = sample(ALL_COLORS, 3)
  return {
    text: messages().quiz.matchColors,
    voice: ['match-colors'],
    pairs: colors.map((c) => ({
      id: c,
      left: { kind: 'object', key: pick(colorById(c).objects) },
      right: { kind: 'color', color: c },
      voice: [`colors/${c}`],
    })),
  }
}

const findShape: Generator = (round, recent) => {
  const pool: ShapeId[] = round < 2 ? ['circle', 'square', 'triangle', 'star'] : ALL_SHAPES
  const s = pickFresh(pool, recent as ShapeId[])
  const options = shuffle([s, ...distractors(pool, s, round < 2 ? 2 : 3)])
  return {
    text: messages().quiz.find,
    hint: { kind: 'object', key: SHAPES.find((x) => x.id === s)!.objects[0]! },
    voice: ['find-the', `shapes/${s}`],
    prompt: { kind: 'none' },
    choices: options.map((x) => ({ id: x, visual: { kind: 'shape', shape: x, color: SHAPE_COLORS[x] }, voice: [`shapes/${x}`] })),
    answerId: s,
  }
}

const matchShapes: MatchGenerator = () => {
  const shapes = sample(ALL_SHAPES, 3)
  return {
    text: messages().quiz.matchShapes,
    voice: ['match-shapes'],
    pairs: shapes.map((s) => ({
      id: s,
      left: { kind: 'shape', shape: s, color: SHAPE_COLORS[s] },
      right: { kind: 'object', key: pick(SHAPES.find((x) => x.id === s)!.objects) },
      voice: [`shapes/${s}`],
    })),
  }
}

/* -------------------------------- registry -------------------------------- */

export type ActivityEngine =
  | { engine: 'quiz'; generate: Generator }
  | { engine: 'match'; generate: MatchGenerator }

export const ACTIVITY_ENGINES: Partial<Record<ActivityId, ActivityEngine>> = {
  'numbers-count': { engine: 'quiz', generate: countObjects },
  'numbers-find': { engine: 'quiz', generate: findNumber },
  'numbers-missing': { engine: 'quiz', generate: missingNumber },
  'numbers-more-less': { engine: 'quiz', generate: moreOrLess },
  'numbers-match': { engine: 'match', generate: matchNumbers },
  'alphabet-find': { engine: 'quiz', generate: findLetter },
  'alphabet-missing': { engine: 'quiz', generate: missingLetter },
  'alphabet-case-match': { engine: 'match', generate: matchCase },
  'alphabet-picture-match': { engine: 'match', generate: matchPicture },
  'colors-find': { engine: 'quiz', generate: findColor },
  'colors-hunt': { engine: 'quiz', generate: colorHunt },
  'colors-match': { engine: 'match', generate: matchColors },
  'shapes-find': { engine: 'quiz', generate: findShape },
  'shapes-match': { engine: 'match', generate: matchShapes },
}

/** Shared by Number Race and other counting games. */
export { countObjects }
export const NUMBER_VALUES = NUMBERS.map((n) => n.value)
