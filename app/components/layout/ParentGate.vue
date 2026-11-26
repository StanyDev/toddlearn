<script setup lang="ts">
import { randInt } from '~/utils/random'

/**
 * Grown-up check: a multiplication question (or the parent's PIN if one is
 * set) typed on a keypad. Easy for adults, unlikely for a toddler to guess.
 */
const { m } = useI18n()
const emit = defineEmits<{ unlock: [] }>()
const { settings } = useSettings()
const usePin = computed(() => settings.value.parentPin.length === 4)

const a = ref(randInt(3, 9))
const b = ref(randInt(3, 9))
const entry = ref('')
const error = ref(false)
const answerLength = computed(() => (usePin.value ? 4 : String(a.value * b.value).length))

function press(d: string) {
  if (entry.value.length >= answerLength.value) return
  error.value = false
  entry.value += d
  if (entry.value.length === answerLength.value) check()
}
function back() {
  entry.value = entry.value.slice(0, -1)
}
function check() {
  const ok = usePin.value ? entry.value === settings.value.parentPin : Number(entry.value) === a.value * b.value
  if (ok) {
    emit('unlock')
    return
  }
  error.value = true
  setTimeout(() => {
    entry.value = ''
    if (!usePin.value) {
      a.value = randInt(3, 9)
      b.value = randInt(3, 9)
    }
  }, 700)
}
</script>

<template>
  <div class="mx-auto flex w-full max-w-sm flex-col items-center gap-5 rounded-[2rem] bg-white p-6 shadow-soft">
    <ObjectIcon name="lock" :size="56" />
    <h1 class="text-2xl font-bold text-ink">{{ m.gate.title }}</h1>
    <p class="text-center text-base text-ink-soft">
      <template v-if="usePin">{{ m.gate.enterPin }}</template>
      <template v-else>{{ m.gate.answer }} <strong class="text-ink">{{ a }} × {{ b }} = ?</strong></template>
    </p>
    <div class="flex gap-2" :class="{ 'animate-wiggle': error }" aria-live="polite">
      <span
        v-for="i in answerLength"
        :key="i"
        class="flex h-14 w-12 items-center justify-center rounded-xl border-2 text-2xl font-bold"
        :class="error ? 'border-bubblegum-deep text-bubblegum-deep' : 'border-ink/15 text-ink'"
        >{{ usePin ? (entry[i - 1] ? '•' : '') : (entry[i - 1] ?? '') }}</span
      >
    </div>
    <div class="grid grid-cols-3 gap-2" role="group" :aria-label="m.gate.keypad">
      <button v-for="d in ['1', '2', '3', '4', '5', '6', '7', '8', '9']" :key="d" type="button" class="h-14 w-16 rounded-xl bg-cream text-xl font-bold text-ink active:bg-sky/50" @click="press(d)">{{ d }}</button>
      <button type="button" class="h-14 w-16 rounded-xl bg-cream text-base font-semibold text-ink-soft" :aria-label="m.gate.delete" @click="back">⌫</button>
      <button type="button" class="h-14 w-16 rounded-xl bg-cream text-xl font-bold text-ink active:bg-sky/50" @click="press('0')">0</button>
      <NuxtLink to="/" class="flex h-14 w-16 items-center justify-center rounded-xl bg-cream text-sm font-semibold text-ink-soft" :aria-label="m.gate.backToApp">{{ m.gate.exit }}</NuxtLink>
    </div>
  </div>
</template>
