import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Anchor, Interactive, SoftBox, TexMat } from './common'
import { G, PATIO } from './Garden'
import { sfx } from './sfx'
import { SIMBA_LINE, useStore } from './store'
import { fabric, withRepeat } from './textures'

/** Simba lies on a blanket at the fire's left (as seen from the default camera), 3/4 towards the viewer. */
const ANG = (135 * Math.PI) / 180
const POS: [number, number, number] = [PATIO.x + Math.cos(ANG) * 1.3, G + 0.05, PATIO.z + Math.sin(ANG) * 1.3]
const ROT_Y = 1.75
/** head yaw (local) to look at the fire vs. at the camera */
const LOOK_FIRE = 0.55
const LOOK_CAM = -0.75

function rng(seed: number) {
  let s = seed
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646
}


/**
 * Fluffy coat geometry: a dense sphere whose surface is pushed out into soft, clumpy locks
 * (sum of a few directional waves + per-lock noise). Reads as long fur instead of bubbles.
 */
function furGeometry(r: number, amp: number, seed: number, droop = 0.35) {
  const g = new THREE.SphereGeometry(r, 64, 48)
  const p = g.attributes.position
  const rand = rng(seed)
  const waves = Array.from({ length: 7 }, () => ({ d: new THREE.Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5).normalize(), f: 9 + rand() * 9, ph: rand() * 6 }))
  const v = new THREE.Vector3()
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i)
    const n = v.clone().normalize()
    let h = 0
    for (const w of waves) h += Math.sin(n.dot(w.d) * w.f + w.ph)
    h = Math.abs(h / waves.length) // ridged → distinct locks
    v.addScaledVector(n, h * amp * r)
    // long hair hangs: the lower half sags a little and flares outwards
    if (n.y < 0) { v.y += n.y * droop * amp * r; v.x *= 1 + -n.y * 0.05; v.z *= 1 + -n.y * 0.05 }
    p.setXYZ(i, v.x, v.y, v.z)
  }
  g.computeVertexNormals()
  return g
}

