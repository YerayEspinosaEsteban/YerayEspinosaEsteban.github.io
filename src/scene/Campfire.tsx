import { useFrame } from '@react-three/fiber'
import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { SoftBox, TexMat } from './common'
import { G, PATIO } from './Garden'
import { rock, withRepeat, woodGrain } from './textures'

const FX = PATIO.x, FZ = PATIO.z
/** Wooden poles that hold the fairy-light strings (x, z, height). */
export const POLES: [number, number, number][] = [
  [5.55, 5.55, 2.45], // lamp post by the cabin corner
  [9.95, 5.0, 2.2],
  [5.0, 9.95, 2.2],
]

function rng(seed: number) {
  let s = seed
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646
}

/** Teardrop flame profile, revolved. */
function flameGeometry() {
  const pts: THREE.Vector2[] = []
  for (let i = 0; i <= 12; i++) {
    const t = i / 12
    const r = Math.sin(Math.PI * Math.pow(t, 0.7)) * (1 - t) * 0.9 + (t < 0.05 ? 0.3 : 0)
    pts.push(new THREE.Vector2(Math.max(0.001, r * 0.68), t))
  }
  return new THREE.LatheGeometry(pts, 14)
}

const FLAMES = [
  { c: '#e04a10', k: 0.55, s: 0.42, h: 0.62, n: 6, r: 0.13 },
  { c: '#f08a1c', k: 0.6, s: 0.3, h: 0.5, n: 4, r: 0.08 },
  { c: '#ffd36b', k: 0.7, s: 0.2, h: 0.34, n: 3, r: 0.04 },
]

function Flames() {
  const geo = useMemo(flameGeometry, [])
  const refs = useRef<THREE.Mesh[]>([])
  const items = useMemo(() => FLAMES.flatMap((L, li) => Array.from({ length: L.n }, (_, i) => {
    const a = (i / L.n) * Math.PI * 2 + li
    return { L, li, x: Math.cos(a) * L.r, z: Math.sin(a) * L.r, ph: i * 1.7 + li * 3.1, idx: 0 }
  })), [])
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    items.forEach((f, i) => {
      const m = refs.current[i]
      if (!m) return
      const k = 1 + Math.sin(t * 9 + f.ph) * 0.12 + Math.sin(t * 15.3 + f.ph * 2) * 0.08
      m.scale.set(f.L.s * (1 - (k - 1) * 0.6), f.L.h * k, f.L.s * (1 - (k - 1) * 0.6))
      m.rotation.z = Math.sin(t * 3.3 + f.ph) * 0.12
      m.rotation.x = Math.cos(t * 2.7 + f.ph) * 0.1
      m.rotation.y = t * 0.6 + f.ph
    })
  })
  return (
    <group position={[0, 0.16, 0]}>
      {items.map((f, i) => (
        <mesh key={i} ref={(el) => { if (el) refs.current[i] = el }} geometry={geo} position={[f.x, 0, f.z]} raycast={() => null}>
          <meshBasicMaterial color={f.L.c} transparent opacity={f.L.k} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}
    </group>
  )
}

/** Rising sparks: instanced, looping, drifting with a little swirl. */
function Embers() {
  const N = 40
  const data = useMemo(() => {
    const r = rng(9)
    return Array.from({ length: N }, () => ({ ph: r(), sp: 0.35 + r() * 0.4, sw: 0.1 + r() * 0.25, a: r() * 6.28, life: 1.6 + r() * 1.4 }))
  }, [])
  const ref = useRef<THREE.InstancedMesh>(null!)
  const m = useMemo(() => new THREE.Matrix4(), [])
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    data.forEach((e, i) => {
      const k = ((t * e.sp) / e.life + e.ph) % 1
      const y = 0.3 + k * 2.6
      const s = (1 - k) * (0.6 + Math.sin(t * 20 + i) * 0.4)
      m.makeScale(s, s, s).setPosition(Math.cos(e.a + k * 5) * e.sw * (0.3 + k), y, Math.sin(e.a + k * 5) * e.sw * (0.3 + k))
      ref.current.setMatrixAt(i, m)
    })
    ref.current.instanceMatrix.needsUpdate = true
  })
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, N]} raycast={() => null}>
      <sphereGeometry args={[0.018, 6, 4]} />
      <meshBasicMaterial color={new THREE.Color('#ffb347').multiplyScalar(5)} toneMapped={false} />
    </instancedMesh>
  )
}

