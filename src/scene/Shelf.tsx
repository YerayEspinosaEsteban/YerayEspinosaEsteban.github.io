import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Anchor, Glow, Interactive, NeonText, useHighlight } from './common'
import { CertsPanel, ScreenPanel } from './Panels'
import { drawDiploma, useCanvasTexture } from './screens'

const WOOD = '#2b2440'
const W = 2.4
const BOARDS = [1.15, 1.8, 2.45, 3.1]

function Pokeball() {
  const g = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    // every few seconds it wobbles, like something is trying to get out
    const w = (t % 5) < 0.8 ? Math.sin(t * 22) * 0.25 * (1 - (t % 5) / 0.8) : 0
    g.current.rotation.z = w
  })
  return (
    <group position={[-0.7, BOARDS[0] + 0.03, 0.05]}>
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.1, 0.12, 0.04, 16]} />
        <meshStandardMaterial color="#111827" metalness={0.6} />
      </mesh>
      <group ref={g} position={[0, 0.17, 0]} rotation={[0, 0.5, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.13, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#ef4444" roughness={0.25} metalness={0.1} />
        </mesh>
        <mesh castShadow>
          <sphereGeometry args={[0.13, 28, 14, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.3} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.13, 0.012, 8, 32]} />
          <meshStandardMaterial color="#0b0d14" />
        </mesh>
        <mesh position={[0, 0, 0.125]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.035, 0.035, 0.02, 16]} />
          <meshStandardMaterial color="#0b0d14" />
        </mesh>
        <mesh position={[0, 0, 0.135]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.022, 0.022, 0.012, 16]} />
          <Glow color="#67e8f9" intensity={3} />
        </mesh>
      </group>
    </group>
  )
}

const BADGE_COLORS = ['#94a3b8', '#ef4444', '#fbbf24', '#4ade80', '#a78bfa', '#22d3ee', '#f472b6', '#fb923c']

function Badges() {
  return (
    <group position={[0.45, BOARDS[0] + 0.2, -0.05]} rotation={[-0.35, 0, 0]}>
      <mesh castShadow>
        <boxGeometry args={[0.62, 0.32, 0.03]} />
        <meshStandardMaterial color="#111827" roughness={0.4} />
      </mesh>
      {BADGE_COLORS.map((c, i) => (
        <mesh key={c} position={[-0.23 + (i % 4) * 0.153, 0.07 - Math.floor(i / 4) * 0.14, 0.025]} rotation={[Math.PI / 2, 0, (i * Math.PI) / 8]}>
          <cylinderGeometry args={[0.045, 0.045, 0.015, i % 2 ? 6 : 8]} />
          <meshStandardMaterial color={c} metalness={0.9} roughness={0.2} emissive={c} emissiveIntensity={0.35} />
        </mesh>
      ))}
    </group>
  )
}

function Holocron() {
  const g = useRef<THREE.Group>(null!)
  const inner = useRef<THREE.MeshStandardMaterial>(null!)
  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime
    g.current.rotation.y += dt * 0.6
    g.current.position.y = BOARDS[1] + 0.32 + Math.sin(t * 1.4) * 0.03
    inner.current.emissiveIntensity = 3 + Math.sin(t * 2.2) * 1.2
  })
  const edges = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(0.2, 0.2, 0.2)), [])
  return (
    <group position={[0.05, 0, 0.05]}>
      <mesh position={[0, BOARDS[1] + 0.05, 0]}>
        <cylinderGeometry args={[0.09, 0.11, 0.08, 6]} />
        <meshStandardMaterial color="#1f2937" metalness={0.7} />
      </mesh>
      <mesh position={[0, BOARDS[1] + 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.08, 6]} />
        <Glow color="#38bdf8" intensity={2} />
      </mesh>
      <group ref={g} position={[0, BOARDS[1] + 0.32, 0]}>
        <group rotation={[0.6, 0, 0.6]}>
          <mesh>
            <boxGeometry args={[0.19, 0.19, 0.19]} />
            <meshStandardMaterial color="#1e3a8a" metalness={0.6} roughness={0.25} transparent opacity={0.75} />
          </mesh>
          <lineSegments geometry={edges}>
            <lineBasicMaterial color="#fde68a" toneMapped={false} />
          </lineSegments>
          <mesh>
            <octahedronGeometry args={[0.07, 0]} />
            <meshStandardMaterial ref={inner} color="#38bdf8" emissive="#38bdf8" emissiveIntensity={3} toneMapped={false} />
          </mesh>
        </group>
      </group>
      <pointLight position={[0, BOARDS[1] + 0.35, 0.25]} color="#38bdf8" intensity={1.2} distance={1.4} decay={2} />
    </group>
  )
}

