import { BIOMES } from './biomes.js'

export function showLoading(visible) {
  document.querySelector('#loading').hidden = !visible
}

export function pickBiome() {
  const menu = document.querySelector('#menu')
  const list = document.querySelector('#menu-list')
  const keys = Object.keys(BIOMES)

  keys.forEach((key, index) => {
    const item = document.createElement('li')
    const button = document.createElement('button')
    button.dataset.biome = key
    button.innerHTML = `<span class="index">${index + 1}</span>${BIOMES[key].label}<span class="hint">${BIOMES[key].hint}</span>`
    item.append(button)
    list.append(item)
  })

  menu.hidden = false

  return new Promise((resolve) => {
    function choose(key) {
      if (!key) return
      window.removeEventListener('keydown', onKey)
      menu.hidden = true
      resolve(key)
    }

    function onKey(event) {
      const index = Number(event.key) - 1
      if (keys[index]) choose(keys[index])
    }

    list.addEventListener('click', (event) => {
      const button = event.target.closest('button')
      if (button) choose(button.dataset.biome)
    })

    window.addEventListener('keydown', onKey)
  })
}
