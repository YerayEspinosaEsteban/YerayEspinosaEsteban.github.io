import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Anchor, Glow, Interactive, Marker, SoftBox, TexMat, useHighlight } from './common'
import { AboutScreen, ScreenPanel } from './Panels'
import { drawCode, drawMain, useCanvasTexture } from './screens'
import { useStore } from './store'
import { fabric, withRepeat, woodGrain } from './textures'

export const DESK = { x: -2.75, z: -4.47, y: 0.86, w: 2.7, d: 0.95 }
const SCREEN = { w: 1.04, h: 0.62 }

function Monitor() {
  const tex = useCanvasTexture(drawMain, 768, 458, 10)
  const hl = useHighlight('about')
  const mat = useRef<THREE.MeshStandardMaterial>(null!)
  useFrame(() => (mat.current.emissiveIntensity = 0.75 + hl.current * 0.35))
  const y = DESK.y + 0.56
  return (
    <group position={[DESK.x + 0.15, 0, DESK.z - 0.22]}>
      <SoftBox size={[SCREEN.w + 0.08, SCREEN.h + 0.08, 0.05]} radius={0.025} position={[0, y, 0]}>
        <meshStandardMaterial color="#f4f1ea" roughness={0.35} />
      </SoftBox>
      <mesh position={[0, y, 0.027]}>
        <planeGeometry args={[SCREEN.w, SCREEN.h]} />
        <meshStandardMaterial ref={mat} map={tex} emissive="#ffffff" emissiveMap={tex} emissiveIntensity={0.75} roughness={0.25} />
      </mesh>
      <mesh position={[0, DESK.y + 0.18, -0.05]} castShadow>
        <boxGeometry args={[0.07, 0.34, 0.04]} />
        <meshStandardMaterial color="#e5e0d6" roughness={0.4} />
      </mesh>
      <SoftBox size={[0.36, 0.025, 0.22]} radius={0.01} position={[0, DESK.y + 0.012, -0.02]}>
        <meshStandardMaterial color="#e5e0d6" roughness={0.4} />
      </SoftBox>
      <Anchor id="about" width={SCREEN.w} height={SCREEN.h} position={[0, y, 0.032]}>
        <ScreenPanel id="about" width={SCREEN.w} height={SCREEN.h} px={1024}>
          <AboutScreen />
        </ScreenPanel>
      </Anchor>
    </group>
  )
}

function Laptop() {
  const tex = useCanvasTexture(drawCode, 360, 230, 6)
  return (
    <group position={[DESK.x + 1.05, DESK.y, DESK.z + 0.1]} rotation={[0, -0.5, 0]}>
      <SoftBox size={[0.5, 0.022, 0.34]} radius={0.01} position={[0, 0.011, 0]}>
        <meshStandardMaterial color="#c9ced6" metalness={0.6} roughness={0.3} />
      </SoftBox>
      <mesh position={[0, 0.024, 0.02]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.42, 0.18]} />
        <meshStandardMaterial color="#3f4652" roughness={0.6} />
      </mesh>
      <group position={[0, 0.02, -0.165]} rotation={[-0.32, 0, 0]}>
        <SoftBox size={[0.5, 0.32, 0.016]} radius={0.008} position={[0, 0.16, 0]}>
          <meshStandardMaterial color="#c9ced6" metalness={0.6} roughness={0.3} />
        </SoftBox>
        <mesh position={[0, 0.16, 0.009]}>
          <planeGeometry args={[0.45, 0.28]} />
          <meshStandardMaterial map={tex} emissive="#ffffff" emissiveMap={tex} emissiveIntensity={0.5} roughness={0.3} />
        </mesh>
      </group>
    </group>
  )
}

/** Ceramic mug with rising steam puffs. */
function Mug() {
  const puffs = useRef<THREE.Mesh[]>([])
  const seeds = useMemo(() => Array.from({ length: 7 }, (_, i) => i / 7), [])
  useFrame(({ clock }) => {
    const t = clock.elapsedTime * 0.35
    seeds.forEach((s, i) => {
      const m = puffs.current[i]
      if (!m) return
      const k = (t + s) % 1
      m.position.set(Math.sin((t + s) * 9) * 0.03 * k, 0.13 + k * 0.45, Math.cos((t + s) * 7) * 0.02 * k)
      m.scale.setScalar(0.025 + k * 0.07)
      ;(m.material as THREE.MeshBasicMaterial).opacity = Math.sin(k * Math.PI) * 0.35
    })
  })
  return (
    <group position={[DESK.x - 0.6, DESK.y, DESK.z + 0.25]}>
      <mesh position={[0, 0.065, 0]} castShadow>
        <cylinderGeometry args={[0.058, 0.052, 0.13, 20]} />
        <meshPhysicalMaterial color="#f6efe2" roughness={0.25} clearcoat={0.8} />
      </mesh>
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.059, 0.059, 0.03, 20]} />
        <meshPhysicalMaterial color="#e2574c" roughness={0.3} clearcoat={0.8} />
      </mesh>
      <mesh position={[0.065, 0.065, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.033, 0.01, 8, 16]} />
        <meshPhysicalMaterial color="#f6efe2" roughness={0.25} clearcoat={0.8} />
      </mesh>
      <mesh position={[0, 0.125, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.05, 20]} />
        <meshStandardMaterial color="#5b3416" roughness={0.2} />
      </mesh>
      {seeds.map((_, i) => (
        <mesh key={i} ref={(el) => { if (el) puffs.current[i] = el }} raycast={() => null}>
          <sphereGeometry args={[1, 10, 8]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.2} depthWrite={false} />
        </mesh>
      ))}
    </group>
  )
}

