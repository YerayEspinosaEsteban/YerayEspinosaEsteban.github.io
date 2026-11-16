import { activateZone, LABEL_HEIGHT, labelEls } from './labels'
import { useFrame, type ThreeElements, type ThreeEvent } from '@react-three/fiber'
import { useMemo, useRef, useState, type ReactNode } from 'react'
import * as THREE from 'three'
import { player } from './playerState'
import { R, tangentToward } from './sphere'
import { useGame } from './store'
import { SPAWN, ZONES, zoneById, type Zone } from './zones'

/* ───────────────────────── helpers ───────────────────────── */

function Spin({ speed = 1, axis = 'y', children, ...rest }: { speed?: number; axis?: 'x' | 'y' | 'z'; children: ReactNode } & ThreeElements['group']) {
  const g = useRef<THREE.Group>(null!)
  useFrame((_, dt) => (g.current.rotation[axis] += dt * speed))
  return <group ref={g} {...rest}>{children}</group>
}

function Bob({ amp = 0.15, speed = 1.5, children, ...rest }: { amp?: number; speed?: number; children: ReactNode } & ThreeElements['group']) {
  const g = useRef<THREE.Group>(null!)
  const y0 = (rest.position as [number, number, number] | undefined)?.[1] ?? 0
  useFrame(({ clock }) => (g.current.position.y = y0 + Math.sin(clock.elapsedTime * speed) * amp))
  return <group ref={g} {...rest}>{children}</group>
}

const Glow = ({ color, intensity = 1.5, ...p }: { color: string; intensity?: number } & ThreeElements['meshStandardMaterial']) => (
  <meshStandardMaterial color={color} emissive={color} emissiveIntensity={intensity} toneMapped={false} {...p} />
)

const Holo = ({ color, opacity = 0.75 }: { color: string; opacity?: number }) => (
  <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.6} transparent opacity={opacity} toneMapped={false} flatShading />
)

/* ───────────────────────── 1 · Base central ───────────────────────── */

