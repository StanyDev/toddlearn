<script setup lang="ts">
import type { LetterInfo } from '~/types'
import { glyphColorFor } from '~/utils/theme'

/** Explorer card: Aa, a picture, and its word — everything is tappable. */
const { m } = useI18n()
const props = defineProps<{ info: LetterInfo }>()
const emit = defineEmits<{ heard: [] }>()
const audio = useAudio()
const pop = ref(0)
const color = computed(() => glyphColorFor(props.info.upper))
const letterKey = computed(() => `letters/${props.info.lower}`)
const wordKey = computed(() => `letter-words/${props.info.lower}`)

function sayLetter() {
  pop.value++
  audio.sfx('tap')
  void audio.say(letterKey.value)
}
function sayWord() {
  pop.value++
  audio.sfx('sparkle')
  void audio.say(wordKey.value).then(() => emit('heard'))
}
</script>

<template>
  <div class="flex w-full flex-col items-center gap-5 lg:flex-row lg:items-stretch lg:justify-center lg:gap-8">
    <div class="flex w-full max-w-xl flex-col items-center justify-center gap-2 rounded-[2.5rem] bg-white/90 px-8 py-5 shadow-soft lg:w-auto">
      <button type="button" class="flex items-end gap-4" :aria-label="m.common.tapToHear(m.common.letter(info.upper))" @click="sayLetter">
        <Motion :key="`${info.upper}-${pop}`" as="span" class="flex items-end gap-4" :initial="{ scale: 0.7, y: 10 }" :animate="{ scale: 1, y: 0 }" :transition="{ type: 'spring', stiffness: 300, damping: 11 }">
          <BigGlyph :value="info.upper" :color="color" size="clamp(7rem, 22vw, 12rem)" />
          <BigGlyph :value="info.lower" :color="color" size="clamp(5.5rem, 16vw, 9rem)" class="opacity-80" />
        </Motion>
      </button>
      <AudioButton :voice="[letterKey]" size="md" :label="m.common.hearLetter(info.upper)" />
    </div>

    <button type="button" class="toy flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-3 bg-white/90 p-6" :aria-label="m.explorer.isFor(info.upper, info.word)" @click="sayWord">
      <Motion :key="info.object" as="span" :initial="{ scale: 0, rotate: -15 }" :animate="{ scale: 1, rotate: 0 }" :transition="{ type: 'spring', stiffness: 220, damping: 12, delay: 0.1 }">
        <ObjectIcon :name="info.object" :size="'clamp(140px, 30vw, 220px)'" class="animate-float" />
      </Motion>
      <span class="text-4xl font-bold text-ink sm:text-5xl">
        <span :style="{ color }">{{ info.word.charAt(0) }}</span>{{ info.word.slice(1) }}
      </span>
      <span class="flex items-center gap-2 text-xl font-semibold text-ink-soft">
        <svg viewBox="0 0 48 48" class="h-7 w-7 text-sky-deep" aria-hidden="true"><path d="M8 18 H16 L27 9 V39 L16 30 H8 Z" fill="currentColor" /><path d="M33 17 Q38 24 33 31" stroke="currentColor" stroke-width="4" fill="none" stroke-linecap="round" /></svg>
        {{ m.explorer.isFor(info.upper, info.word) }}
      </span>
    </button>
  </div>
</template>
