import * as THREE from 'three'
import { tangentToward } from './sphere'
import { SPAWN, zoneById } from './zones'

export const WALK = 4.2
export const RUN = 7.5
export const AUTO = 9

/** Mutable per-frame player state shared by controller, avatar and labels. */
export const player = {
  up: SPAWN.clone(),
  /** direction the avatar faces (tangent) */
  facing: tangentToward(SPAWN, zoneById.base.dir),
  /** camera "forward" tangent, parallel-transported as the player walks */
  camFwd: tangentToward(SPAWN, zoneById.base.dir),
  h: 0,
  vh: 0,
  speed: 0,
  pos: new THREE.Vector3(),
}