export function Simba() {
  const root = useRef<THREE.Group>(null!)
  const body = useRef<THREE.Group>(null!)
  const head = useRef<THREE.Group>(null!)
  const earUp = useRef<THREE.Group>(null!)
  const earFlop = useRef<THREE.Group>(null!)
  const tail = useRef<THREE.Group>(null!)
  const eyes = useRef<THREE.Group[]>([])
  const nextBlink = useRef(2.5)
  const happy = useRef(0)
  const focused = useStore((s) => s.focus === 'simba')
  const arrived = useStore((s) => s.arrived)

  useEffect(() => { if (focused) { happy.current = 1; sfx.woof() } }, [focused])

  // jet-black long fur: sheen picks up the cool moon rim and the warm fire
  const fur = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#16161b', roughness: 0.82, sheen: 1, sheenColor: new THREE.Color('#8494c4'), sheenRoughness: 0.42 }), [])
  const grey = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#a9a6a1', roughness: 0.9, sheen: 0.6, sheenColor: new THREE.Color('#ffffff') }), [])
  const white = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#f1ede6', roughness: 0.9, sheen: 0.6, sheenColor: new THREE.Color('#ffffff') }), [])
  const nose = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#0c0c0e', roughness: 0.25, clearcoat: 1 }), [])
  const eye = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#120d0a', roughness: 0.05, clearcoat: 1, clearcoatRoughness: 0.05 }), [])
  const glint = useMemo(() => new THREE.MeshBasicMaterial({ color: '#ffffff' }), [])
  const fireGlint = useMemo(() => new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffb067').multiplyScalar(1.6), toneMapped: false }), [])
  const blanket = useMemo(() => withRepeat(fabric('#b91c1c', '#7f1d1d', 91), 3, 3), [])

  const bodyGeo = useMemo(() => furGeometry(0.25, 0.22, 3), [])
  const headGeo = useMemo(() => furGeometry(0.16, 0.16, 8, 0.2), [])
  const chunkGeo = useMemo(() => furGeometry(0.1, 0.3, 13), [])
  const tailBalls = useMemo(() => {
    const c = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0.24, -0.4), new THREE.Vector3(0.06, 0.38, -0.55), new THREE.Vector3(0.2, 0.5, -0.5), new THREE.Vector3(0.32, 0.46, -0.3), new THREE.Vector3(0.36, 0.36, -0.12)])
    const r = rng(21)
    return Array.from({ length: 13 }, (_, i) => {
      const t = i / 12
      const p = c.getPoint(t)
      // feathered plume: a core ball plus a few offset wisps
      return { p, s: 0.05 + Math.sin(t * Math.PI) * 0.05, w: [0, 1, 2].map(() => new THREE.Vector3((r() - 0.5) * 0.12, (r() - 0.3) * 0.1, (r() - 0.5) * 0.12)) }
    })
  }, [])

  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime
    happy.current = Math.max(0, happy.current - dt * 0.25)
    const h = happy.current
    const s = useStore.getState()
    const lookingAtYou = s.focus === 'simba'
    // slow breathing
    const br = Math.sin(t * 1.6) * 0.025
    body.current.scale.set(1 + br * 0.6, 1 + br, 1)
    // head: watches the fire, turns to you when you visit; happy head tilt
    const goalY = lookingAtYou ? LOOK_CAM : LOOK_FIRE + Math.sin(t * 0.3) * 0.12
    head.current.rotation.y = THREE.MathUtils.lerp(head.current.rotation.y, goalY, 1 - Math.exp(-3 * dt))
    const tilt = lookingAtYou ? 0.32 + Math.sin(t * 2.2) * 0.06 * h : Math.sin(t * 0.5) * 0.04
    head.current.rotation.z = THREE.MathUtils.lerp(head.current.rotation.z, tilt, 1 - Math.exp(-5 * dt))
    head.current.position.y = 0.42 + br * 0.5
    // tail: lazy sway, fast wag when happy
    tail.current.rotation.y = Math.sin(t * (1.4 + h * 12)) * (0.12 + h * 0.3)
    tail.current.rotation.z = Math.sin(t * (0.9 + h * 6)) * (0.05 + h * 0.1)
    // ears: the up ear perks when he looks at you, the floppy one bounces
    earUp.current.rotation.x = THREE.MathUtils.lerp(earUp.current.rotation.x, lookingAtYou ? -0.25 : 0, 1 - Math.exp(-6 * dt)) + Math.sin(t * 14) * 0.04 * h
    earFlop.current.rotation.z = -0.55 + Math.sin(t * 3 + 1) * (0.03 + h * 0.12)
    // blink
    let b = 1
    if (t > nextBlink.current) {
      const k = (t - nextBlink.current) / 0.16
      b = k < 1 ? Math.abs(Math.cos(k * Math.PI)) * 0.9 + 0.1 : 1
      if (k >= 1) nextBlink.current = t + 2.5 + Math.random() * 3.5
    }
    eyes.current.forEach((e) => e && (e.scale.y = b))
    root.current.position.y = POS[1] + Math.max(0, Math.sin(t * 12)) * 0.015 * h
  })

  const S = (r: number, w = 18, hh = 14) => <sphereGeometry args={[r, w, hh]} />
  return (
    <Interactive id="simba">
      {/* camera anchor: in front of his face, facing the default view */}
      <Anchor id="simba" width={2.3} height={1.5} position={[POS[0] + 0.1, G + 0.55, POS[2] - 0.1]} rotation={[0, 1.2, 0]}>
        {focused && arrived && (
          <Html position={[0, 0.75, 0]} center zIndexRange={[25, 0]} style={{ pointerEvents: 'none' }}>
            <div className="speech speech-lg">{SIMBA_LINE}</div>
          </Html>
        )}
      </Anchor>
      <group position={[POS[0], G, POS[2]]} rotation={[0, ROT_Y, 0]}>
        {/* plaid blanket */}
        <SoftBox size={[1.0, 0.05, 1.25]} radius={0.025} position={[0, 0.025, 0.02]}>
          <TexMat set={blanket} bump={0.6} roughness={1} />
        </SoftBox>
      </group>
      {/* cool rim light from behind (moon side) so the black coat reads against the night */}
      <pointLight position={[POS[0] - 0.9, G + 1.1, POS[2] - 0.9]} color="#9db4ff" intensity={2.6} decay={2} distance={3.2} />
      <group ref={root} position={POS} rotation={[0, ROT_Y, 0]}>
        <group ref={body}>
          {/* lying torso in one continuous long coat */}
          <mesh geometry={bodyGeo} position={[0, 0.21, -0.05]} scale={[0.95, 0.74, 1.32]} material={fur} castShadow receiveShadow />
          {/* neck ruff (mane) + haunch fluff, same clumpy coat */}
          <mesh geometry={chunkGeo} position={[0, 0.3, 0.26]} scale={[1.75, 1.45, 1.2]} material={fur} castShadow />
          {[-1, 1].map((s) => (
            <mesh key={s} geometry={chunkGeo} position={[s * 0.17, 0.14, -0.26]} scale={[1.05, 1.15, 1.5]} material={fur} castShadow />
          ))}
          {/* little white chest tuft peeking out under the ruff */}
          <mesh position={[0, 0.2, 0.37]} scale={[1.1, 1.2, 0.5]} material={white}>{S(0.032, 14, 10)}</mesh>
          {/* short front legs stretched forward + paws, back paws tucked */}
          {[-1, 1].map((s) => (
            <group key={s}>
              <mesh position={[s * 0.1, 0.065, 0.42]} rotation={[Math.PI / 2, 0, 0]} material={fur} castShadow>
                <capsuleGeometry args={[0.052, 0.18, 6, 12]} />
              </mesh>
              <mesh position={[s * 0.1, 0.045, 0.56]} scale={[1, 0.6, 1.2]} material={fur} castShadow>{S(0.058, 12, 10)}</mesh>
              <mesh position={[s * 0.23, 0.04, -0.05]} scale={[0.8, 0.55, 1.3]} material={fur} castShadow>{S(0.052, 10, 8)}</mesh>
            </group>
          ))}
        </group>

        {/* plumed tail curling over his side */}
        <group ref={tail}>
          {tailBalls.map((b, i) => (
            <mesh key={i} geometry={chunkGeo} position={b.p} scale={(b.s / 0.1) * 1.05} rotation={[i, i * 0.7, 0]} material={fur} castShadow />
          ))}
        </group>

        {/* head (big and round, short muzzle) */}
        <group ref={head} position={[0, 0.42, 0.4]} scale={1.18}>
          <mesh geometry={headGeo} scale={[1.08, 0.96, 1]} material={fur} castShadow />
          {/* muzzle, grey-white chin, glossy nose */}
          <mesh position={[0, -0.045, 0.14]} scale={[1, 0.8, 1.1]} material={fur} castShadow>{S(0.07, 18, 14)}</mesh>
          <mesh position={[0, -0.088, 0.14]} scale={[1.05, 0.6, 0.95]} material={grey}>{S(0.055, 14, 10)}</mesh>
          <mesh position={[0, -0.07, 0.19]} scale={[1, 0.55, 0.7]} material={grey}>{S(0.038, 12, 8)}</mesh>
          <mesh position={[0, -0.02, 0.21]} scale={[1.3, 0.9, 1]} material={nose}>{S(0.027, 14, 10)}</mesh>
          {/* big dark eyes, a white glint and a warm glint from the fire */}
          {[-1, 1].map((s, i) => (
            <group key={s} ref={(el) => { if (el) eyes.current[i] = el }} position={[s * 0.07, 0.03, 0.13]} rotation={[0, s * 0.3, 0]}>
              <mesh scale={[1, 1, 0.6]} material={eye}>{S(0.038, 16, 12)}</mesh>
              <mesh position={[-0.01, 0.014, 0.021]} material={glint}>{S(0.009, 8, 6)}</mesh>
              <mesh position={[0.011, -0.009, 0.02]} material={fireGlint}>{S(0.006, 6, 4)}</mesh>
            </group>
          ))}
          {/* his right ear (−x): standing up, with a tufted tip */}
          <group ref={earUp} position={[-0.08, 0.12, -0.03]} rotation={[0, 0, 0.3]}>
            <mesh position={[0, 0.065, 0]} scale={[1, 1, 0.45]} material={fur} castShadow>
              <coneGeometry args={[0.052, 0.15, 14]} />
            </mesh>
            <mesh position={[-0.005, 0.15, 0]} rotation={[0, 0, 0.3]} scale={[0.35, 1.4, 0.35]} material={fur}>{S(0.02, 8, 6)}</mesh>
          </group>
          {/* his left ear (+x): half up, then folding over to the side */}
          <group ref={earFlop} position={[0.085, 0.11, -0.03]} rotation={[0, 0, -0.55]}>
            <mesh position={[0, 0.035, 0]} scale={[1, 1, 0.45]} material={fur} castShadow>
              <cylinderGeometry args={[0.03, 0.05, 0.07, 14]} />
            </mesh>
            <group position={[0, 0.07, 0]} rotation={[0, 0, -1.1]}>
              <mesh position={[0, 0.04, 0]} scale={[1, 1, 0.45]} material={fur} castShadow>
                <coneGeometry args={[0.032, 0.09, 12]} />
              </mesh>
            </group>
          </group>
        </group>
      </group>
    </Interactive>
  )
}