function Trophy({ x, color, h = 0.32 }: { x: number; color: string; h?: number }) {
  const cup = useMemo(() => {
    const pts = [[0, 0], [0.07, 0], [0.07, 0.02], [0.02, 0.04], [0.02, h * 0.45], [0.09, h * 0.62], [0.1, h], [0.085, h]].map(([a, b]) => new THREE.Vector2(a, b))
    return new THREE.LatheGeometry(pts, 20)
  }, [h])
  return (
    <mesh geometry={cup} position={[x, BOARDS[2] + 0.02, 0.02]} castShadow>
      <meshStandardMaterial color={color} metalness={1} roughness={0.18} side={THREE.DoubleSide} />
    </mesh>
  )
}

function Diploma() {
  const tex = useCanvasTexture(drawDiploma, 400, 300, 0)
  return (
    <group position={[0.62, BOARDS[2] + 0.2, -0.08]} rotation={[-0.15, -0.12, 0]}>
      <mesh castShadow>
        <boxGeometry args={[0.46, 0.36, 0.02]} />
        <meshStandardMaterial color="#78350f" roughness={0.4} />
      </mesh>
      <mesh position={[0, 0, 0.011]}>
        <planeGeometry args={[0.4, 0.3]} />
        <meshStandardMaterial map={tex} roughness={0.8} />
      </mesh>
    </group>
  )
}

function MiniRocket() {
  return (
    <group position={[-0.25, BOARDS[1] + 0.03, 0]}>
      <mesh position={[0, 0.17, 0]} castShadow>
        <cylinderGeometry args={[0.045, 0.05, 0.26, 12]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.35, 0]} castShadow>
        <coneGeometry args={[0.045, 0.12, 12]} />
        <meshStandardMaterial color="#ef4444" roughness={0.4} />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[Math.cos((i * 2 * Math.PI) / 3) * 0.05, 0.07, Math.sin((i * 2 * Math.PI) / 3) * 0.05]} rotation={[0, -(i * 2 * Math.PI) / 3, 0]}>
          <boxGeometry args={[0.04, 0.08, 0.01]} />
          <meshStandardMaterial color="#1d4ed8" />
        </mesh>
      ))}
    </group>
  )
}

function Books() {
  const cols = ['#6366f1', '#0ea5e9', '#f43f5e', '#10b981', '#f59e0b', '#8b5cf6']
  return (
    <group position={[-0.85, BOARDS[1] + 0.02, -0.02]}>
      {cols.map((c, i) => (
        <mesh key={c} position={[i * 0.065, 0.13 + (i % 2) * 0.015, 0]} rotation={[0, 0, i === 5 ? 0.25 : 0]} castShadow>
          <boxGeometry args={[0.055, 0.26 + (i % 2) * 0.03, 0.22]} />
          <meshStandardMaterial color={c} roughness={0.7} />
        </mesh>
      ))}
    </group>
  )
}

