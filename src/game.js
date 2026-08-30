import { hitAny } from './collision.js'
import { isNight } from './score.js'
import { SPEED_ACCEL, SPEED_MAX, SPEED_START } from './config.js'

export function createGame({ player, obstacles, forest, rig, input, score, ui, sky }) {
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
    score.reset()
    sky.setNight(false)
    ui.setNight(false)
    ui.hideGameOver()
    ui.setScore(0, score.high)
  }

  function update(delta) {
    if (state === 'gameover') {
      player.update(delta, input)
      if (input.anyPressed) start()
      return
    }

    speed = Math.min(speed + SPEED_ACCEL * delta, SPEED_MAX)
    distance += speed * delta

    score.add(speed * delta)
    ui.setScore(score.value, score.high)
    const night = isNight(score.value)
    sky.setNight(night)
    ui.setNight(night)

    forest.update(delta, speed)
    obstacles.update(delta, speed, score.value)
    player.update(delta, input)

    if (hitAny(player.getBox(), obstacles.boxes())) {
      state = 'gameover'
      player.die()
      rig.punchIn()
      ui.showGameOver()
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
