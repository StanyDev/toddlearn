import { ref } from 'vue'

/** The parent area stays unlocked for a short while, in memory only. */
const unlockedUntil = ref(0)
const SESSION_MS = 10 * 60 * 1000

export function useParentSession() {
  const isUnlocked = () => Date.now() < unlockedUntil.value
  const unlock = () => (unlockedUntil.value = Date.now() + SESSION_MS)
  const lock = () => (unlockedUntil.value = 0)
  return { isUnlocked, unlock, lock, unlockedUntil }
}
