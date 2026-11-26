<script setup lang="ts">
/**
 * A big tappable answer card. `state` drives friendly animations:
 * correct → bounce + green glow, wrong → gentle wobble (never red/negative).
 */
const props = withDefaults(defineProps<{ state?: 'idle' | 'correct' | 'wrong' | 'dim'; disabled?: boolean; label?: string; size?: 'md' | 'lg' | 'wide' }>(), {
  state: 'idle',
  disabled: false,
  label: undefined,
  size: 'lg',
})
defineEmits<{ select: [] }>()

const anim = ref('')
watch(
  () => props.state,
  (s) => {
    anim.value = s === 'correct' ? 'opt-bounce' : s === 'wrong' ? 'opt-wobble' : ''
  },
)
const sizes = {
  md: 'min-h-24 min-w-24 p-3',
  lg: 'min-h-32 min-w-32 p-4 sm:min-h-40 sm:min-w-40',
  wide: 'min-h-40 w-full p-4 sm:min-h-52',
}
</script>

<template>
  <button
    type="button"
    class="toy flex items-center justify-center bg-white transition-[opacity,box-shadow,background-color] duration-300"
    :class="[
      sizes[size],
      anim,
      state === 'correct' ? 'bg-mint! ring-8 ring-mint-deep/60' : '',
      state === 'dim' ? 'opacity-40' : '',
    ]"
    :disabled="disabled"
    :aria-label="label"
    @click="$emit('select')"
  >
    <slot />
  </button>
</template>

<style scoped>
.opt-bounce {
  animation: opt-bounce 0.7s cubic-bezier(0.3, 1.6, 0.5, 1);
}
.opt-wobble {
  animation: opt-wobble 0.55s ease-in-out;
}
@keyframes opt-bounce {
  0% { transform: scale(1); }
  40% { transform: scale(1.18) rotate(-3deg); }
  70% { transform: scale(0.96) rotate(2deg); }
  100% { transform: scale(1.06); }
}
@keyframes opt-wobble {
  0%, 100% { transform: translateX(0) rotate(0); }
  20% { transform: translateX(-10px) rotate(-4deg); }
  40% { transform: translateX(9px) rotate(3deg); }
  60% { transform: translateX(-6px) rotate(-2deg); }
  80% { transform: translateX(4px) rotate(1deg); }
}
</style>
