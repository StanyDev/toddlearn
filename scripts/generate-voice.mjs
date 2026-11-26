// Generates development voice clips for every key in app/data/voice.ts using
// macOS text-to-speech. Replace any file with a real recording at the same
// path to upgrade the voice — the app picks it up automatically.
//
//   node scripts/generate-voice.mjs            # only missing clips
//   node scripts/generate-voice.mjs --force    # regenerate everything
//   VOICE=Samantha RATE=165 node scripts/generate-voice.mjs
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, rmSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { VOICE_CATALOG } from '../app/data/voice.ts'

if (process.platform !== 'darwin') {
  console.error('This generator uses the macOS `say` command. On other systems, record clips manually.')
  process.exit(1)
}

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'public/audio/voice')
const force = process.argv.includes('--force')
const voice = process.env.VOICE ?? 'Samantha'
const rate = process.env.RATE ?? '160'

// Spell single letters literally so "A" is said as the letter name.
const spoken = (key, text) => {
  if (key.startsWith('letters/')) return `[[char LTRL]]${text}[[char NORM]]`
  if (key.startsWith('letter-words/')) return text.replace(/^(\w) is for/, '[[char LTRL]]$1[[char NORM]], is for')
  return text
}

// `say` writes padded MP4 files; rendering to AIFF and encoding with
// afconvert gives clips ~5x smaller.
const tmp = mkdtempSync(join(tmpdir(), 'dinoland-voice-'))
const aiff = join(tmp, 'clip.aiff')

let made = 0
for (const [key, text] of Object.entries(VOICE_CATALOG)) {
  const file = join(outDir, `${key}.m4a`)
  if (!force && existsSync(file)) continue
  mkdirSync(dirname(file), { recursive: true })
  if (existsSync(file)) rmSync(file)
  execFileSync('say', ['-v', voice, '-r', rate, '-o', aiff, spoken(key, text)])
  execFileSync('afconvert', ['-f', 'm4af', '-d', 'aac', '-b', '32000', aiff, file])
  made++
}
rmSync(tmp, { recursive: true, force: true })
console.log(`Generated ${made} clips (${Object.keys(VOICE_CATALOG).length} in catalogue).`)
