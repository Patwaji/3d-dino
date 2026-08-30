import { describe, expect, it } from 'vitest'
import { nextGap, pickObstacle } from '../src/spawn.js'
import {
  BIRD_SCORE,
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
