import { ref } from 'vue'

/**
 * Languages DinoLand can be played in.
 *
 * - UI text lives in `en.ts` / `id.ts` (read it with `useI18n()`).
 * - Learning content (numbers, letters, colors, objects, activity titles…)
 *   is written in English in `app/data/*` and translated by id in each
 *   locale's data table. `localize()` turns those fields into getters, so
 *   `activity.title` or `color.name` always returns the current language.
 * - Voice clips are per language: public/audio/voice/<locale>/<key>.m4a.
 *
 * This module is framework-free (only `vue`'s `ref`) so Node scripts such as
 * the voice generator can import it too.
 */
export type Locale = 'en' | 'id'

export interface LocaleInfo {
  id: Locale
  /** Name of the language in that language. */
  name: string
  /** BCP-47 tag for <html lang> and speech synthesis. */
  tag: string
}

export const LOCALES: LocaleInfo[] = [
  { id: 'en', name: 'English', tag: 'en-US' },
  { id: 'id', name: 'Bahasa Indonesia', tag: 'id-ID' },
]

export const LOCALE_IDS = LOCALES.map((l) => l.id)

/** The active language. Set from the persisted settings by useSettings(). */
export const locale = ref<Locale>('en')

export const localeInfo = (l: Locale = locale.value) => LOCALES.find((x) => x.id === l)!

/** First-run language: the first browser language DinoLand supports. */
export function detectLocale(): Locale {
  const langs = typeof navigator === 'undefined' ? [] : [...(navigator.languages ?? []), navigator.language]
  for (const tag of langs) {
    const base = (tag ?? '').toLowerCase().split(/[-_]/)[0]
    if (base === 'en') return 'en'
    if (base === 'id' || base === 'in') return 'id'
  }
  return 'en'
}

/**
 * Replace `field` on every item with a getter that returns the translation
 * for the current locale (falling back to the English value). Reading the
 * getter inside a component render or computed tracks `locale`, so the UI
 * updates as soon as the language changes.
 */
export function localize<T extends object, K extends keyof T>(items: readonly T[], field: K, translations: Partial<Record<Exclude<Locale, 'en'>, (item: T) => T[K] | undefined>>) {
  for (const item of items) {
    const english = item[field]
    Object.defineProperty(item, field, {
      enumerable: true,
      configurable: true,
      get: () => {
        const l = locale.value
        if (l === 'en') return english
        return translations[l]?.(item) ?? english
      },
    })
  }
}
