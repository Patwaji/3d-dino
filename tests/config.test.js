import { describe, it, expect } from 'vitest'
import { GAP_MIN_SECONDS, GRAVITY, JUMP_VELOCITY, SPEED_MAX, SPEED_START } from '../src/config.js'

describe('config', () => {
  it('caps speed above the starting speed', () => {
    expect(SPEED_MAX).toBeGreaterThan(SPEED_START)
  })

  it('leaves room to land between obstacles at max speed', () => {
    const airTime = (2 * JUMP_VELOCITY) / GRAVITY
    expect(GAP_MIN_SECONDS).toBeGreaterThan(airTime)
  })
})
