<script setup lang="ts">
import type { ChoiceVisual, PromptVisual } from '~/types'
const { m } = useI18n()

/**
 * Instruction line (tap to hear again) + the question's main visual.
 * The hint gives a visual alternative to the spoken instruction.
 */
const props = defineProps<{ text: string; voice: string[]; hint?: ChoiceVisual; prompt?: PromptVisual; revealed?: string | null }>()
const audio = useAudio()
function replay() {
  void audio.say(props.voice)
}
</script>

<template>
  <div class="flex w-full flex-col items-center gap-5">
    <button type="button" class="toy flex min-h-20 items-center gap-3 bg-white py-2 pr-6 pl-3" :aria-label="m.common.hearQuestion" @click="replay">
      <span class="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-sky-deep text-white" :class="{ 'animate-pulse': audio.speaking.value }">
        <svg viewBox="0 0 48 48" class="h-8 w-8" aria-hidden="true">
          <path d="M8 18 H16 L27 9 V39 L16 30 H8 Z" fill="currentColor" stroke="currentColor" stroke-width="3" stroke-linejoin="round" />
          <path d="M33 17 Q38 24 33 31 M38 12 Q46 24 38 36" stroke="currentColor" stroke-width="4" fill="none" stroke-linecap="round" />
        </svg>
      </span>
      <span class="text-3xl font-bold text-ink sm:text-4xl">{{ text }}</span>
      <span v-if="hint" class="ml-1 flex items-center rounded-2xl bg-cream px-2 py-1">
        <ChoiceVisual :visual="hint" :scale="hint.kind === 'group' ? 0.55 : 0.6" />
      </span>
    </button>

    <template v-if="prompt && prompt.kind !== 'none'">
      <Motion
        :key="JSON.stringify(prompt)"
        as="div"
        class="flex min-h-40 items-center justify-center rounded-[2rem] bg-white/90 p-5 shadow-soft"
        :initial="{ scale: 0.8, opacity: 0 }"
        :animate="{ scale: 1, opacity: 1 }"
        :transition="{ type: 'spring', stiffness: 260, damping: 18 }"
      >
        <ObjectCounter v-if="prompt.kind === 'group'" :object="prompt.object" :count="prompt.count" />
        <div v-else-if="prompt.kind === 'sequence'" class="flex items-center gap-2 sm:gap-4">
          <template v-for="(item, i) in prompt.items" :key="i">
            <span v-if="i > 0" class="text-3xl font-bold text-ink/25">›</span>
            <span
              class="flex h-24 w-20 items-center justify-center rounded-3xl sm:h-28 sm:w-24"
              :class="item === null && !revealed ? 'animate-pulse border-4 border-dashed border-sunny-deep bg-sunny/40' : 'bg-cream'"
            >
              <BigGlyph v-if="item !== null" :value="item" size="3.6rem" />
              <Motion v-else-if="revealed" as="span" :initial="{ scale: 0 }" :animate="{ scale: 1 }"><BigGlyph :value="revealed" size="3.6rem" /></Motion>
              <span v-else class="text-5xl font-bold text-sunny-deep">?</span>
            </span>
          </template>
        </div>
        <ChoiceVisual v-else :visual="prompt as ChoiceVisual" :scale="1.6" />
      </Motion>
    </template>
  </div>
</template>
