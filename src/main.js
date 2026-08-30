import * as THREE from 'three'
import { MAX_DELTA } from './config.js'
import { createCameraRig } from './camera.js'
import { createScene } from './scene.js'

const canvas = document.querySelector('#game')
const { scene, renderer, resize } = createScene(canvas)

const rig = createCameraRig(window.innerWidth, window.innerHeight)
const camera = rig.camera
resize(window.innerWidth, window.innerHeight)

const cube = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1.6, 1),
  new THREE.MeshLambertMaterial({ color: '#4f8f63' })
)
cube.position.y = 0.8
cube.castShadow = true
scene.add(cube)

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
  renderer.render(scene, camera)
  requestAnimationFrame(frame)
}

requestAnimationFrame(frame)
