import { capturePointer } from '~/utils/pointer'
import { ref } from 'vue'

/**
 * Minimal pointer-based drag & drop for touch, mouse and pen.
 * A press without movement counts as a tap (`onTap`); a drag released over an
 * element with `data-drop="<id>"` calls `onDrop(itemId, dropId)`.
 */
export function useDragDrop<T extends string | number>(opts: {
  onTap?: (id: T) => void
  onDrop: (id: T, dropId: string) => void
  onDragStart?: (id: T) => void
  enabled?: () => boolean
}) {
  const dragging = ref<T | null>(null) as { value: T | null }
  const offset = ref({ x: 0, y: 0 })
  const overDrop = ref<string | null>(null)
  let start = { x: 0, y: 0 }
  let moved = false
  let target: HTMLElement | null = null

  function findDrop(x: number, y: number) {
    const el = document.elementFromPoint(x, y)?.closest<HTMLElement>('[data-drop]')
    return el?.dataset.drop ?? null
  }

  function down(e: PointerEvent, id: T) {
    if (opts.enabled && !opts.enabled()) return
    target = e.currentTarget as HTMLElement
    capturePointer(e)
    start = { x: e.clientX, y: e.clientY }
    moved = false
    dragging.value = id
    offset.value = { x: 0, y: 0 }
  }

  function move(e: PointerEvent) {
    if (dragging.value === null) return
    const dx = e.clientX - start.x
    const dy = e.clientY - start.y
    if (!moved && Math.hypot(dx, dy) > 10) {
      moved = true
      opts.onDragStart?.(dragging.value)
    }
    if (!moved) return
    offset.value = { x: dx, y: dy }
    // The dragged element ignores pointer hits so we can see what's below.
    if (target) target.style.pointerEvents = 'none'
    overDrop.value = findDrop(e.clientX, e.clientY)
    if (target) target.style.pointerEvents = ''
  }

  function up(e: PointerEvent) {
    const id = dragging.value
    if (id === null) return
    if (target) target.style.pointerEvents = 'none'
    const drop = moved ? findDrop(e.clientX, e.clientY) : null
    if (target) target.style.pointerEvents = ''
    dragging.value = null
    offset.value = { x: 0, y: 0 }
    overDrop.value = null
    if (!moved) opts.onTap?.(id)
    else if (drop) opts.onDrop(id, drop)
  }

  /** Spread onto the draggable element: v-bind="handlers(id)". */
  const handlers = (id: T) => ({
    onPointerdown: (e: PointerEvent) => down(e, id),
    onPointermove: move,
    onPointerup: up,
    onPointercancel: up,
  })

  const styleFor = (id: T) =>
    dragging.value === id && (offset.value.x || offset.value.y)
      ? { transform: `translate(${offset.value.x}px, ${offset.value.y}px) scale(1.12)`, zIndex: 50, transition: 'none' }
      : undefined

  return { dragging, offset, overDrop, handlers, styleFor }
}
