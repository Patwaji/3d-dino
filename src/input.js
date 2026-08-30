const JUMP_KEYS = ['Space', 'ArrowUp', 'KeyW']
const DUCK_KEYS = ['ArrowDown', 'KeyS']

export function createInput() {
  const state = {
    jumpPressed: false,
    jumpHeld: false,
    duckHeld: false,
    anyPressed: false
  }

  function press(code) {
    if (JUMP_KEYS.includes(code)) {
      if (!state.jumpHeld) state.jumpPressed = true
      state.jumpHeld = true
    }
    if (DUCK_KEYS.includes(code)) state.duckHeld = true
    state.anyPressed = true
  }

  function release(code) {
    if (JUMP_KEYS.includes(code)) state.jumpHeld = false
    if (DUCK_KEYS.includes(code)) state.duckHeld = false
  }

  window.addEventListener('keydown', (event) => {
    if (JUMP_KEYS.includes(event.code) || DUCK_KEYS.includes(event.code)) event.preventDefault()
    press(event.code)
  })

  window.addEventListener('keyup', (event) => release(event.code))

  window.addEventListener('touchstart', (event) => {
    press(event.touches[0].clientY > window.innerHeight / 2 ? 'ArrowDown' : 'Space')
  }, { passive: true })

  window.addEventListener('touchend', () => {
    release('Space')
    release('ArrowDown')
  })

  window.addEventListener('blur', () => {
    state.jumpHeld = false
    state.duckHeld = false
  })

  state.consume = () => {
    state.jumpPressed = false
    state.anyPressed = false
  }

  return state
}
