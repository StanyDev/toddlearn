import { ref, watch, type Ref } from 'vue'

/**
 * A reactive value persisted to localStorage.
 *
 * - `sanitize` receives whatever was stored (possibly corrupted or from an
 *   older version) and must return a fully valid state, so the app always
 *   starts from safe defaults.
 * - Writes are debounced and failures (quota, private mode) are ignored:
 *   the app keeps working in memory.
 */
export function usePersistedState<T extends object>(key: string, sanitize: (raw: unknown) => T): Ref<T> {
  let initial: unknown = undefined
  try {
    const raw = localStorage.getItem(key)
    if (raw) initial = JSON.parse(raw)
  } catch {
    initial = undefined
  }
  const state = ref(sanitize(initial)) as Ref<T>

  let timer: ReturnType<typeof setTimeout> | undefined
  const write = () => {
    try {
      localStorage.setItem(key, JSON.stringify(state.value))
    } catch {
      /* storage unavailable — keep in memory */
    }
  }
  watch(
    state,
    () => {
      clearTimeout(timer)
      timer = setTimeout(write, 150)
    },
    { deep: true },
  )
  window.addEventListener('pagehide', write)
  return state
}

/* ------------------------- tiny validation helpers ------------------------ */

export const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)

export const num = (v: unknown, fallback: number, min = -Infinity, max = Infinity) =>
  typeof v === 'number' && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : fallback

export const bool = (v: unknown, fallback: boolean) => (typeof v === 'boolean' ? v : fallback)

export const str = (v: unknown, fallback: string) => (typeof v === 'string' ? v : fallback)

export function oneOf<T extends string>(v: unknown, allowed: readonly T[], fallback: T): T {
  return allowed.includes(v as T) ? (v as T) : fallback
}

/** Keep only array items that pass `valid`, de-duplicated. */
export function arrOf<T>(v: unknown, valid: (x: unknown) => x is T): T[] {
  if (!Array.isArray(v)) return []
  return [...new Set(v.filter(valid))]
}