function BaseBuilding() {
  return (
    <group>
      <mesh position={[0, 0.15, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[1.75, 1.95, 0.3, 6]} />
        <meshStandardMaterial color="#e2e8f0" flatShading />
      </mesh>
      <mesh position={[0, 0.36, 0]}>
        <cylinderGeometry args={[1.4, 1.4, 0.12, 6]} />
        <meshStandardMaterial color="#cbd5e1" flatShading />
      </mesh>
      {/* monolith */}
      <mesh position={[0, 2, 0]} castShadow>
        <boxGeometry args={[0.95, 3.2, 0.5]} />
        <meshStandardMaterial color="#1e293b" emissive="#0e7490" emissiveIntensity={0.25} metalness={0.7} roughness={0.25} />
      </mesh>
      {[-0.49, 0.49].map((x) => (
        <mesh key={x} position={[x, 2, 0]}>
          <boxGeometry args={[0.04, 3.2, 0.52]} />
          <Glow color="#22d3ee" />
        </mesh>
      ))}
      <mesh position={[0, 2.5, 0.26]}>
        <boxGeometry args={[0.6, 0.6, 0.02]} />
        <Glow color="#22d3ee" intensity={0.8} />
      </mesh>
      <mesh position={[0, 1.4, 0.26]}>
        <boxGeometry args={[0.6, 0.06, 0.02]} />
        <Glow color="#a78bfa" />
      </mesh>
      <mesh position={[0, 1.25, 0.26]}>
        <boxGeometry args={[0.4, 0.06, 0.02]} />
        <Glow color="#a78bfa" />
      </mesh>
      <Spin speed={0.8} position={[0, 2.4, 0]}>
        <mesh rotation={[Math.PI / 2.3, 0, 0]}>
          <torusGeometry args={[1.25, 0.04, 6, 48]} />
          <Glow color="#22d3ee" />
        </mesh>
      </Spin>
      <Spin speed={-0.5} position={[0, 2.4, 0]}>
        <mesh rotation={[Math.PI / 1.8, 0.4, 0]}>
          <torusGeometry args={[1.45, 0.03, 6, 48]} />
          <Glow color="#a78bfa" />
        </mesh>
      </Spin>
      <Bob position={[0, 4.15, 0]} amp={0.12}>
        <Spin speed={1.4}>
          <mesh castShadow>
            <octahedronGeometry args={[0.35, 0]} />
            <Glow color="#22d3ee" intensity={2} flatShading />
          </mesh>
        </Spin>
      </Bob>
    </group>
  )
}

/* ───────────────────────── 2 · Fortaleza Cloud & DevSecOps ───────────────────────── */

function FortressBuilding() {
  const leds = useMemo(() => Array.from({ length: 3 }, (_, f) => Array.from({ length: 4 }, (_, i) => ({ f, i, c: (f + i) % 3 === 0 ? '#4ade80' : '#a78bfa' }))).flat(), [])
  return (
    <group>
      <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.85, 2.0, 0.6, 8]} />
        <meshStandardMaterial color="#94a3b8" flatShading />
      </mesh>
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2
        return (
          <mesh key={i} position={[Math.cos(a) * 1.75, 0.75, Math.sin(a) * 1.75]} castShadow>
            <boxGeometry args={[0.35, 0.3, 0.35]} />
            <meshStandardMaterial color="#64748b" flatShading />
          </mesh>
        )
      })}
      {/* server-rack tower */}
      {[0, 1, 2].map((f) => (
        <mesh key={f} position={[0, 1.15 + f * 0.95, 0]} castShadow>
          <boxGeometry args={[1.35 - f * 0.12, 0.88, 1.35 - f * 0.12]} />
          <meshStandardMaterial color="#1e1b4b" metalness={0.6} roughness={0.35} />
        </mesh>
      ))}
      {leds.map(({ f, i, c }) => {
        const half = (1.35 - f * 0.12) / 2 + 0.01
        const rot = (i * Math.PI) / 2
        return (
          <group key={`${f}-${i}`} rotation={[0, rot, 0]} position={[0, 1.15 + f * 0.95, 0]}>
            {[-0.22, 0, 0.22].map((y) => (
              <mesh key={y} position={[0, y, half]}>
                <boxGeometry args={[0.8 - f * 0.1, 0.05, 0.02]} />
                <Glow color={c} intensity={1.2} />
              </mesh>
            ))}
          </group>
        )
      })}
      <mesh position={[0, 4.05, 0]}>
        <cylinderGeometry args={[0.03, 0.05, 1, 6]} />
        <meshStandardMaterial color="#e2e8f0" />
      </mesh>
      <mesh position={[0, 4.6, 0]}>
        <sphereGeometry args={[0.1, 10, 8]} />
        <Glow color="#f43f5e" intensity={2.5} />
      </mesh>
      {/* orbital shields: defence in depth */}
      <Spin speed={0.7} position={[0, 2.2, 0]}>
        <mesh rotation={[1.2, 0, 0]}>
          <torusGeometry args={[1.9, 0.05, 6, 64]} />
          <Glow color="#a78bfa" />
        </mesh>
        <mesh position={[1.9, 0, 0]}>
          <boxGeometry args={[0.2, 0.2, 0.2]} />
          <Glow color="#a78bfa" />
        </mesh>
      </Spin>
      <Spin speed={-0.5} position={[0, 2.4, 0]}>
        <mesh rotation={[1.9, 0.5, 0]}>
          <torusGeometry args={[2.15, 0.04, 6, 64]} />
          <Glow color="#4ade80" />
        </mesh>
      </Spin>
      <Spin speed={0.15} position={[0, 1.4, 0]}>
        <mesh>
          <icosahedronGeometry args={[2.6, 1]} />
          <meshBasicMaterial color="#a78bfa" wireframe transparent opacity={0.16} />
        </mesh>
      </Spin>
    </group>
  )
}

/* ───────────────────────── 3 · Hangar de proyectos ───────────────────────── */

