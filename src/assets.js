import * as THREE from 'three'
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js'
import { clone as cloneSkeleton } from 'three/addons/utils/SkeletonUtils.js'
import { CACTUS_LARGE_HEIGHT, CACTUS_SMALL_HEIGHT, DINO_HEIGHT } from './config.js'

const CACTUS_COLOR = '#2b4630'
const BIRD_HEIGHT = 1.2

function mergeByMaterial(root) {
  const groups = new Map()
  root.updateMatrixWorld(true)

  root.traverse((child) => {
    if (!child.isMesh) return
    const materials = Array.isArray(child.material) ? child.material : [child.material]
    const key = materials[0].uuid
    const geometry = child.geometry.clone()
    geometry.applyMatrix4(child.matrixWorld)
    for (const name of Object.keys(geometry.attributes)) {
      if (name !== 'position' && name !== 'normal') geometry.deleteAttribute(name)
    }
    if (!groups.has(key)) groups.set(key, { material: materials[0], geometries: [] })
    groups.get(key).geometries.push(geometry)
  })

  const merged = new THREE.Group()
  for (const { material, geometries } of groups.values()) {
    const geometry = geometries.length === 1 ? geometries[0] : mergeGeometries(geometries)
    merged.add(new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ color: material.color })))
  }
  return merged
}

function normalize(object, targetHeight) {
  const box = new THREE.Box3().setFromObject(object)
  const scale = targetHeight / box.getSize(new THREE.Vector3()).y
  object.scale.setScalar(scale)
  object.position.y = -box.min.y * scale

  const group = new THREE.Group()
  group.add(object)
  return group
}

function prepare(object, material) {
  object.traverse((child) => {
    if (!child.isMesh) return
    child.castShadow = true
    if (material) child.material = material
  })
  return object
}

export function findClip(animations, suffix) {
  return animations.find((clip) => clip.name.endsWith(suffix))
}

export function cloneModel(model) {
  const root = cloneSkeleton(model)
  root.traverse((child) => {
    if (child.isMesh) child.castShadow = true
  })
  return root
}

export async function loadFoliage(names) {
  const mtl = new MTLLoader().setPath('/models/foliage/')
  const obj = new OBJLoader().setPath('/models/foliage/')
  const loaded = {}

  for (const name of names) {
    const materials = await mtl.loadAsync(`${name}.mtl`)
    materials.preload()
    const object = await obj.setMaterials(materials).loadAsync(`${name}.obj`)
    object.traverse((child) => {
      if (!child.isMesh) return
      const source = Array.isArray(child.material) ? child.material : [child.material]
      const converted = source.map((item) => new THREE.MeshLambertMaterial({
        color: item.color.clone().convertLinearToSRGB()
      }))
      child.material = converted.length === 1 ? converted[0] : converted
    })
    loaded[name] = object
  }

  return loaded
}

export async function loadAssets(onProgress) {
  const fbx = new FBXLoader()
  const obj = new OBJLoader()
  const cactusMaterial = new THREE.MeshLambertMaterial({ color: CACTUS_COLOR })
  const steps = 4
  let done = 0

  const step = (value) => {
    done += 1
    if (onProgress) onProgress(done / steps)
    return value
  }

  const gltf = new GLTFLoader()
  const dino = step(await fbx.loadAsync('/models/dino.fbx'))
  const bird = mergeByMaterial((await gltf.loadAsync('/models/bird.glb')).scene)
  const cactusSmall = step(await obj.loadAsync('/models/cactus-small.obj'))
  const cactusLarge = step(await obj.loadAsync('/models/cactus-large.obj'))

  return {
    dino: {
      object: prepare(normalize(dino, DINO_HEIGHT)),
      animations: dino.animations
    },
    cactusSmall: prepare(normalize(cactusSmall, CACTUS_SMALL_HEIGHT), cactusMaterial),
    cactusLarge: prepare(normalize(cactusLarge, CACTUS_LARGE_HEIGHT), cactusMaterial),
    bird: prepare(normalize(bird, BIRD_HEIGHT))
  }
}
