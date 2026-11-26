// Copies the Twemoji illustrations DinoLand uses into public/images/objects.
// Run with: node scripts/build-illustrations.mjs
// Twemoji graphics © Twitter / jdecked, licensed CC-BY 4.0.
import { copyFileSync, existsSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { OBJECTS, CUSTOM_OBJECTS } from '../app/data/objects.ts'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const src = join(root, 'node_modules/@twemoji/svg')
const out = join(root, 'public/images/objects')
mkdirSync(out, { recursive: true })

// Same file-naming rule Twemoji uses: drop VS16 unless the emoji has a ZWJ.
function twemojiName(emoji) {
  const raw = emoji.includes('‍') ? emoji : emoji.replace(/️/g, '')
  return [...raw].map((c) => c.codePointAt(0).toString(16)).join('-')
}

let copied = 0
const missing = []
for (const o of OBJECTS) {
  if (CUSTOM_OBJECTS.has(o.key)) continue
  const file = join(src, `${twemojiName(o.emoji)}.svg`)
  if (!existsSync(file)) { missing.push(`${o.key} (${o.emoji})`); continue }
  copyFileSync(file, join(out, `${o.key}.svg`))
  copied++
}
console.log(`Copied ${copied} illustrations.`)
if (missing.length) { console.error('Missing:', missing.join(', ')); process.exitCode = 1 }
