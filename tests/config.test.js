import { describe, it, expect } from 'vitest'
import { FALL_GRAVITY, GAP_MIN_SECONDS, GRAVITY, JUMP_THRUST, LAUNCH_VELOCITY, SPEED_MAX, SPEED_START, THRUST_TIME } from '../src/config.js'

describe('config', () => {
  it('caps speed above the starting speed', () => {
    expect(SPEED_MAX).toBeGreaterThan(SPEED_START)
  })

  it('leaves room to land between obstacles at max speed', () => {
    const peakVelocity = LAUNCH_VELOCITY + (JUMP_THRUST - GRAVITY) * THRUST_TIME
    const riseTime = THRUST_TIME + peakVelocity / GRAVITY
    const peak = peakVelocity * peakVelocity / (2 * GRAVITY) + LAUNCH_VELOCITY * THRUST_TIME
    const fallTime = Math.sqrt((2 * peak) / (GRAVITY * FALL_GRAVITY))
    expect(GAP_MIN_SECONDS).toBeGreaterThan(riseTime + fallTime)
  })

  it('thrust outlasts a single frame so the launch ramps', () => {
    expect(THRUST_TIME).toBeGreaterThan(0.05)
  })
})
