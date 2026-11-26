<script setup lang="ts">
import type { DecorationId, DinoMood } from '~/types'
import { dinoById } from '~/data/rewards'
const { m } = useI18n()

const props = withDefaults(
  defineProps<{
    size?: number | string
    mood?: DinoMood
    /** Dino character id; defaults to the child's chosen dino. */
    dino?: string
    /** Accessory; `undefined` uses the child's choice, `null` shows none. */
    decoration?: DecorationId | null
    talking?: boolean
    /** Animate the mouth whenever the app is speaking. */
    listen?: boolean
    animated?: boolean
    silhouette?: boolean
  }>(),
  { size: 160, mood: 'happy', listen: false, animated: true, silhouette: false, decoration: undefined, dino: undefined, talking: false },
)

const { speaking } = useAudio()
const rewards = useRewards()

const def = computed(() => (props.dino ? dinoById(props.dino) : rewards.activeDino.value))
const decor = computed(() => (props.decoration === undefined ? rewards.activeDecoration.value : props.decoration))
const isTalking = computed(() => props.talking || (props.listen && speaking.value))
const colors = computed(() =>
  props.silhouette
    ? { body: '#D6D3E6', belly: '#E6E3F2', spots: '#C4C0DA' }
    : { body: def.value.body, belly: def.value.belly, spots: def.value.spots },
)
const mouthOpen = computed(() => isTalking.value || props.mood === 'excited' || props.mood === 'cheer')
const sizeStyle = computed(() => {
  const s = typeof props.size === 'number' ? `${props.size}px` : props.size
  return { width: s, height: s }
})

// Rounded spikes along the head and back, computed from angles.
function spike(cx: number, cy: number, rx: number, ry: number, angleDeg: number, spread = 13, length = 20) {
  const pt = (a: number, grow = 0) => {
    const r = (a * Math.PI) / 180
    return [cx + (rx + grow) * Math.cos(r), cy + (ry + grow) * Math.sin(r)]
  }
  const [x1, y1] = pt(angleDeg - spread, -4)
  const [x2, y2] = pt(angleDeg, length)
  const [x3, y3] = pt(angleDeg + spread, -4)
  return `M${x1!.toFixed(1)} ${y1!.toFixed(1)} L${x2!.toFixed(1)} ${y2!.toFixed(1)} L${x3!.toFixed(1)} ${y3!.toFixed(1)} Z`
}
const spikes = [
  ...[-160, -128, -96, -64].map((a) => spike(118, 80, 58, 58, a, 12, 18)),
  ...[196, 222].map((a) => spike(108, 150, 55, 46, a, 13, 14)),
]
</script>

