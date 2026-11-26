<script setup lang="ts">
import { CATEGORIES } from '~/data/activities'
import { ACHIEVEMENTS, DECORATIONS, DINOS } from '~/data/rewards'
const { m } = useI18n()

useHead({ title: 'DinoLand' })

const audio = useAudio()
const { progress, categoryProgress, overallProgress } = useProgress()
const rewards = useRewards()

const isReturning = computed(() => progress.value.stars > 0 || progress.value.history.length > 0)
const greeting = computed(() => (isReturning.value ? m.value.home.greetingBack : m.value.home.greetingNew))
const dinoMood = ref<'happy' | 'cheer'>('happy')
const dinoBounce = ref(0)

function talkToDino() {
  dinoBounce.value++
  dinoMood.value = 'cheer'
  audio.sfx('sparkle')
  void audio.say(isReturning.value ? 'welcome-back' : 'welcome').then(() => (dinoMood.value = 'happy'))
}

onMounted(() => {
  // Plays immediately if audio is already unlocked (e.g. coming back home).
  audio.preload(['welcome', 'welcome-back', ...CATEGORIES.map((c) => c.voice)])
  if (audio.unlocked.value) void audio.say(isReturning.value ? 'welcome-back' : 'welcome')
})

const unlockedBadges = computed(() => ACHIEVEMENTS.filter((a) => rewards.rewards.value.unlockedAchievements[a.id]))
const next = computed(() => rewards.nextUnlock.value)
const nextProgress = computed(() => {
  const n = next.value
  if (!n) return 1
  const all = [...DINOS.map((d) => d.starsNeeded), ...DECORATIONS.map((d) => d.starsNeeded)].filter((s) => s < n.starsNeeded)
  const prev = Math.max(0, ...all)
  return (progress.value.stars - prev) / (n.starsNeeded - prev)
})
</script>

<template>
  <div class="relative isolate min-h-dvh page-pad pb-10">
    <PlaygroundBackground />

    <!-- top bar -->
    <header class="flex items-center justify-between gap-3 pt-[max(1rem,env(safe-area-inset-top))]">
      <div class="flex items-center gap-2">
        <span class="text-4xl font-bold tracking-tight sm:text-5xl" aria-label="DinoLand">
          <span class="text-[#FF6B8B]">D</span><span class="text-[#F5A524]">i</span><span class="text-[#3DBE8B]">n</span><span class="text-[#3FB5EA]">o</span><span class="text-ink">Land</span>
        </span>
      </div>
      <div class="flex items-center gap-3">
        <StarCounter />
        <ParentCorner />
      </div>
    </header>

    <div class="mx-auto mt-4 grid max-w-6xl gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:items-start">
      <!-- Dino hero -->
      <section class="flex items-center gap-2 lg:sticky lg:top-6 lg:flex-col lg:items-start" :aria-label="m.home.dinoSays">
        <button type="button" class="shrink-0 rounded-full focus-visible:outline-4" :aria-label="m.common.talkToDino" @click="talkToDino">
          <Motion :key="dinoBounce" as="span" class="block" :initial="{ scale: dinoBounce ? 0.85 : 0.6, y: dinoBounce ? 0 : 40 }" :animate="{ scale: 1, y: 0 }" :transition="{ type: 'spring', stiffness: 300, damping: 10 }">
            <DinoMascot :size="'min(44vw, 230px)'" :mood="dinoMood" listen />
          </Motion>
        </button>
        <SpeechBubble class="max-w-xs lg:ml-10" :tail="'left'">
          <span class="block text-2xl font-bold sm:text-3xl">{{ greeting }}</span>
          <span class="block text-lg text-ink-soft sm:text-xl">{{ m.home.tagline }}</span>
        </SpeechBubble>
      </section>

      <!-- learning categories -->
      <section :aria-label="m.home.learningAreas" class="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <LearningCategoryCard v-for="(c, i) in CATEGORIES" :key="c.id" :category="c" :progress="categoryProgress(c.id)" :index="i" />
      </section>
    </div>

    <!-- rewards & progress -->
    <section class="mx-auto mt-6 grid max-w-6xl gap-5 sm:grid-cols-2" :aria-label="m.home.myRewards">
      <NuxtLink to="/rewards" class="toy flex items-center gap-4 bg-white/90 p-5" @click="audio.sfx('tap')">
        <div class="flex shrink-0 -space-x-6">
          <DinoMascot v-for="d in DINOS.slice(0, 3)" :key="d.id" :dino="d.id" :decoration="null" :size="72" :animated="false" :silhouette="!rewards.rewards.value.unlockedDinos.includes(d.id)" />
        </div>
        <div class="min-w-0 flex-1">
          <h2 class="text-2xl font-bold text-ink">{{ m.home.myRewards }}</h2>
          <div v-if="next" class="mt-1 flex items-center gap-2 text-lg text-ink-soft">
            <ObjectIcon name="star" :size="24" decorative />
            <span class="font-semibold">{{ m.home.moreFor(next.starsNeeded - progress.stars, next.name) }}</span>
          </div>
          <div v-else class="mt-1 text-lg font-semibold text-ink-soft">{{ m.home.allUnlocked }}</div>
          <div class="mt-2 h-4 overflow-hidden rounded-full bg-sunny/40">
            <div class="h-full rounded-full bg-sunny-deep transition-[width] duration-700" :style="{ width: `${Math.max(4, nextProgress * 100)}%` }" />
          </div>
        </div>
      </NuxtLink>

      <NuxtLink to="/rewards" class="toy flex flex-col justify-center gap-3 bg-white/90 p-5" @click="audio.sfx('tap')">
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-bold text-ink">{{ m.home.myJourney }}</h2>
          <span class="text-lg font-semibold text-ink-soft">{{ m.home.badgesCount(unlockedBadges.length, ACHIEVEMENTS.length) }}</span>
        </div>
        <!-- learning path: Dino walks along as the child learns -->
        <div class="relative h-14" role="progressbar" :aria-valuenow="Math.round(overallProgress * 100)" aria-valuemin="0" aria-valuemax="100" :aria-label="m.home.learningProgress">
          <div class="absolute top-1/2 right-6 left-6 h-4 -translate-y-1/2 rounded-full bg-[repeating-linear-gradient(90deg,#FFE58A_0_18px,#FFD166_18px_36px)]" />
          <div class="absolute top-1/2 left-6 h-4 -translate-y-1/2 rounded-full bg-mint-deep transition-[width] duration-700" :style="{ width: `calc((100% - 3rem) * ${overallProgress})` }" />
          <ObjectIcon name="flag" :size="36" decorative class="absolute top-0 right-0" />
          <div class="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 transition-[left] duration-700" :style="{ left: `calc(1.5rem + (100% - 3rem) * ${overallProgress})` }">
            <DinoMascot :size="56" :animated="true" />
          </div>
        </div>
        <div class="flex gap-1">
          <ObjectIcon v-for="b in unlockedBadges.slice(-6)" :key="b.id" :name="b.icon" :size="32" />
          <span v-if="!unlockedBadges.length" class="text-base text-ink-soft">{{ m.home.firstBadge }}</span>
        </div>
      </NuxtLink>
    </section>
  </div>
</template>
