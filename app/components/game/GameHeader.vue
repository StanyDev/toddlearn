<script setup lang="ts">
/** Top bar for activities: hold-to-exit, title, replay instruction, stars. */
const { m } = useI18n()
withDefaults(defineProps<{ title: string; icon?: string; backTo: string; hold?: boolean; canReplay?: boolean }>(), {
  icon: undefined,
  hold: true,
  canReplay: true,
})
defineEmits<{ replay: [] }>()
</script>

<template>
  <header class="flex items-center gap-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
    <BackButton :to="backTo" :hold="hold" />
    <div class="flex min-w-0 flex-1 items-center gap-2">
      <span v-if="icon" class="hidden sm:block"><ObjectIcon :name="icon" :size="40" decorative /></span>
      <h1 class="truncate text-2xl font-bold text-ink sm:text-3xl">{{ title }}</h1>
    </div>
    <button
      v-if="canReplay"
      type="button"
      class="toy flex h-16 w-16 items-center justify-center bg-sunny text-ink sm:h-[4.5rem] sm:w-[4.5rem]"
      :aria-label="m.common.hearInstruction"
      @click="$emit('replay')"
    >
      <svg viewBox="0 0 48 48" class="h-9 w-9" aria-hidden="true">
        <path d="M8 18 H16 L27 9 V39 L16 30 H8 Z" fill="currentColor" stroke="currentColor" stroke-width="3" stroke-linejoin="round" />
        <path d="M33 17 Q38 24 33 31" stroke="currentColor" stroke-width="4" fill="none" stroke-linecap="round" />
        <path d="M38 12 Q46 24 38 36" stroke="currentColor" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.55" />
      </svg>
    </button>
    <StarCounter compact />
  </header>
</template>
