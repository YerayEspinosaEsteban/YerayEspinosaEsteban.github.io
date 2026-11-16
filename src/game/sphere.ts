import * as THREE from 'three'

/** Planet radius in world units. Everything walkable lives on this sphere. */
export const R = 12
const D2R = Math.PI / 180
const Y = new THREE.Vector3(0, 1, 0)

export function dirFromLatLon(lat: number, lon: number) {
  const la = lat * D2R
  const lo = lon * D2R
  return new THREE.Vector3(Math.cos(la) * Math.sin(lo), Math.sin(la), Math.cos(la) * Math.cos(lo)).normalize()
}

/** Quaternion that maps local +Y onto the surface normal `n`, then spins `yaw` around it. */
export function quatForNormal(n: THREE.Vector3, yaw = 0) {
  const q = new THREE.Quaternion().setFromUnitVectors(Y, n)
  if (yaw) q.multiply(new THREE.Quaternion().setFromAxisAngle(Y, yaw))
  return q
}

/** World matrix for an object standing on the planet at direction `dir`. */
export function sphereMatrix(dir: THREE.Vector3, yaw = 0, scale = 1, lift = 0, out = new THREE.Matrix4()) {
  const q = quatForNormal(dir, yaw)
  const p = dir.clone().multiplyScalar(R + lift)
  return out.compose(p, q, new THREE.Vector3(scale, scale, scale))
}

/** Unit tangent at `up` pointing toward `target` (both unit vectors). */
export function tangentToward(up: THREE.Vector3, target: THREE.Vector3, out = new THREE.Vector3()) {
  out.copy(target).addScaledVector(up, -target.dot(up))
  const l = out.length()
  return l < 1e-6 ? out.set(0, 0, 0) : out.divideScalar(l)
}

/** Angular distance from point p to the great-circle arc a→b (all unit vectors). */
export function distToArc(p: THREE.Vector3, a: THREE.Vector3, b: THREE.Vector3) {
  const n = new THREE.Vector3().crossVectors(a, b).normalize()
  const proj = p.clone().addScaledVector(n, -p.dot(n)).normalize()
  const ab = a.angleTo(b)
  if (Math.abs(a.angleTo(proj) + proj.angleTo(b) - ab) < 1e-3) return Math.asin(Math.min(1, Math.abs(p.dot(n))))
  return Math.min(p.angleTo(a), p.angleTo(b))
}

/** Deterministic PRNG so the world is identical on every visit. */
export function rng(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function randomDir(r: () => number) {
  const z = r() * 2 - 1
  const a = r() * Math.PI * 2
  const s = Math.sqrt(1 - z * z)
  return new THREE.Vector3(s * Math.cos(a), z, s * Math.sin(a))
}

/** Cheap smooth 3D noise (sum of sines), good enough for terrain tinting. */
export function noise3(x: number, y: number, z: number) {
  return (
    Math.sin(x * 1.7 + y * 0.6) * 0.5 +
    Math.sin(y * 2.3 - z * 1.1) * 0.3 +
    Math.sin(z * 2.9 + x * 1.9) * 0.2 +
    Math.sin((x + y + z) * 4.1) * 0.12
  )
}
