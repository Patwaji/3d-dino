import * as THREE from 'three'
import { MAX_DELTA } from './config.js'
import { createCameraRig } from './camera.js'
import { createScene } from './scene.js'
import { cloneModel, findClip, loadAssets, loadFoliage } from './assets.js'
import { createForest } from './forest.js'
import { BIOMES, FOLIAGE } from './biomes.js'
import { pickBiome, showLoading } from './menu.js'
import { createInput } from './input.js'

const canvas = document.querySelector('#game')
const { scene, renderer, resize, setGround } = createScene(canvas)

const rig = createCameraRig(window.innerWidth, window.innerHeight)
const camera = rig.camera
resize(window.innerWidth, window.innerHeight)

const input = createInput()
const mixers = []
let forest = null

async function boot() {
  const [assets, foliage] = await Promise.all([loadAssets(), loadFoliage(FOLIAGE)])
  showLoading(false)

  const dino = cloneModel(assets.dino.object)
  dino.rotation.y = Math.PI / 2
  scene.add(dino)

  const mixer = new THREE.AnimationMixer(dino)
  mixer.clipAction(findClip(assets.dino.animations, 'TRex_Run')).play()
  mixers.push(mixer)

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
  for (const mixer of mixers) mixer.update(delta)
  if (forest) forest.update(delta, 6)
  renderer.render(scene, camera)
  input.consume()
  requestAnimationFrame(frame)
}

requestAnimationFrame(frame)
