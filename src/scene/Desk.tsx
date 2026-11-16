import { useFrame, type ThreeElements } from '@react-three/fiber'
import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Anchor, Fan, Glow, Interactive, NeonText, useHighlight } from './common'
import { AboutScreen, ScreenPanel } from './Panels'
import { drawCode, drawDash, drawMain, useCanvasTexture } from './screens'
import { useStore } from './store'

const DESK = { x: 1.2, z: -4.1, y: 1.0, w: 3.4, d: 1.3 }
const DARK = '#1a1d2b'

function Monitor({ w, h, tex, hl, ...rest }: { w: number; h: number; tex: THREE.Texture; hl?: React.RefObject<number> } & ThreeElements['group']) {
  const mat = useRef<THREE.MeshStandardMaterial>(null!)
  useFrame(() => { if (hl?.current) mat.current.emissiveIntensity = 1.15 * hl.current })
  return (
    <group {...rest}>
      <mesh castShadow>
        <boxGeometry args={[w + 0.08, h + 0.08, 0.05]} />
        <meshStandardMaterial color="#0b0d14" metalness={0.6} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0, 0.027]}>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial ref={mat} map={tex} emissive="#ffffff" emissiveMap={tex} emissiveIntensity={1.15} toneMapped={false} roughness={0.3} />
      </mesh>
      {/* stand */}
      <mesh position={[0, -h / 2 - 0.12, -0.06]} castShadow>
        <boxGeometry args={[0.06, 0.3, 0.04]} />
        <meshStandardMaterial color="#2b3042" metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  )
}

function Keyboard() {
  const strip = useRef<THREE.MeshStandardMaterial>(null!)
  const keys = useMemo(() => {
    const out: [number, number][] = []
    for (let r = 0; r < 4; r++) for (let c = 0; c < 14; c++) out.push([-0.39 + c * 0.06, -0.09 + r * 0.06])
    return out
  }, [])
  const inst = useRef<THREE.InstancedMesh>(null!)
  useLayoutEffect(() => {
    const m = new THREE.Matrix4()
    keys.forEach(([x, z], i) => inst.current.setMatrixAt(i, m.makeTranslation(x, 0.03, z)))
    inst.current.instanceMatrix.needsUpdate = true
  }, [keys])
  useFrame(({ clock }) => strip.current.emissive.setHSL((clock.elapsedTime * 0.12) % 1, 0.9, 0.55))
  return (
    <group position={[DESK.x, DESK.y + 0.04, -3.72]}>
      <mesh castShadow>
        <boxGeometry args={[0.9, 0.035, 0.3]} />
        <meshStandardMaterial color="#111827" metalness={0.4} roughness={0.5} />
      </mesh>
      <instancedMesh ref={inst} args={[undefined, undefined, keys.length]}>
        <boxGeometry args={[0.048, 0.022, 0.048]} />
        <meshStandardMaterial color="#1f2937" roughness={0.6} />
      </instancedMesh>
      <mesh position={[0, -0.02, 0.152]}>
        <boxGeometry args={[0.9, 0.012, 0.01]} />
        <meshStandardMaterial ref={strip} color="#000" emissive="#22d3ee" emissiveIntensity={3} toneMapped={false} />
      </mesh>
      {/* mouse + pad */}
      <mesh position={[0.72, -0.012, 0.02]} receiveShadow>
        <boxGeometry args={[0.36, 0.006, 0.3]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      <mesh position={[0.72, 0.012, 0.02]} scale={[1, 0.55, 1.4]} castShadow>
        <sphereGeometry args={[0.045, 14, 10]} />
        <meshStandardMaterial color="#1f2937" metalness={0.3} />
      </mesh>
    </group>
  )
}

/** Mug with rising steam puffs. */
function Mug() {
  const puffs = useRef<THREE.Mesh[]>([])
  const seeds = useMemo(() => Array.from({ length: 7 }, (_, i) => i / 7), [])
  useFrame(({ clock }) => {
    const t = clock.elapsedTime * 0.35
    seeds.forEach((s, i) => {
      const m = puffs.current[i]
      if (!m) return
      const k = (t + s) % 1
      m.position.set(Math.sin((t + s) * 9) * 0.03 * k, 0.12 + k * 0.5, Math.cos((t + s) * 7) * 0.02 * k)
      m.scale.setScalar(0.03 + k * 0.08)
      ;(m.material as THREE.MeshBasicMaterial).opacity = Math.sin(k * Math.PI) * 0.22
    })
  })
  return (
    <group position={[2.6, DESK.y + 0.04, -3.75]}>
      <mesh position={[0, 0.07, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.055, 0.14, 16]} />
        <meshStandardMaterial color="#f472b6" roughness={0.4} />
      </mesh>
      <mesh position={[0.065, 0.075, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.035, 0.01, 6, 12]} />
        <meshStandardMaterial color="#f472b6" roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.135, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.052, 16]} />
        <meshStandardMaterial color="#3b1d0f" />
      </mesh>
      {seeds.map((_, i) => (
        <mesh key={i} ref={(el) => { if (el) puffs.current[i] = el }}>
          <sphereGeometry args={[1, 8, 6]} />
          <meshBasicMaterial color="#e2e8f0" transparent opacity={0.2} depthWrite={false} />
        </mesh>
      ))}
    </group>
  )
}

