<template>
  <!-- A sunny meadow with a house, tree, pond and bushes to search around. -->
  <svg viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" class="absolute inset-0 h-full w-full" aria-hidden="true">
    <defs>
      <linearGradient id="ts-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8ED8F8" /><stop offset="1" stop-color="#E6F7FF" /></linearGradient>
      <linearGradient id="ts-pond" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7FD3F7" /><stop offset="1" stop-color="#3FB5EA" /></linearGradient>
    </defs>
    <rect width="1600" height="1000" fill="url(#ts-sky)" />
    <circle cx="1450" cy="120" r="80" fill="#FFE58A" />
    <g fill="#fff" opacity="0.95">
      <path d="M380 170 q-50 0 -48 -36 q4 -34 46 -30 q12 -40 60 -38 q44 2 52 40 q44 -6 48 30 q2 34 -40 34 z" />
      <path d="M980 120 q-40 0 -38 -28 q4 -28 36 -24 q10 -32 48 -30 q36 2 42 32 q36 -4 38 24 q2 26 -32 26 z" />
    </g>
    <path d="M0 520 Q300 400 640 500 T1200 470 T1600 440 V1000 H0 Z" fill="#A8E6CF" />
    <path d="M0 640 Q400 560 820 640 T1600 610 V1000 H0 Z" fill="#7FD8B0" />
    <!-- house -->
    <g transform="translate(980 300)">
      <rect x="20" y="140" width="300" height="220" rx="12" fill="#FFD1A8" />
      <path d="M0 150 L170 20 L340 150 Z" fill="#FF7FA1" stroke="#E8577F" stroke-width="10" stroke-linejoin="round" />
      <rect x="140" y="240" width="70" height="120" rx="10" fill="#A0673C" />
      <circle cx="196" cy="300" r="6" fill="#FFE58A" />
      <rect x="50" y="190" width="70" height="60" rx="8" fill="#E6F7FF" stroke="#fff" stroke-width="8" />
      <rect x="230" y="190" width="70" height="60" rx="8" fill="#E6F7FF" stroke="#fff" stroke-width="8" />
      <rect x="240" y="40" width="40" height="70" fill="#C98E45" />
    </g>
    <!-- tree -->
    <g transform="translate(170 260)">
      <rect x="110" y="200" width="50" height="230" rx="16" fill="#A0673C" />
      <circle cx="135" cy="150" r="120" fill="#5CCB9F" />
      <circle cx="60" cy="210" r="80" fill="#4DBA8C" />
      <circle cx="215" cy="200" r="85" fill="#4DBA8C" />
      <g fill="#EF4444"><circle cx="90" cy="120" r="14" /><circle cx="190" cy="140" r="14" /><circle cx="140" cy="230" r="14" /></g>
    </g>
    <!-- pond -->
    <ellipse cx="760" cy="820" rx="230" ry="80" fill="url(#ts-pond)" />
    <ellipse cx="700" cy="800" rx="60" ry="12" fill="#fff" opacity="0.4" />
    <!-- bushes -->
    <g fill="#3DBE8B">
      <circle cx="460" cy="800" r="70" /><circle cx="530" cy="780" r="80" /><circle cx="600" cy="810" r="60" />
      <circle cx="1300" cy="800" r="75" /><circle cx="1380" cy="780" r="85" /><circle cx="1450" cy="810" r="65" />
    </g>
    <!-- flowers -->
    <g v-for="(f, i) in [[120, 900], [300, 940], [1050, 920], [1180, 960], [1540, 920], [900, 950]]" :key="i" :transform="`translate(${f[0]} ${f[1]})`">
      <rect x="-3" y="0" width="6" height="40" fill="#3DBE8B" />
      <circle v-for="a in 5" :key="a" :cx="14 * Math.cos((a * 72 * Math.PI) / 180)" :cy="14 * Math.sin((a * 72 * Math.PI) / 180)" r="11" :fill="['#FFB6C8', '#D8C7FF', '#FFE58A'][i % 3]" />
      <circle r="8" fill="#FF9F5A" />
    </g>
    <!-- mushroom -->
    <g transform="translate(60 760)"><rect x="30" y="40" width="30" height="50" rx="10" fill="#FFF3E0" /><path d="M0 50 Q45 -20 90 50 Z" fill="#EF4444" /><circle cx="30" cy="30" r="8" fill="#fff" /><circle cx="60" cy="36" r="6" fill="#fff" /></g>
  </svg>
</template>
