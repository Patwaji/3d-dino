import * as THREE from 'three'
import { cloneModel, findClip } from './assets.js'
import { FALL_GRAVITY, FAST_FALL, GRAVITY, JUMP_THRUST, LAUNCH_VELOCITY, THRUST_TIME } from './config.js'

const RUN_BOX = { width: 0.9, height: 1.6 }
const DUCK_BOX = { width: 1.3, height: 0.9 }
const DUCK_SQUASH = 0.55
const FADE = 0.25

export function createPlayer(model, animations) {
  const object = cloneModel(model)
  object.rotation.y = Math.PI / 2

  const mixer = new THREE.AnimationMixer(object)
  const run = mixer.clipAction(findClip(animations, 'TRex_Run'))
  const jump = mixer.clipAction(findClip(animations, 'TRex_Jump'))
  const death = mixer.clipAction(findClip(animations, 'TRex_Death'))

  const peakVelocity = LAUNCH_VELOCITY + (JUMP_THRUST - GRAVITY) * THRUST_TIME
  const airTime = THRUST_TIME + (peakVelocity / GRAVITY) * (1 + 1 / FALL_GRAVITY)
  jump.setLoop(THREE.LoopOnce)
  jump.clampWhenFinished = true
  jump.timeScale = jump.getClip().duration / airTime

  death.setLoop(THREE.LoopOnce)
  death.clampWhenFinished = true

  let current = run
  let velocityY = 0
  let thrustLeft = 0
  let state = 'running'

  run.play()

  function play(next) {
    if (next === current) return
    next.reset()
    next.enabled = true
    next.setEffectiveWeight(1)
    next.play()
    current.crossFadeTo(next, FADE, false)
    current = next
  }

  function update(delta, input) {
    if (state === 'dead') {
      mixer.update(delta)
      return
    }

    if (state !== 'jumping' && input.jumpPressed) {
      velocityY = LAUNCH_VELOCITY
      thrustLeft = THRUST_TIME
      state = 'jumping'
      object.scale.y = 1
      play(jump)
    }

    if (state === 'jumping') {
      if (thrustLeft > 0 && input.jumpHeld) {
        const thrust = Math.min(delta, thrustLeft)
        velocityY += JUMP_THRUST * thrust
        thrustLeft -= thrust
      } else {
        thrustLeft = 0
      }

      velocityY -= GRAVITY * (velocityY <= 0 ? FALL_GRAVITY : 1) * delta
      if (input.duckHeld) velocityY -= FAST_FALL * delta
      object.position.y += velocityY * delta

      if (object.position.y <= 0) {
        object.position.y = 0
        velocityY = 0
        thrustLeft = 0
        state = 'running'
        play(run)
      }
    } else {
      state = input.duckHeld ? 'ducking' : 'running'
      object.scale.y = state === 'ducking' ? DUCK_SQUASH : 1
    }

    mixer.update(delta)
  }

  function getBox() {
    const box = state === 'ducking' ? DUCK_BOX : RUN_BOX
    return {
      x: 0,
      y: object.position.y + box.height / 2,
      width: box.width,
      height: box.height
    }
  }

  function die() {
    state = 'dead'
    velocityY = 0
    thrustLeft = 0
    object.scale.y = 1
    play(death)
  }

  function reset() {
    state = 'running'
    velocityY = 0
    thrustLeft = 0
    object.position.y = 0
    object.scale.y = 1
    play(run)
  }

  return {
    object,
    update,
    getBox,
    die,
    reset,
    get state() { return state }
  }
}
