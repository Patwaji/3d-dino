import { BIRD_SCORE, CLUSTER_SPACING, GAP_MAX_SECONDS, GAP_MIN_SECONDS, MAX_CLUSTER } from './config.js'

export const SHAPES = {
  small: { visual: 0.55, width: 0.5, height: 1 },
  large: { visual: 1.37, width: 0.9, height: 1.5 },
  bird: { visual: 1, width: 0.9, height: 0.7 }
}

export function clusterOffsets(sizes) {
  const offsets = []
  let x = 0
  for (const size of sizes) {
    offsets.push(x)
    x += SHAPES[size].visual / 2 + CLUSTER_SPACING / 2
  }
  return offsets
}

export function clusterWidth(sizes) {
  const offsets = clusterOffsets(sizes)
  const last = sizes[sizes.length - 1]
  return offsets[offsets.length - 1] + SHAPES[last].width / 2 + SHAPES[sizes[0]].width / 2
}

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
  const largeAllowed = MAX_CLUSTER - count
  const sizes = []
  let larges = 0

  for (let i = 0; i < count; i += 1) {
    const large = larges < largeAllowed && random() < LARGE_CHANCE
    if (large) larges += 1
    sizes.push(large ? 'large' : 'small')
  }

  return { kind: 'cactus', count, sizes, height: 0 }
}