function Rocket({ c }: { c: string }) {
  return (
    <group scale={0.8}>
      <mesh><cylinderGeometry args={[0.16, 0.18, 0.6, 8]} /><Holo color={c} /></mesh>
      <mesh position={[0, 0.45, 0]}><coneGeometry args={[0.16, 0.32, 8]} /><Holo color={c} /></mesh>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[Math.cos((i * Math.PI * 2) / 3) * 0.2, -0.25, Math.sin((i * Math.PI * 2) / 3) * 0.2]}>
          <boxGeometry args={[0.06, 0.2, 0.12]} /><Holo color={c} />
        </mesh>
      ))}
      <mesh position={[0, 0.0, 0]} scale={[1.8, 1.8, 1.8]}><sphereGeometry args={[0.05, 6, 4]} /><Holo color="#ef4444" /></mesh>
    </group>
  )
}
function Car({ c }: { c: string }) {
  return (
    <group scale={0.8}>
      <mesh position={[0, 0.05, 0]}><boxGeometry args={[0.75, 0.18, 0.38]} /><Holo color={c} /></mesh>
      <mesh position={[-0.05, 0.22, 0]}><boxGeometry args={[0.4, 0.16, 0.34]} /><Holo color={c} /></mesh>
      {[[-0.25, 0.2], [0.25, 0.2], [-0.25, -0.2], [0.25, -0.2]].map(([x, z], i) => (
        <mesh key={i} position={[x, -0.06, z]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.09, 0.09, 0.06, 10]} /><Holo color="#e2e8f0" /></mesh>
      ))}
    </group>
  )
}
function Heart({ c }: { c: string }) {
  return (
    <group scale={0.75}>
      <mesh position={[-0.13, 0.1, 0]}><sphereGeometry args={[0.18, 10, 8]} /><Holo color={c} /></mesh>
      <mesh position={[0.13, 0.1, 0]}><sphereGeometry args={[0.18, 10, 8]} /><Holo color={c} /></mesh>
      <mesh position={[0, -0.12, 0]} rotation={[0, 0, Math.PI]}><coneGeometry args={[0.29, 0.38, 12]} /><Holo color={c} /></mesh>
    </group>
  )
}
function ShieldIcon({ c }: { c: string }) {
  return (
    <group scale={0.8}>
      <mesh scale={[1, 1.2, 0.35]}><octahedronGeometry args={[0.3, 0]} /><Holo color={c} /></mesh>
      <mesh position={[0, 0.02, 0.1]}><boxGeometry args={[0.05, 0.3, 0.02]} /><Holo color="#ffffff" opacity={0.9} /></mesh>
      <mesh position={[0, 0.06, 0.1]}><boxGeometry args={[0.22, 0.05, 0.02]} /><Holo color="#ffffff" opacity={0.9} /></mesh>
    </group>
  )
}

function Pedestal({ x, z, color, children }: { x: number; z: number; color: string; children: ReactNode }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.25, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.38, 0.5, 8]} />
        <meshStandardMaterial color="#334155" flatShading />
      </mesh>
      <mesh position={[0, 0.51, 0]}>
        <cylinderGeometry args={[0.26, 0.26, 0.02, 16]} />
        <Glow color={color} />
      </mesh>
      <mesh position={[0, 0.95, 0]}>
        <cylinderGeometry args={[0.32, 0.22, 0.85, 16, 1, true]} />
        <meshBasicMaterial color={color} transparent opacity={0.12} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <Bob position={[0, 1.1, 0]} amp={0.08} speed={2}>
        <Spin speed={0.9}>{children}</Spin>
      </Bob>
    </group>
  )
}

