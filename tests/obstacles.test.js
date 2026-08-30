import { describe, expect, it } from 'vitest'
import { createObstacles } from '../src/obstacles.js'
import { BIRD_SCORE, SPEED_MAX } from '../src/config.js'

function fakeModel() {
  return {
    clone() {
      return {
        visible: true,
        position: { x: 0, y: 0, set(x, y, z) { this.x = x; this.y = y; this.z = z } },
        rotation: { y: 0 }
      }
    }
  }
}

function makeObstacles({ withBird }) {
  const scene = { add() {} }
  const assets = {
    cactusSmall: fakeModel(),
    cactusLarge: fakeModel(),
    bird: withBird ? fakeModel() : undefined
  }
  return createObstacles(scene, assets)
}

function run(obstacles, score, seconds = 120) {
  for (let i = 0; i < seconds * 60; i += 1) {
    obstacles.update(1 / 60, SPEED_MAX, score)
  }
}

describe('createObstacles', () => {
  it('survives scores past the bird threshold without a bird model', () => {
    const obstacles = makeObstacles({ withBird: false })
    expect(() => run(obstacles, BIRD_SCORE + 500)).not.toThrow()
  })

  it('survives scores past the bird threshold with a bird model', () => {
    const obstacles = makeObstacles({ withBird: true })
    expect(() => run(obstacles, BIRD_SCORE + 500)).not.toThrow()
  })

  it('recycles instead of growing without bound', () => {
    const obstacles = makeObstacles({ withBird: false })
    run(obstacles, 0, 30)
    const early = obstacles.boxes().length
    run(obstacles, 0, 300)
    expect(obstacles.boxes().length).toBeLessThanOrEqual(early + 6)
  })

  it('clears everything on reset', () => {
    const obstacles = makeObstacles({ withBird: false })
    run(obstacles, 0, 20)
    obstacles.reset()
    expect(obstacles.boxes().every((b) => b.x > 0)).toBe(true)
  })
})
