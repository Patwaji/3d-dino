import { describe, expect, it } from 'vitest'
import { SHAPES, clusterOffsets, clusterWidth, nextGap, pickObstacle } from '../src/spawn.js'
import {
  BIRD_SCORE,
  SPEED_START,
  FALL_GRAVITY,
  GAP_MAX_SECONDS,
  GAP_MIN_SECONDS,
  GRAVITY,
  JUMP_THRUST,
  LAUNCH_VELOCITY,
  MAX_CLUSTER,
  MAX_OBSTACLE_WIDTH,
  SPEED_MAX,
  THRUST_TIME
} from '../src/config.js'

function airTime() {
  const peakVelocity = LAUNCH_VELOCITY + (JUMP_THRUST - GRAVITY) * THRUST_TIME
  const riseTime = THRUST_TIME + peakVelocity / GRAVITY
  const peak = (peakVelocity * peakVelocity) / (2 * GRAVITY) + LAUNCH_VELOCITY * THRUST_TIME
  return riseTime + Math.sqrt((2 * peak) / (GRAVITY * FALL_GRAVITY))
}

describe('nextGap', () => {
  it('leaves room to clear the widest cluster and land at max speed', () => {
    const clusterSeconds = MAX_OBSTACLE_WIDTH / SPEED_MAX
    for (let i = 0; i < 500; i += 1) {
      const gapSeconds = nextGap(SPEED_MAX, Math.random) / SPEED_MAX
      expect(gapSeconds - clusterSeconds).toBeGreaterThan(airTime())
    }
  })

  it('scales with speed so the rhythm is constant', () => {
    expect(nextGap(12, () => 0.5) / 12).toBeCloseTo(nextGap(6, () => 0.5) / 6)
  })

  it('stays within the configured window', () => {
    expect(nextGap(10, () => 0)).toBeCloseTo(10 * GAP_MIN_SECONDS)
    expect(nextGap(10, () => 0.999999)).toBeCloseTo(10 * GAP_MAX_SECONDS)
  })
})

const DINO_WIDTH = 0.9
const FORGIVENESS = 0.85

function jumpPeak() {
  const peakVelocity = LAUNCH_VELOCITY + (JUMP_THRUST - GRAVITY) * THRUST_TIME
  return (
    LAUNCH_VELOCITY * THRUST_TIME +
    0.5 * (JUMP_THRUST - GRAVITY) * THRUST_TIME * THRUST_TIME +
    (peakVelocity * peakVelocity) / (2 * GRAVITY)
  )
}

function secondsAbove(height) {
  const peak = jumpPeak()
  if (peak <= height) return 0
  return 2 * Math.sqrt((2 * (peak - height)) / (GRAVITY * FALL_GRAVITY))
}

function secondsNeededOver(sizes, height, speed) {
  const offsets = clusterOffsets(sizes)
  const indices = sizes.map((size, i) => (SHAPES[size].height >= height ? i : -1)).filter((i) => i >= 0)
  if (!indices.length) return 0
  const first = indices[0]
  const last = indices[indices.length - 1]
  const span = offsets[last] - offsets[first]
  const overlap = (DINO_WIDTH + SHAPES[sizes[first]].width) * FORGIVENESS
  return (span + overlap) / speed
}

describe('cluster clearability', () => {
  it('never puts more than one large cactus in a cluster', () => {
    for (let i = 0; i < 2000; i += 1) {
      const obstacle = pickObstacle(0, Math.random)
      if (obstacle.kind !== 'cactus') continue
      const larges = obstacle.sizes.filter((size) => size === 'large').length
      expect(larges).toBeLessThanOrEqual(1)
    }
  })

  it('generates only clusters a single jump can clear at starting speed', () => {
    for (let i = 0; i < 2000; i += 1) {
      const obstacle = pickObstacle(0, Math.random)
      if (obstacle.kind !== 'cactus') continue
      for (const height of [1, 1.5]) {
        const needed = secondsNeededOver(obstacle.sizes, height, SPEED_START)
        if (needed === 0) continue
        expect(secondsAbove(height)).toBeGreaterThan(needed)
      }
    }
  })

  it('confirms two large cacti in one cluster would be unclearable', () => {
    const needed = secondsNeededOver(['large', 'large'], 1.5, SPEED_START)
    expect(secondsAbove(1.5)).toBeLessThan(needed)
  })

  it('stays within the width the spacing test assumes', () => {
    for (let i = 0; i < 2000; i += 1) {
      const obstacle = pickObstacle(0, Math.random)
      if (obstacle.kind !== 'cactus') continue
      expect(clusterWidth(obstacle.sizes)).toBeLessThanOrEqual(MAX_OBSTACLE_WIDTH)
    }
  })
})

describe('pickObstacle', () => {
  it('never spawns birds before the threshold', () => {
    for (let i = 0; i < 300; i += 1) {
      expect(pickObstacle(BIRD_SCORE - 1, Math.random).kind).toBe('cactus')
    }
  })

  it('spawns birds once past the threshold', () => {
    const kinds = new Set()
    for (let i = 0; i < 500; i += 1) kinds.add(pickObstacle(BIRD_SCORE + 100, Math.random).kind)
    expect(kinds.has('bird')).toBe(true)
  })

  it('keeps cactus clusters within the configured maximum', () => {
    for (let i = 0; i < 300; i += 1) {
      const obstacle = pickObstacle(0, Math.random)
      expect(obstacle.count).toBeGreaterThanOrEqual(1)
      expect(obstacle.count).toBeLessThanOrEqual(MAX_CLUSTER)
      expect(obstacle.sizes).toHaveLength(obstacle.count)
    }
  })

  it('gives every bird a reachable height', () => {
    for (let i = 0; i < 300; i += 1) {
      const obstacle = pickObstacle(BIRD_SCORE + 100, Math.random)
      if (obstacle.kind === 'bird') expect(obstacle.height).toBeGreaterThan(0)
    }
  })
})
