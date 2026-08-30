import * as THREE from 'three'
import { MAX_DELTA, SPEED_START } from './config.js'
import { createCameraRig } from './camera.js'
import { createScene } from './scene.js'
import { loadAssets, loadFoliage } from './assets.js'
import { createForest } from './forest.js'
import { BIOMES, FOLIAGE } from './biomes.js'
import { pickBiome, showLoading } from './menu.js'
import { createInput } from './input.js'
import { createPlayer } from './player.js'

const canvas = document.querySelector('#game')
const { scene, renderer, resize, setGround } = createScene(canvas)

const rig = createCameraRig(window.innerWidth, window.innerHeight)
const camera = rig.camera
resize(window.innerWidth, window.innerHeight)

const input = createInput()
let player = null
let forest = null
let speed = SPEED_START

async function boot() {
  const [assets, foliage] = await Promise.all([loadAssets(), loadFoliage(FOLIAGE)])
  showLoading(false)

  player = createPlayer(assets.dino.object, assets.dino.animations)
  scene.add(player.object)

  const biome = BIOMES[await pickBiome()]
  setGround(biome.ground)
  forest = createForest(scene, biome.kinds(foliage))
}

boot()

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
  if (player) player.update(delta, input)
  if (forest) forest.update(delta, speed)
  renderer.render(scene, camera)
  input.consume()
  requestAnimationFrame(frame)
}

requestAnimationFrame(frame)
