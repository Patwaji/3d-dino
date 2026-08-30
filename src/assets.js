import * as THREE from 'three'
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js'
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js'
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js'
import { clone as cloneSkeleton } from 'three/addons/utils/SkeletonUtils.js'
import { CACTUS_LARGE_HEIGHT, CACTUS_SMALL_HEIGHT, DINO_HEIGHT } from './config.js'

const CACTUS_COLOR = '#2b4630'

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
  const steps = 3
  let done = 0

  const step = (value) => {
    done += 1
    if (onProgress) onProgress(done / steps)
    return value
  }

  const dino = step(await fbx.loadAsync('/models/dino.fbx'))
  const cactusSmall = step(await obj.loadAsync('/models/cactus-small.obj'))
  const cactusLarge = step(await obj.loadAsync('/models/cactus-large.obj'))

  return {
    dino: {
      object: prepare(normalize(dino, DINO_HEIGHT)),
      animations: dino.animations
    },
    cactusSmall: prepare(normalize(cactusSmall, CACTUS_SMALL_HEIGHT), cactusMaterial),
    cactusLarge: prepare(normalize(cactusLarge, CACTUS_LARGE_HEIGHT), cactusMaterial)
  }
}
