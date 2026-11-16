import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Avatar } from './Avatar'
import { OBSTACLES } from './decor'
import { input, k } from './input'
import { AUTO, player, RUN, WALK } from './playerState'
import { R, tangentToward } from './sphere'
import { sfx } from './sfx'
import { nav, useGame } from './store'
import { GRASS_CENTER, GRASS_RADIUS, ZONES } from './zones'

const v1 = new THREE.Vector3()
const v2 = new THREE.Vector3()
const move = new THREE.Vector3()
const axis = new THREE.Vector3()
const q = new THREE.Quaternion()
const basis = new THREE.Matrix4()
const right = new THREE.Vector3()

function orthonormalize(t: THREE.Vector3, up: THREE.Vector3, fallback: THREE.Vector3) {
  t.addScaledVector(up, -t.dot(up))
  if (t.lengthSq() < 1e-6) t.copy(fallback).addScaledVector(up, -fallback.dot(up))
  return t.normalize()
}

/** Steer around nearby obstacles (used by autopilot). */
function avoid(up: THREE.Vector3, dir: THREE.Vector3, targetDir: THREE.Vector3 | null) {
  for (const o of OBSTACLES) {
    if (targetDir && o.dir === targetDir) continue
    const ang = up.angleTo(o.dir)
    if (ang > o.r + 0.12) continue
    const toO = tangentToward(up, o.dir, v1)
    const d = dir.dot(toO)
    if (d <= 0) continue
    const side = v2.crossVectors(up, toO)
    if (dir.dot(side) < 0) side.negate()
    dir.addScaledVector(toO, -d * 1.1).addScaledVector(side, 0.9).normalize()
  }
}