function Lamp() {
  return (
    <group position={[-0.25, DESK.y + 0.04, -4.45]}>
      <mesh position={[0, 0.015, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.14, 0.03, 16]} />
        <meshStandardMaterial color="#111827" metalness={0.6} />
      </mesh>
      <mesh position={[0.08, 0.32, 0.05]} rotation={[0.2, 0, -0.35]} castShadow>
        <cylinderGeometry args={[0.012, 0.012, 0.62, 6]} />
        <meshStandardMaterial color="#9ca3af" metalness={0.8} />
      </mesh>
      <mesh position={[0.25, 0.6, 0.14]} rotation={[0.9, 0, -1.3]} castShadow>
        <coneGeometry args={[0.1, 0.18, 14, 1, true]} />
        <meshStandardMaterial color="#111827" side={THREE.DoubleSide} metalness={0.5} />
      </mesh>
      <mesh position={[0.29, 0.57, 0.18]}>
        <sphereGeometry args={[0.04, 10, 8]} />
        <Glow color="#fbbf24" intensity={4} />
      </mesh>
      <pointLight position={[0.35, 0.5, 0.3]} color="#fbbf24" intensity={2.2} distance={3.2} decay={2} />
    </group>
  )
}

function Tower() {
  const coolant = useRef<THREE.MeshStandardMaterial>(null!)
  useFrame(({ clock }) => coolant.current.emissive.setHSL(0.52 + Math.sin(clock.elapsedTime * 0.6) * 0.1, 0.9, 0.5))
  return (
    <group position={[3.5, 0, -4.15]}>
      <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.55, 1.15, 1.05]} />
        <meshStandardMaterial color="#0d0f17" metalness={0.6} roughness={0.35} transparent opacity={0.96} />
      </mesh>
      {/* tempered glass side facing the camera (+x) */}
      <mesh position={[0.279, 0.6, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.98, 1.08]} />
        <meshPhysicalMaterial color="#1e293b" transparent opacity={0.25} roughness={0.05} metalness={0.1} />
      </mesh>
      <Fan r={0.13} color="#22d3ee" position={[0.26, 0.88, 0.28]} rotation={[0, Math.PI / 2, 0]} speed={14} />
      <Fan r={0.13} color="#a78bfa" position={[0.26, 0.88, -0.05]} rotation={[0, Math.PI / 2, 0]} speed={15} />
      <Fan r={0.13} color="#f472b6" position={[0.26, 0.4, 0.28]} rotation={[0, Math.PI / 2, 0]} speed={13} />
      {/* GPU */}
      <mesh position={[0.1, 0.48, -0.15]}>
        <boxGeometry args={[0.28, 0.08, 0.6]} />
        <meshStandardMaterial color="#1f2937" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0.245, 0.48, -0.15]}>
        <boxGeometry args={[0.01, 0.025, 0.55]} />
        <Glow color="#a78bfa" intensity={3} />
      </mesh>
      {/* CPU block + coolant loop */}
      <mesh position={[0.15, 0.82, -0.3]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.07, 0.07, 0.05, 20]} />
        <meshStandardMaterial ref={coolant} color="#0b1020" emissive="#22d3ee" emissiveIntensity={2.5} toneMapped={false} />
      </mesh>
      <mesh position={[0.15, 0.82, -0.05]} rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[0.2, 0.014, 6, 20, Math.PI]} />
        <Glow color="#22d3ee" intensity={1.8} />
      </mesh>
      <mesh position={[0.2, 1.15, 0.43]}>
        <boxGeometry args={[0.1, 0.02, 0.1]} />
        <Glow color="#4ade80" intensity={3} />
      </mesh>
    </group>
  )
}

