<script setup lang="ts">
import { ACHIEVEMENTS, DECORATIONS, DINOS } from '~/data/rewards'
import type { DecorationId } from '~/types'

/** Global celebration for newly unlocked badges, dino friends and decorations. */
const { m } = useI18n()
const rewards = useRewards()
const audio = useAudio()
const route = useRoute()
const burst = ref(0)

const item = computed(() => (route.path.startsWith('/parent') ? null : rewards.current.value))
const badge = computed(() => (item.value?.kind === 'achievement' ? ACHIEVEMENTS.find((a) => a.id === item.value!.id) : undefined))
const dino = computed(() => (item.value?.kind === 'dino' ? DINOS.find((d) => d.id === item.value!.id) : undefined))
const decoration = computed(() => (item.value?.kind === 'decoration' ? DECORATIONS.find((d) => d.id === item.value!.id) : undefined))

watch(
  item,
  (it) => {
    if (!it) return
    burst.value++
    audio.sfx('reward')
    void audio.say(it.kind === 'achievement' ? 'new-badge' : it.kind === 'dino' ? 'new-dino' : 'new-decoration')
  },
  { immediate: true },
)

function close() {
  audio.sfx('tap')
  rewards.dismissCurrent()
}
function useNow() {
  if (dino.value) rewards.setActiveDino(dino.value.id)
  if (decoration.value) rewards.setDecoration(decoration.value.id as DecorationId)
  audio.sfx('sparkle')
  rewards.dismissCurrent()
}
</script>

<template>
  <AnimatePresence>
    <Motion
      v-if="item"
      :key="`${item.kind}-${item.id}`"
      as="div"
      class="fixed inset-0 z-[80] flex items-center justify-center bg-ink/40 p-6 backdrop-blur-sm"
      :initial="{ opacity: 0 }"
      :animate="{ opacity: 1 }"
      :exit="{ opacity: 0 }"
      role="dialog"
      aria-modal="true"
      :aria-label="m.rewards.newReward"
    >
      <CelebrationAnimation :trigger="burst" :pieces="48" />
      <Motion
        as="div"
        class="relative flex w-full max-w-md flex-col items-center gap-4 rounded-[2.5rem] bg-cream p-8 text-center shadow-soft"
        :initial="{ scale: 0.4, rotate: -8 }"
        :animate="{ scale: 1, rotate: 0 }"
        :transition="{ type: 'spring', stiffness: 260, damping: 14 }"
      >
        <span class="absolute -top-6 rounded-full bg-sunny px-6 py-2 text-xl font-bold text-ink shadow-pop-sm">
          {{ badge ? m.rewards.newBadge : dino ? m.rewards.newFriend : m.rewards.newSurprise }}
        </span>
        <div class="mt-4">
          <AchievementBadge v-if="badge" :badge="badge" unlocked :progress="1" :size="160" :show-label="false" />
          <DinoMascot v-else-if="dino" :dino="dino.id" :decoration="null" :size="190" mood="cheer" />
          <DinoMascot v-else-if="decoration" :decoration="decoration.id as DecorationId" :size="190" mood="excited" />
        </div>
        <h2 class="text-4xl font-bold text-ink">{{ badge?.title ?? dino?.name ?? decoration?.name }}</h2>
        <p v-if="badge" class="text-xl text-ink-soft">{{ badge.description }}</p>
        <div class="mt-2 flex gap-4">
          <button v-if="dino || decoration" type="button" class="toy flex h-20 items-center gap-2 bg-mint px-6 text-2xl font-bold text-ink" @click="useNow">
            <ObjectIcon name="sparkles" :size="36" decorative /> {{ m.rewards.useIt }}
          </button>
          <button type="button" class="toy flex h-20 min-w-20 items-center justify-center bg-white px-6 text-2xl font-bold text-ink" :aria-label="m.rewards.yayClose" @click="close">
            {{ m.rewards.yay }}
          </button>
        </div>
      </Motion>
    </Motion>
  </AnimatePresence>
</template>
