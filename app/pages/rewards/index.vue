<script setup lang="ts">
import type { DecorationId } from '~/types'
import { ACHIEVEMENTS, DECORATIONS, DINOS } from '~/data/rewards'
const { m } = useI18n()

useHead({ title: () => `${m.value.rewards.title} · DinoLand` })
const audio = useAudio()
const { progress } = useProgress()
const rewards = useRewards()
const cheer = ref(0)

const stars = computed(() => progress.value.stars)
const r = computed(() => rewards.rewards.value)

function chooseDino(id: string) {
  if (!r.value.unlockedDinos.includes(id)) {
    audio.sfx('tryAgain')
    return
  }
  rewards.setActiveDino(id)
  cheer.value++
  audio.sfx('sparkle')
}
function chooseDecoration(id: DecorationId) {
  if (!r.value.unlockedDecorations.includes(id)) {
    audio.sfx('tryAgain')
    return
  }
  rewards.setDecoration(r.value.activeDecoration === id ? null : id)
  cheer.value++
  audio.sfx('sparkle')
}
onMounted(() => {
  if (audio.unlocked.value) void audio.say('hub-rewards')
})
</script>

<template>
  <div class="relative min-h-dvh bg-sunny/30 page-pad pb-10">
    <div class="pointer-events-none absolute inset-0 dots-bg" aria-hidden="true" />
    <CelebrationAnimation :trigger="cheer" :pieces="24" origin="top" />
    <header class="relative flex items-center gap-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
      <BackButton to="/" icon="home" :label="m.common.home" />
      <h1 class="flex-1 text-3xl font-bold text-ink sm:text-4xl">{{ m.rewards.title }}</h1>
    </header>

    <!-- star hero -->
    <section class="relative mx-auto mt-4 flex max-w-5xl flex-col items-center gap-4 rounded-[2.5rem] bg-white/90 p-6 shadow-soft sm:flex-row">
      <Motion :key="cheer" as="div" :initial="{ scale: 0.8 }" :animate="{ scale: 1 }" :transition="{ type: 'spring', stiffness: 300, damping: 10 }">
        <DinoMascot :size="180" mood="cheer" listen />
      </Motion>
      <div class="flex flex-1 flex-col items-center gap-2 sm:items-start">
        <div class="flex items-center gap-3">
          <ObjectIcon name="star" :size="72" class="animate-twinkle" />
          <span class="text-7xl font-bold text-ink tabular-nums">{{ stars }}</span>
        </div>
        <p class="text-2xl font-semibold text-ink-soft">{{ m.rewards.starsCollected }}</p>
        <p v-if="rewards.nextUnlock.value" class="flex items-center gap-2 rounded-full bg-sunny/50 px-4 py-2 text-lg font-semibold text-ink">
          <ObjectIcon name="gift" :size="28" decorative />
          {{ m.rewards.moreStarsFor(rewards.nextUnlock.value.starsNeeded - stars, rewards.nextUnlock.value.name) }}
        </p>
      </div>
    </section>

    <!-- dino friends -->
    <section class="relative mx-auto mt-6 max-w-5xl" aria-labelledby="friends">
      <h2 id="friends" class="mb-3 text-2xl font-bold text-ink">{{ m.rewards.friends }}</h2>
      <div class="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
        <button
          v-for="d in DINOS"
          :key="d.id"
          type="button"
          class="toy relative flex flex-col items-center gap-1 bg-white p-3"
          :class="r.activeDino === d.id ? 'ring-8 ring-mint-deep' : ''"
          :aria-label="r.unlockedDinos.includes(d.id) ? m.rewards.playWith(d.name) : m.rewards.needs(d.name, d.starsNeeded)"
          :aria-pressed="r.activeDino === d.id"
          @click="chooseDino(d.id)"
        >
          <DinoMascot :dino="d.id" :decoration="null" :size="96" :animated="r.activeDino === d.id" :silhouette="!r.unlockedDinos.includes(d.id)" />
          <span class="text-lg font-bold text-ink">{{ r.unlockedDinos.includes(d.id) ? d.name : '???' }}</span>
          <span v-if="!r.unlockedDinos.includes(d.id)" class="flex items-center gap-1 text-base font-bold text-ink-soft">
            <ObjectIcon name="star" :size="20" decorative /> {{ d.starsNeeded }}
          </span>
        </button>
      </div>
    </section>

    <!-- decorations -->
    <section class="relative mx-auto mt-6 max-w-5xl" aria-labelledby="dressup">
      <h2 id="dressup" class="mb-3 text-2xl font-bold text-ink">{{ m.rewards.dressUp }}</h2>
      <div class="grid grid-cols-3 gap-4 sm:grid-cols-6">
        <button
          v-for="d in DECORATIONS"
          :key="d.id"
          type="button"
          class="toy relative flex flex-col items-center gap-1 bg-white p-3"
          :class="r.activeDecoration === d.id ? 'ring-8 ring-bubblegum-deep' : ''"
          :aria-label="r.unlockedDecorations.includes(d.id) ? m.rewards.wear(d.name) : m.rewards.needs(d.name, d.starsNeeded)"
          :aria-pressed="r.activeDecoration === d.id"
          @click="chooseDecoration(d.id)"
        >
          <span :class="r.unlockedDecorations.includes(d.id) ? '' : 'opacity-40 grayscale'">
            <DinoMascot :decoration="d.id" :size="84" :animated="false" />
          </span>
          <span class="text-base font-bold text-ink">{{ d.name }}</span>
          <span v-if="!r.unlockedDecorations.includes(d.id)" class="absolute top-2 right-2 flex items-center gap-0.5 rounded-full bg-cream px-2 text-sm font-bold text-ink-soft">
            <ObjectIcon name="star" :size="16" decorative />{{ d.starsNeeded }}
          </span>
        </button>
      </div>
    </section>

    <!-- badges -->
    <section class="relative mx-auto mt-6 max-w-5xl" aria-labelledby="badges">
      <h2 id="badges" class="mb-3 text-2xl font-bold text-ink">{{ m.rewards.badges }}</h2>
      <div class="grid grid-cols-2 gap-6 rounded-[2.5rem] bg-white/80 p-6 sm:grid-cols-4 lg:grid-cols-6">
        <AchievementBadge v-for="b in ACHIEVEMENTS" :key="b.id" :badge="b" :unlocked="!!r.unlockedAchievements[b.id]" :progress="b.progress(progress)" :size="104" />
      </div>
    </section>
  </div>
</template>
