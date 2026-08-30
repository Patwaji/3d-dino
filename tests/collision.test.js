import { describe, expect, it } from 'vitest'
import { hitAny, overlaps } from '../src/collision.js'

const box = (x, y, width, height) => ({ x, y, width, height })

const runningDino = (y = 0) => box(0, y + 0.8, 0.9, 1.6)
const duckingDino = () => box(0, 0.45, 1.3, 0.9)
const smallCactus = (x) => box(x, 0.5, 0.5, 1)
const largeCactus = (x) => box(x, 0.75, 0.9, 1.5)

describe('overlaps', () => {
  it('detects a cactus at the dino', () => {
    expect(overlaps(runningDino(), smallCactus(0.1))).toBe(true)
  })

  it('ignores a cactus still far away', () => {
    expect(overlaps(runningDino(), smallCactus(6))).toBe(false)
  })

  it('clears a large cactus at full jump height', () => {
    expect(overlaps(runningDino(1.8), largeCactus(0))).toBe(false)
  })

  it('does not clear a large cactus on a short hop', () => {
    expect(overlaps(runningDino(0.6), largeCactus(0))).toBe(true)
  })

  it('lets a ducking dino pass under a mid bird', () => {
    expect(overlaps(duckingDino(), box(0, 1.6, 0.9, 0.7))).toBe(false)
  })

  it('hits a mid bird when not ducking', () => {
    expect(overlaps(runningDino(), box(0, 1.6, 0.9, 0.7))).toBe(true)
  })

  it('treats exactly touching edges as a miss', () => {
    expect(overlaps(box(0, 0.8, 1, 1.6), box(1, 0.8, 1, 1.6))).toBe(false)
  })

  it('is forgiving at the edges rather than pixel exact', () => {
    const grazing = smallCactus(0.7)
    expect(overlaps(runningDino(), grazing)).toBe(false)
  })
})

describe('hitAny', () => {
  it('returns false with nothing on screen', () => {
    expect(hitAny(runningDino(), [])).toBe(false)
  })

  it('finds a hit anywhere in the list', () => {
    expect(hitAny(runningDino(), [smallCactus(20), smallCactus(9), smallCactus(0.1)])).toBe(true)
  })

  it('returns false when every obstacle is clear', () => {
    expect(hitAny(runningDino(1.9), [largeCactus(0), smallCactus(12)])).toBe(false)
  })
})
