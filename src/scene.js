import * as THREE from 'three'

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

  function resize(width, height) {
    renderer.setSize(width, height)
  }

  return { scene, renderer, sun, hemi, resize }
}
