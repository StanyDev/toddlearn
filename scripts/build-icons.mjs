// Renders DinoLand's app icons (PWA, Apple touch, favicon) from one SVG.
// Run with: node scripts/build-icons.mjs
import sharp from 'sharp'
import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const out = join(dirname(fileURLToPath(import.meta.url)), '../public/icons')
const body = '#7ED957', belly = '#FFF3B0', spots = '#4CB944'

const dino = `
  <g transform="translate(56 70) scale(1.9)">
    <path d="M70 162 C 28 168 6 140 14 108 C 30 130 52 138 82 130 Z" fill="${body}"/>
    <g fill="${spots}" stroke="${spots}" stroke-width="8" stroke-linejoin="round">
      <path d="M62 64 L48 38 L80 40 Z"/><path d="M84 36 L84 4 L110 26 Z"/><path d="M118 24 L134 -2 L144 30 Z"/><path d="M150 36 L178 30 L166 58 Z"/>
    </g>
    <ellipse cx="108" cy="150" rx="55" ry="46" fill="${body}"/>
    <ellipse cx="118" cy="158" rx="34" ry="31" fill="${belly}"/>
    <ellipse cx="84" cy="193" rx="21" ry="12" fill="${body}"/><ellipse cx="138" cy="193" rx="21" ry="12" fill="${body}"/>
    <circle cx="118" cy="80" r="58" fill="${body}"/>
    <ellipse cx="118" cy="102" rx="30" ry="19" fill="${belly}" opacity="0.55"/>
    <ellipse cx="96" cy="76" rx="13" ry="15" fill="#fff"/><ellipse cx="140" cy="76" rx="13" ry="15" fill="#fff"/>
    <circle cx="98" cy="79" r="8.5" fill="#3d3a5c"/><circle cx="142" cy="79" r="8.5" fill="#3d3a5c"/>
    <circle cx="101.5" cy="75" r="3.2" fill="#fff"/><circle cx="145.5" cy="75" r="3.2" fill="#fff"/>
    <ellipse cx="78" cy="98" rx="10" ry="6.5" fill="#FF8FB1" opacity="0.6"/><ellipse cx="158" cy="98" rx="10" ry="6.5" fill="#FF8FB1" opacity="0.6"/>
    <path d="M102 102 Q118 128 134 102 Q118 108 102 102 Z" fill="#7A2E3B"/>
  </g>`

const icon = (rounded) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8ED8F8"/><stop offset="1" stop-color="#D8C7FF"/></linearGradient>
    <clipPath id="frame"><rect width="512" height="512" rx="${rounded ? 112 : 0}"/></clipPath>
  </defs>
  <g clip-path="url(#frame)">
    <rect width="512" height="512" fill="url(#bg)"/>
    <circle cx="420" cy="92" r="48" fill="#FFE58A"/>
    <path d="M0 430 Q140 380 260 420 T512 400 V512 H0 Z" fill="#A8E6CF"/>
    ${dino}
  </g>
</svg>`

// Maskable icons need the art inside the central safe zone.
const maskable = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#8ED8F8"/>
  <g transform="translate(64 64) scale(0.75)">${dino}</g>
</svg>`

writeFileSync(join(out, 'icon.svg'), icon(true))
const render = (svg, size, file) => sharp(Buffer.from(svg)).resize(size, size).png().toFile(join(out, file))
await render(icon(true), 192, 'icon-192.png')
await render(icon(true), 512, 'icon-512.png')
await render(maskable, 512, 'icon-maskable-512.png')
await render(icon(false), 180, 'apple-touch-icon.png')

// favicon.ico with an embedded 32px PNG.
const png = await sharp(Buffer.from(icon(true))).resize(32, 32).png().toBuffer()
const header = Buffer.alloc(22)
header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(1, 4)
header.writeUInt8(32, 6); header.writeUInt8(32, 7); header.writeUInt16LE(1, 10); header.writeUInt16LE(32, 12)
header.writeUInt32LE(png.length, 14); header.writeUInt32LE(22, 18)
writeFileSync(join(out, '../favicon.ico'), Buffer.concat([header, png]))
console.log('Icons written to public/icons')
