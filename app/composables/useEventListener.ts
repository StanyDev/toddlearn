import { onBeforeUnmount, onMounted } from 'vue'

/** Add a window event listener for the lifetime of the component. */
export function useEventListener<K extends keyof WindowEventMap>(type: K, handler: (e: WindowEventMap[K]) => void, options?: AddEventListenerOptions) {
  onMounted(() => window.addEventListener(type, handler, options))
  onBeforeUnmount(() => window.removeEventListener(type, handler, options))
}
