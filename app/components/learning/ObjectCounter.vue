<script setup lang="ts">
/**
 * Shows `count` copies of an object in tidy rows of five (like a ten-frame).
 * With `countable`, children tap each object to count it out loud.
 */
const props = withDefaults(
  defineProps<{ object: string; count: number; size?: number; countable?: boolean; perRow?: number }>(),
  { size: undefined, countable: false, perRow: 5 },
)
const emit = defineEmits<{ counted: [n: number]; complete: [] }>()
const audio = useAudio()

const counted = ref<number[]>([])
watch(() => [props.object, props.count], () => (counted.value = []))

const autoSize = computed(() => props.size ?? (props.count <= 3 ? 76 : props.count <= 5 ? 62 : props.count <= 10 ? 52 : 42))
const rows = computed(() => {
  const per = props.count <= 5 ? props.count : props.perRow
  const out: number[][] = []
  for (let i = 0; i < props.count; i += per) out.push(Array.from({ length: Math.min(per, props.count - i) }, (_, k) => i + k))
  return out
})

function tap(i: number) {
  if (!props.countable || counted.value.includes(i)) return
  counted.value.push(i)
  const n = counted.value.length
  audio.sfx('tap')
  void audio.say(`numbers/${n}`)
  emit('counted', n)
  if (n === props.count) emit('complete')
}
const badgeFor = (i: number) => counted.value.indexOf(i) + 1
</script>

<template>
  <div class="flex flex-col items-center gap-1.5" :aria-label="`${count} ${object}`">
    <div v-for="(row, r) in rows" :key="r" class="flex justify-center gap-1.5">
      <component
        :is="countable ? 'button' : 'span'"
        v-for="i in row"
        :key="i"
        type="button"
        class="relative flex items-center justify-center rounded-2xl transition-transform"
        :class="[countable ? 'active:scale-90' : '', countable && badgeFor(i) ? 'bg-white/70' : '']"
        :style="{ width: `${autoSize + 8}px`, height: `${autoSize + 8}px` }"
        :aria-label="countable ? `Count ${object}` : undefined"
        @click="tap(i)"
      >
        <Motion
          as="span"
          class="block"
          :initial="{ scale: 0, rotate: -20 }"
          :animate="{ scale: badgeFor(i) ? 1.12 : 1, rotate: 0 }"
          :transition="{ type: 'spring', stiffness: 400, damping: 16, delay: countable ? 0 : i * 0.04 }"
        >
          <ObjectIcon :name="object" :size="autoSize" decorative />
        </Motion>
        <Motion
          v-if="countable && badgeFor(i)"
          as="span"
          class="absolute -top-1 -right-1 flex h-7 min-w-7 items-center justify-center rounded-full bg-sky-deep px-1 text-base font-bold text-white shadow-pop-sm"
          :initial="{ scale: 0 }"
          :animate="{ scale: 1 }"
          >{{ badgeFor(i) }}</Motion
        >
      </component>
    </div>
  </div>
</template>
