import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Anchor, Interactive, Marker, SoftBox, TexMat } from './common'
import { CertsPanel, ScreenPanel } from './Panels'
import { drawDiploma, useCanvasTexture } from './screens'
import { withRepeat, woodGrain } from './textures'

const W = 2.0
const D = 0.42
const BOARDS = [0.62, 1.22, 1.82, 2.42]
const TOP = 2.95
/** Left-wall bookcase; local +Z points into the room (world +X). */
const ORIGIN: [number, number, number] = [-4.76, 0, 1.0]

/** Collector's capture ball on a little stand; wobbles now and then. */
function CaptureBall() {
  const g = useRef<THREE.Group>(null!)
  const gem = useRef<THREE.MeshStandardMaterial>(null!)
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const k = t % 5
    g.current.rotation.z = k < 0.8 ? Math.sin(t * 22) * 0.22 * (1 - k / 0.8) : 0
    gem.current.emissiveIntensity = 0.8 + Math.sin(t * 3) * 0.4
  })
  return (
    <group position={[-0.62, BOARDS[1] + 0.02, 0.04]}>
      <mesh position={[0, 0.02, 0]} castShadow>
        <cylinderGeometry args={[0.09, 0.11, 0.04, 20]} />
        <meshStandardMaterial color="#8a5a2c" roughness={0.45} />
      </mesh>
      <group ref={g} position={[0, 0.15, 0]} rotation={[0, 0.3, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.11, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshPhysicalMaterial color="#2563eb" roughness={0.2} clearcoat={1} />
        </mesh>
        <mesh castShadow>
          <sphereGeometry args={[0.11, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
          <meshPhysicalMaterial color="#f8fafc" roughness={0.25} clearcoat={1} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.11, 0.011, 8, 40]} />
          <meshStandardMaterial color="#d4a72c" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0, 0.105]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.032, 0.032, 0.02, 20]} />
          <meshStandardMaterial color="#d4a72c" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0, 0.116]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.018, 0.018, 0.01, 16]} />
          <meshStandardMaterial ref={gem} color="#7dd3fc" emissive="#38bdf8" emissiveIntensity={1} toneMapped={false} />
        </mesh>
      </group>
    </group>
  )
}

const BADGES: [string, number][] = [['#94a3b8', 8], ['#e2574c', 6], ['#f59e0b', 5], ['#22a35a', 4], ['#8b5cf6', 7], ['#0ea5e9', 3], ['#f472b6', 6], ['#fb923c', 8]]

