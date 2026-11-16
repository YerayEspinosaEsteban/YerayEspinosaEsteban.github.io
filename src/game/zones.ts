import * as THREE from 'three'
import { dirFromLatLon, R } from './sphere'

export type ZoneId = 'base' | 'fortress' | 'hangar' | 'gym' | 'secret'

export type Zone = {
  id: ZoneId
  name: string
  short: string
  icon: string
  color: string
  dir: THREE.Vector3
  /** building footprint (angle, radians) — solid */
  build: number
  /** proximity trigger (angle, radians) */
  trigger: number
  yaw: number
}

const w = (units: number) => units / R

export const ZONES: Zone[] = [
  { id: 'base', name: 'Base Central', short: 'Base', icon: '◆', color: '#22d3ee', dir: dirFromLatLon(62, 0), build: w(1.5), trigger: w(3.6), yaw: Math.PI },
  { id: 'fortress', name: 'Fortaleza Cloud & DevSecOps', short: 'Fortaleza', icon: '⛨', color: '#a78bfa', dir: dirFromLatLon(16, 72), build: w(1.7), trigger: w(4), yaw: -Math.PI / 2 },
  { id: 'hangar', name: 'Hangar de Proyectos', short: 'Hangar', icon: '✦', color: '#fbbf24', dir: dirFromLatLon(12, -74), build: w(2.2), trigger: w(4.4), yaw: Math.PI / 2 },
  { id: 'gym', name: 'Academia & Gimnasio', short: 'Gimnasio', icon: '◎', color: '#f43f5e', dir: dirFromLatLon(-30, 30), build: w(1.9), trigger: w(4.2), yaw: -0.5 },
  { id: 'secret', name: 'Zona Secreta', short: '???', icon: '✧', color: '#4ade80', dir: dirFromLatLon(-32, -38), build: w(0.9), trigger: w(4.2), yaw: 0.5 },
]

export const zoneById = Object.fromEntries(ZONES.map((z) => [z.id, z])) as Record<ZoneId, Zone>

/** Where the player appears: just south of the base, looking at it. */
export const SPAWN = dirFromLatLon(44, 0)

/** Tall-grass patch next to the secret portal. */
export const GRASS_CENTER = new THREE.Vector3().copy(zoneById.secret.dir).applyAxisAngle(new THREE.Vector3(0, 1, 0), 0.3).normalize()
export const GRASS_RADIUS = w(1.9)
