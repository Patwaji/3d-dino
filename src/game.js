import { hitAny } from './collision.js'
import { SPEED_ACCEL, SPEED_MAX, SPEED_START } from './config.js'

export function createGame({ player, obstacles, forest, rig, input }) {
  let state = 'playing'
  let speed = SPEED_START
  let distance = 0

  function start() {
    state = 'playing'
    speed = SPEED_START
    distance = 0
    player.reset()
    obstacles.reset()
    rig.reset()
  }

  function update(delta) {
    if (state === 'gameover') {
      player.update(delta, input)
      if (input.anyPressed) start()
      return
    }

    speed = Math.min(speed + SPEED_ACCEL * delta, SPEED_MAX)
    distance += speed * delta

    forest.update(delta, speed)
    obstacles.update(delta, speed, 0)
    player.update(delta, input)

    if (hitAny(player.getBox(), obstacles.boxes())) {
      state = 'gameover'
      player.die()
      rig.punchIn()
    }
  }

  return {
    update,
    restart: start,
    get state() { return state },
    get speed() { return speed },
    get distance() { return distance }
  }
}
