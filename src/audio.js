const MASTER = 0.16

export function createAudio() {
  let context = null
  let muted = false

  function ensure() {
    if (!context) context = new (window.AudioContext || window.webkitAudioContext)()
    if (context.state === 'suspended') context.resume()
    return context
  }

  function tone({ from, to, duration, type = 'square', gain = 1 }) {
    if (muted) return
    const ctx = ensure()
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const amp = ctx.createGain()

    osc.type = type
    osc.frequency.setValueAtTime(from, now)
    if (to !== from) osc.frequency.exponentialRampToValueAtTime(to, now + duration)

    amp.gain.setValueAtTime(0, now)
    amp.gain.linearRampToValueAtTime(MASTER * gain, now + 0.01)
    amp.gain.exponentialRampToValueAtTime(0.0001, now + duration)

    osc.connect(amp)
    amp.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + duration + 0.02)
  }

  return {
    jump: () => tone({ from: 300, to: 700, duration: 0.11 }),
    milestone: () => {
      tone({ from: 880, to: 880, duration: 0.07, gain: 0.7 })
      window.setTimeout(() => tone({ from: 1320, to: 1320, duration: 0.1, gain: 0.7 }), 80)
    },
    death: () => tone({ from: 420, to: 70, duration: 0.5, type: 'sawtooth', gain: 0.9 }),
    toggleMute: () => {
      muted = !muted
      return muted
    },
    get muted() { return muted }
  }
}