/** Articulated desk lamp (flexo) with a warm bulb and real light. */
function Lamp() {
  return (
    <group position={[DESK.x - 1.05, DESK.y, DESK.z - 0.2]}>
      <mesh position={[0, 0.02, 0]} castShadow>
        <cylinderGeometry args={[0.11, 0.13, 0.04, 20]} />
        <meshStandardMaterial color="#2f7d5b" roughness={0.35} metalness={0.3} />
      </mesh>
      <mesh position={[0.06, 0.25, 0.04]} rotation={[0.2, 0, -0.3]} castShadow>
        <cylinderGeometry args={[0.012, 0.012, 0.46, 8]} />
        <meshStandardMaterial color="#d6d3cc" metalness={0.8} roughness={0.25} />
      </mesh>
      <mesh position={[0.13, 0.47, 0.09]}>
        <sphereGeometry args={[0.025, 10, 8]} />
        <meshStandardMaterial color="#2f7d5b" metalness={0.3} roughness={0.35} />
      </mesh>
      <mesh position={[0.26, 0.55, 0.14]} rotation={[0.2, 0, 1.15]} castShadow>
        <cylinderGeometry args={[0.012, 0.012, 0.3, 8]} />
        <meshStandardMaterial color="#d6d3cc" metalness={0.8} roughness={0.25} />
      </mesh>
      <mesh position={[0.42, 0.53, 0.19]} rotation={[0.4, 0, -2.4]} castShadow>
        <coneGeometry args={[0.1, 0.16, 20, 1, true]} />
        <meshStandardMaterial color="#2f7d5b" side={THREE.DoubleSide} roughness={0.35} metalness={0.3} />
      </mesh>
      <mesh position={[0.45, 0.49, 0.21]}>
        <sphereGeometry args={[0.035, 12, 10]} />
        <Glow color="#ffd58a" intensity={2.6} />
      </mesh>
      <pointLight position={[0.5, 0.4, 0.3]} color="#ffcf8a" intensity={1.6} distance={2.4} decay={2} />
    </group>
  )
}

function Notebook() {
  return (
    <group position={[DESK.x + 0.15, DESK.y, DESK.z + 0.3]} rotation={[0, 0.15, 0]}>
      <SoftBox size={[0.42, 0.025, 0.3]} radius={0.008} position={[0, 0.013, 0]}>
        <meshStandardMaterial color="#3b82f6" roughness={0.6} />
      </SoftBox>
      <mesh position={[0, 0.027, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.38, 0.27]} />
        <meshStandardMaterial color="#fffdf6" roughness={0.9} />
      </mesh>
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={i} position={[-0.02, 0.028, -0.09 + i * 0.04]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.3 - (i % 3) * 0.06, 0.006]} />
          <meshBasicMaterial color="#94a3b8" />
        </mesh>
      ))}
      <mesh position={[0.12, 0.04, 0.02]} rotation={[0, 0.6, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.008, 0.008, 0.22, 6]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.5} />
      </mesh>
    </group>
  )
}

