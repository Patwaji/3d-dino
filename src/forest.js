import * as THREE from 'three'

const TILE = 130
const START_X = -30

function collectParts(model) {
  const parts = []
  model.updateMatrixWorld(true)
  model.traverse((child) => {
    if (!child.isMesh) return
    parts.push({
      geometry: child.geometry,
      material: child.material,
      matrix: child.matrixWorld.clone()
    })
  })
  return parts
}

function buildTile(kinds) {
  const tile = new THREE.Group()
  const transform = new THREE.Matrix4()
  const quaternion = new THREE.Quaternion()
  const position = new THREE.Vector3()
  const scale = new THREE.Vector3()
  const combined = new THREE.Matrix4()

  for (const kind of kinds) {
    const parts = collectParts(kind.model)
    const placements = []

    for (let i = 0; i < kind.count; i += 1) {
      const size = kind.scale[0] + Math.random() * (kind.scale[1] - kind.scale[0])
      position.set(
        Math.random() * TILE,
        0,
        kind.depth[0] + Math.random() * (kind.depth[1] - kind.depth[0])
      )
      quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.random() * Math.PI * 2)
      scale.setScalar(size)
      placements.push(new THREE.Matrix4().compose(position, quaternion, scale))
    }

    for (const part of parts) {
      const mesh = new THREE.InstancedMesh(part.geometry, part.material, kind.count)
      mesh.frustumCulled = false
      for (let i = 0; i < kind.count; i += 1) {
        combined.multiplyMatrices(placements[i], part.matrix)
        mesh.setMatrixAt(i, combined)
      }
      mesh.instanceMatrix.needsUpdate = true
      tile.add(mesh)
    }
  }

  return tile
}

export function createForest(scene, kinds) {
  const tiles = [buildTile(kinds), buildTile(kinds)]
  tiles[0].position.x = START_X
  tiles[1].position.x = START_X + TILE
  for (const tile of tiles) scene.add(tile)

  function update(delta, speed) {
    const travelled = speed * delta
    for (const tile of tiles) {
      tile.position.x -= travelled
      if (tile.position.x <= START_X - TILE) tile.position.x += TILE * 2
    }
  }

  return { update }
}
