import * as THREE from 'three'

/**
 * Procedural PBR-ish texture sets painted on <canvas> at runtime (no image files):
 * every generator writes colour, height (→ bumpMap) and roughness in a single pixel pass.
 * All noise is periodic so the textures tile seamlessly with RepeatWrapping.
 */

export type TexSet = { map: THREE.CanvasTexture; bumpMap: THREE.CanvasTexture; roughnessMap: THREE.CanvasTexture }
type Px = (x: number, y: number) => [r: number, g: number, b: number, height: number, rough: number]

/* ───────── tileable value noise ───────── */
function hash(x: number, y: number, s: number) {
  let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(s | 0, 982451653)) | 0
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  h ^= h >>> 16
  return (h >>> 0) / 4294967296
}
const mod = (a: number, p: number) => ((a % p) + p) % p
/** value noise on a lattice of `p` cells per tile (wraps every p cells). */
function vnoise(x: number, y: number, p: number, s: number) {
  const xi = Math.floor(x), yi = Math.floor(y)
  const xf = x - xi, yf = y - yi
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf)
  const x0 = mod(xi, p), x1 = mod(xi + 1, p), y0 = mod(yi, p), y1 = mod(yi + 1, p)
  const a = hash(x0, y0, s), b = hash(x1, y0, s), c = hash(x0, y1, s), d = hash(x1, y1, s)
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v
}
/** fractal noise; u,v in [0,1) of the tile, `p` = base cells per tile. */
function fbm(u: number, v: number, p: number, s = 0, oct = 4) {
  let sum = 0, amp = 0.5, norm = 0, f = p
  for (let i = 0; i < oct; i++) {
    sum += vnoise(u * f, v * f, f, s + i * 17) * amp
    norm += amp
    amp *= 0.5
    f *= 2
  }
  return sum / norm
}
const clamp = (v: number, a = 0, b = 255) => (v < a ? a : v > b ? b : v)
const mix = (a: number, b: number, t: number) => a + (b - a) * t
function hex(h: string): [number, number, number] {
  const n = parseInt(h.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
function mixc(a: [number, number, number], b: [number, number, number], t: number): [number, number, number] {
  return [mix(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t)]
}

function build(size: number, px: Px, opts: { repeat?: [number, number]; anisotropy?: number } = {}): TexSet {
  const mk = () => {
    const c = document.createElement('canvas')
    c.width = c.height = size
    const ctx = c.getContext('2d')!
    return { c, ctx, img: ctx.createImageData(size, size) }
  }
  const col = mk(), hgt = mk(), rgh = mk()
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const [r, g, b, h, ro] = px(x / size, y / size)
      const i = (y * size + x) * 4
      col.img.data[i] = clamp(r); col.img.data[i + 1] = clamp(g); col.img.data[i + 2] = clamp(b); col.img.data[i + 3] = 255
      const hv = clamp(h * 255), rv = clamp(ro * 255)
      hgt.img.data[i] = hgt.img.data[i + 1] = hgt.img.data[i + 2] = hv; hgt.img.data[i + 3] = 255
      rgh.img.data[i] = rgh.img.data[i + 1] = rgh.img.data[i + 2] = rv; rgh.img.data[i + 3] = 255
    }
  }
  const tex = (o: ReturnType<typeof mk>, srgb: boolean) => {
    o.ctx.putImageData(o.img, 0, 0)
    const t = new THREE.CanvasTexture(o.c)
    if (srgb) t.colorSpace = THREE.SRGBColorSpace
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    t.anisotropy = opts.anisotropy ?? 8
    if (opts.repeat) t.repeat.set(...opts.repeat)
    return t
  }
  return { map: tex(col, true), bumpMap: tex(hgt, false), roughnessMap: tex(rgh, false) }
}

/** Same images, different tiling (Texture.clone shares the uploaded source). */
export function withRepeat(set: TexSet, rx: number, ry: number, rotation = 0): TexSet {
  const c = (t: THREE.CanvasTexture) => {
    const n = t.clone()
    n.repeat.set(rx, ry)
    n.rotation = rotation
    n.needsUpdate = true
    return n
  }
  return { map: c(set.map), bumpMap: c(set.bumpMap), roughnessMap: c(set.roughnessMap) }
}

