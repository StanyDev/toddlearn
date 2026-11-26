import { EN, type Messages } from '~/locales/en'
import { ID } from '~/locales/id'
import { LOCALES, locale, type Locale } from '~/locales'

const MESSAGES: Record<Locale, Messages> = { en: EN, id: ID }

/** UI text for the current language, for code outside components (generators…). */
export const messages = (): Messages => MESSAGES[locale.value]

/**
 * UI text for the current language.
 *   const { m } = useI18n()
 *   <h1>{{ m.home.myRewards }}</h1>   ·   {{ m.rewards.needs(name, 10) }}
 * Learning content (titles, names, words) is already translated on the data
 * objects themselves — see app/locales/index.ts.
 */
export function useI18n() {
  const { settings, update } = useSettings()
  const m = computed(() => MESSAGES[locale.value])
  const setLocale = (language: Locale) => update({ language })
  return { m, locale: computed(() => settings.value.language), setLocale, locales: LOCALES }
}
