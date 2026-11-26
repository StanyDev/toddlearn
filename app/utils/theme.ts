import type { ThemeColor } from '~/types'

/** Full class names (Tailwind needs them spelled out) for each theme colour. */
export const THEME: Record<ThemeColor, { bg: string; soft: string; deep: string; text: string; border: string; hex: string; deepHex: string }> = {
  sky: { bg: 'bg-sky', soft: 'bg-sky/40', deep: 'bg-sky-deep', text: 'text-sky-deep', border: 'border-sky-deep', hex: '#8ED8F8', deepHex: '#3FB5EA' },
  sunny: { bg: 'bg-sunny', soft: 'bg-sunny/40', deep: 'bg-sunny-deep', text: 'text-sunny-deep', border: 'border-sunny-deep', hex: '#FFE58A', deepHex: '#F6C94A' },
  bubblegum: { bg: 'bg-bubblegum', soft: 'bg-bubblegum/40', deep: 'bg-bubblegum-deep', text: 'text-bubblegum-deep', border: 'border-bubblegum-deep', hex: '#FFB6C8', deepHex: '#FF7FA1' },
  mint: { bg: 'bg-mint', soft: 'bg-mint/40', deep: 'bg-mint-deep', text: 'text-mint-deep', border: 'border-mint-deep', hex: '#A8E6CF', deepHex: '#5CCB9F' },
  lavender: { bg: 'bg-lavender', soft: 'bg-lavender/40', deep: 'bg-lavender-deep', text: 'text-lavender-deep', border: 'border-lavender-deep', hex: '#D8C7FF', deepHex: '#A78BFA' },
  peach: { bg: 'bg-peach', soft: 'bg-peach/40', deep: 'bg-peach-deep', text: 'text-peach-deep', border: 'border-peach-deep', hex: '#FFD1A8', deepHex: '#FF9F5A' },
}

/** Cheerful colours used to paint numbers and letters. */
export const GLYPH_COLORS = ['#FF6B8B', '#3FB5EA', '#F5A524', '#3DBE8B', '#9B7BF7', '#FF8A3D']

export const glyphColor = (i: number) => GLYPH_COLORS[((i % GLYPH_COLORS.length) + GLYPH_COLORS.length) % GLYPH_COLORS.length]!

export function glyphColorFor(value: string | number) {
  const code = typeof value === 'number' ? value : value.toUpperCase().charCodeAt(0) - 64
  return glyphColor(code - 1)
}