function Smoke() {
  const puffs = useRef<THREE.Mesh[]>([])
  useFrame(({ clock }) => {
    const t = clock.elapsedTime * 0.18
    puffs.current.forEach((p, i) => {
      if (!p) return
      const k = (t + i / 6) % 1
      p.position.set(Math.sin((t + i) * 3) * 0.2 * k + k * 0.4, 1.2 + k * 2.6, Math.cos((t + i) * 2) * 0.15 * k)
      p.scale.setScalar(0.15 + k * 0.55)
      ;(p.material as THREE.MeshBasicMaterial).opacity = Math.sin(k * Math.PI) * 0.12
    })
  })
  return (
    <group>
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={i} ref={(el) => { if (el) puffs.current[i] = el }} raycast={() => null}>
          <sphereGeometry args={[1, 10, 8]} />
          <meshBasicMaterial color="#8a8fa8" transparent opacity={0.1} depthWrite={false} />
        </mesh>
      ))}
    </group>
  )
}

/** The fire's warm light, flickering; casts soft shadows on desktop. */
function FireLight({ shadows }: { shadows: boolean }) {
  const l = useRef<THREE.PointLight>(null!)
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const f = 1 + Math.sin(t * 11) * 0.07 + Math.sin(t * 23.7) * 0.05 + Math.sin(t * 5.3) * 0.08
    l.current.intensity = 16 * f
    l.current.position.set(Math.sin(t * 7) * 0.04, 0.85 + Math.sin(t * 9) * 0.04, Math.cos(t * 6) * 0.04)
  })
  return (
    <pointLight
      ref={l}
      color="#ff7b29"
      intensity={16}
      distance={0}
      decay={1.6}
      castShadow={shadows}
      shadow-mapSize={[512, 512]}
      shadow-bias={-0.002}
      shadow-normalBias={0.04}
      shadow-radius={6}
      shadow-camera-near={0.3}
      shadow-camera-far={18}
    />
  )
}

function Log({ position, rotY, len = 1.25, r = 0.17 }: { position: [number, number, number]; rotY: number; len?: number; r?: number }) {
  const bark = useMemo(() => withRepeat(woodGrain('#5a3a22', 71), 1, 2, Math.PI / 2), [])
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
        <cylinderGeometry args={[r, r * 1.04, len, 14]} />
        <TexMat set={bark} bump={2} roughness={1} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[(s * len) / 2 + s * 0.002, 0, 0]} rotation={[0, (s * Math.PI) / 2, 0]}>
          <circleGeometry args={[r * 0.96, 14]} />
          <meshStandardMaterial color="#d2a36b" roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

function FirePit({ shadows }: { shadows: boolean }) {
  const stone = rock()
  const stones = useMemo(() => {
    const r = rng(5)
    return Array.from({ length: 11 }, (_, i) => {
      const a = (i / 11) * Math.PI * 2
      return { x: Math.cos(a) * 0.58, z: Math.sin(a) * 0.58, s: 0.13 + r() * 0.05, rot: r() * 3 }
    })
  }, [])
  const wood = useMemo(() => withRepeat(woodGrain('#4a2e1a', 72), 1, 1), [])
  return (
    <group position={[FX, G, FZ]}>
      {stones.map((s, i) => (
        <mesh key={i} position={[s.x, s.s * 0.6, s.z]} rotation={[s.rot, s.rot * 2, 0]} scale={[1.2, 0.8, 1]} castShadow receiveShadow>
          <dodecahedronGeometry args={[s.s, 0]} />
          <TexMat set={stone} bump={2} flatShading roughness={1} color="#a8a29e" />
        </mesh>
      ))}
      {/* glowing coals */}
      <mesh position={[0, 0.04, 0]} scale={[1, 0.25, 1]}>
        <sphereGeometry args={[0.42, 20, 10]} />
        <meshStandardMaterial color="#3a1608" emissive="#ff4d0d" emissiveIntensity={1.4} roughness={1} />
      </mesh>
      {/* teepee of logs */}
      {[0, 1, 2, 3].map((i) => {
        const a = (i / 4) * Math.PI * 2 + 0.4
        return (
          <mesh key={i} position={[Math.cos(a) * 0.18, 0.24, Math.sin(a) * 0.18]} rotation={[Math.sin(a) * 0.55, 0, -Math.cos(a) * 0.55]} castShadow>
            <cylinderGeometry args={[0.045, 0.06, 0.62, 8]} />
            <TexMat set={wood} bump={1.5} roughness={1} emissive="#ff4d0d" emissiveIntensity={0.15} />
          </mesh>
        )
      })}
      <Flames />
      <Embers />
      <Smoke />
      <FireLight shadows={shadows} />
    </group>
  )
}