function Saber() {
  const blade = useRef<THREE.MeshStandardMaterial>(null!)
  useFrame(({ clock }) => (blade.current.emissiveIntensity = 3.2 + Math.sin(clock.elapsedTime * 30) * 0.15))
  return (
    <group position={[0, BOARDS[3] + 0.32, -0.15]} rotation={[0, 0, Math.PI / 2 - 0.08]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.022, 0.022, 0.26, 12]} />
        <meshStandardMaterial color="#9ca3af" metalness={0.9} roughness={0.25} />
      </mesh>
      {[-0.06, 0, 0.06].map((y) => (
        <mesh key={y} position={[0, y, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 0.02, 12]} />
          <meshStandardMaterial color="#111827" />
        </mesh>
      ))}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.012, 0.014, 0.75, 10]} />
        <meshStandardMaterial ref={blade} color="#bfdbfe" emissive="#3b82f6" emissiveIntensity={3.2} toneMapped={false} />
      </mesh>
    </group>
  )
}

export function Shelf() {
  const hl = useHighlight('certs')
  const strips = useRef<THREE.MeshStandardMaterial[]>([])
  useFrame(() => strips.current.forEach((m) => m && (m.emissiveIntensity = 2.2 * hl.current)))
  const PANEL = { w: 2.3, h: 1.45 }
  return (
    <Interactive id="certs">
      <group position={[-4.78, 0, 1.15]} rotation={[0, Math.PI / 2, 0]}>
        {/* carcass */}
        <mesh position={[0, 2.15, -0.2]} receiveShadow>
          <boxGeometry args={[W, 2.1, 0.02]} />
          <meshStandardMaterial color="#1a1530" roughness={0.8} />
        </mesh>
        {[-W / 2, W / 2].map((x) => (
          <mesh key={x} position={[x, 2.15, 0]} castShadow>
            <boxGeometry args={[0.05, 2.1, 0.42]} />
            <meshStandardMaterial color={WOOD} roughness={0.6} />
          </mesh>
        ))}
        {BOARDS.map((y, i) => (
          <group key={y} position={[0, y, 0]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[W, 0.04, 0.42]} />
              <meshStandardMaterial color={WOOD} roughness={0.6} />
            </mesh>
            {i > 0 && (
              <mesh position={[0, -0.025, 0.18]}>
                <boxGeometry args={[W - 0.1, 0.01, 0.02]} />
                <meshStandardMaterial ref={(m) => { if (m) strips.current[i] = m }} color="#000" emissive="#fbbf24" emissiveIntensity={2.2} toneMapped={false} />
              </mesh>
            )}
          </group>
        ))}
        {/* low cabinet */}
        <mesh position={[0, 0.55, 0]} castShadow receiveShadow>
          <boxGeometry args={[W, 1.1, 0.45]} />
          <meshStandardMaterial color={WOOD} roughness={0.55} />
        </mesh>
        {[-0.6, 0.6].map((x) => (
          <mesh key={x} position={[x, 0.55, 0.23]}>
            <boxGeometry args={[1.1, 0.95, 0.01]} />
            <meshStandardMaterial color="#231d38" roughness={0.5} />
          </mesh>
        ))}
        {[-0.1, 0.1].map((x) => (
          <mesh key={x} position={[x, 0.75, 0.245]}>
            <boxGeometry args={[0.02, 0.18, 0.02]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.2} />
          </mesh>
        ))}
        <Pokeball />
        <Badges />
        <Books />
        <MiniRocket />
        <Holocron />
        <Trophy x={-0.75} color="#fbbf24" h={0.36} />
        <Trophy x={-0.4} color="#d1d5db" h={0.3} />
        <Trophy x={-0.1} color="#d97706" h={0.26} />
        <Diploma />
        <Saber />
        <pointLight position={[0, 2.2, 0.6]} color="#fbbf24" intensity={2} distance={2.6} decay={2} />
        {/* tactical visor floats in front of the shelf */}
        <Anchor id="certs" width={PANEL.w} height={PANEL.h} position={[0, 2.15, 0.62]}>
          <ScreenPanel id="certs" width={PANEL.w} height={PANEL.h} px={940}>
            <CertsPanel />
          </ScreenPanel>
        </Anchor>
      </group>
      <NeonText id="certs" text="LOGROS" color="#fbbf24" size={0.26} position={[-4.95, 3.72, 1.15]} rotation={[0, Math.PI / 2, 0]} intensity={4.5} />
    </Interactive>
  )
}
