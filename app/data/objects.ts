import type { ObjectInfo } from '../types'
import { localize } from '../locales/index.ts'
import { ID_OBJECTS } from '../locales/id.ts'

/**
 * Catalogue of every illustrated object used in DinoLand.
 *
 * Illustrations live in `public/images/objects/<key>.svg`. Most are copied
 * from Twemoji (CC-BY 4.0) by `scripts/build-illustrations.mjs` so the style
 * stays consistent across devices; a few (e.g. xylophone) are hand-drawn.
 * The `emoji` is used as a fallback if an image is missing.
 */
export const OBJECTS: ObjectInfo[] = [
  // Alphabet words
  { key: 'apple', label: 'Apple', emoji: '🍎', color: 'red', shape: 'circle' },
  { key: 'ball', label: 'Ball', emoji: '⚽', shape: 'circle' },
  { key: 'cat', label: 'Cat', emoji: '🐱' },
  { key: 'dinosaur', label: 'Dinosaur', emoji: '🦕' },
  { key: 'elephant', label: 'Elephant', emoji: '🐘' },
  { key: 'fish', label: 'Fish', emoji: '🐟', color: 'blue' },
  { key: 'grapes', label: 'Grapes', emoji: '🍇', color: 'purple' },
  { key: 'hat', label: 'Hat', emoji: '👒' },
  { key: 'ice-cream', label: 'Ice cream', emoji: '🍦' },
  { key: 'juice', label: 'Juice', emoji: '🧃' },
  { key: 'kite', label: 'Kite', emoji: '🪁' },
  { key: 'lion', label: 'Lion', emoji: '🦁' },
  { key: 'moon', label: 'Moon', emoji: '🌙', color: 'yellow' },
  { key: 'nest', label: 'Nest', emoji: '🪺' },
  { key: 'orange', label: 'Orange', emoji: '🍊', color: 'orange', shape: 'circle' },
  { key: 'pig', label: 'Pig', emoji: '🐷', color: 'pink' },
  { key: 'queen', label: 'Queen', emoji: '👸' },
  { key: 'rabbit', label: 'Rabbit', emoji: '🐰' },
  { key: 'sun', label: 'Sun', emoji: '☀️', color: 'yellow', shape: 'circle' },
  { key: 'tree', label: 'Tree', emoji: '🌳', color: 'green' },
  { key: 'umbrella', label: 'Umbrella', emoji: '☂️', color: 'purple' },
  { key: 'van', label: 'Van', emoji: '🚐' },
  { key: 'whale', label: 'Whale', emoji: '🐳', color: 'blue' },
  { key: 'xylophone', label: 'Xylophone', emoji: '🎹' },
  { key: 'yo-yo', label: 'Yo-yo', emoji: '🪀' },
  { key: 'zebra', label: 'Zebra', emoji: '🦓' },

  // Counting objects
  { key: 'duck', label: 'Duck', emoji: '🦆' },
  { key: 'balloon', label: 'Balloon', emoji: '🎈', color: 'red' },
  { key: 'car', label: 'Car', emoji: '🚗', color: 'red' },
  { key: 'star', label: 'Star', emoji: '⭐', color: 'yellow', shape: 'star' },
  { key: 'flower', label: 'Flower', emoji: '🌸', color: 'pink' },
  { key: 'butterfly', label: 'Butterfly', emoji: '🦋', color: 'blue' },
  { key: 'cookie', label: 'Cookie', emoji: '🍪', shape: 'circle' },
  { key: 'strawberry', label: 'Strawberry', emoji: '🍓', color: 'red' },
  { key: 'ladybug', label: 'Ladybug', emoji: '🐞', color: 'red' },
  { key: 'banana', label: 'Banana', emoji: '🍌', color: 'yellow' },
  { key: 'cupcake', label: 'Cupcake', emoji: '🧁' },
  { key: 'frog', label: 'Frog', emoji: '🐸', color: 'green' },
  { key: 'chick', label: 'Chick', emoji: '🐤', color: 'yellow' },
  { key: 'carrot', label: 'Carrot', emoji: '🥕', color: 'orange' },
  { key: 'bee', label: 'Bee', emoji: '🐝' },
  { key: 'heart', label: 'Heart', emoji: '❤️', color: 'red', shape: 'heart' },

  // Colour objects
  { key: 'fire-truck', label: 'Fire truck', emoji: '🚒', color: 'red' },
  { key: 'jeans', label: 'Jeans', emoji: '👖', color: 'blue' },
  { key: 'blue-car', label: 'Blue car', emoji: '🚙', color: 'blue' },
  { key: 'lemon', label: 'Lemon', emoji: '🍋', color: 'yellow' },
  { key: 'broccoli', label: 'Broccoli', emoji: '🥦', color: 'green' },
  { key: 'turtle', label: 'Turtle', emoji: '🐢', color: 'green' },
  { key: 'clover', label: 'Clover', emoji: '🍀', color: 'green' },
  { key: 'pumpkin', label: 'Pumpkin', emoji: '🎃', color: 'orange' },
  { key: 'basketball', label: 'Basketball', emoji: '🏀', color: 'orange', shape: 'circle' },
  { key: 'eggplant', label: 'Eggplant', emoji: '🍆', color: 'purple' },
  { key: 'purple-heart', label: 'Purple heart', emoji: '💜', color: 'purple', shape: 'heart' },
  { key: 'flamingo', label: 'Flamingo', emoji: '🦩', color: 'pink' },
  { key: 'top-hat', label: 'Top hat', emoji: '🎩', color: 'black' },
  { key: 'black-cat', label: 'Black cat', emoji: '🐈‍⬛', color: 'black' },
  { key: 'spider', label: 'Spider', emoji: '🕷️', color: 'black' },
  { key: 'ghost', label: 'Ghost', emoji: '👻', color: 'white' },
  { key: 'cloud', label: 'Cloud', emoji: '☁️', color: 'white' },
  { key: 'sheep', label: 'Sheep', emoji: '🐑', color: 'white' },

  // Shape objects
  { key: 'clock', label: 'Clock', emoji: '🕒', shape: 'circle' },
  { key: 'donut', label: 'Donut', emoji: '🍩', shape: 'circle' },
  { key: 'gift', label: 'Gift', emoji: '🎁', shape: 'square' },
  { key: 'waffle', label: 'Waffle', emoji: '🧇', shape: 'square' },
  { key: 'dice', label: 'Dice', emoji: '🎲', shape: 'square' },
  { key: 'pizza', label: 'Pizza', emoji: '🍕', shape: 'triangle' },
  { key: 'cheese', label: 'Cheese', emoji: '🧀', shape: 'triangle' },
  { key: 'tent', label: 'Tent', emoji: '⛺', shape: 'triangle' },
  { key: 'door', label: 'Door', emoji: '🚪', shape: 'rectangle' },
  { key: 'book', label: 'Book', emoji: '📕', shape: 'rectangle' },
  { key: 'phone', label: 'Phone', emoji: '📱', shape: 'rectangle' },
  { key: 'glowing-star', label: 'Glowing star', emoji: '🌟', shape: 'star' },
  { key: 'shooting-star', label: 'Shooting star', emoji: '🌠', shape: 'star' },
  { key: 'love-letter', label: 'Love letter', emoji: '💌', shape: 'heart' },
  { key: 'heart-gift', label: 'Heart gift', emoji: '💝', shape: 'heart' },

  // Animals for memory cards
  { key: 'dog', label: 'Dog', emoji: '🐶' },
  { key: 'bear', label: 'Bear', emoji: '🐻' },
  { key: 'monkey', label: 'Monkey', emoji: '🐵' },
  { key: 'cow', label: 'Cow', emoji: '🐮' },
  { key: 'panda', label: 'Panda', emoji: '🐼' },
  { key: 'owl', label: 'Owl', emoji: '🦉' },

  // Fruits for Feed the Monster
  { key: 'cherry', label: 'Cherry', emoji: '🍒', color: 'red' },
  { key: 'watermelon', label: 'Watermelon', emoji: '🍉' },
  { key: 'pear', label: 'Pear', emoji: '🍐', color: 'green' },
  { key: 'peach', label: 'Peach', emoji: '🍑' },

  // Extra pictures for the Indonesian alphabet (Harimau, Nanas, Orang utan…)
  { key: 'tiger', label: 'Tiger', emoji: '🐯' },
  { key: 'pineapple', label: 'Pineapple', emoji: '🍍', color: 'yellow' },
  { key: 'orangutan', label: 'Orangutan', emoji: '🦧' },
  { key: 'snake', label: 'Snake', emoji: '🐍', color: 'green' },
  { key: 'violin', label: 'Violin', emoji: '🎻' },

  // UI / category illustrations
  { key: 'palette', label: 'Palette', emoji: '🎨' },
  { key: 'pencil', label: 'Pencil', emoji: '✏️' },
  { key: 'magnifier', label: 'Magnifier', emoji: '🔍' },
  { key: 'puzzle', label: 'Puzzle', emoji: '🧩' },
  { key: 'fishing-pole', label: 'Fishing pole', emoji: '🎣' },
  { key: 'joker', label: 'Cards', emoji: '🃏' },
  { key: 'flag', label: 'Finish flag', emoji: '🏁' },
  { key: 'map', label: 'Map', emoji: '🗺️' },
  { key: 'bricks', label: 'Bricks', emoji: '🧱' },
  { key: 'trophy', label: 'Trophy', emoji: '🏆' },
  { key: 'medal', label: 'Medal', emoji: '🏅' },
  { key: 'rainbow', label: 'Rainbow', emoji: '🌈' },
  { key: 'crayon', label: 'Crayon', emoji: '🖍️' },
  { key: 'eyes', label: 'Eyes', emoji: '👀' },
  { key: 'scales', label: 'Scales', emoji: '⚖️' },
  { key: 'link', label: 'Link', emoji: '🔗' },
  { key: 'sparkles', label: 'Sparkles', emoji: '✨' },
  { key: 'question', label: 'Question', emoji: '❓' },
  { key: 'gem', label: 'Gem', emoji: '💎' },
  { key: 'crown', label: 'Crown', emoji: '👑' },
  { key: 'party', label: 'Party', emoji: '🎉' },
  { key: 'rocket', label: 'Rocket', emoji: '🚀' },
  { key: 'books', label: 'Books', emoji: '📚' },
  { key: 'lock', label: 'Lock', emoji: '🔒' },
  { key: 'speaker', label: 'Speaker', emoji: '🔊' },
  { key: 'muted', label: 'Muted', emoji: '🔇' },
  { key: 'house', label: 'House', emoji: '🏠' },
  { key: 'basket', label: 'Basket', emoji: '🧺' },
  { key: 'paint', label: 'Paint', emoji: '🖌️' },
  { key: 'shapes', label: 'Shapes', emoji: '🔷' },
  { key: 'abacus', label: 'Abacus', emoji: '🧮' },
  { key: 'teddy', label: 'Teddy', emoji: '🧸' },
  { key: 'clipboard', label: 'Clipboard', emoji: '📋' },
  { key: 'muscle', label: 'Strong', emoji: '💪' },
  { key: 'brain', label: 'Brain', emoji: '🧠' },
  { key: 'mushroom', label: 'Mushroom', emoji: '🍄' },
  { key: 'snail', label: 'Snail', emoji: '🐌' },
]

// Labels follow the current language.
localize(OBJECTS, 'label', { id: (o) => ID_OBJECTS[o.key] })

/** Objects drawn by hand rather than copied from Twemoji. */
export const CUSTOM_OBJECTS = new Set(['xylophone'])

const byKey = new Map(OBJECTS.map((o) => [o.key, o]))

export function getObject(key: string): ObjectInfo {
  return byKey.get(key) ?? { key, label: key, emoji: '❓' }
}

export const ANIMALS = ['cat', 'dog', 'pig', 'lion', 'frog', 'rabbit', 'bear', 'monkey', 'cow', 'panda', 'owl', 'chick']
export const FRUITS = ['apple', 'banana', 'strawberry', 'grapes', 'orange', 'cherry', 'watermelon', 'pear', 'peach']