function Patio() {
  const stone = rock()
  const flags = useMemo(() => {
    const r = rng(17)
    const out: { x: number; z: number; rad: number; rot: number }[] = []
    for (let ring = 0; ring < 3; ring++) {
      const R = 0.95 + ring * 0.52
      const n = 9 + ring * 5
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + ring * 0.3
        out.push({ x: Math.cos(a) * R, z: Math.sin(a) * R, rad: 0.22 + r() * 0.06, rot: r() * 3 })
      }
    }
    return out
  }, [])
  return (
    <group position={[FX, G, FZ]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0]} receiveShadow>
        <circleGeometry args={[PATIO.r, 48]} />
        <meshStandardMaterial color="#5b4636" roughness={1} />
      </mesh>
      {flags.map((f, i) => (
        <mesh key={i} position={[f.x, 0.02, f.z]} rotation={[0, f.rot, 0]} scale={[1, 1, 0.8]} receiveShadow>
          <cylinderGeometry args={[f.rad, f.rad, 0.04, 7]} />
          <TexMat set={stone} bump={1.2} roughness={0.95} color="#cfc8bd" />
        </mesh>
      ))}
    </group>
  )
}

/** Lantern on top of the lamp post (warm porch light). */
function Lantern() {
  const [x, z, h] = POLES[0]
  return (
    <group position={[x, G + h, z]}>
      <SoftBox size={[0.24, 0.05, 0.24]} radius={0.015} position={[0, 0.2, 0]}>
        <meshStandardMaterial color="#2b2b2f" metalness={0.6} roughness={0.4} />
      </SoftBox>
      <mesh position={[0, 0.27, 0]} castShadow>
        <coneGeometry args={[0.16, 0.14, 4]} />
        <meshStandardMaterial color="#2b2b2f" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.06, 0]}>
        <boxGeometry args={[0.18, 0.26, 0.18]} />
        <meshStandardMaterial color="#ffd48a" emissive="#ffb347" emissiveIntensity={2.2} toneMapped={false} transparent opacity={0.9} />
      </mesh>
      <pointLight position={[0, 0.05, 0]} color="#ffc36b" intensity={5} decay={1.8} distance={0} />
    </group>
  )
}

