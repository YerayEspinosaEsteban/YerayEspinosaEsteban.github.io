import * as THREE from 'three'
import { distToArc, randomDir, rng, R } from './sphere'
import { GRASS_CENTER, GRASS_RADIUS, SPAWN, ZONES, zoneById } from './zones'

export type Placed = { dir: THREE.Vector3; yaw: number; scale: number; kind: number }
export type Obstacle = { dir: THREE.Vector3; r: number }

/** Dirt paths: from the base to every other zone, plus spawn → base. */
export const PATHS: [THREE.Vector3, THREE.Vector3][] = [
  [SPAWN, zoneById.base.dir],
  ...ZONES.filter((z) => z.id !== 'base').map((z) => [zoneById.base.dir, z.dir] as [THREE.Vector3, THREE.Vector3]),
  [zoneById.gym.dir, zoneById.secret.dir],
  [zoneById.fortress.dir, zoneById.gym.dir],
  [zoneById.hangar.dir, zoneById.secret.dir],
]
export const PATH_W = 0.75 / R

export function pathDist(p: THREE.Vector3) {
  let d = Infinity
  for (const [a, b] of PATHS) d = Math.min(d, distToArc(p, a, b))
  return d
}

function isFree(p: THREE.Vector3, margin: number) {
  if (pathDist(p) < PATH_W + margin) return false
  if (p.angleTo(SPAWN) < 2.2 / R) return false
  if (p.angleTo(GRASS_CENTER) < GRASS_RADIUS + margin) return false
  for (const z of ZONES) if (p.angleTo(z.dir) < z.trigger + margin) return false
  return true
}

function scatter(seed: number, count: number, margin: number, minGap: number, taken: THREE.Vector3[], kinds = 1, s0 = 0.8, s1 = 1.3): Placed[] {
  const r = rng(seed)
  const out: Placed[] = []
  let tries = 0
  while (out.length < count && tries++ < count * 60) {
    const d = randomDir(r)
    if (!isFree(d, margin)) continue
    if (taken.some((t) => t.angleTo(d) < minGap)) continue
    taken.push(d)
    out.push({ dir: d, yaw: r() * Math.PI * 2, scale: s0 + r() * (s1 - s0), kind: Math.floor(r() * kinds) })
  }
  return out
}

const taken: THREE.Vector3[] = []
export const TREES = scatter(7, 95, 0.06, 1.15 / R, taken, 3, 0.75, 1.35)
export const ROCKS = scatter(21, 40, 0.03, 0.9 / R, taken, 2, 0.5, 1.1)
export const CRYSTALS = scatter(33, 22, 0.05, 1.2 / R, taken, 1, 0.6, 1.2)
export const ANTENNAS = scatter(48, 8, 0.1, 2.5 / R, taken, 1, 1, 1)
export const FLOWERS = scatter(55, 260, 0.0, 0.18 / R, [], 4, 0.7, 1.2)

/** Tall grass blades, densely packed in the secret patch. */
export const GRASS: Placed[] = (() => {
  const r = rng(99)
  const out: Placed[] = []
  const up = GRASS_CENTER
  const t1 = new THREE.Vector3(0, 1, 0).cross(up).normalize()
  const t2 = up.clone().cross(t1)
  for (let i = 0; i < 380; i++) {
    const a = r() * Math.PI * 2
    const rad = Math.sqrt(r()) * GRASS_RADIUS
    const d = up.clone().addScaledVector(t1, Math.cos(a) * rad).addScaledVector(t2, Math.sin(a) * rad).normalize()
    out.push({ dir: d, yaw: r() * Math.PI * 2, scale: 0.7 + r() * 0.6, kind: Math.floor(r() * 3) })
  }
  return out
})()

/** Solid things the player cannot walk through. */
export const OBSTACLES: Obstacle[] = [
  ...ZONES.map((z) => ({ dir: z.dir, r: z.build })),
  ...TREES.map((t) => ({ dir: t.dir, r: (0.42 * t.scale) / R })),
  ...ROCKS.filter((r) => r.scale > 0.8).map((t) => ({ dir: t.dir, r: (0.5 * t.scale) / R })),
  ...CRYSTALS.map((t) => ({ dir: t.dir, r: (0.35 * t.scale) / R })),
  ...ANTENNAS.map((t) => ({ dir: t.dir, r: 0.4 / R })),
]
