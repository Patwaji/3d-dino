import * as THREE from 'three'
import { cloneModel, findClip } from './assets.js'
import { FAST_FALL, GRAVITY, JUMP_CUT, JUMP_VELOCITY } from './config.js'

const RUN_BOX = { width: 0.9, height: 1.6 }
const DUCK_BOX = { width: 1.3, height: 0.9 }
const DUCK_SQUASH = 0.55
const FADE = 0.15

export function createPlayer(model, animations) {
  const object = cloneModel(model)
  object.rotation.y = Math.PI / 2

  const mixer = new THREE.AnimationMixer(object)
  const run = mixer.clipAction(findClip(animations, 'TRex_Run'))
  const jump = mixer.clipAction(findClip(animations, 'TRex_Jump'))
  const death = mixer.clipAction(findClip(animations, 'TRex_Death'))

  const airTime = (2 * JUMP_VELOCITY) / GRAVITY
  jump.setLoop(THREE.LoopOnce)
  jump.clampWhenFinished = true
  jump.timeScale = jump.getClip().duration / airTime

  death.setLoop(THREE.LoopOnce)
  death.clampWhenFinished = true

  let current = run
  let velocityY = 0
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
      velocityY = JUMP_VELOCITY
      state = 'jumping'
      object.scale.y = 1
      play(jump)
    }

    if (state === 'jumping') {
      if (!input.jumpHeld && velocityY > 0) velocityY *= JUMP_CUT
      velocityY -= GRAVITY * delta
      if (input.duckHeld) velocityY -= FAST_FALL * delta
      object.position.y += velocityY * delta

      if (object.position.y <= 0) {
        object.position.y = 0
        velocityY = 0
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
    object.scale.y = 1
    play(death)
  }

  function reset() {
    state = 'running'
    velocityY = 0
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
