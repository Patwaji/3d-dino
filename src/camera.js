import * as THREE from 'three'

const BASE_POSITION = new THREE.Vector3(-5, 3.5, 9)
const BASE_TARGET = new THREE.Vector3(3, 1.2, 0)
const PUNCH_POSITION = new THREE.Vector3(-3.2, 2.6, 6.4)

export function createCameraRig(width, height) {
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 200)
  const position = BASE_POSITION.clone()
  const target = BASE_TARGET.clone()
  const desired = BASE_POSITION.clone()

  camera.position.copy(position)
  camera.lookAt(target)

  function update(delta) {
    position.lerp(desired, 1 - Math.pow(0.001, delta))
    camera.position.copy(position)
    camera.lookAt(target)
  }

  function punchIn() {
    desired.copy(PUNCH_POSITION)
  }

  function reset() {
    desired.copy(BASE_POSITION)
    position.copy(BASE_POSITION)
  }

  function resize(nextWidth, nextHeight) {
    camera.aspect = nextWidth / nextHeight
    camera.updateProjectionMatrix()
  }

  return { camera, update, punchIn, reset, resize }
}
