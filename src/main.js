import * as THREE from 'three'
import { MAX_DELTA } from './config.js'
import { createCameraRig } from './camera.js'
import { createScene } from './scene.js'
import { cloneModel, findClip, loadAssets } from './assets.js'

const canvas = document.querySelector('#game')
const { scene, renderer, resize } = createScene(canvas)

const rig = createCameraRig(window.innerWidth, window.innerHeight)
const camera = rig.camera
resize(window.innerWidth, window.innerHeight)

const mixers = []

loadAssets().then((assets) => {
  const dino = cloneModel(assets.dino.object)
  dino.rotation.y = Math.PI / 2
  scene.add(dino)

  const mixer = new THREE.AnimationMixer(dino)
  mixer.clipAction(findClip(assets.dino.animations, 'TRex_Run')).play()
  mixers.push(mixer)
})

window.addEventListener('resize', () => {
  rig.resize(window.innerWidth, window.innerHeight)
  resize(window.innerWidth, window.innerHeight)
})

const timer = new THREE.Timer()
timer.connect(document)

function frame(timestamp) {
  timer.update(timestamp)
  const delta = Math.min(timer.getDelta(), MAX_DELTA)
  rig.update(delta)
  for (const mixer of mixers) mixer.update(delta)
  renderer.render(scene, camera)
  requestAnimationFrame(frame)
}

requestAnimationFrame(frame)