function HangarBuilding() {
  return (
    <group>
      <mesh position={[0, 0.06, 0]} receiveShadow>
        <boxGeometry args={[4.2, 0.12, 3.2]} />
        <meshStandardMaterial color="#cbd5e1" flatShading />
      </mesh>
      {/* arched hangar, opening towards +Z (the arrival path) */}
      <group position={[0, 0.1, -0.75]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[1.55, 1.55, 2.6, 14, 1, true, Math.PI / 2, Math.PI]} />
          <meshStandardMaterial color="#e2e8f0" side={THREE.DoubleSide} flatShading metalness={0.25} />
        </mesh>
        {[-1.25, 0, 1.25].map((z) => (
          <mesh key={z} position={[0, 0, z]}>
            <torusGeometry args={[1.58, 0.06, 4, 20, Math.PI]} />
            <meshStandardMaterial color="#f59e0b" flatShading />
          </mesh>
        ))}
        <mesh position={[0, 0, -1.3]}>
          <circleGeometry args={[1.55, 14, 0, Math.PI]} />
          <meshStandardMaterial color="#475569" side={THREE.DoubleSide} flatShading />
        </mesh>
        {/* glowing hangar sign + runway lights */}
        <mesh position={[0, 1.75, 1.3]}>
          <boxGeometry args={[1.3, 0.28, 0.06]} />
          <Glow color="#fbbf24" intensity={1.1} />
        </mesh>
        {[-0.9, -0.3, 0.3, 0.9].map((x) => (
          <mesh key={x} position={[x, 0.04, 0.4]}>
            <boxGeometry args={[0.18, 0.03, 0.18]} />
            <Glow color="#fbbf24" intensity={1.4} />
          </mesh>
        ))}
        <mesh position={[0, 0.9, -0.6]}>
          <boxGeometry args={[1.6, 0.5, 0.9]} />
          <meshStandardMaterial color="#64748b" flatShading metalness={0.5} />
        </mesh>
        <mesh position={[0, 1.2, -0.6]} rotation={[0, 0, 0]}>
          <coneGeometry args={[0.35, 0.6, 4]} />
          <meshStandardMaterial color="#94a3b8" flatShading metalness={0.5} />
        </mesh>
      </group>
      <Pedestal x={-1.55} z={1.25} color="#fb923c"><Rocket c="#fb923c" /></Pedestal>
      <Pedestal x={-0.52} z={1.45} color="#22d3ee"><Car c="#22d3ee" /></Pedestal>
      <Pedestal x={0.52} z={1.45} color="#c084fc"><Heart c="#c084fc" /></Pedestal>
      <Pedestal x={1.55} z={1.25} color="#4ade80"><ShieldIcon c="#4ade80" /></Pedestal>
    </group>
  )
}

/* ───────────────────────── 4 · Academia & Gimnasio (Centro Pokémon × Templo Jedi) ───────────────────────── */

