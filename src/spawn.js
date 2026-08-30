import { BIRD_SCORE, GAP_MAX_SECONDS, GAP_MIN_SECONDS, MAX_CLUSTER } from './config.js'

const BIRD_HEIGHTS = [0.7, 1.6, 3.6]
const BIRD_CHANCE = 0.25
const LARGE_CHANCE = 0.4

export function nextGap(speed, random) {
  return speed * (GAP_MIN_SECONDS + random() * (GAP_MAX_SECONDS - GAP_MIN_SECONDS))
}

export function pickObstacle(score, random) {
  if (score >= BIRD_SCORE && random() < BIRD_CHANCE) {
    return { kind: 'bird', count: 1, height: BIRD_HEIGHTS[Math.floor(random() * BIRD_HEIGHTS.length)] }
  }

  const count = 1 + Math.floor(random() * MAX_CLUSTER)
  const sizes = []
  for (let i = 0; i < count; i += 1) sizes.push(random() < LARGE_CHANCE ? 'large' : 'small')
  return { kind: 'cactus', count, sizes, height: 0 }
}