function Chair() {
  // the camera ends up where the chair is when zooming into the monitor → roll it out of the way
  const g = useRef<THREE.Group>(null!)
  const cushion = useMemo(() => withRepeat(fabric('#3f7cac', undefined, 21), 2, 2), [])
  const wood = useMemo(() => withRepeat(woodGrain('#b57a45', 13), 1, 1), [])
  useFrame((_, dt) => {
    const away = useStore.getState().focus === 'about'
    const k = 1 - Math.exp(-3 * dt)
    g.current.position.x = THREE.MathUtils.lerp(g.current.position.x, away ? -0.6 : -2.55, k)
    g.current.position.z = THREE.MathUtils.lerp(g.current.position.z, away ? -2.6 : -3.55, k)
    g.current.rotation.y = THREE.MathUtils.lerp(g.current.rotation.y, away ? Math.PI + 1.2 : Math.PI + 0.25, k)
  })
  return (
    <group ref={g} position={[-2.55, 0, -3.55]} rotation={[0, Math.PI + 0.25, 0]}>
      {Array.from({ length: 5 }, (_, i) => {
        const a = (i / 5) * Math.PI * 2
        return (
          <group key={i} rotation={[0, a, 0]}>
            <mesh position={[0.18, 0.07, 0]} castShadow>
              <boxGeometry args={[0.36, 0.035, 0.05]} />
              <meshStandardMaterial color="#3a3f47" metalness={0.5} roughness={0.4} />
            </mesh>
            <mesh position={[0.34, 0.035, 0]}>
              <sphereGeometry args={[0.035, 10, 8]} />
              <meshStandardMaterial color="#1f2328" />
            </mesh>
          </group>
        )
      })}
      <mesh position={[0, 0.28, 0]} castShadow>
        <cylinderGeometry args={[0.028, 0.035, 0.4, 10]} />
        <meshStandardMaterial color="#c9ced6" metalness={0.8} roughness={0.25} />
      </mesh>
      <SoftBox size={[0.56, 0.08, 0.54]} radius={0.03} position={[0, 0.5, 0]}>
        <TexMat set={wood} bump={0.5} roughness={0.6} />
      </SoftBox>
      <SoftBox size={[0.52, 0.09, 0.5]} radius={0.045} position={[0, 0.58, 0.01]}>
        <TexMat set={cushion} bump={0.6} roughness={1} />
      </SoftBox>
      <SoftBox size={[0.52, 0.66, 0.08]} radius={0.04} position={[0, 0.95, -0.27]} rotation={[-0.1, 0, 0]}>
        <TexMat set={wood} bump={0.5} roughness={0.6} />
      </SoftBox>
      <SoftBox size={[0.44, 0.48, 0.07]} radius={0.035} position={[0, 0.95, -0.22]} rotation={[-0.1, 0, 0]}>
        <TexMat set={cushion} bump={0.6} roughness={1} />
      </SoftBox>
    </group>
  )
}

export function Desk() {
  const top = useMemo(() => withRepeat(woodGrain('#c48a52', 2), 2, 1), [])
  const body = useMemo(() => withRepeat(woodGrain('#b07745', 3), 1, 1), [])
  return (
    <Interactive id="about">
      <SoftBox size={[DESK.w, 0.07, DESK.d]} radius={0.025} position={[DESK.x, DESK.y - 0.035, DESK.z]}>
        <TexMat set={top} bump={0.6} roughness={0.5} />
      </SoftBox>
      {/* drawer unit (left) + leg panel (right) */}
      <SoftBox size={[0.62, DESK.y - 0.07, DESK.d - 0.08]} radius={0.02} position={[DESK.x - DESK.w / 2 + 0.36, (DESK.y - 0.07) / 2, DESK.z]}>
        <TexMat set={body} bump={0.5} roughness={0.6} />
      </SoftBox>
      {[0.2, 0.46, 0.7].map((y) => (
        <group key={y} position={[DESK.x - DESK.w / 2 + 0.36, y, DESK.z + DESK.d / 2 - 0.035]}>
          <SoftBox size={[0.56, 0.22, 0.02]} radius={0.008}>
            <meshStandardMaterial color="#c48a52" roughness={0.5} />
          </SoftBox>
          <mesh position={[0, 0.03, 0.02]} rotation={[0, 0, Math.PI / 2]}>
            <capsuleGeometry args={[0.012, 0.1, 4, 8]} />
            <meshStandardMaterial color="#d4a72c" metalness={0.8} roughness={0.25} />
          </mesh>
        </group>
      ))}
      <SoftBox size={[0.07, DESK.y - 0.07, DESK.d - 0.08]} radius={0.02} position={[DESK.x + DESK.w / 2 - 0.08, (DESK.y - 0.07) / 2, DESK.z]}>
        <TexMat set={body} bump={0.5} roughness={0.6} />
      </SoftBox>
      <mesh position={[DESK.x + 0.4, DESK.y - 0.2, DESK.z - DESK.d / 2 + 0.06]} castShadow>
        <boxGeometry args={[1.5, 0.3, 0.03]} />
        <meshStandardMaterial color="#b07745" roughness={0.6} />
      </mesh>
      <Monitor />
      <Laptop />
      <Mug />
      <Lamp />
      <Notebook />
      {/* keyboard + mouse */}
      <SoftBox size={[0.62, 0.025, 0.2]} radius={0.01} position={[DESK.x + 0.15, DESK.y + 0.013, DESK.z + 0.02]}>
        <meshStandardMaterial color="#f4f1ea" roughness={0.5} />
      </SoftBox>
      <mesh position={[DESK.x + 0.6, DESK.y + 0.018, DESK.z + 0.05]} scale={[1, 0.55, 1.4]} castShadow>
        <sphereGeometry args={[0.04, 14, 10]} />
        <meshStandardMaterial color="#f4f1ea" roughness={0.4} />
      </mesh>
      <Chair />
      <Marker id="about" position={[DESK.x + 0.15, 2.45, DESK.z - 0.1]} />
    </Interactive>
  )
}
