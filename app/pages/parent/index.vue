<script setup lang="ts">
import type { CategoryId } from '~/types'
import { ACTIVITIES, CATEGORIES, getActivity } from '~/data/activities'
import { COLORS, LETTERS, NUMBERS, SHAPES } from '~/data/learning'
import { ACHIEVEMENTS } from '~/data/rewards'
import { THEME } from '~/utils/theme'

useHead({ title: 'Parent Dashboard · DinoLand' })

const session = useParentSession()
const unlocked = ref(session.isUnlocked())
const { progress, categoryProgress, totalCompleted, reset: resetProgress } = useProgress()
const rewards = useRewards()
const { settings, update } = useSettings()
const audio = useAudio()

function onUnlock() {
  session.unlock()
  unlocked.value = true
}
function lockNow() {
  session.lock()
  unlocked.value = false
}

/* --------------------------------- stats -------------------------------- */
function fmt(ms: number) {
  const min = Math.floor(ms / 60000)
  if (min < 1) return ms > 0 ? '< 1 min' : '0 min'
  const h = Math.floor(min / 60)
  return h ? `${h} h ${min % 60} min` : `${min} min`
}
const today = computed(() => progress.value.dailyTimeMs[todayKey()] ?? 0)
const week = computed(() => {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = todayKey(d)
    days.push({ key, label: d.toLocaleDateString(undefined, { weekday: 'short' }), ms: progress.value.dailyTimeMs[key] ?? 0 })
  }
  const max = Math.max(60000, ...days.map((d) => d.ms))
  return days.map((d) => ({ ...d, pct: d.ms / max }))
})
const badgesUnlocked = computed(() => Object.keys(rewards.rewards.value.unlockedAchievements).length)
const activityRows = computed(() =>
  ACTIVITIES.map((a) => ({ a, r: progress.value.activities[a.id] })).sort((x, y) => (y.r?.lastPlayedAt ?? 0) - (x.r?.lastPlayedAt ?? 0)),
)
const recent = computed(() => [...progress.value.history].reverse().slice(0, 8))
const categoryRows = computed(() => CATEGORIES.map((c) => ({ c, pct: Math.round(categoryProgress(c.id as CategoryId) * 100) })))

/* -------------------------------- settings ------------------------------ */
const pinDraft = ref('')
const pinMessage = ref('')
function savePin() {
  if (!/^\d{4}$/.test(pinDraft.value)) {
    pinMessage.value = 'Please enter exactly 4 digits.'
    return
  }
  update({ parentPin: pinDraft.value })
  pinDraft.value = ''
  pinMessage.value = 'PIN saved. It will be asked for next time.'
}
function clearPin() {
  update({ parentPin: '' })
  pinMessage.value = 'PIN removed. A grown-up math question will be used instead.'
}
function testSound() {
  void audio.say('praise-1')
  audio.sfx('correct')
}

/* ---------------------------------- data -------------------------------- */
const confirmReset = ref(false)
const resetDone = ref(false)
function doReset() {
  resetProgress()
  rewards.reset()
  confirmReset.value = false
  resetDone.value = true
  setTimeout(() => (resetDone.value = false), 4000)
}
function exportData() {
  const data = { exportedAt: new Date().toISOString(), progress: progress.value, rewards: rewards.rewards.value, settings: { ...settings.value, parentPin: settings.value.parentPin ? '••••' : '' } }
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }))
  const link = document.createElement('a')
  link.href = url
  link.download = `dinoland-progress-${todayKey()}.json`
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
const timeAgo = (t: number) => {
  if (!t) return '—'
  const min = Math.round((Date.now() - t) / 60000)
  if (min < 1) return 'just now'
  if (min < 60) return `${min} min ago`
  const h = Math.round(min / 60)
  if (h < 24) return `${h} h ago`
  return new Date(t).toLocaleDateString()
}
</script>