export function Player({ mobile }: { mobile: boolean }) {
  const group = useRef<THREE.Group>(null!)
  const ring = useRef<THREE.Mesh>(null!)
  const marker = useRef<THREE.Group>(null!)
  const { camera, gl } = useThree()
  const sun = useRef<THREE.DirectionalLight>(null!)
  const sunTarget = useMemo(() => new THREE.Object3D(), [])
  const camUp = useRef(player.up.clone())
  const grassMeter = useRef(0)
  const grassCooldown = useRef(0)
  const nearRef = useRef<string | null>(null)

  // drag horizontally to orbit the camera around the avatar
  useEffect(() => {
    const el = gl.domElement
    let down = false, lastX = 0, moved = 0
    const pd = (e: PointerEvent) => { down = true; lastX = e.clientX; moved = 0 }
    const pm = (e: PointerEvent) => {
      if (!down) return
      const dx = e.clientX - lastX
      lastX = e.clientX
      moved += Math.abs(dx)
      if (moved > 6) input.dragYaw += dx * 0.006
    }
    const pu = () => (down = false)
    el.addEventListener('pointerdown', pd)
    window.addEventListener('pointermove', pm)
    window.addEventListener('pointerup', pu)
    return () => { el.removeEventListener('pointerdown', pd); window.removeEventListener('pointermove', pm); window.removeEventListener('pointerup', pu) }
  }, [gl])

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 0.05)
    const s = useGame.getState()
    const locked = !s.started || !!s.open || s.encounter || s.cv
    const { up, facing, camFwd } = player

    // ── camera orbit from drag
    if (input.dragYaw) {
      camFwd.applyAxisAngle(up, -input.dragYaw)
      input.dragYaw = 0
    }

    // ── manual input (camera-relative)
    right.crossVectors(camFwd, up)
    let ix = 0, iz = 0
    if (!locked) {
      if (k('KeyW', 'ArrowUp')) iz += 1
      if (k('KeyS', 'ArrowDown')) iz -= 1
      if (k('KeyD', 'ArrowRight')) ix += 1
      if (k('KeyA', 'ArrowLeft')) ix -= 1
      ix += input.joy.x
      iz += input.joy.y
    }
    move.set(0, 0, 0).addScaledVector(camFwd, iz).addScaledVector(right, ix)
    const mag = Math.min(move.length(), 1)
    let target = 0
    if (mag > 0.08) {
      nav.target = null
      move.normalize()
      const running = k('ShiftLeft', 'ShiftRight') || Math.hypot(input.joy.x, input.joy.y) > 0.9
      target = (running ? RUN : WALK) * Math.max(mag, 0.4)
    } else if (nav.target && !locked) {
      // ── autopilot
      const arriveAt = nav.arriveOpen ? ZONES.find((z) => z.id === nav.arriveOpen)!.trigger * 0.75 : 0.03
      if (up.angleTo(nav.target) < arriveAt) {
        const open = nav.arriveOpen
        nav.target = null
        nav.arriveOpen = null
        if (open) useGame.getState().openZone(open)
      } else if (performance.now() - nav.since > 12000) {
        // safety net: never get stuck — hop the rest of the way
        up.copy(nav.target).applyAxisAngle(right.normalize(), -0.2).normalize()
        nav.since = performance.now()
      } else {
        tangentToward(up, nav.target, move)
        const zoneDir = nav.arriveOpen ? ZONES.find((z) => z.id === nav.arriveOpen)!.dir : null
        // cinematic chase cam: swing behind the runner so we arrive facing the building
        if (zoneDir) camFwd.lerp(tangentToward(up, zoneDir, v2), 1 - Math.exp(-2.5 * dt)).normalize()
        avoid(up, move, zoneDir)
        target = nav.arriveOpen ? AUTO : RUN
      }
    }
    player.speed = THREE.MathUtils.lerp(player.speed, target, 1 - Math.exp(-10 * dt))

    // ── face the movement direction
    if (target > 0 && move.lengthSq() > 0.5) facing.lerp(move, 1 - Math.exp(-12 * dt))

    // ── walk along the sphere: rotate everything about (up × dir)
    if (player.speed > 0.02) {
      const dir = target > 0 && move.lengthSq() > 0.5 ? move : facing
      axis.crossVectors(up, dir).normalize()
      q.setFromAxisAngle(axis, (player.speed * dt) / R)
      up.applyQuaternion(q).normalize()
      facing.applyQuaternion(q)
      camFwd.applyQuaternion(q)
    }

    // ── collisions: push out of solid footprints
    for (const o of OBSTACLES) {
      const ang = up.angleTo(o.dir)
      if (ang < o.r) {
        axis.crossVectors(o.dir, up)
        if (axis.lengthSq() < 1e-8) axis.set(1, 0, 0)
        up.copy(o.dir).applyAxisAngle(axis.normalize(), o.r).normalize()
      }
    }
    orthonormalize(facing, up, camFwd)
    orthonormalize(camFwd, up, facing)

    // ── jump
    if (input.jump) {
      input.jump = false
      if (!locked && player.h === 0) { player.vh = 7.5; sfx.jump() }
    }
    if (player.h > 0 || player.vh > 0) {
      player.vh -= 24 * dt
      player.h = Math.max(0, player.h + player.vh * dt)
      if (player.h === 0) player.vh = 0
    }

    // ── place the avatar
    player.pos.copy(up).multiplyScalar(R + player.h)
    group.current.position.copy(player.pos)
    right.crossVectors(up, facing)
    basis.makeBasis(right, up, facing)
    group.current.quaternion.setFromRotationMatrix(basis)

    // ── third-person camera
    const dist = mobile ? 11 : 9
    const height = mobile ? 6.5 : 5.2
    camUp.current.lerp(up, 1 - Math.exp(-8 * dt)).normalize()
    v1.copy(up).multiplyScalar(R + height).addScaledVector(camFwd, -dist)
    state.camera.position.lerp(v1, 1 - Math.exp(-7 * dt))
    camera.up.copy(camUp.current)
    v2.copy(up).multiplyScalar(R + 1.2).addScaledVector(camFwd, 2)
    camera.lookAt(v2)

    // ── sun follows the player so the playable area is always lit (shadows stay crisp)
    sun.current.position.copy(player.pos).addScaledVector(up, 18).addScaledVector(right, 8).addScaledVector(camFwd, -4)
    sunTarget.position.copy(player.pos)
    sunTarget.updateMatrixWorld()

    // ── zone proximity
    let near: (typeof ZONES)[number] | null = null
    for (const z of ZONES) if (up.angleTo(z.dir) < z.trigger) near = z
    const nid = near?.id ?? null
    if (nid !== nearRef.current) { nearRef.current = nid; s.setNear(nid) }

    // ── tall grass encounters
    grassCooldown.current = Math.max(0, grassCooldown.current - dt)
    if (!locked && up.angleTo(GRASS_CENTER) < GRASS_RADIUS && player.speed > 1) {
      grassMeter.current += player.speed * dt
      if (grassMeter.current > 3.5 && grassCooldown.current === 0 && Math.random() < dt * 1.6) {
        grassMeter.current = 0
        grassCooldown.current = 6
        s.startEncounter()
      }
    }

    // ── click-to-move marker
    if (nav.target && !nav.arriveOpen) {
      marker.current.visible = true
      marker.current.position.copy(nav.target).multiplyScalar(R + 0.05)
      marker.current.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), nav.target)
      const sc = 1 + Math.sin(state.clock.elapsedTime * 8) * 0.15
      marker.current.scale.setScalar(sc)
    } else marker.current.visible = false

    // ground ring under the avatar pulses when near a zone
    ;(ring.current.material as THREE.MeshBasicMaterial).opacity = nid ? 0.55 + Math.sin(state.clock.elapsedTime * 6) * 0.25 : 0.18
  })

  return (
    <>
      <directionalLight ref={sun} target={sunTarget} intensity={2.2} color="#fff4e0" castShadow shadow-mapSize={[mobile ? 1024 : 2048, mobile ? 1024 : 2048]} shadow-camera-left={-14} shadow-camera-right={14} shadow-camera-top={14} shadow-camera-bottom={-14} shadow-camera-near={1} shadow-camera-far={45} shadow-bias={-0.0006} shadow-normalBias={0.04} />
      <primitive object={sunTarget} />
      <group ref={group}>
        <Avatar />
        <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
          <ringGeometry args={[0.55, 0.68, 32]} />
          <meshBasicMaterial color="#22d3ee" transparent opacity={0.2} depthWrite={false} />
        </mesh>
      </group>
      <group ref={marker} visible={false}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.3, 0.42, 24]} />
          <meshBasicMaterial color="#fbbf24" transparent opacity={0.9} depthWrite={false} />
        </mesh>
        <mesh position={[0, 0.5, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.15, 0.35, 4]} />
          <meshBasicMaterial color="#fbbf24" />
        </mesh>
      </group>
    </>
  )
}
