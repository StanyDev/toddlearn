<script setup lang="ts">
/** End-of-activity celebration screen. */
const { m } = useI18n()
const props = defineProps<{ stars: number; backTo: string; title?: string }>()
defineEmits<{ again: [] }>()
const audio = useAudio()
const burst = ref(0)
onMounted(() => {
  burst.value++
  const t = setInterval(() => burst.value++, 1800)
  setTimeout(() => clearInterval(t), 5600)
})
const router = useRouter()
function back() {
  audio.sfx('whoosh')
  void router.push(props.backTo)
}
</script>

<template>
  <Motion
    as="div"
    class="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-4 overflow-hidden bg-gradient-to-b from-sky/95 via-lavender/95 to-bubblegum/95 p-6 text-center backdrop-blur-sm"
    :initial="{ opacity: 0 }"
    :animate="{ opacity: 1 }"
    role="dialog"
    aria-modal="true"
    :aria-label="m.complete.aria"
  >
    <CelebrationAnimation :trigger="burst" :pieces="44" origin="top" />
    <div class="absolute inset-0 dots-bg opacity-60" aria-hidden="true" />
    <Motion as="div" :initial="{ scale: 0.3, y: 80 }" :animate="{ scale: 1, y: 0 }" :transition="{ type: 'spring', stiffness: 200, damping: 14 }" class="relative">
      <DinoMascot :size="200" mood="cheer" listen />
    </Motion>
    <h2 class="relative text-5xl font-bold text-white drop-shadow-[0_4px_0_rgba(61,58,92,0.25)] sm:text-6xl">{{ m.complete.title }}</h2>
    <p v-if="title" class="relative text-2xl font-semibold text-ink/80">{{ title }}</p>
    <StarReward class="relative" :count="stars" />
    <div class="relative mt-4 flex gap-5">
      <button type="button" class="toy flex h-24 w-24 flex-col items-center justify-center bg-mint text-ink" :aria-label="m.complete.playAgain" @click="$emit('again')">
        <svg viewBox="0 0 48 48" class="h-12 w-12" aria-hidden="true">
          <path d="M38 24 A14 14 0 1 1 33.9 14.1" stroke="currentColor" stroke-width="6" fill="none" stroke-linecap="round" />
          <path d="M28 6 L36 14 L27 19" stroke="currentColor" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <span class="text-sm font-bold">{{ m.complete.again }}</span>
      </button>
      <button type="button" class="toy flex h-24 w-24 flex-col items-center justify-center bg-white text-ink" :aria-label="m.complete.backToActivities" @click="back">
        <svg viewBox="0 0 48 48" class="h-12 w-12" aria-hidden="true">
          <rect x="7" y="7" width="14" height="14" rx="4" fill="currentColor" />
          <rect x="27" y="7" width="14" height="14" rx="4" fill="currentColor" opacity="0.6" />
          <rect x="7" y="27" width="14" height="14" rx="4" fill="currentColor" opacity="0.6" />
          <rect x="27" y="27" width="14" height="14" rx="4" fill="currentColor" />
        </svg>
        <span class="text-sm font-bold">{{ m.complete.more }}</span>
      </button>
    </div>
  </Motion>
</template>