function Chair() {
  // the camera sits roughly where the chair is when zooming into the monitor → slide it out of the way
  const g = useRef<THREE.Group>(null!)
  useFrame((_, dt) => {
    const away = useStore.getState().focus === 'about'
    g.current.position.x = THREE.MathUtils.lerp(g.current.position.x, away ? 3.0 : 1.25, 1 - Math.exp(-3 * dt))
    g.current.rotation.y = THREE.MathUtils.lerp(g.current.rotation.y, away ? Math.PI + 1.1 : Math.PI + 0.3, 1 - Math.exp(-3 * dt))
  })
  return (
    <group ref={g} position={[1.25, 0, -2.85]} rotation={[0, Math.PI + 0.3, 0]}>
      {Array.from({ length: 5 }, (_, i) => {
        const a = (i / 5) * Math.PI * 2
        return (
          <group key={i} rotation={[0, a, 0]}>
            <mesh position={[0.2, 0.08, 0]} castShadow>
              <boxGeometry args={[0.4, 0.04, 0.06]} />
              <meshStandardMaterial color="#111827" metalness={0.6} />
            </mesh>
            <mesh position={[0.38, 0.04, 0]}>
              <sphereGeometry args={[0.04, 8, 6]} />
              <meshStandardMaterial color="#0b0d14" />
            </mesh>
          </group>
        )
      })}
      <mesh position={[0, 0.32, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.04, 0.45, 8]} />
        <meshStandardMaterial color="#9ca3af" metalness={0.8} />
      </mesh>
      <mesh position={[0, 0.58, 0]} castShadow>
        <boxGeometry args={[0.6, 0.12, 0.58]} />
        <meshStandardMaterial color="#111827" roughness={0.7} />
      </mesh>
      <mesh position={[0, 1.08, -0.3]} rotation={[-0.12, 0, 0]} castShadow>
        <boxGeometry args={[0.56, 0.9, 0.1]} />
        <meshStandardMaterial color="#111827" roughness={0.7} />
      </mesh>
      {[-0.2, 0.2].map((x) => (
        <mesh key={x} position={[x, 1.08, -0.36]} rotation={[-0.12, 0, 0]}>
          <boxGeometry args={[0.05, 0.84, 0.01]} />
          <Glow color="#22d3ee" intensity={1.8} />
        </mesh>
      ))}
      <mesh position={[0, 1.45, -0.34]} rotation={[-0.12, 0, 0]}>
        <boxGeometry args={[0.3, 0.14, 0.06]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.5} />
      </mesh>
      {[-0.32, 0.32].map((x) => (
        <mesh key={x} position={[x, 0.78, 0]} castShadow>
          <boxGeometry args={[0.06, 0.05, 0.36]} />
          <meshStandardMaterial color="#1f2937" />
        </mesh>
      ))}
    </group>
  )
}