const once = <T,>(f: () => T) => {
  let v: T | undefined
  return () => (v ??= f())
}

/* ───────── generators ───────── */

/** Modern Scandinavian light oak floor planks: wide boards, subtle grain, satin finish. */
export const woodPlanks = once(() => {
  const ROWS = 6
  const tones = ['#ded3c4', '#d6c8b7', '#e3d8ca', '#cfc2b1', '#dacfc1', '#c7baa8'].map(hex)
  return build(512, (u, v) => {
    const row = Math.floor(v * ROWS)
    const fv = v * ROWS - row
    // two boards per row, joint offset per row
    const off = hash(row, 3, 9)
    const bu = mod(u + off, 1)
    const board = row * 2 + (bu < 0.5 ? 0 : 1)
    const fu = (bu % 0.5) / 0.5
    const base = tones[Math.floor(hash(board, 1, 4) * tones.length)]
    // grain: elegant flowing longitudinal grain
    const warp = fbm(u, v, 3, board + 1, 3)
    const grain = Math.sin((v * ROWS * 26 + warp * 7 + hash(board, 5, 2) * 20) * 1.0) * 0.5 + 0.5
    const fine = fbm(u * 1.5, v * 10, 16, 42, 3)
    let shade = 0.88 + grain * 0.1 + (fine - 0.5) * 0.12
    // refined, subtle knots (rare, soft, modern select oak)
    const kx = hash(board, 2, 5), ky = hash(board, 8, 5)
    const dx = (fu - kx) * 3.5, dy = (fv - ky) * 1.2
    const kd = Math.sqrt(dx * dx + dy * dy)
    if (hash(board, 11, 3) > 0.82 && kd < 0.14) {
      shade *= 0.85 + kd * 1.1
    }
    // clean, thin micro-bevel seams
    const edgeV = Math.min(fv, 1 - fv) * ROWS * 80
    const edgeU = Math.min(fu, 1 - fu) * 320
    const seam = Math.min(1, edgeV / 2.0, edgeU / 2.0)
    shade *= 0.62 + 0.38 * seam
    const [r, g, b] = base
    const h = 0.55 + (grain - 0.5) * 0.08 - (1 - seam) * 0.1
    // satin finish: low roughness with slight variation along grain
    const rough = 0.62 + (1 - seam) * 0.15 + (fine - 0.5) * 0.08
    return [r * shade, g * shade, b * shade, h, rough]
  })
})

/** Plain wood (furniture): fine straight grain. */
export const woodGrain = (tone: string, seed = 1) => {
  const base = hex(tone)
  return build(256, (u, v) => {
    const warp = fbm(u, v, 3, seed, 3)
    const grain = Math.sin(v * 140 + warp * 14) * 0.5 + 0.5
    const fine = fbm(u * 0.5, v * 4, 8, seed + 9, 3)
    const s = 0.85 + grain * 0.1 + (fine - 0.5) * 0.15
    return [base[0] * s, base[1] * s, base[2] * s, 0.5 + grain * 0.1, 0.5 + (fine - 0.5) * 0.2]
  }, { anisotropy: 4 })
}

/** Modern architectural wall finish: subtle warm off-white lime-wash with fine mineral texture. */
export const wallpaper = once(() => {
  const base = hex('#f5f3ef'), warm = hex('#ebe6de'), cool = hex('#eeebe5')
  return build(512, (u, v) => {
    // gentle cloudy plaster wash
    const wash = fbm(u, v, 4, 12, 4)
    let c = mixc(base, warm, wash)
    // subtle fine mineral grain
    const fine = fbm(u, v, 32, 45, 3)
    c = mixc(c, cool, (fine - 0.5) * 0.35)
    const micro = vnoise(u * 256, v * 256, 256, 73)
    const s = 0.98 + (fine - 0.5) * 0.04 + (micro - 0.5) * 0.03
    const h = 0.5 + (fine - 0.5) * 0.12 + (micro - 0.5) * 0.08
    return [c[0] * s, c[1] * s, c[2] * s, h, 0.92]
  })
})

