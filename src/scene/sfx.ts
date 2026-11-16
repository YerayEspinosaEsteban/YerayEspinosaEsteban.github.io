/** Synthesised UI sounds + a soft server-room ambience. Muted by default; no audio files. */
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
  out.gain.linearRampToValueAtTime(0.05, a.currentTime + 2)
  const lp = a.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 420
  lp.connect(out).connect(master)
  // low server hum: two detuned saws through a lowpass
  const oscs = [55, 55.4, 110.3].map((f) => {
    const o = a.createOscillator()
    o.type = 'sawtooth'
    o.frequency.value = f
    const g = a.createGain()
    g.gain.value = f > 100 ? 0.12 : 0.3
    o.connect(g).connect(lp)
    o.start()
    return o
  })
  // airy fan noise
  const buf = a.createBuffer(1, a.sampleRate * 2, a.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  const noise = a.createBufferSource()
  noise.buffer = buf
  noise.loop = true
  const bp = a.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.value = 900
  bp.Q.value = 0.6
  const ng = a.createGain()
  ng.gain.value = 0.35
  noise.connect(bp).connect(ng).connect(out)
  noise.start()
  ambience = {
    stop: () => {
      const t = a.currentTime
      out.gain.cancelScheduledValues(t)
      out.gain.setValueAtTime(out.gain.value, t)
      out.gain.linearRampToValueAtTime(0, t + 0.4)
      setTimeout(() => { oscs.forEach((o) => o.stop()); noise.stop() }, 500)
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
  tick: () => tone(1800, 0.03, 'square', 0.012),
  bloop: () => tone(520, 0.12, 'sine', 0.07, 0, 880),
  whoosh: () => { tone(180, 0.5, 'sine', 0.05, 0, 520); tone(1200, 0.06, 'triangle', 0.025, 0.05) },
  enter: () => [392, 523, 659, 784].forEach((f, i) => tone(f, 0.18, 'triangle', 0.05, i * 0.08)),
}