function GymBuilding() {
  return (
    <group>
      <mesh position={[0, 0.1, 0]} receiveShadow>
        <boxGeometry args={[3.4, 0.2, 3]} />
        <meshStandardMaterial color="#e5e7eb" flatShading />
      </mesh>
      {/* main body */}
      <mesh position={[0, 0.95, -0.2]} castShadow>
        <boxGeometry args={[2.6, 1.5, 2]} />
        <meshStandardMaterial color="#fff7ed" flatShading />
      </mesh>
      <mesh position={[0, 1.85, -0.2]} castShadow>
        <boxGeometry args={[2.85, 0.35, 2.25]} />
        <meshStandardMaterial color="#ef4444" flatShading />
      </mesh>
      {/* door */}
      <mesh position={[0, 0.65, 0.81]}>
        <boxGeometry args={[0.8, 0.9, 0.04]} />
        <meshStandardMaterial color="#67e8f9" transparent opacity={0.75} metalness={0.4} roughness={0.1} />
      </mesh>
      {/* Poké-emblem on the façade */}
      <group position={[0, 1.42, 0.82]}>
        <mesh><circleGeometry args={[0.32, 24, 0, Math.PI]} /><meshStandardMaterial color="#ef4444" /></mesh>
        <mesh><circleGeometry args={[0.32, 24, Math.PI, Math.PI]} /><meshStandardMaterial color="#ffffff" /></mesh>
        <mesh position={[0, 0, 0.005]}><planeGeometry args={[0.64, 0.05]} /><meshStandardMaterial color="#111827" /></mesh>
        <mesh position={[0, 0, 0.01]}><circleGeometry args={[0.09, 16]} /><meshStandardMaterial color="#111827" /></mesh>
        <mesh position={[0, 0, 0.015]}><circleGeometry args={[0.055, 16]} /><meshStandardMaterial color="#ffffff" /></mesh>
      </group>
      {/* Jedi-temple spires on the roof */}
      {[[0, 0.75, 1.2], [-0.95, 0.4, 0.55], [0.95, 0.4, 0.55], [-0.95, -0.85, 0.55], [0.95, -0.85, 0.55]].map(([x, z, h], i) => (
        <group key={i} position={[x, 2.02, z - 0.2]}>
          <mesh position={[0, h / 2, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.2, h, 6]} />
            <meshStandardMaterial color="#d6c7a1" flatShading />
          </mesh>
          <mesh position={[0, h + 0.05, 0]}>
            <sphereGeometry args={[0.07, 8, 6]} />
            <Glow color="#fbbf24" intensity={1.5} />
          </mesh>
        </group>
      ))}
      {/* temple pillars */}
      {[-1.45, 1.45].map((x) =>
        [1.2, -0.4].map((z) => (
          <mesh key={`${x}${z}`} position={[x, 1, z]} castShadow>
            <cylinderGeometry args={[0.13, 0.15, 1.8, 8]} />
            <meshStandardMaterial color="#e7dcc0" flatShading />
          </mesh>
        )),
      )}
      {/* orbiting medals */}
      <Spin speed={0.9} position={[0, 3.4, -0.2]}>
        {['#fbbf24', '#e5e7eb', '#d97706'].map((c, i) => {
          const a = (i / 3) * Math.PI * 2
          return (
            <Spin key={c} speed={2} position={[Math.cos(a) * 0.9, 0, Math.sin(a) * 0.9]}>
              <mesh castShadow>
                <octahedronGeometry args={[0.18, 0]} />
                <meshStandardMaterial color={c} metalness={0.9} roughness={0.2} emissive={c} emissiveIntensity={0.3} flatShading />
              </mesh>
            </Spin>
          )
        })}
      </Spin>
    </group>
  )
}

/* ───────────────────────── 5 · Zona secreta: portal + Holocrón ───────────────────────── */

function SecretBuilding() {
  const disc = useRef<THREE.MeshBasicMaterial>(null!)
  useFrame(({ clock }) => (disc.current.opacity = 0.45 + Math.sin(clock.elapsedTime * 2.5) * 0.15))
  return (
    <group>
      <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.95, 1.1, 0.3, 8]} />
        <meshStandardMaterial color="#64748b" flatShading />
      </mesh>
      {/* star portal */}
      <group position={[0, 1.55, 0]}>
        <mesh castShadow>
          <torusGeometry args={[1.05, 0.13, 6, 24]} />
          <meshStandardMaterial color="#475569" flatShading metalness={0.5} />
        </mesh>
        <Spin speed={1.5} axis="z">
          {Array.from({ length: 9 }, (_, i) => {
            const a = (i / 9) * Math.PI * 2
            return (
              <mesh key={i} position={[Math.cos(a) * 1.05, Math.sin(a) * 1.05, 0.12]}>
                <boxGeometry args={[0.1, 0.1, 0.06]} />
                <Glow color="#4ade80" intensity={2} />
              </mesh>
            )
          })}
        </Spin>
        <Spin speed={-0.8} axis="z">
          <mesh>
            <circleGeometry args={[0.95, 6]} />
            <meshBasicMaterial ref={disc} color="#22d3ee" transparent opacity={0.5} side={THREE.DoubleSide} depthWrite={false} toneMapped={false} />
          </mesh>
        </Spin>
      </group>
      {/* Holocron */}
      <Bob position={[1.5, 2.6, 0.4]} amp={0.18} speed={1.2}>
        <Spin speed={0.8}>
          <group rotation={[0.6, 0, 0.6]}>
            <mesh>
              <boxGeometry args={[0.42, 0.42, 0.42]} />
              <meshStandardMaterial color="#78350f" emissive="#f59e0b" emissiveIntensity={0.7} metalness={0.6} roughness={0.3} transparent opacity={0.9} />
            </mesh>
            <lineSegments>
              <edgesGeometry args={[new THREE.BoxGeometry(0.44, 0.44, 0.44)]} />
              <lineBasicMaterial color="#fde68a" toneMapped={false} />
            </lineSegments>
            <mesh>
              <octahedronGeometry args={[0.16, 0]} />
              <Glow color="#38bdf8" intensity={3} />
            </mesh>
          </group>
        </Spin>
      </Bob>
    </group>
  )
}

