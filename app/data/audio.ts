import type { SfxName } from '../utils/synth'

/**
 * Audio asset configuration.
 *
 * VOICE — see data/voice.ts. Files: public/audio/voice/<key>.m4a
 *
 * SOUND EFFECTS — synthesised in code by default (utils/synth.ts). To use a
 * recorded effect instead, put the file in public/audio/sfx/ and map it here,
 * e.g. `correct: '/audio/sfx/correct.m4a'`. If the file can't be loaded the
 * synthesised version plays instead.
 */
export const SFX_FILES: Partial<Record<SfxName, string>> = {}

export const PRAISE_KEYS = ['praise-1', 'praise-2', 'praise-3', 'praise-4', 'praise-5', 'praise-6']
export const ENCOURAGE_KEYS = ['encourage-1', 'encourage-2', 'encourage-3', 'encourage-4']
