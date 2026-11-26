<script setup lang="ts">
import type { NumberInfo } from '~/types'
import { glyphColorFor } from '~/utils/theme'

/** Explorer card: big number, its name, and objects to count by tapping. */
const { m } = useI18n()
const props = defineProps<{ info: NumberInfo }>()
const emit = defineEmits<{ counted: [] }>()
const audio = useAudio()
const wiggle = ref(0)
const allCounted = ref(false)
watch(() => props.info.value, () => (allCounted.value = false))

function sayNumber() {
  wiggle.value++
  audio.sfx('tap')
  void audio.say(`numbers/${props.info.value}`)
}
function onComplete() {
  allCounted.value = true
  setTimeout(() => {
    audio.sfx('correct')
    void audio.say([`numbers/${props.info.value}`, audio.praise()])
    emit('counted')
  }, 450)
}
</script>

<template>
  <div class="flex w-full flex-col items-center gap-5 lg:flex-row lg:items-stretch lg:justify-center lg:gap-8">
    <div class="flex w-full max-w-xl flex-col items-center justify-center gap-3 rounded-[2.5rem] bg-white/90 px-8 py-5 shadow-soft lg:w-auto">
      <button type="button" :aria-label="m.common.tapToHear(m.common.number(info.value))" @click="sayNumber">
        <Motion :key="`${info.value}-${wiggle}`" as="span" class="block" :initial="{ scale: 0.6, rotate: -10 }" :animate="{ scale: 1, rotate: 0 }" :transition="{ type: 'spring', stiffness: 300, damping: 10 }">
          <BigGlyph :value="info.value" size="clamp(7rem, 22vw, 12rem)" />
        </Motion>
      </button>
      <div class="flex items-center gap-3">
        <span class="text-4xl font-bold sm:text-5xl" :style="{ color: glyphColorFor(info.value) }">{{ info.name }}</span>
        <AudioButton :voice="[`numbers/${info.value}`]" size="md" :label="m.common.hear(info.name)" />
      </div>
    </div>

    <div class="flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-4 rounded-[2.5rem] bg-white/90 p-5 shadow-soft">
      <button type="button" class="flex items-center gap-2 text-2xl font-bold text-ink sm:text-3xl" @click="audio.say(`count-the/${info.value}`)">
        <ObjectIcon name="eyes" :size="36" decorative />
        {{ allCounted ? m.explorer.greatCounting(info.value) : info.value === 1 ? m.explorer.tapToCount : m.explorer.countThe(info.plural) }}
      </button>
      <ObjectCounter :key="info.value" :object="info.object" :count="info.value" countable @complete="onComplete" />
    </div>
  </div>
</template>