/** Open velvet case with eight metal badges. */
function BadgeCase() {
  return (
    <group position={[0.42, BOARDS[1] + 0.02, 0]}>
      <SoftBox size={[0.6, 0.05, 0.3]} radius={0.015} position={[0, 0.025, 0.02]}>
        <meshStandardMaterial color="#5b3a1e" roughness={0.5} />
      </SoftBox>
      <group position={[0, 0.05, -0.12]} rotation={[-0.45, 0, 0]}>
        <SoftBox size={[0.6, 0.32, 0.03]} radius={0.015} position={[0, 0.16, 0]}>
          <meshStandardMaterial color="#5b3a1e" roughness={0.5} />
        </SoftBox>
        <mesh position={[0, 0.16, 0.017]}>
          <planeGeometry args={[0.54, 0.27]} />
          <meshStandardMaterial color="#7f1d1d" roughness={1} />
        </mesh>
        {BADGES.map(([c, sides], i) => (
          <mesh key={i} position={[-0.2 + (i % 4) * 0.133, 0.22 - Math.floor(i / 4) * 0.12, 0.03]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.042, 0.042, 0.014, sides]} />
            <meshStandardMaterial color={c} metalness={0.85} roughness={0.22} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

function Trophy({ x, color, h = 0.3 }: { x: number; color: string; h?: number }) {
  const cup = useMemo(() => {
    const pts = [[0, 0], [0.07, 0], [0.07, 0.02], [0.02, 0.04], [0.02, h * 0.45], [0.09, h * 0.62], [0.1, h], [0.085, h]].map(([a, b]) => new THREE.Vector2(a, b))
    return new THREE.LatheGeometry(pts, 24)
  }, [h])
  return (
    <mesh geometry={cup} position={[x, BOARDS[2] + 0.02, 0.02]} castShadow>
      <meshStandardMaterial color={color} metalness={1} roughness={0.18} side={THREE.DoubleSide} />
    </mesh>
  )
}

function Diploma({ x, y, rot = 0 }: { x: number; y: number; rot?: number }) {
  const tex = useCanvasTexture(drawDiploma, 400, 300, 0)
  return (
    <group position={[x, y, -0.08]} rotation={[-0.12, rot, 0]}>
      <SoftBox size={[0.46, 0.36, 0.025]} radius={0.01}>
        <meshStandardMaterial color="#8a5a2c" roughness={0.4} />
      </SoftBox>
      <mesh position={[0, 0, 0.014]}>
        <planeGeometry args={[0.4, 0.3]} />
        <meshStandardMaterial map={tex} roughness={0.8} />
      </mesh>
    </group>
  )
}

function BookRow({ x, y, n, lean = false }: { x: number; y: number; n: number; lean?: boolean }) {
  const cols = ['#e2574c', '#3b82f6', '#f59e0b', '#22a35a', '#8b5cf6', '#f6efe2', '#0ea5e9', '#be185d']
  const books = useMemo(() => Array.from({ length: n }, (_, i) => ({ h: 0.26 + ((i * 7) % 4) * 0.035, w: 0.05 + ((i * 3) % 3) * 0.012, c: cols[(i * 5 + Math.round(x * 10)) % cols.length] })), [n, x])
  let acc = 0
  return (
    <group position={[x, y, -0.02]}>
      {books.map((b, i) => {
        const bx = acc + b.w / 2
        acc += b.w + 0.006
        const tilt = lean && i === n - 1
        return (
          <SoftBox key={i} size={[b.w, b.h, 0.24]} radius={0.008} position={[tilt ? bx + 0.04 : bx, b.h / 2, 0]} rotation={[0, 0, tilt ? -0.3 : 0]}>
            <meshStandardMaterial color={b.c} roughness={0.7} />
          </SoftBox>
        )
      })}
    </group>
  )
}

export function Shelf() {
  const wood = useMemo(() => withRepeat(woodGrain('#c48a52', 61), 1, 2, Math.PI / 2), [])
  const plank = useMemo(() => withRepeat(woodGrain('#c48a52', 62), 2, 0.4), [])
  const back = useMemo(() => withRepeat(woodGrain('#a8713f', 63), 2, 2), [])
  const PANEL = { w: 2.0, h: 1.3 }
  return (
    <Interactive id="certs">
      <group position={ORIGIN} rotation={[0, Math.PI / 2, 0]}>
        {/* carcass */}
        <mesh position={[0, TOP / 2, -D / 2 + 0.01]} receiveShadow>
          <boxGeometry args={[W, TOP, 0.02]} />
          <TexMat set={back} bump={0.4} roughness={0.7} />
        </mesh>
        {[-W / 2, W / 2].map((x) => (
          <SoftBox key={x} size={[0.06, TOP, D]} radius={0.015} position={[x, TOP / 2, 0]}>
            <TexMat set={wood} bump={0.5} roughness={0.55} />
          </SoftBox>
        ))}
        <SoftBox size={[W + 0.12, 0.07, D + 0.04]} radius={0.02} position={[0, TOP, 0]}>
          <TexMat set={plank} bump={0.5} roughness={0.55} />
        </SoftBox>
        {BOARDS.map((y) => (
          <SoftBox key={y} size={[W - 0.04, 0.04, D - 0.02]} radius={0.01} position={[0, y, 0]}>
            <TexMat set={plank} bump={0.5} roughness={0.55} />
          </SoftBox>
        ))}
        {/* low cupboard doors */}
        {[-0.48, 0.48].map((x) => (
          <group key={x} position={[x, 0.31, D / 2 - 0.01]}>
            <SoftBox size={[0.9, 0.56, 0.02]} radius={0.01}>
              <meshStandardMaterial color="#b57a45" roughness={0.5} />
            </SoftBox>
            <mesh position={[x > 0 ? -0.36 : 0.36, 0.1, 0.02]}>
              <sphereGeometry args={[0.022, 10, 8]} />
              <meshStandardMaterial color="#d4a72c" metalness={0.8} roughness={0.25} />
            </mesh>
          </group>
        ))}
        {/* shelf 1: books + capture ball + badges */}
        <BookRow x={-0.92} y={BOARDS[0] + 0.02} n={9} lean />
        <BookRow x={0.15} y={BOARDS[0] + 0.02} n={11} />
        <CaptureBall />
        <BadgeCase />
        <BookRow x={-0.3} y={BOARDS[1] + 0.02} n={4} lean />
        {/* shelf 2: trophies + diploma */}
        <Trophy x={-0.75} color="#f5c542" h={0.36} />
        <Trophy x={-0.48} color="#d6d3cc" h={0.3} />
        <Trophy x={-0.24} color="#cd7f32" h={0.26} />
        <Diploma x={0.45} y={BOARDS[2] + 0.2} rot={-0.08} />
        {/* shelf 3: second diploma + books */}
        <Diploma x={-0.5} y={BOARDS[3] + 0.2} rot={0.1} />
        <BookRow x={0.05} y={BOARDS[3] + 0.02} n={10} />
        <pointLight position={[0, 2.1, 0.7]} color="#ffc787" intensity={2.2} decay={1.8} distance={0} />
        <Anchor id="certs" width={PANEL.w} height={PANEL.h} position={[0, 1.72, D / 2 + 0.35]}>
          <ScreenPanel id="certs" width={PANEL.w} height={PANEL.h} px={940}>
            <CertsPanel />
          </ScreenPanel>
        </Anchor>
      </group>
      <Marker id="certs" position={[ORIGIN[0] + 0.25, TOP + 0.45, ORIGIN[2]]} />
    </Interactive>
  )
}
