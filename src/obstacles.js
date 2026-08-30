import { CLUSTER_SPACING, DESPAWN_X, SPAWN_X, SPEED_START } from './config.js'
import { nextGap, pickObstacle } from './spawn.js'

const FIRST_X = 18

const SHAPES = {
  small: { visual: 0.55, width: 0.5, height: 1 },
  large: { visual: 1.37, width: 0.9, height: 1.5 },
  bird: { visual: 1, width: 0.9, height: 0.7 }
}

export function createObstacles(scene, assets) {
  const models = {
    small: assets.cactusSmall,
    large: assets.cactusLarge,
    bird: assets.bird
  }

  const pools = { small: [], large: [], bird: [] }
  const active = []
  let distanceToNext = 0

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
    item.object.rotation.y = Math.random() * Math.PI * 2
    active.push(item)
    return item
  }

  function spawn(score, startX) {
    const choice = pickObstacle(score, Math.random)

    if (choice.kind === 'bird' && models.bird) {
      place('bird', startX, choice.height)
      return
    }

    let x = startX
    for (const size of choice.sizes) {
      place(size, x, 0)
      x += SHAPES[size].visual / 2 + CLUSTER_SPACING / 2
    }
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

    for (let i = active.length - 1; i >= 0; i -= 1) {
      const item = active[i]
      item.object.position.x -= travelled
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
        y: item.object.position.y + shape.height / 2,
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
