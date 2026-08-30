import * as THREE from 'three'

const DAY = {
  sky: new THREE.Color('#dfe6e2'),
  sun: new THREE.Color('#fff4e0'),
  sunIntensity: 1.7,
  hemiSky: new THREE.Color('#ffffff'),
  hemiGround: new THREE.Color('#8d8163'),
  hemiIntensity: 0.9
}

const NIGHT = {
  sky: new THREE.Color('#333b30'),
  sun: new THREE.Color('#c8d2bd'),
  sunIntensity: 0.55,
  hemiSky: new THREE.Color('#9fb0a4'),
  hemiGround: new THREE.Color('#2a2b22'),
  hemiIntensity: 0.34
}

export function createScene(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFShadowMap

  const scene = new THREE.Scene()
  scene.background = new THREE.Color('#dfe6e2')
  scene.fog = new THREE.Fog('#dfe6e2', 35, 70)

  const hemi = new THREE.HemisphereLight('#ffffff', '#8d8163', 0.9)
  scene.add(hemi)

  const sun = new THREE.DirectionalLight('#fff4e0', 1.7)
  sun.position.set(8, 14, 10)
  sun.castShadow = true
  sun.shadow.mapSize.set(2048, 2048)
  sun.shadow.camera.left = -12
  sun.shadow.camera.right = 20
  sun.shadow.camera.top = 12
  sun.shadow.camera.bottom = -8
  sun.shadow.camera.near = 1
  sun.shadow.camera.far = 45
  sun.shadow.bias = -0.0008
  scene.add(sun)
  scene.add(sun.target)

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(400, 200),
    new THREE.MeshLambertMaterial({ color: '#cbbb99' })
  )
  ground.rotation.x = -Math.PI / 2
  ground.position.x = 40
  ground.receiveShadow = true
  scene.add(ground)

  let blend = 0
  let target = 0

  function setNight(isNight) {
    target = isNight ? 1 : 0
  }

  function updateSky(delta) {
    if (blend === target) return
    blend += (target - blend) * (1 - Math.pow(0.08, delta))
    if (Math.abs(target - blend) < 0.002) blend = target

    scene.background.lerpColors(DAY.sky, NIGHT.sky, blend)
    scene.fog.color.copy(scene.background)
    sun.color.lerpColors(DAY.sun, NIGHT.sun, blend)
    sun.intensity = DAY.sunIntensity + (NIGHT.sunIntensity - DAY.sunIntensity) * blend
    hemi.color.lerpColors(DAY.hemiSky, NIGHT.hemiSky, blend)
    hemi.groundColor.lerpColors(DAY.hemiGround, NIGHT.hemiGround, blend)
    hemi.intensity = DAY.hemiIntensity + (NIGHT.hemiIntensity - DAY.hemiIntensity) * blend
  }

  function setGround(color) {
    ground.material.color.set(color)
  }

  function resize(width, height) {
    renderer.setSize(width, height)
  }

  return { scene, renderer, sun, hemi, setGround, setNight, updateSky, resize }
}
