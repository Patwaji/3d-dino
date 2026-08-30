import * as THREE from 'three'
import { MAX_DELTA } from './config.js'
import { createCameraRig } from './camera.js'
import { createScene } from './scene.js'
import { loadAssets, loadFoliage } from './assets.js'
import { createForest } from './forest.js'
import { BIOMES, FOLIAGE } from './biomes.js'
import { pickBiome, showLoading } from './menu.js'
import { createInput } from './input.js'
import { createPlayer } from './player.js'
import { createObstacles } from './obstacles.js'
import { createGame } from './game.js'
import { createScore } from './score.js'
import { createUI } from './ui.js'
import { createAudio } from './audio.js'

const probe = document.createElement('canvas')
if (!probe.getContext('webgl2') && !probe.getContext('webgl')) {
  document.body.innerHTML = '<p style="font:500 14px/1.6 ui-monospace,monospace;padding:48px;color:#3f3b2e;letter-spacing:.1em">this game needs WebGL, which this browser does not support</p>'
  throw new Error('no webgl')
}

const canvas = document.querySelector('#game')
const { scene, renderer, resize, setGround, setNight, updateSky } = createScene(canvas)

const rig = createCameraRig(window.innerWidth, window.innerHeight)
const camera = rig.camera
resize(window.innerWidth, window.innerHeight)

const input = createInput()
const ui = createUI()
const score = createScore(window.localStorage)
const audio = createAudio()
let game = null

async function boot() {
  const [assets, foliage] = await Promise.all([loadAssets(), loadFoliage(FOLIAGE)])
  showLoading(false)

  const player = createPlayer(assets.dino.object, assets.dino.animations)
  scene.add(player.object)

  const biome = BIOMES[await pickBiome()]
  setGround(biome.ground)
  const forest = createForest(scene, biome.kinds(foliage))
  const obstacles = createObstacles(scene, assets)

  ui.show()
  ui.setScore(0, score.high)
  game = createGame({ player, obstacles, forest, rig, input, score, ui, sky: { setNight }, audio })
}

boot()

window.addEventListener('keydown', (event) => {
  if (event.code === 'KeyM') ui.setMuted(audio.toggleMute())
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
  if (game) game.update(delta)
  updateSky(delta)
  rig.update(delta)
  renderer.render(scene, camera)
  input.consume()
  requestAnimationFrame(frame)
}

requestAnimationFrame(frame)
