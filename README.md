# DinoLand 🦕

A playful, offline-first learning playground for toddlers (ages 3–4): numbers 1–20, the alphabet, colors, shapes and mini-games, guided by Dino the baby dinosaur. Playable in **English** and **Bahasa Indonesia**.

Built with Nuxt 4 (SPA mode), Vue 3 `<script setup lang="ts">`, Tailwind CSS 4, Motion for Vue, Web Audio, SVG and a PWA service worker. There is no backend: all progress is stored on the device.

## Getting started

```bash
yarn install
yarn dev            # http://localhost:3000
yarn generate       # static build in .output/public (static build; see Deploying below)
npx nuxi typecheck  # type-check the project
```

## Deploying to GitHub Pages

The app is configured as a GitHub Pages **project site** and is served from `https://stanydev.github.io/toddlearn/` (`app.baseURL` is `/toddlearn/` in `nuxt.config.ts`; the PWA manifest, icons and service-worker fallback use the same prefix). If the repository or its owner is renamed, or a custom domain is used, update that prefix.

1. In the repository go to **Settings → Pages** and set **Source** to **GitHub Actions**.
2. Push to `master` (or run **Deploy to GitHub Pages** from the Actions tab). `.github/workflows/deploy.yml` runs `yarn install --frozen-lockfile` and `yarn generate`, then publishes `.output/public` with the official Pages actions.

Notes:

- The published site is public to everyone, even if the repository is private. Pages from a private repository requires a paid GitHub plan; GitHub Free needs a public repository.
- GitHub Pages has no SPA fallback to `index.html`. Instead it serves `404.html` for unknown paths, and `nuxt generate` writes `404.html` as a copy of the app shell, so deep links such as `/toddlearn/numbers/count` still boot the app and the router renders the route (the HTTP status of such a first load is 404, and the service worker serves the shell once installed).
- Other static hosts at the domain root: change `baseURL` to `/` and serve `index.html` (or `200.html`) for unknown paths.

## What's inside

| Area | Activities |
| --- | --- |
| **Numbers** | Explorer 1–20 (tap to count), Count, Find the Number, Match (numeral ↔ amount), Missing Number, More or Less, Tracing |
| **ABC** | Explorer A–Z, Find the Letter, Big & Little (A ↔ a), Picture Match, Missing Letter, Tracing (upper + lower case) |
| **Colors & Shapes** | Color explorer, Shape explorer, Find the Color, Color Match, Color Hunt, Find the Shape, Shape Match, Sort It (by color / by shape) |
| **Games** | Balloon Pop, Feed the Monster, Letter Fishing, Memory Cards, Number Race, Treasure Hunt, Build a Tower |
| **Rewards** | Stars, 12 badges, 7 unlockable dino friends, 6 dress-up items, celebration pop-ups |
| **Parents** | Hidden behind a press-and-hold lock on the home screen plus a grown-up math question or PIN: learning time, weekly chart, explored items, activity history, language, sound/motion/session settings, export and reset |

Toddler-first rules apply everywhere: big touch targets, spoken instructions with visual hints, no timers, no penalties, gentle "try again" feedback, and hold-to-exit buttons inside activities.

## Project structure

```
app/
  components/
    common/     DinoMascot, ObjectIcon, ShapeIcon, BigGlyph, AudioButton, BackButton, CelebrationAnimation…
    game/       GameShell, GameHeader, GameProgress, GameQuestion, GameFeedback, GameComplete,
                AnswerOption, QuizActivity, MatchingActivity, sprites (balloon, fish, monster, car, scene)
    learning/   CategoryHub, ActivityTile, LearningCategoryCard, NumberCard, AlphabetCard,
                ObjectCounter, TracingBoard, Explorer shell/nav
    rewards/    StarCounter, StarReward, AchievementBadge, RewardPopup
    layout/     PlaygroundBackground, ParentCorner, ParentGate
  composables/  useGame, useAudio, useProgress, useRewards, useSettings, useI18n, useDragDrop, useParentSession
  data/         learning content, activities, rewards, voice catalogue, tracing glyphs, illustrations
  locales/      languages: en.ts (UI text), id.ts (Indonesian UI text, content and phrases)
  pages/        index, numbers/, alphabet/, colors-shapes/, games/, rewards/, parent/
  utils/        question generators, storage + validation, random helpers, Web Audio synth
public/
  audio/voice/  recorded voice clips per language: en/, id/ (see below)
  images/objects/  illustrations
  icons/        PWA icons
scripts/        asset generators (voice, illustrations, icons)
```

**Shared game engine:** every activity uses `useGame()` (rounds, stars, feedback, completion, progress tracking). Quiz and matching activities are fully data-driven: add a generator in `app/utils/generators.ts` and register it in `ACTIVITY_ENGINES` plus `data/activities.ts`.

## Languages

DinoLand ships in English and Bahasa Indonesia. On first launch it follows the browser's language; parents can switch at any time in the dashboard (**Language**). The choice is saved on the device and applies to screens, words, pictures and voice.

- **UI text:** `app/locales/en.ts` defines every string; `app/locales/id.ts` must provide the same keys (a missing one is a type error). Components read them with `const { m } = useI18n()`.
- **Learning content** (numbers, letters, colors, shapes, objects, activity and badge names) is written in English in `app/data/*` and translated by id in `app/locales/id.ts`. `localize()` makes those fields follow the current language, so `activity.title` or `color.name` is always translated.
- **Alphabet words** are chosen per language so they start with the right letter: "B untuk Bola", "H untuk Harimau", "N untuk Nanas". Q has almost no everyday Indonesian words, so it uses "Queen"; change any word or picture in `ID_LETTERS`.
- **Adding a language:** add it to `LOCALES` in `app/locales/index.ts`, create a messages file and data table like `id.ts`, register it in `useI18n.ts`, `voice.ts` and `scripts/generate-voice.mjs`, then generate or record its clips.

## Audio

- **Voice:** every spoken line has a key in `app/data/voice.ts`, and its file lives at `public/audio/voice/<lang>/<key>.m4a` (e.g. `en/numbers/5.m4a` "Five", `id/numbers/5.m4a` "Lima", `id/letter-words/b.m4a` "be, untuk Bola!"). The same keys are used in every language.
  The shipped clips are development recordings generated with macOS text-to-speech (`node scripts/generate-voice.mjs`; voices Samantha and Damayanti; `--lang=id` for one language). To use a professional voice-over, record files with the same names and replace them. No code changes are needed.
  If a clip is missing, the app falls back to the browser's speech synthesis. Parents can turn this off.
- **Sound effects:** synthesised with Web Audio (`app/utils/synth.ts`), so they're friendly, never harsh, and need no assets. To use recorded effects, map them in `app/data/audio.ts`.
- Parents can mute the sound or adjust voice and effects volume separately in the dashboard.

## Data & privacy

Progress, rewards and settings are stored in `localStorage` (`dinoland:*` keys), validated on load with safe defaults. Nothing leaves the device. Parents can export the data as JSON or reset it.

## Offline

The PWA service worker precaches the app shell, all illustrations and all voice clips in both languages (~6 MB), so after the first visit DinoLand works with no connection and can be installed to the home screen.

## Credits

- Object illustrations: [Twemoji](https://github.com/jdecked/twemoji) © Twitter, Inc. and contributors, licensed [CC-BY 4.0](https://creativecommons.org/licenses/by/4.0/). They're copied by `scripts/build-illustrations.mjs`.
- Dino, the monster, scenes, balloons, fish, race car and UI art are original SVG drawn for DinoLand.
- Font: Fredoka (SIL Open Font License) via Fontsource.

## THANKS
