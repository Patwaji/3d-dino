import * as THREE from 'three'
import { createScene } from './scene.js'

const canvas = document.querySelector('#game')
const { scene, renderer, resize } = createScene(canvas)

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 200)
camera.position.set(-5, 3.5, 9)
camera.lookAt(3, 1.2, 0)
resize(window.innerWidth, window.innerHeight, camera)

const cube = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1.6, 1),
  new THREE.MeshLambertMaterial({ color: '#4f8f63' })
)
cube.position.y = 0.8
cube.castShadow = true
scene.add(cube)

window.addEventListener('resize', () => resize(window.innerWidth, window.innerHeight, camera))

const timer = new THREE.Timer()
timer.connect(document)

function frame(timestamp) {
  timer.update(timestamp)
  renderer.render(scene, camera)
  requestAnimationFrame(frame)
}

requestAnimationFrame(frame)