<template>
  <div class="relative inline-block shrink-0" :style="sizeStyle" role="img" :aria-label="m.common.dino(def.name)">
    <svg viewBox="0 -30 220 240" class="h-full w-full overflow-visible" :class="{ 'animate-bob': animated }">
      <ellipse cx="110" cy="205" rx="62" ry="8" fill="#3d3a5c" opacity="0.1" />

      <!-- tail -->
      <path d="M70 162 C 28 168 6 140 14 108 C 30 130 52 138 82 130 Z" :fill="colors.body" />
      <!-- spikes -->
      <path v-for="(d, i) in spikes" :key="i" :d="d" :fill="colors.spots" :stroke="colors.spots" stroke-width="8" stroke-linejoin="round" />

      <!-- body -->
      <ellipse cx="108" cy="150" rx="55" ry="46" :fill="colors.body" />
      <ellipse cx="118" cy="158" rx="34" ry="31" :fill="colors.belly" />
      <circle cx="70" cy="166" r="6" :fill="colors.spots" opacity="0.55" />
      <circle cx="78" cy="138" r="4" :fill="colors.spots" opacity="0.55" />
      <circle cx="152" cy="172" r="5" :fill="colors.spots" opacity="0.55" />

      <!-- feet -->
      <ellipse cx="84" cy="193" rx="21" ry="12" :fill="colors.body" />
      <ellipse cx="138" cy="193" rx="21" ry="12" :fill="colors.body" />
      <g fill="#fff" opacity="0.85">
        <circle cx="75" cy="198" r="3" /><circle cx="84" cy="200" r="3" /><circle cx="93" cy="198" r="3" />
        <circle cx="129" cy="198" r="3" /><circle cx="138" cy="200" r="3" /><circle cx="147" cy="198" r="3" />
      </g>

      <!-- arms -->
      <g :class="{ 'dino-wave': mood === 'cheer' || mood === 'excited' }">
        <ellipse cx="74" cy="146" rx="10" ry="17" transform="rotate(35 74 146)" :fill="colors.body" />
      </g>
      <ellipse cx="160" cy="146" rx="10" ry="17" transform="rotate(-35 160 146)" :fill="colors.body" />

      <!-- scarf sits under the head -->
      <g v-if="decor === 'scarf' && !silhouette">
        <path d="M74 122 Q118 146 162 122 L164 136 Q118 160 72 136 Z" fill="#FF6F6F" />
        <path d="M138 138 L146 170 L160 166 L150 134 Z" fill="#FF6F6F" />
        <path d="M84 130 L84 140 M100 136 L100 146 M116 138 L116 148 M132 136 L132 146" stroke="#fff" stroke-width="3" opacity="0.6" stroke-linecap="round" />
      </g>

      <!-- head -->
      <circle cx="118" cy="80" r="58" :fill="colors.body" />
      <ellipse cx="118" cy="102" rx="30" ry="19" :fill="colors.belly" opacity="0.55" />
      <ellipse cx="96" cy="48" rx="14" ry="8" fill="#fff" opacity="0.25" transform="rotate(-25 96 48)" />

      <!-- eyes -->
      <g v-if="!silhouette">
        <template v-if="mood === 'cheer'">
          <path d="M84 80 Q96 64 108 80" stroke="#3d3a5c" stroke-width="6" fill="none" stroke-linecap="round" />
          <path d="M128 80 Q140 64 152 80" stroke="#3d3a5c" stroke-width="6" fill="none" stroke-linecap="round" />
        </template>
        <g v-else class="dino-blink">
          <ellipse cx="96" cy="76" rx="13" ry="15" fill="#fff" />
          <ellipse cx="140" cy="76" rx="13" ry="15" fill="#fff" />
          <template v-if="mood === 'thinking'">
            <circle cx="100" cy="71" r="8" fill="#3d3a5c" /><circle cx="144" cy="71" r="8" fill="#3d3a5c" />
            <circle cx="103" cy="68" r="3" fill="#fff" /><circle cx="147" cy="68" r="3" fill="#fff" />
          </template>
          <template v-else>
            <circle cx="98" cy="79" r="8.5" fill="#3d3a5c" /><circle cx="142" cy="79" r="8.5" fill="#3d3a5c" />
            <circle cx="101.5" cy="75" r="3.2" fill="#fff" /><circle cx="145.5" cy="75" r="3.2" fill="#fff" />
            <circle cx="95" cy="83" r="1.6" fill="#fff" /><circle cx="139" cy="83" r="1.6" fill="#fff" />
          </template>
          <template v-if="mood === 'sleepy'">
            <path d="M82 76 A14 15 0 0 1 110 76 Z" :fill="colors.body" />
            <path d="M126 76 A14 15 0 0 1 154 76 Z" :fill="colors.body" />
          </template>
        </g>
      </g>

      <!-- cheeks & nostrils -->
      <ellipse v-if="!silhouette" cx="78" cy="98" rx="10" ry="6.5" fill="#FF8FB1" opacity="0.55" />
      <ellipse v-if="!silhouette" cx="158" cy="98" rx="10" ry="6.5" fill="#FF8FB1" opacity="0.55" />
      <ellipse cx="112" cy="93" rx="2.2" ry="1.6" :fill="colors.spots" />
      <ellipse cx="124" cy="93" rx="2.2" ry="1.6" :fill="colors.spots" />

      <!-- mouth -->
      <g v-if="!silhouette">
        <g v-if="mouthOpen" :class="{ 'dino-talk': isTalking }" style="transform-box: fill-box; transform-origin: 50% 0%">
          <path d="M102 102 Q118 130 134 102 Q118 108 102 102 Z" fill="#7A2E3B" />
          <ellipse cx="118" cy="116" rx="7" ry="4" fill="#FF8FA3" />
        </g>
        <path v-else-if="mood === 'thinking'" d="M112 108 Q118 104 124 108" stroke="#3d3a5c" stroke-width="4" fill="none" stroke-linecap="round" />
        <path v-else d="M104 104 Q118 117 132 104" stroke="#3d3a5c" stroke-width="4.5" fill="none" stroke-linecap="round" />
      </g>

      <!-- accessories -->
      <g v-if="!silhouette">
        <g v-if="decor === 'party-hat'" transform="rotate(-12 118 28)">
          <path d="M96 30 L118 -22 L140 30 Z" fill="#FF7FA1" stroke="#FF5C8A" stroke-width="3" stroke-linejoin="round" />
          <path d="M104 12 L132 12 M100 22 L136 22" stroke="#FFE58A" stroke-width="4" />
          <circle cx="118" cy="-24" r="8" fill="#FFE58A" />
        </g>
        <g v-else-if="decor === 'bow'">
          <path d="M150 30 L130 14 L132 46 Z" fill="#FF4F8B" stroke="#E83E7A" stroke-width="3" stroke-linejoin="round" />
          <path d="M150 30 L170 14 L168 46 Z" fill="#FF4F8B" stroke="#E83E7A" stroke-width="3" stroke-linejoin="round" />
          <circle cx="150" cy="30" r="7" fill="#FF7FA1" />
        </g>
        <g v-else-if="decor === 'sunglasses'">
          <rect x="80" y="64" width="33" height="25" rx="11" fill="#3d3a5c" />
          <rect x="123" y="64" width="33" height="25" rx="11" fill="#3d3a5c" />
          <path d="M113 72 L123 72" stroke="#3d3a5c" stroke-width="4" />
          <path d="M86 70 L94 70" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity="0.7" />
          <path d="M129 70 L137 70" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity="0.7" />
        </g>
        <g v-else-if="decor === 'crown'">
          <path d="M92 30 L95 2 L108 16 L118 -4 L128 16 L141 2 L144 30 Z" fill="#FFD54F" stroke="#F5B700" stroke-width="3" stroke-linejoin="round" />
          <circle cx="118" cy="20" r="4.5" fill="#FF6B8B" />
          <circle cx="103" cy="23" r="3.5" fill="#3FB5EA" />
          <circle cx="133" cy="23" r="3.5" fill="#5CCB9F" />
        </g>
        <g v-else-if="decor === 'flower'">
          <circle v-for="a in [0, 72, 144, 216, 288]" :key="a" :cx="160 + 10 * Math.cos((a * Math.PI) / 180)" :cy="36 + 10 * Math.sin((a * Math.PI) / 180)" r="8" fill="#FFB6C8" />
          <circle cx="160" cy="36" r="6" fill="#FFE58A" />
        </g>
      </g>
    </svg>
  </div>
</template>

<style scoped>
.dino-blink {
  transform-box: fill-box;
  transform-origin: center;
  animation: blink 4.5s infinite;
}
.dino-talk {
  animation: talk 0.22s ease-in-out infinite alternate;
}
.dino-wave {
  transform-box: fill-box;
  transform-origin: 80% 20%;
  animation: wave 0.6s ease-in-out infinite alternate;
}
@keyframes blink {
  0%, 92%, 100% { transform: scaleY(1); }
  95% { transform: scaleY(0.1); }
}
@keyframes talk {
  from { transform: scaleY(0.35); }
  to { transform: scaleY(1); }
}
@keyframes wave {
  from { transform: rotate(0deg); }
  to { transform: rotate(-35deg); }
}
</style>
