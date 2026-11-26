/**
 * App-wide client behaviour:
 * - tracks active learning time (only while the tab is visible and the child
 *   has interacted recently, and never inside the parent area)
 * - applies the reduced-motion preference to <html>
 */
export default defineNuxtPlugin(() => {
  const { addTime } = useProgress()
  const { settings } = useSettings()
  const route = useRoute()

  const TICK = 5000
  const IDLE_AFTER = 90_000
  let lastInteraction = Date.now()
  const mark = () => (lastInteraction = Date.now())
  window.addEventListener('pointerdown', mark, { passive: true })
  window.addEventListener('keydown', mark)

  setInterval(() => {
    if (document.visibilityState !== 'visible') return
    if (Date.now() - lastInteraction > IDLE_AFTER) return
    if (route.path.startsWith('/parent')) return
    addTime(TICK)
  }, TICK)

  watch(
    () => settings.value.reducedMotion,
    (mode) => {
      document.documentElement.classList.toggle('reduce-motion', mode === 'on')
      document.documentElement.classList.toggle('allow-motion', mode === 'off')
    },
    { immediate: true },
  )

  // Long-press context menus get in the way of little fingers.
  window.addEventListener('contextmenu', (e) => {
    if (!(e.target as HTMLElement)?.closest('input, textarea')) e.preventDefault()
  })
})