/** Lush lawn: mottled greens + dense blade strokes in the height map. */
export const grass = once(() => {
  const g1 = hex('#7cc457'), g2 = hex('#5aa63f'), g3 = hex('#9ad46a'), dry = hex('#b8c76a')
  return build(512, (u, v) => {
    const big = fbm(u, v, 4, 21, 4)
    const mid = fbm(u, v, 16, 22, 3)
    let c = mixc(g2, g1, clamp(big * 1.6 - 0.3, 0, 1))
    c = mixc(c, g3, clamp((mid - 0.55) * 3, 0, 1))
    if (fbm(u, v, 6, 40, 3) > 0.66) c = mixc(c, dry, 0.35)
    // blades: high-frequency stretched noise
    const blade = vnoise(u * 160, v * 40, 160, 77) * 0.6 + vnoise(u * 90, v * 220, 90, 78) * 0.4
    const s = 0.78 + blade * 0.32
    return [c[0] * s, c[1] * s, c[2] * s, blade, 0.85]
  }, { anisotropy: 8 })
})

/** Soil cross-section: horizontal strata, roots and pebbles (for the diorama's cut edge). */
export const dirt = once(() => {
  const layers = ['#7a5232', '#6b4529', '#83593a', '#5d3b23'].map(hex)
  const pebble = hex('#a8988a')
  return build(512, (u, v) => {
    const w = fbm(u, v, 4, 51, 3) * 0.12
    const li = Math.floor((v + w) * 7) % layers.length
    let c = layers[li]
    const n = fbm(u, v, 24, 52, 3)
    let h = 0.4 + n * 0.3
    // pebbles: cellular-ish blobs
    const cx = Math.floor(u * 22), cy = Math.floor(v * 22)
    const px = (cx + hash(cx, cy, 3)) / 22, py = (cy + hash(cx, cy, 4)) / 22
    const d = Math.hypot((u - px) * 22, (v - py) * 22)
    const rad = 0.18 + hash(cx, cy, 5) * 0.25
    if (hash(cx, cy, 6) > 0.55 && d < rad) {
      c = mixc(pebble, hex('#8b7d70'), hash(cx, cy, 7))
      h = 0.7 + (rad - d) * 1.2
    }
    const s = 0.85 + n * 0.25
    return [c[0] * s, c[1] * s, c[2] * s, h, 0.95]
  })
})

/** Grey-blue rock with cracks (underside of the floating island, stepping stones). */
export const rock = once(() => {
  const a = hex('#9aa0a6'), b = hex('#6f767e'), moss = hex('#7a9a52')
  return build(512, (u, v) => {
    const n = fbm(u, v, 6, 61, 5)
    const crack = Math.abs(fbm(u, v, 5, 62, 4) - 0.5)
    let c = mixc(b, a, clamp(n * 1.5 - 0.2, 0, 1))
    if (fbm(u, v, 3, 63, 3) > 0.62) c = mixc(c, moss, 0.35)
    const cr = crack < 0.02 ? 0.55 : 1
    return [c[0] * cr, c[1] * cr, c[2] * cr, n * 0.8 + (cr < 1 ? -0.3 : 0.2), 0.9]
  })
})

