/** Synthesised UI sounds + a night ambience (campfire crackle + crickets). Muted by default; no audio files. */
let ctx: AudioContext | null = null
let master: GainNode | null = null
let ambience: { stop: () => void } | null = null
let muted = true

function ac() {
  if (!ctx) {
    const C = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!C) return null
    ctx = new C()
    master = ctx.createGain()
    master.gain.value = 0.9
    master.connect(ctx.destination)
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

function tone(freq: number, dur: number, type: OscillatorType = 'sine', vol = 0.05, delay = 0, slideTo?: number) {
  if (muted) return
  const a = ac()
  if (!a || !master) return
  const t = a.currentTime + delay
  const o = a.createOscillator()
  const g = a.createGain()
  o.type = type
  o.frequency.setValueAtTime(freq, t)
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(vol, t + 0.01)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  o.connect(g).connect(master)
  o.start(t)
  o.stop(t + dur + 0.05)
}

function startAmbience() {
  const a = ac()
  if (!a || !master || ambience) return
  const out = a.createGain()
  out.gain.value = 0
  out.gain.linearRampToValueAtTime(0.07, a.currentTime + 2)
  out.connect(master)
  // fire roar: brown-ish noise through a lowpass
  const buf = a.createBuffer(1, a.sampleRate * 3, a.sampleRate)
  const d = buf.getChannelData(0)
  let last = 0
  for (let i = 0; i < d.length; i++) { last = last * 0.98 + (Math.random() * 2 - 1) * 0.02; d[i] = last * 7 }
  const roar = a.createBufferSource()
  roar.buffer = buf
  roar.loop = true
  const lp = a.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 380
  const rg = a.createGain()
  rg.gain.value = 0.5
  roar.connect(lp).connect(rg).connect(out)
  roar.start()
  // crackles: tiny filtered noise clicks at random moments
  const pop = (t: number, vol: number) => {
    const n = a.createBufferSource()
    const b = a.createBuffer(1, Math.floor(a.sampleRate * 0.03), a.sampleRate)
    const c = b.getChannelData(0)
    for (let i = 0; i < c.length; i++) c[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / c.length, 4)
    n.buffer = b
    const bp = a.createBiquadFilter()
    bp.type = 'bandpass'
    bp.frequency.value = 1200 + Math.random() * 2800
    const g = a.createGain()
    g.gain.value = vol
    n.connect(bp).connect(g).connect(out)
    n.start(t)
  }
  let crackleTimer = 0
  const crackle = () => {
    if (muted) return
    const now = a.currentTime
    const burst = Math.random() < 0.25 ? 3 + Math.floor(Math.random() * 4) : 1
    for (let k = 0; k < burst; k++) pop(now + k * (0.02 + Math.random() * 0.05), 0.6 + Math.random() * 1.4)
    crackleTimer = window.setTimeout(crackle, 80 + Math.random() * 500)
  }
  crackle()
  // crickets: pulsed high sine, very soft
  let cricketTimer = 0
  const cricket = () => {
    if (muted) return
    const f = 4300 + Math.random() * 500
    for (let k = 0; k < 3; k++) tone(f, 0.035, 'sine', 0.006, k * 0.06)
    cricketTimer = window.setTimeout(cricket, 700 + Math.random() * 1600)
  }
  cricketTimer = window.setTimeout(cricket, 900)
  ambience = {
    stop: () => {
      const t = a.currentTime
      clearTimeout(crackleTimer)
      clearTimeout(cricketTimer)
      out.gain.cancelScheduledValues(t)
      out.gain.setValueAtTime(out.gain.value, t)
      out.gain.linearRampToValueAtTime(0, t + 0.4)
      setTimeout(() => roar.stop(), 500)
      ambience = null
    },
  }
}

export const sfx = {
  setMuted(m: boolean) {
    muted = m
    if (m) ambience?.stop()
    else { startAmbience(); tone(660, 0.12, 'triangle', 0.05); tone(990, 0.16, 'triangle', 0.04, 0.08) }
  },
  tick: () => tone(1500, 0.04, 'triangle', 0.015),
  bloop: () => tone(520, 0.12, 'sine', 0.07, 0, 880),
  whoosh: () => { tone(220, 0.4, 'sine', 0.04, 0, 440); tone(880, 0.08, 'triangle', 0.02, 0.06) },
  enter: () => [392, 494, 587, 784].forEach((f, i) => tone(f, 0.2, 'triangle', 0.05, i * 0.1)),
  /** two soft little barks */
  woof: () => { tone(340, 0.09, 'sawtooth', 0.035, 0, 210); tone(380, 0.11, 'sawtooth', 0.035, 0.18, 230) },
}