<template>
  <div class="min-h-dvh bg-cream page-pad pt-[max(1rem,env(safe-area-inset-top))] pb-12 select-text">
    <div v-if="!unlocked" class="flex min-h-[80dvh] items-center justify-center">
      <ParentGate @unlock="onUnlock" />
    </div>

    <div v-else class="mx-auto max-w-6xl">
      <header class="flex flex-wrap items-center gap-3">
        <DinoMascot :size="64" :animated="false" />
        <div class="flex-1">
          <h1 class="text-3xl font-bold text-ink">Parent Dashboard</h1>
          <p class="text-ink-soft">Everything is stored only on this device.</p>
        </div>
        <button type="button" class="rounded-full border-2 border-ink/10 bg-white px-4 py-2 font-semibold text-ink" @click="lockNow">Lock</button>
        <NuxtLink to="/" class="rounded-full bg-mint-deep px-5 py-2 font-bold text-white shadow-pop-sm">Back to DinoLand</NuxtLink>
      </header>

      <!-- summary -->
      <section class="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4" aria-label="Summary">
        <div class="rounded-3xl bg-white p-5 shadow-soft">
          <p class="text-sm font-semibold tracking-wide text-ink-soft uppercase">Learning time</p>
          <p class="mt-1 text-3xl font-bold text-ink">{{ fmt(progress.totalTimeMs) }}</p>
          <p class="text-sm text-ink-soft">Today: {{ fmt(today) }}</p>
        </div>
        <div class="rounded-3xl bg-white p-5 shadow-soft">
          <p class="text-sm font-semibold tracking-wide text-ink-soft uppercase">Stars earned</p>
          <p class="mt-1 flex items-center gap-2 text-3xl font-bold text-ink"><ObjectIcon name="star" :size="30" decorative />{{ progress.stars }}</p>
          <p class="text-sm text-ink-soft">Badges: {{ badgesUnlocked }} / {{ ACHIEVEMENTS.length }}</p>
        </div>
        <div class="rounded-3xl bg-white p-5 shadow-soft">
          <p class="text-sm font-semibold tracking-wide text-ink-soft uppercase">Activities completed</p>
          <p class="mt-1 text-3xl font-bold text-ink">{{ totalCompleted }}</p>
          <p class="text-sm text-ink-soft">{{ Object.keys(progress.activities).length }} of {{ ACTIVITIES.length }} tried</p>
        </div>
        <div class="rounded-3xl bg-white p-5 shadow-soft">
          <p class="text-sm font-semibold tracking-wide text-ink-soft uppercase">Explored</p>
          <p class="mt-1 text-lg font-bold text-ink">{{ progress.learnedNumbers.length }}/20 numbers</p>
          <p class="text-lg font-bold text-ink">{{ progress.learnedLetters.length }}/26 letters</p>
        </div>
      </section>

      <div class="mt-6 grid gap-6 lg:grid-cols-2">
        <!-- weekly time -->
        <section class="rounded-3xl bg-white p-5 shadow-soft" aria-labelledby="week-h">
          <h2 id="week-h" class="text-xl font-bold text-ink">Last 7 days</h2>
          <div class="mt-4 flex h-40 items-end gap-3">
            <div v-for="d in week" :key="d.key" class="flex flex-1 flex-col items-center gap-1">
              <span class="text-xs text-ink-soft">{{ Math.round(d.ms / 60000) }}m</span>
              <div class="w-full rounded-t-lg bg-sky-deep/80" :style="{ height: `${Math.max(3, d.pct * 110)}px` }" :title="fmt(d.ms)" />
              <span class="text-xs font-semibold text-ink-soft">{{ d.label }}</span>
            </div>
          </div>
        </section>

        <!-- category progress -->
        <section class="rounded-3xl bg-white p-5 shadow-soft" aria-labelledby="prog-h">
          <h2 id="prog-h" class="text-xl font-bold text-ink">Learning progress</h2>
          <div class="mt-4 space-y-4">
            <div v-for="row in categoryRows" :key="row.c.id">
              <div class="flex justify-between text-sm font-semibold text-ink"><span>{{ row.c.title }}</span><span>{{ row.pct }}%</span></div>
              <div class="mt-1 h-3 overflow-hidden rounded-full bg-ink/5">
                <div class="h-full rounded-full" :class="THEME[row.c.color].deep" :style="{ width: `${row.pct}%` }" />
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- explored items -->
      <section class="mt-6 rounded-3xl bg-white p-5 shadow-soft" aria-labelledby="exp-h">
        <h2 id="exp-h" class="text-xl font-bold text-ink">What has been explored</h2>
        <p class="text-sm text-ink-soft">Highlighted items have been explored. A pencil means it was traced.</p>
        <h3 class="mt-4 font-semibold text-ink">Numbers</h3>
        <div class="mt-2 flex flex-wrap gap-1.5">
          <span v-for="n in NUMBERS" :key="n.value" class="relative flex h-10 w-10 items-center justify-center rounded-xl text-lg font-bold" :class="progress.learnedNumbers.includes(n.value) ? 'bg-sky text-ink' : 'bg-ink/5 text-ink/30'">
            {{ n.value }}<span v-if="progress.tracedNumbers.includes(n.value)" class="absolute -top-1 -right-1 text-xs">✏️</span>
          </span>
        </div>
        <h3 class="mt-4 font-semibold text-ink">Letters</h3>
        <div class="mt-2 flex flex-wrap gap-1.5">
          <span v-for="l in LETTERS" :key="l.upper" class="relative flex h-10 w-10 items-center justify-center rounded-xl text-lg font-bold" :class="progress.learnedLetters.includes(l.upper) ? 'bg-bubblegum text-ink' : 'bg-ink/5 text-ink/30'">
            {{ l.upper }}<span v-if="progress.tracedLetters.includes(l.upper)" class="absolute -top-1 -right-1 text-xs">✏️</span>
          </span>
        </div>
        <h3 class="mt-4 font-semibold text-ink">Colors &amp; shapes</h3>
        <div class="mt-2 flex flex-wrap items-center gap-2">
          <span v-for="c in COLORS" :key="c.id" class="h-9 w-9 rounded-full border-2" :class="progress.exploredColors.includes(c.id) ? 'border-ink/20' : 'border-transparent opacity-20'" :style="{ background: c.hex }" :title="c.name" />
          <span class="mx-2 h-6 w-px bg-ink/10" />
          <span v-for="s in SHAPES" :key="s.id" :class="progress.exploredShapes.includes(s.id) ? '' : 'opacity-20 grayscale'" :title="s.name"><ShapeIcon :shape="s.id" :size="34" /></span>
        </div>
      </section>

      <div class="mt-6 grid gap-6 lg:grid-cols-[3fr_2fr]">
        <!-- activities -->
        <section class="overflow-x-auto rounded-3xl bg-white p-5 shadow-soft" aria-labelledby="act-h">
          <h2 id="act-h" class="text-xl font-bold text-ink">Activities</h2>
          <table class="mt-3 w-full text-left text-sm">
            <thead class="text-ink-soft">
              <tr><th class="py-2 font-semibold">Activity</th><th class="font-semibold">Played</th><th class="font-semibold">Finished</th><th class="font-semibold">Best ★</th><th class="font-semibold">Last</th></tr>
            </thead>
            <tbody>
              <tr v-for="row in activityRows" :key="row.a.id" class="border-t border-ink/5" :class="row.r ? 'text-ink' : 'text-ink/40'">
                <td class="flex items-center gap-2 py-2"><ObjectIcon :name="row.a.icon" :size="22" decorative />{{ row.a.title }} <span class="text-xs text-ink-soft">· {{ CATEGORIES.find((c) => c.id === row.a.category)?.title }}</span></td>
                <td>{{ row.r?.played ?? 0 }}</td>
                <td>{{ row.r?.completed ?? 0 }}</td>
                <td>{{ row.r?.bestStars ?? 0 }}</td>
                <td class="whitespace-nowrap">{{ timeAgo(row.r?.lastPlayedAt ?? 0) }}</td>
              </tr>
            </tbody>
          </table>
        </section>

        <!-- history -->
        <section class="rounded-3xl bg-white p-5 shadow-soft" aria-labelledby="hist-h">
          <h2 id="hist-h" class="text-xl font-bold text-ink">Recent sessions</h2>
          <ul v-if="recent.length" class="mt-3 space-y-2">
            <li v-for="h in recent" :key="h.at" class="flex items-center gap-3 rounded-2xl bg-cream px-3 py-2">
              <ObjectIcon :name="getActivity(h.activityId).icon" :size="28" decorative />
              <div class="min-w-0 flex-1">
                <p class="truncate font-semibold text-ink">{{ getActivity(h.activityId).title }}</p>
                <p class="text-xs text-ink-soft">{{ timeAgo(h.at) }} · {{ fmt(h.durationMs) }}</p>
              </div>
              <span class="flex items-center gap-1 font-bold text-ink"><ObjectIcon name="star" :size="18" decorative />{{ h.stars }}</span>
            </li>
          </ul>
          <p v-else class="mt-3 text-ink-soft">No finished activities yet.</p>
        </section>
      </div>

      <!-- settings -->
      <section class="mt-6 grid gap-6 lg:grid-cols-2">
        <div class="rounded-3xl bg-white p-5 shadow-soft" aria-labelledby="snd-h">
          <h2 id="snd-h" class="text-xl font-bold text-ink">Sound</h2>
          <label class="mt-4 flex items-center justify-between gap-4">
            <span class="font-semibold text-ink">Sound on</span>
            <input type="checkbox" class="h-6 w-6 accent-[#3FB5EA]" :checked="settings.soundEnabled" @change="update({ soundEnabled: ($event.target as HTMLInputElement).checked })" />
          </label>
          <label class="mt-4 block">
            <span class="flex justify-between font-semibold text-ink"><span>Voice volume</span><span class="text-ink-soft">{{ Math.round(settings.voiceVolume * 100) }}%</span></span>
            <input type="range" min="0" max="1" step="0.05" class="mt-1 w-full accent-[#3FB5EA]" :value="settings.voiceVolume" :disabled="!settings.soundEnabled" @input="update({ voiceVolume: Number(($event.target as HTMLInputElement).value) })" />
          </label>
          <label class="mt-4 block">
            <span class="flex justify-between font-semibold text-ink"><span>Sound effects volume</span><span class="text-ink-soft">{{ Math.round(settings.effectsVolume * 100) }}%</span></span>
            <input type="range" min="0" max="1" step="0.05" class="mt-1 w-full accent-[#3FB5EA]" :value="settings.effectsVolume" :disabled="!settings.soundEnabled" @input="update({ effectsVolume: Number(($event.target as HTMLInputElement).value) })" />
          </label>
          <label class="mt-4 flex items-center justify-between gap-4">
            <span>
              <span class="block font-semibold text-ink">Speech fallback</span>
              <span class="block text-sm text-ink-soft">Use the device voice if a recording is missing.</span>
            </span>
            <input type="checkbox" class="h-6 w-6 accent-[#3FB5EA]" :checked="settings.speechFallback" @change="update({ speechFallback: ($event.target as HTMLInputElement).checked })" />
          </label>
          <button type="button" class="mt-4 rounded-full bg-sky px-4 py-2 font-semibold text-ink" @click="testSound">Test sound</button>
        </div>

        <div class="rounded-3xl bg-white p-5 shadow-soft" aria-labelledby="play-h">
          <h2 id="play-h" class="text-xl font-bold text-ink">Play settings</h2>
          <div class="mt-4 flex items-center justify-between gap-4">
            <span>
              <span class="block font-semibold text-ink">Questions per activity</span>
              <span class="block text-sm text-ink-soft">Shorter sessions suit younger children.</span>
            </span>
            <div class="flex items-center gap-2">
              <button type="button" class="h-10 w-10 rounded-full bg-cream text-xl font-bold" aria-label="Fewer questions" @click="update({ roundsPerActivity: settings.roundsPerActivity - 1 })">−</button>
              <span class="w-6 text-center text-xl font-bold">{{ settings.roundsPerActivity }}</span>
              <button type="button" class="h-10 w-10 rounded-full bg-cream text-xl font-bold" aria-label="More questions" @click="update({ roundsPerActivity: settings.roundsPerActivity + 1 })">+</button>
            </div>
          </div>
          <label class="mt-4 flex items-center justify-between gap-4">
            <span>
              <span class="block font-semibold text-ink">Reduce motion</span>
              <span class="block text-sm text-ink-soft">"Auto" follows the device setting.</span>
            </span>
            <select class="rounded-xl border-2 border-ink/10 bg-cream px-3 py-2 font-semibold" :value="settings.reducedMotion" @change="update({ reducedMotion: ($event.target as HTMLSelectElement).value as 'auto' | 'on' | 'off' })">
              <option value="auto">Auto</option>
              <option value="on">On</option>
              <option value="off">Off</option>
            </select>
          </label>
          <div class="mt-5 border-t border-ink/5 pt-4">
            <span class="block font-semibold text-ink">Parent PIN</span>
            <span class="block text-sm text-ink-soft">{{ settings.parentPin ? 'A PIN is set.' : 'No PIN set — a grown-up math question protects this area.' }}</span>
            <div class="mt-2 flex flex-wrap gap-2">
              <input v-model="pinDraft" inputmode="numeric" maxlength="4" pattern="\d{4}" placeholder="4 digits" aria-label="New PIN" class="w-32 rounded-xl border-2 border-ink/10 px-3 py-2 text-lg tracking-widest" />
              <button type="button" class="rounded-full bg-mint px-4 py-2 font-semibold text-ink" @click="savePin">Save PIN</button>
              <button v-if="settings.parentPin" type="button" class="rounded-full bg-cream px-4 py-2 font-semibold text-ink" @click="clearPin">Remove PIN</button>
            </div>
            <p v-if="pinMessage" class="mt-2 text-sm text-ink-soft" role="status">{{ pinMessage }}</p>
          </div>
        </div>
      </section>

      <!-- data -->
      <section class="mt-6 rounded-3xl bg-white p-5 shadow-soft" aria-labelledby="data-h">
        <h2 id="data-h" class="text-xl font-bold text-ink">Data</h2>
        <p class="text-sm text-ink-soft">Progress is saved in this browser only. Nothing is sent anywhere.</p>
        <div class="mt-3 flex flex-wrap gap-3">
          <button type="button" class="rounded-full bg-sky px-4 py-2 font-semibold text-ink" @click="exportData">Download progress (JSON)</button>
          <button v-if="!confirmReset" type="button" class="rounded-full bg-bubblegum px-4 py-2 font-semibold text-ink" @click="confirmReset = true">Reset progress…</button>
          <div v-else class="flex flex-wrap items-center gap-2 rounded-2xl bg-bubblegum/30 px-4 py-2" role="alert">
            <span class="font-semibold text-ink">Erase all stars, badges, dino friends and history? This cannot be undone.</span>
            <button type="button" class="rounded-full bg-bubblegum-deep px-4 py-2 font-bold text-white" @click="doReset">Yes, reset</button>
            <button type="button" class="rounded-full bg-white px-4 py-2 font-semibold text-ink" @click="confirmReset = false">Cancel</button>
          </div>
          <span v-if="resetDone" class="self-center font-semibold text-mint-deep" role="status">Progress reset.</span>
        </div>
      </section>

      <section class="mt-6 text-sm text-ink-soft" aria-label="Credits">
        <p>Illustrations: Twemoji by Twitter, Inc. and contributors, licensed CC-BY 4.0. Dino, monster, scenes and UI art are original to DinoLand.</p>
        <p>Voice clips are development recordings; replace files in <code>public/audio/voice/</code> to use a professional voice-over.</p>
      </section>
    </div>
  </div>
</template>