/* ───────────────────────── zone wrapper: placement, plaza ring, label, clicks ───────────────────────── */

const BUILDINGS: Record<Zone['id'], () => React.ReactElement> = {
  base: BaseBuilding,
  fortress: FortressBuilding,
  hangar: HangarBuilding,
  gym: GymBuilding,
  secret: SecretBuilding,
}

function ZoneSite({ zone }: { zone: Zone }) {
  const near = useGame((s) => s.near === zone.id)
  const ringMat = useRef<THREE.MeshBasicMaterial>(null!)
  const [hover, setHover] = useState(false)
  const pos = useMemo(() => zone.dir.clone().multiplyScalar(R), [zone])
  // every building's façade (+Z) faces the path the player arrives on
  const quat = useMemo(() => {
    const from = zone.id === 'base' ? SPAWN : zoneById.base.dir
    const fwd = tangentToward(zone.dir, from)
    const right = new THREE.Vector3().crossVectors(zone.dir, fwd)
    return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(right, zone.dir, fwd))
  }, [zone])
  const Building = BUILDINGS[zone.id]

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    ringMat.current.opacity = near ? 0.7 + Math.sin(t * 5) * 0.25 : hover ? 0.5 : 0.22
  })

  const activate = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    if (e.delta > 6) return
    activateZone(zone.id)
  }

  const trig = zone.trigger * R
  return (
    <group position={pos} quaternion={quat}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
        <ringGeometry args={[trig - 0.18, trig, 64]} />
        <meshBasicMaterial ref={ringMat} color={zone.color} transparent opacity={0.25} depthWrite={false} toneMapped={false} />
      </mesh>
      <group
        onClick={activate}
        onPointerOver={(e) => { e.stopPropagation(); setHover(true); document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { setHover(false); document.body.style.cursor = '' }}
      >
        <Building />
      </group>
    </group>
  )
}

/** Projects each zone's label anchor to screen space and positions the DOM labels (see ui/ZoneLabels). */
function LabelProjector() {
  const anchors = useMemo(() => ZONES.map((z) => z.dir.clone().multiplyScalar(R + LABEL_HEIGHT[z.id])), [])
  const v = useMemo(() => new THREE.Vector3(), [])
  useFrame(({ camera, size }) => {
    ZONES.forEach((z, i) => {
      const el = labelEls[z.id]
      if (!el) return
      // fade labels on the far side of the planet
      const op = THREE.MathUtils.clamp((player.up.dot(z.dir) - 0.35) * 3, 0, 1)
      v.copy(anchors[i]).project(camera)
      const behind = v.z > 1
      el.style.opacity = behind ? '0' : String(op)
      el.style.pointerEvents = op > 0.3 && !behind ? 'auto' : 'none'
      el.style.transform = `translate(-50%, -50%) translate(${((v.x + 1) / 2) * size.width}px, ${((1 - v.y) / 2) * size.height}px)`
    })
  })
  return null
}

export function Zones() {
  return (
    <>
      {ZONES.map((z) => (
        <ZoneSite key={z.id} zone={z} />
      ))}
      <LabelProjector />
    </>
  )
}
