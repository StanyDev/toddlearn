import type { ColorId, ColorInfo, LetterInfo, NumberInfo, ShapeId, ShapeInfo } from '../types'

export const NUMBERS: NumberInfo[] = [
  { value: 1, name: 'One', object: 'sun', plural: 'sun' },
  { value: 2, name: 'Two', object: 'duck', plural: 'ducks' },
  { value: 3, name: 'Three', object: 'balloon', plural: 'balloons' },
  { value: 4, name: 'Four', object: 'car', plural: 'cars' },
  { value: 5, name: 'Five', object: 'apple', plural: 'apples' },
  { value: 6, name: 'Six', object: 'star', plural: 'stars' },
  { value: 7, name: 'Seven', object: 'flower', plural: 'flowers' },
  { value: 8, name: 'Eight', object: 'fish', plural: 'fish' },
  { value: 9, name: 'Nine', object: 'butterfly', plural: 'butterflies' },
  { value: 10, name: 'Ten', object: 'cookie', plural: 'cookies' },
  { value: 11, name: 'Eleven', object: 'strawberry', plural: 'strawberries' },
  { value: 12, name: 'Twelve', object: 'ladybug', plural: 'ladybugs' },
  { value: 13, name: 'Thirteen', object: 'banana', plural: 'bananas' },
  { value: 14, name: 'Fourteen', object: 'cupcake', plural: 'cupcakes' },
  { value: 15, name: 'Fifteen', object: 'frog', plural: 'frogs' },
  { value: 16, name: 'Sixteen', object: 'chick', plural: 'chicks' },
  { value: 17, name: 'Seventeen', object: 'carrot', plural: 'carrots' },
  { value: 18, name: 'Eighteen', object: 'bee', plural: 'bees' },
  { value: 19, name: 'Nineteen', object: 'heart', plural: 'hearts' },
  { value: 20, name: 'Twenty', object: 'ball', plural: 'balls' },
]

export const LETTERS: LetterInfo[] = [
  { upper: 'A', lower: 'a', word: 'Apple', object: 'apple' },
  { upper: 'B', lower: 'b', word: 'Ball', object: 'ball' },
  { upper: 'C', lower: 'c', word: 'Cat', object: 'cat' },
  { upper: 'D', lower: 'd', word: 'Dinosaur', object: 'dinosaur' },
  { upper: 'E', lower: 'e', word: 'Elephant', object: 'elephant' },
  { upper: 'F', lower: 'f', word: 'Fish', object: 'fish' },
  { upper: 'G', lower: 'g', word: 'Grapes', object: 'grapes' },
  { upper: 'H', lower: 'h', word: 'Hat', object: 'hat' },
  { upper: 'I', lower: 'i', word: 'Ice cream', object: 'ice-cream' },
  { upper: 'J', lower: 'j', word: 'Juice', object: 'juice' },
  { upper: 'K', lower: 'k', word: 'Kite', object: 'kite' },
  { upper: 'L', lower: 'l', word: 'Lion', object: 'lion' },
  { upper: 'M', lower: 'm', word: 'Moon', object: 'moon' },
  { upper: 'N', lower: 'n', word: 'Nest', object: 'nest' },
  { upper: 'O', lower: 'o', word: 'Orange', object: 'orange' },
  { upper: 'P', lower: 'p', word: 'Pig', object: 'pig' },
  { upper: 'Q', lower: 'q', word: 'Queen', object: 'queen' },
  { upper: 'R', lower: 'r', word: 'Rabbit', object: 'rabbit' },
  { upper: 'S', lower: 's', word: 'Sun', object: 'sun' },
  { upper: 'T', lower: 't', word: 'Tree', object: 'tree' },
  { upper: 'U', lower: 'u', word: 'Umbrella', object: 'umbrella' },
  { upper: 'V', lower: 'v', word: 'Van', object: 'van' },
  { upper: 'W', lower: 'w', word: 'Whale', object: 'whale' },
  { upper: 'X', lower: 'x', word: 'Xylophone', object: 'xylophone' },
  { upper: 'Y', lower: 'y', word: 'Yo-yo', object: 'yo-yo' },
  { upper: 'Z', lower: 'z', word: 'Zebra', object: 'zebra' },
]

export const COLORS: ColorInfo[] = [
  { id: 'red', name: 'Red', hex: '#EF4444', onHex: '#fff', objects: ['apple', 'strawberry', 'ladybug', 'fire-truck'] },
  { id: 'blue', name: 'Blue', hex: '#3B82F6', onHex: '#fff', objects: ['whale', 'butterfly', 'jeans', 'blue-car'] },
  { id: 'yellow', name: 'Yellow', hex: '#FACC15', onHex: '#3d3a5c', objects: ['banana', 'chick', 'sun', 'lemon'] },
  { id: 'green', name: 'Green', hex: '#22C55E', onHex: '#fff', objects: ['frog', 'tree', 'broccoli', 'turtle'] },
  { id: 'orange', name: 'Orange', hex: '#FB923C', onHex: '#fff', objects: ['orange', 'carrot', 'pumpkin', 'basketball'] },
  { id: 'purple', name: 'Purple', hex: '#A855F7', onHex: '#fff', objects: ['grapes', 'eggplant', 'purple-heart', 'umbrella'] },
  { id: 'pink', name: 'Pink', hex: '#F472B6', onHex: '#fff', objects: ['pig', 'flower', 'flamingo'] },
  { id: 'black', name: 'Black', hex: '#27272A', onHex: '#fff', objects: ['top-hat', 'black-cat', 'spider'] },
  { id: 'white', name: 'White', hex: '#FFFFFF', onHex: '#3d3a5c', objects: ['ghost', 'cloud', 'sheep'] },
]

export const SHAPES: ShapeInfo[] = [
  { id: 'circle', name: 'Circle', objects: ['ball', 'cookie', 'clock', 'donut'] },
  { id: 'square', name: 'Square', objects: ['gift', 'waffle', 'dice'] },
  { id: 'triangle', name: 'Triangle', objects: ['pizza', 'cheese', 'tent'] },
  { id: 'rectangle', name: 'Rectangle', objects: ['door', 'book', 'phone'] },
  { id: 'star', name: 'Star', objects: ['star', 'glowing-star'] },
  { id: 'heart', name: 'Heart', objects: ['heart', 'love-letter', 'heart-gift'] },
]

/** Default fill colours used when drawing a shape without a specific colour. */
export const SHAPE_COLORS: Record<ShapeId, string> = {
  circle: '#FF7FA1',
  square: '#3FB5EA',
  triangle: '#5CCB9F',
  rectangle: '#FF9F5A',
  star: '#F6C94A',
  heart: '#EF4444',
}

export const colorById = (id: ColorId) => COLORS.find((c) => c.id === id)!
export const shapeById = (id: ShapeId) => SHAPES.find((s) => s.id === id)!
export const numberInfo = (n: number) => NUMBERS[n - 1]!
export const letterInfo = (l: string) => LETTERS.find((x) => x.upper === l.toUpperCase())!
