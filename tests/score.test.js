import { beforeEach, describe, expect, it } from 'vitest'
import { createScore } from '../src/score.js'
import { SCORE_PER_UNIT } from '../src/config.js'

function fakeStorage() {
  const data = new Map()
  return {
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => data.set(key, String(value))
  }
}

const hostileStorage = {
  getItem: () => { throw new Error('blocked') },
  setItem: () => { throw new Error('blocked') }
}

describe('createScore', () => {
  let score

  beforeEach(() => {
    score = createScore(fakeStorage())
  })

  it('starts at zero', () => {
    expect(score.value).toBe(0)
  })

  it('converts distance travelled into points', () => {
    score.add(10)
    expect(score.value).toBe(Math.floor(10 * SCORE_PER_UNIT))
  })

  it('accumulates fractions instead of losing them', () => {
    for (let i = 0; i < 100; i += 1) score.add(0.1)
    expect(score.value).toBe(Math.floor(10 * SCORE_PER_UNIT))
  })

  it('flags a milestone when crossing a hundred', () => {
    score.add(100 / SCORE_PER_UNIT)
    expect(score.milestone).toBe(true)
    score.add(0.001)
    expect(score.milestone).toBe(false)
  })

  it('does not flag a milestone at zero', () => {
    score.add(0)
    expect(score.milestone).toBe(false)
  })

  it('keeps the best score across resets', () => {
    score.add(200)
    const best = score.value
    score.reset()
    expect(score.value).toBe(0)
    expect(score.high).toBe(best)
  })

  it('loads a stored high score', () => {
    const storage = fakeStorage()
    storage.setItem('dino-high-score', 4321)
    expect(createScore(storage).high).toBe(4321)
  })

  it('keeps running when storage throws', () => {
    const guarded = createScore(hostileStorage)
    guarded.add(100)
    expect(guarded.value).toBeGreaterThan(0)
    expect(guarded.high).toBe(guarded.value)
  })
})
