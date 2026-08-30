import { DESPAWN_X, SPAWN_X, SPEED_START } from './config.js'
import { SHAPES, clusterOffsets, nextGap, pickObstacle } from './spawn.js'

const FIRST_X = 18
const BIRD_BOB = 0.22
const BIRD_BOB_SPEED = 4.2
const BIRD_ROLL = 0.14

export function createObstacles(scene, assets) {
  const models = {
    small: assets.cactusSmall,
    large: assets.cactusLarge,
    bird: assets.bird
  }

  const pools = { small: [], large: [], bird: [] }
  const active = []
  let distanceToNext = 0
  let elapsed = 0

  function take(size) {
    const pooled = pools[size].pop()
    if (pooled) {
      pooled.object.visible = true
      return pooled
    }

    const object = models[size].clone()
    scene.add(object)
    return { size, object }
  }

  function place(size, x, y) {
    const item = take(size)
    item.object.position.set(x, y, 0)
    item.object.rotation.y = size === 'bird' ? Math.PI : Math.random() * Math.PI * 2
    item.baseY = y
    item.phase = Math.random() * Math.PI * 2
    active.push(item)
    return item
  }

  function spawn(score, startX) {
    const choice = pickObstacle(score, Math.random, Boolean(models.bird))

    if (choice.kind === 'bird') {
      place('bird', startX, choice.height)
      return
    }

    const offsets = clusterOffsets(choice.sizes)
    choice.sizes.forEach((size, i) => place(size, startX + offsets[i], 0))
  }

  function prefill() {
    let x = FIRST_X
    while (x < SPAWN_X) {
      spawn(0, x)
      x += nextGap(SPEED_START, Math.random)
    }
    distanceToNext = x - SPAWN_X
  }

  function update(delta, speed, score) {
    const travelled = speed * delta
    distanceToNext -= travelled

    if (distanceToNext <= 0) {
      spawn(score, SPAWN_X)
      distanceToNext = nextGap(speed, Math.random)
    }

    elapsed += delta

    for (let i = active.length - 1; i >= 0; i -= 1) {
      const item = active[i]
      item.object.position.x -= travelled

      if (item.size === 'bird') {
        const wave = elapsed * BIRD_BOB_SPEED + item.phase
        item.object.position.y = item.baseY + Math.sin(wave) * BIRD_BOB
        item.object.rotation.z = Math.sin(wave) * BIRD_ROLL
      }

      if (item.object.position.x < DESPAWN_X) {
        item.object.visible = false
        active.splice(i, 1)
        pools[item.size].push(item)
      }
    }
  }

  function boxes() {
    return active.map((item) => {
      const shape = SHAPES[item.size]
      return {
        x: item.object.position.x,
        y: (item.size === 'bird' ? item.baseY : item.object.position.y) + shape.height / 2,
        width: shape.width,
        height: shape.height
      }
    })
  }

  function reset() {
    for (const item of active) {
      item.object.visible = false
      pools[item.size].push(item)
    }
    active.length = 0
    prefill()
  }

  prefill()

  return { update, boxes, reset }
}
