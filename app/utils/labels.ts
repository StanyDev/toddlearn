import type { ChoiceVisual } from '~/types'
import { colorById, shapeById } from '~/data/learning'
import { getObject } from '~/data/objects'
import { messages } from '~/composables/useI18n'

/** Accessible label for any answer visual. */
export function visualLabel(v: ChoiceVisual): string {
  switch (v.kind) {
    case 'number':
      return String(v.value)
    case 'letter':
      return messages().common.letter(v.value)
    case 'object':
      return getObject(v.key).label
    case 'group':
      return messages().common.count(v.count, getObject(v.object).label)
    case 'color':
      return colorById(v.color).name
    case 'shape':
      return shapeById(v.shape).name
  }
}
