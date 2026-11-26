/** Capture the pointer so drags keep working outside the element; never throws. */
export function capturePointer(e: PointerEvent) {
  try {
    ;(e.currentTarget as Element | null)?.setPointerCapture?.(e.pointerId)
  } catch {
    /* pointer already released or synthetic — safe to ignore */
  }
}