/** Modern Nordic designer rug: warm ivory wool, refined neutral arcs, carved pile lines, plush texture. */
export const rug = once(() => {
  const ivory = hex('#f7f5ed')
  const sand = hex('#dfd6c6')
  const sage = hex('#96a598')
  const charcoal = hex('#363c45')
  const taupe = hex('#c5b7a3')
  return build(512, (u, v) => {
    const dx = u - 0.5, dy = v - 0.5
    const r = Math.sqrt(dx * dx + dy * dy) * 2
    const a = Math.atan2(dy, dx)
    // Base color: warm ivory
    let c = ivory
    let isCarved = false
    // Offset coordinates for modern asymmetric organic arches
    const ox = dx - 0.1, oy = dy + 0.08
    const rOff = Math.sqrt(ox * ox + oy * oy) * 2
    // Outer border (clean textured sand frame with fine charcoal accent)
    if (r > 0.88 && r <= 0.98) {
      c = sand
    } else if (r > 0.85 && r <= 0.88) {
      c = charcoal
      isCarved = true
    } else {
      // Inner field: modern abstract Nordic composition
      if (rOff > 0.42 && rOff < 0.76 && dy > -0.16) {
        c = mixc(sand, sage, 0.45)
      } else if (r > 0.28 && r < 0.52 && dx < 0.1) {
        c = taupe
      }
      // Elegant fine carved minimalist lines
      const line1 = Math.abs(rOff - 0.42) < 0.015
      const line2 = Math.abs(rOff - 0.76) < 0.015
      const line3 = Math.abs(r - 0.52) < 0.015
      const line4 = Math.abs(dx * 1.5 + dy * 0.8) < 0.012 && r < 0.75
      if (line1 || line2 || line3 || line4) {
        c = charcoal
        isCarved = true
      }
    }
    // Plush woven wool texture (bouclé loops & organic yarn fibers)
    const wool = fbm(u, v, 24, 7, 3)
    const loops = Math.sin(u * 220 * Math.PI) * Math.sin(v * 220 * Math.PI) * 0.5 + 0.5
    const fringe = Math.sin(a * 120) * 0.5 + 0.5
    const s = 0.92 + wool * 0.12 + (loops - 0.5) * 0.08
    const bump = (isCarved ? 0.2 : 0.65) + loops * 0.2 + (r > 0.95 ? fringe * 0.2 : 0)
    return [c[0] * s, c[1] * s, c[2] * s, bump, 0.98]
  }, { anisotropy: 4 })
})

/** Soft woven fabric (curtains, quilt, beanbag). */
export const fabric = (tone: string, check?: string, seed = 3) => {
  const base = hex(tone), alt = check ? hex(check) : base
  return build(256, (u, v) => {
    const warp = Math.sin(u * 256 * Math.PI) * 0.5 + 0.5
    const weft = Math.sin(v * 256 * Math.PI) * 0.5 + 0.5
    const n = fbm(u, v, 8, seed, 2)
    const checker = check && (Math.floor(u * 8) + Math.floor(v * 8)) % 2 === 0
    const c = checker ? alt : base
    const s = 0.88 + (warp * weft) * 0.1 + (n - 0.5) * 0.1
    return [c[0] * s, c[1] * s, c[2] * s, warp * 0.5 + weft * 0.5, 1]
  }, { anisotropy: 4 })
}

/** Cork board: tan speckle. */
export const cork = once(() => {
  const a = hex('#c99a63'), b = hex('#a8763f'), d = hex('#7e5427')
  return build(256, (u, v) => {
    const n = fbm(u, v, 32, 81, 2)
    const sp = vnoise(u * 180, v * 180, 180, 82)
    let c = mixc(b, a, n)
    if (sp > 0.82) c = d
    else if (sp < 0.12) c = mixc(c, hex('#e3bd88'), 0.6)
    return [c[0], c[1], c[2], sp, 1]
  }, { anisotropy: 4 })
})

/** Modern architectural plinth / honed concrete (house foundation band). */
export const stoneBlocks = once(() => {
  const a = hex('#e2ded6'), b = hex('#cfc8bc')
  return build(256, (u, v) => {
    const row = Math.floor(v * 3)
    const uu = mod(u * 2 + (row % 2) * 0.5, 1)
    const fv = mod(v * 3, 1)
    const edge = Math.min(uu * 2 * 6, (1 - uu) * 2 * 6, fv * 24, (1 - fv) * 24)
    const m = clamp(edge, 0, 1)
    const n = fbm(u, v, 8, 91 + row, 3)
    const c = mixc(b, a, n)
    const s = 0.82 + 0.18 * m
    return [c[0] * s, c[1] * s, c[2] * s, m * 0.5 + n * 0.5, 0.85]
  }, { anisotropy: 4 })
})

/** Vertical night-sky gradient (deep navy → indigo with a faint dusk glow at the horizon). */
export const skyGradient = once(() => {
  const c = document.createElement('canvas')
  c.width = 4
  c.height = 512
  const ctx = c.getContext('2d')!
  const g = ctx.createLinearGradient(0, 0, 0, 512)
  g.addColorStop(0, '#070b1c')
  g.addColorStop(0.45, '#0f172a')
  g.addColorStop(0.8, '#1e1b4b')
  g.addColorStop(1, '#3b2459')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 4, 512)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
})
