export const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min

export function shuffle<T>(items: readonly T[]): T[] {
  const a = [...items]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j]!, a[i]!]
  }
  return a
}

export const pick = <T>(items: readonly T[]): T => items[Math.floor(Math.random() * items.length)]!

/** Pick `n` distinct items. */
export const sample = <T>(items: readonly T[], n: number): T[] => shuffle(items).slice(0, n)

/** Pick `n` distinct items that are not `exclude`. */
export function distractors<T>(items: readonly T[], exclude: T, n: number): T[] {
  return sample(items.filter((x) => x !== exclude), n)
}

/** Distinct integers near `target` within [min, max], excluding target. */
export function nearbyNumbers(target: number, n: number, min: number, max: number, spread = 3): number[] {
  const pool: number[] = []
  for (let d = 1; pool.length < n * 3 && d <= max - min; d++) {
    if (target - d >= min) pool.push(target - d)
    if (target + d <= max) pool.push(target + d)
    if (d >= spread && pool.length >= n) break
  }
  return sample(pool, n)
}

/** Avoid repeating the same target in consecutive rounds. */
export function pickFresh<T>(items: readonly T[], recent: T[], keep = 3): T {
  const fresh = items.filter((x) => !recent.includes(x))
  const choice = pick(fresh.length ? fresh : items)
  recent.push(choice)
  if (recent.length > keep) recent.shift()
  return choice
}

export const uid = () => Math.random().toString(36).slice(2, 10)
