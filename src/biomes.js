export const BIOMES = {
  savanna: {
    label: 'Savanna',
    hint: 'orchard trees, tall grass',
    ground: '#8a9463',
    kinds: (f) => [
      { model: f.Apple_4, count: 210, scale: [0.7, 1.6], depth: [-6, -34] },
      { model: f.Orange_4, count: 180, scale: [0.7, 1.5], depth: [-6, -34] },
      { model: f.BushBerries_4, count: 165, scale: [0.6, 1.4], depth: [-5, -22] },
      { model: f.Grass_4, count: 360, scale: [0.6, 1.4], depth: [-4, -18] },
      { model: f.Flower_4, count: 180, scale: [0.7, 1.3], depth: [-4, -14] }
    ]
  },
  bamboo: {
    label: 'Bamboo',
    hint: 'leafy grove, mushrooms',
    ground: '#77804f',
    kinds: (f) => [
      { model: f.Bamboo_4, count: 780, scale: [0.7, 1.8], depth: [-5, -34], crown: { model: f.Grass_4, height: 1.75, scale: [2.6, 1.1, 2.6] } },
      { model: f.Grass_4, count: 390, scale: [0.6, 1.4], depth: [-4, -18] },
      { model: f.Mushroom_4, count: 165, scale: [0.7, 1.8], depth: [-4, -16] },
      { model: f.BushBerries_4, count: 90, scale: [0.6, 1.2], depth: [-6, -20] }
    ]
  },
  jungle: {
    label: 'Jungle',
    hint: 'palm canopy over bamboo',
    ground: '#6f7c4c',
    kinds: (f) => [
      { model: f.PalmTree_4, count: 240, scale: [0.9, 1.9], depth: [-6, -34] },
      { model: f.Bamboo_4, count: 420, scale: [0.6, 1.3], depth: [-5, -26], crown: { model: f.Grass_4, height: 1.75, scale: [2.2, 1.0, 2.2] } },
      { model: f.BushBerries_4, count: 210, scale: [0.7, 1.5], depth: [-5, -22] },
      { model: f.Grass_4, count: 300, scale: [0.7, 1.5], depth: [-4, -18] },
      { model: f.Mushroom_4, count: 90, scale: [0.7, 1.6], depth: [-4, -14] }
    ]
  },
  jurassic: {
    label: 'Jurassic',
    hint: 'palms, dry ground',
    ground: '#b9a878',
    kinds: (f) => [
      { model: f.PalmTree_4, count: 285, scale: [0.7, 1.7], depth: [-6, -34] },
      { model: f.BushBerries_4, count: 165, scale: [0.6, 1.3], depth: [-5, -20] },
      { model: f.Grass_4, count: 330, scale: [0.6, 1.4], depth: [-4, -18] },
      { model: f.Mushroom_4, count: 75, scale: [0.6, 1.2], depth: [-4, -14] }
    ]
  }
}

export const FOLIAGE = ['Apple_4', 'Orange_4', 'PalmTree_4', 'Bamboo_4', 'BushBerries_4', 'Grass_4', 'Flower_4', 'Mushroom_4']