export function Desk() {
  const hl = useHighlight('about')
  const main = useCanvasTexture(drawMain, 768, 432, 12)
  const code = useCanvasTexture(drawCode, 300, 516, 14)
  const dash = useCanvasTexture(drawDash, 512, 288, 10)
  const MAIN = { w: 1.28, h: 0.72 }
  return (
    <Interactive id="about">
      {/* desk */}
      <mesh position={[DESK.x, DESK.y, DESK.z]} castShadow receiveShadow>
        <boxGeometry args={[DESK.w, 0.07, DESK.d]} />
        <meshStandardMaterial color="#2a2f45" roughness={0.45} metalness={0.3} />
      </mesh>
      <mesh position={[DESK.x, DESK.y - 0.045, DESK.z + DESK.d / 2 - 0.02]}>
        <boxGeometry args={[DESK.w - 0.1, 0.02, 0.02]} />
        <Glow color="#e879f9" intensity={2.6} />
      </mesh>
      {[-1, 1].map((sx) => (
        <group key={sx} position={[DESK.x + sx * (DESK.w / 2 - 0.12), DESK.y / 2, DESK.z]}>
          <mesh castShadow>
            <boxGeometry args={[0.07, DESK.y, DESK.d - 0.15]} />
            <meshStandardMaterial color="#111827" metalness={0.7} roughness={0.3} />
          </mesh>
        </group>
      ))}
      <mesh position={[DESK.x - 1.05, 0.42, DESK.z - 0.05]} castShadow>
        <boxGeometry args={[0.6, 0.8, 1.0]} />
        <meshStandardMaterial color="#1f2436" roughness={0.6} />
      </mesh>
      {/* monitors */}
      <Anchor id="about" width={MAIN.w} height={MAIN.h} position={[DESK.x, 1.68, -4.37 + 0.03]}>
        <ScreenPanel id="about" width={MAIN.w} height={MAIN.h} px={1024}>
          <AboutScreen />
        </ScreenPanel>
      </Anchor>
      <Monitor w={MAIN.w} h={MAIN.h} tex={main} hl={hl} position={[DESK.x, 1.68, -4.37]} />
      <mesh position={[DESK.x, DESK.y + 0.045, -4.4]} castShadow>
        <boxGeometry args={[0.36, 0.02, 0.22]} />
        <meshStandardMaterial color="#2b3042" metalness={0.7} />
      </mesh>
      <Monitor w={0.48} h={0.84} tex={code} hl={hl} position={[DESK.x - 1.0, 1.66, -4.2]} rotation={[0, 0.42, 0]} />
      <Monitor w={0.94} h={0.53} tex={dash} hl={hl} position={[DESK.x + 1.12, 1.6, -4.2]} rotation={[0, -0.42, 0]} />
      <pointLight position={[DESK.x, 1.7, -3.6]} color="#67e8f9" intensity={2.5} distance={3} decay={2} />
      <Keyboard />
      <Mug />
      <Lamp />
      <Tower />
      <Chair />
      {/* neon sign on the back wall */}
      <mesh position={[DESK.x, 3.0, -4.98]}>
        <boxGeometry args={[3.3, 0.85, 0.04]} />
        <meshStandardMaterial color="#0b0d14" roughness={0.3} metalness={0.4} transparent opacity={0.85} />
      </mesh>
      <NeonText id="about" text="YERAY // SEC-ARCH" color="#22d3ee" size={0.3} position={[DESK.x, 3.1, -4.95]} intensity={4.5} flicker />
      <NeonText id="about" text="SECURITY · BY · DESIGN" color="#f472b6" size={0.11} position={[DESK.x, 2.78, -4.95]} intensity={4} />
      <mesh position={[DESK.x, 3.0, -4.955]}>
        <boxGeometry args={[3.2, 0.012, 0.01]} />
        <meshStandardMaterial color={DARK} />
      </mesh>
    </Interactive>
  )
}
