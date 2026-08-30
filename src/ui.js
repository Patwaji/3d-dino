export function createUI() {
  const hud = document.querySelector('#hud')
  const scoreEl = document.querySelector('#score')
  const highEl = document.querySelector('#high')
  const gameOverEl = document.querySelector('#gameover')

  function setScore(value, high) {
    scoreEl.textContent = String(value).padStart(5, '0')
    highEl.textContent = high > 0 ? `hi ${String(high).padStart(5, '0')}` : ''
  }

  return {
    setScore,
    show: () => { hud.hidden = false },
    showGameOver: () => { gameOverEl.hidden = false },
    hideGameOver: () => { gameOverEl.hidden = true }
  }
}
