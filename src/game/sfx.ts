/** Tiny chiptune-ish sound effects synthesised with WebAudio (no audio files). */
let ctx: AudioContext | null = null

function ac() {
  if (!ctx) {
    const C = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!C) return null
    ctx = new C()
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

function tone(freq: number, dur: number, type: OscillatorType = 'square', vol = 0.05, delay = 0, slideTo?: number) {
  if (sfx.muted) return
  const a = ac()
  if (!a) return
  const t = a.currentTime + delay
  const o = a.createOscillator()
  const g = a.createGain()
  o.type = type
  o.frequency.setValueAtTime(freq, t)
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur)
  g.gain.setValueAtTime(vol, t)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  o.connect(g).connect(a.destination)
  o.start(t)
  o.stop(t + dur + 0.02)
}

export const sfx = {
  muted: false,
  blip: (f = 880, d = 0.06) => tone(f, d, 'square', 0.035),
  jump: () => tone(300, 0.18, 'square', 0.03, 0, 700),
  open: () => { tone(523, 0.08); tone(784, 0.12, 'square', 0.05, 0.08) },
  start: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.12, 'square', 0.045, i * 0.09)),
  encounter: () => [880, 660, 880, 660, 988, 740, 988, 740].forEach((f, i) => tone(f, 0.07, 'square', 0.04, i * 0.065)),
  hit: () => { tone(200, 0.25, 'sawtooth', 0.05, 0, 60); tone(1200, 0.1, 'square', 0.03, 0.05) },
  win: () => [784, 988, 1175, 1568].forEach((f, i) => tone(f, 0.14, 'triangle', 0.06, i * 0.11)),
}
