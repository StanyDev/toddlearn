import type { ChoiceVisual } from '~/types'
import { colorById, shapeById } from '~/data/learning'
import { getObject } from '~/data/objects'

/** Accessible label for any answer visual. */
export function visualLabel(v: ChoiceVisual): string {
  switch (v.kind) {
    case 'number':
      return String(v.value)
    case 'letter':
      return `Letter ${v.value}`
    case 'object':
      return getObject(v.key).label
    case 'group':
      return `${v.count} ${getObject(v.object).label}`
    case 'color':
      return colorById(v.color).name
    case 'shape':
      return shapeById(v.shape).name
  }
}
