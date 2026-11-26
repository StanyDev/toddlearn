// Generates development voice clips for every key in app/data/voice.ts, in
// every language, using macOS text-to-speech. Replace any file with a real
// recording at the same path to upgrade the voice — the app picks it up
// automatically.
//
//   node scripts/generate-voice.mjs                 # only missing clips, all languages
//   node scripts/generate-voice.mjs --force         # regenerate everything
//   node scripts/generate-voice.mjs --lang=id       # one language
//   VOICE_EN=Samantha VOICE_ID=Damayanti RATE=160 node scripts/generate-voice.mjs
//
// Output: public/audio/voice/<lang>/<key>.m4a
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, rmSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { VOICE_CATALOGS } from '../app/data/voice.ts'

if (process.platform !== 'darwin') {
  console.error('This generator uses the macOS `say` command. On other systems, record clips manually.')
  process.exit(1)
}

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const force = process.argv.includes('--force')
const only = process.argv.find((a) => a.startsWith('--lang='))?.slice(7)
const rate = process.env.RATE ?? '160'

const LANGS = {
  en: {
    voice: process.env.VOICE_EN ?? 'Samantha',
    // Spell single letters literally so "A" is said as the letter name.
    spoken: (key, text) => {
      if (key.startsWith('letters/')) return `[[char LTRL]]${text}[[char NORM]]`
      if (key.startsWith('letter-words/')) return text.replace(/^(\w) is for/, '[[char LTRL]]$1[[char NORM]], is for')
      return text
    },
  },
  id: {
    // Damayanti is macOS's built-in Indonesian voice. Letter names are
    // already written the way they're said ("be", "ce", "ka"…).
    voice: process.env.VOICE_ID ?? 'Damayanti',
    spoken: (_key, text) => text,
  },
}

// `say` writes padded MP4 files; rendering to AIFF and encoding with
// afconvert gives clips ~5x smaller.
const tmp = mkdtempSync(join(tmpdir(), 'dinoland-voice-'))
const aiff = join(tmp, 'clip.aiff')

for (const [lang, cfg] of Object.entries(LANGS)) {
  if (only && only !== lang) continue
  const catalog = VOICE_CATALOGS[lang]
  const outDir = join(root, 'public/audio/voice', lang)
  let made = 0
  for (const [key, text] of Object.entries(catalog)) {
    const file = join(outDir, `${key}.m4a`)
    if (!force && existsSync(file)) continue
    mkdirSync(dirname(file), { recursive: true })
    if (existsSync(file)) rmSync(file)
    execFileSync('say', ['-v', cfg.voice, '-r', rate, '-o', aiff, cfg.spoken(key, text)])
    execFileSync('afconvert', ['-f', 'm4af', '-d', 'aac', '-b', '32000', aiff, file])
    made++
  }
  console.log(`[${lang}] generated ${made} clips (${Object.keys(catalog).length} in catalogue, voice ${cfg.voice}).`)
}
rmSync(tmp, { recursive: true, force: true })