/** Fairy-light strings sagging between the poles, with glowing bulbs (bloom does the halo). */
function FairyLights() {
  const links: [number, number][] = [[0, 1], [0, 2]]
  const { curves, bulbs } = useMemo(() => {
    const curves: THREE.TubeGeometry[] = []
    const bulbs: { p: THREE.Vector3; c: THREE.Color }[] = []
    const pal = ['#ffd27a', '#ffb347', '#ff8a5c', '#fff1b0', '#ffc36b'].map((c) => new THREE.Color(c).multiplyScalar(3.2))
    links.forEach(([a, b], li) => {
      const A = new THREE.Vector3(POLES[a][0], G + POLES[a][2] - 0.05, POLES[a][1])
      const B = new THREE.Vector3(POLES[b][0], G + POLES[b][2] - 0.05, POLES[b][1])
      const pts = Array.from({ length: 20 }, (_, i) => {
        const t = i / 19
        const p = A.clone().lerp(B, t)
        p.y -= Math.sin(Math.PI * t) * 0.55
        return p
      })
      const curve = new THREE.CatmullRomCurve3(pts)
      curves.push(new THREE.TubeGeometry(curve, 40, 0.008, 4, false))
      const n = Math.round(A.distanceTo(B) / 0.42)
      for (let i = 1; i < n; i++) bulbs.push({ p: curve.getPoint(i / n).add(new THREE.Vector3(0, -0.05, 0)), c: pal[(i + li * 2) % pal.length] })
    })
    return { curves, bulbs }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const ref = useRef<THREE.InstancedMesh>(null!)
  useLayoutEffect(() => {
    const m = new THREE.Matrix4()
    bulbs.forEach((b, i) => { ref.current.setMatrixAt(i, m.makeTranslation(b.p.x, b.p.y, b.p.z)); ref.current.setColorAt(i, b.c) })
    ref.current.instanceMatrix.needsUpdate = true
    ref.current.instanceColor!.needsUpdate = true
  }, [bulbs])
  // gentle twinkle
  const tmp = useMemo(() => new THREE.Color(), [])
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    bulbs.forEach((b, i) => ref.current.setColorAt(i, tmp.copy(b.c).multiplyScalar(0.8 + Math.sin(t * 1.5 + i * 0.9) * 0.2)))
    ref.current.instanceColor!.needsUpdate = true
  })
  return (
    <group>
      {curves.map((g, i) => (
        <mesh key={i} geometry={g}>
          <meshStandardMaterial color="#2a2420" roughness={0.8} />
        </mesh>
      ))}
      <instancedMesh ref={ref} args={[undefined, undefined, bulbs.length]} raycast={() => null}>
        <sphereGeometry args={[0.04, 10, 8]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
    </group>
  )
}

function Poles() {
  const wood = useMemo(() => withRepeat(woodGrain('#7a5131', 73), 1, 3, Math.PI / 2), [])
  return (
    <group>
      {POLES.map(([x, z, h], i) => (
        <group key={i} position={[x, G, z]}>
          <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.05, 0.065, h, 10]} />
            <TexMat set={wood} bump={1.5} roughness={1} />
          </mesh>
          <mesh position={[0, 0.05, 0]} castShadow>
            <cylinderGeometry args={[0.11, 0.13, 0.1, 10]} />
            <meshStandardMaterial color="#6b6460" roughness={1} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/** Campfire corner of the garden: patio, fire pit, log seats, lamp post and fairy lights. */
export function Campfire({ shadows }: { shadows: boolean }) {
  // log seats on the patio rim, tangent to the fire
  const seat = (deg: number, rad = 1.4): [[number, number, number], number] => {
    const a = (deg * Math.PI) / 180
    return [[FX + Math.cos(a) * rad, G + 0.17, FZ + Math.sin(a) * rad], -a + Math.PI / 2]
  }
  const s1 = seat(225), s2 = seat(320)
  return (
    <group>
      <Patio />
      <FirePit shadows={shadows} />
      <Log position={s1[0]} rotY={s1[1]} />
      <Log position={s2[0]} rotY={s2[1]} len={1.05} r={0.16} />
      {/* toasting stick + a mug on a stump */}
      <group position={[FX + 1.4, G, FZ + 0.25]}>
        <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.2, 0.22, 0.4, 14]} />
          <meshStandardMaterial color="#6e482b" roughness={1} />
        </mesh>
        <mesh position={[0, 0.401, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.19, 14]} />
          <meshStandardMaterial color="#d2a36b" roughness={0.9} />
        </mesh>
        <mesh position={[0.05, 0.46, 0]} castShadow>
          <cylinderGeometry args={[0.045, 0.04, 0.11, 14]} />
          <meshStandardMaterial color="#3b82f6" roughness={0.4} />
        </mesh>
      </group>
      <mesh position={[FX + 0.55, G + 0.38, FZ - 0.55]} rotation={[0.9, -0.785, 0]} castShadow>
        <cylinderGeometry args={[0.008, 0.01, 1.1, 5]} />
        <meshStandardMaterial color="#8a5a2c" />
      </mesh>
      <mesh position={[FX + 0.2, G + 0.6, FZ - 0.2]}>
        <sphereGeometry args={[0.035, 10, 8]} />
        <meshStandardMaterial color="#fff6e8" roughness={0.9} />
      </mesh>
      <Poles />
      <Lantern />
      <FairyLights />
    </group>
  )
}
