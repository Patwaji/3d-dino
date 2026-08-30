import { SCORE_PER_UNIT } from './config.js'

const KEY = 'dino-high-score'

export function createScore(storage) {
  let raw = 0
  let value = 0
  let high = 0
  let milestone = false

  try {
    high = Number(storage.getItem(KEY)) || 0
  } catch (error) {
    high = 0
  }

  function add(distance) {
    const previous = value
    raw += distance * SCORE_PER_UNIT
    value = Math.floor(raw)
    milestone = value > 0 && Math.floor(previous / 100) !== Math.floor(value / 100)

    if (value > high) {
      high = value
      try {
        storage.setItem(KEY, high)
      } catch (error) {
        high = value
      }
    }
  }

  function reset() {
    raw = 0
    value = 0
    milestone = false
  }

  return {
    add,
    reset,
    get value() { return value },
    get high() { return high },
    get milestone() { return milestone }
  }
}
