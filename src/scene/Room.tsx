import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { PottedPlant, SoftBox, TexMat } from './common'
import { drawPainting, useCanvasTexture } from './screens'
import { fabric, rug, stoneBlocks, wallpaper, withRepeat, woodGrain, woodPlanks } from './textures'

export const ROOM = { half: 5, wallH: 3.8, wallT: 0.3 }
/** Window opening in the left wall (x = -half). */
export const WIN = { z0: -3.0, z1: -1.0, y0: 1.1, y1: 2.9 }
/** Direction of the low sun beam entering through the window (unnormalised). */
export const SUN_DIR = new THREE.Vector3(5, -2.5, 1)
const TRIM = '#fbfbfa'
const CAP_COLOR = '#dfdad0'
const SKIRTING_COLOR = '#f4f2ee'

/** Box of wall with modern lime-wash/plaster tiled on its room-facing side. */
function WallBox({ position, size, uv }: { position: [number, number, number]; size: [number, number, number]; uv: [number, number] }) {
  const set = useMemo(() => withRepeat(wallpaper(), uv[0] / 2, uv[1] / 2), [uv])
  return (
    <mesh position={position} receiveShadow castShadow>
      <boxGeometry args={size} />
      <TexMat set={set} bump={0.35} />
    </mesh>
  )
}

function Walls() {
  const { half, wallH: H, wallT: T } = ROOM
  const wx = -half - T / 2
  const SKIRTING_H = 0.12
  const SKIRTING_T = 0.025
  return (
    <group>
      {/* back wall (z = -half) spans the left wall's thickness too */}
      <WallBox position={[-T / 2, H / 2, -half - T / 2]} size={[half * 2 + T, H, T]} uv={[half * 2 + T, H]} />
      {/* left wall, built around the window opening */}
      <WallBox position={[wx, H / 2, (WIN.z0 - half) / 2]} size={[T, H, WIN.z0 + half]} uv={[WIN.z0 + half, H]} />
      <WallBox position={[wx, H / 2, (WIN.z1 + half) / 2]} size={[T, H, half - WIN.z1]} uv={[half - WIN.z1, H]} />
      <WallBox position={[wx, WIN.y0 / 2, (WIN.z0 + WIN.z1) / 2]} size={[T, WIN.y0, WIN.z1 - WIN.z0]} uv={[WIN.z1 - WIN.z0, WIN.y0]} />
      <WallBox position={[wx, (H + WIN.y1) / 2, (WIN.z0 + WIN.z1) / 2]} size={[T, H - WIN.y1, WIN.z1 - WIN.z0]} uv={[WIN.z1 - WIN.z0, H - WIN.y1]} />

      {/* modern minimalist skirting board (rodapié) */}
      <mesh position={[0, SKIRTING_H / 2, -half + SKIRTING_T / 2]} receiveShadow castShadow>
        <boxGeometry args={[half * 2, SKIRTING_H, SKIRTING_T]} />
        <meshStandardMaterial color={SKIRTING_COLOR} roughness={0.5} />
      </mesh>
      <mesh position={[-half + SKIRTING_T / 2, SKIRTING_H / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[SKIRTING_T, SKIRTING_H, half * 2]} />
        <meshStandardMaterial color={SKIRTING_COLOR} roughness={0.5} />
      </mesh>

      {/* clean slim top architectural trim */}
      {[[0, H - 0.03, -half + 0.025, half * 2, 0.06, 0.05], [-half + 0.025, H - 0.03, 0, 0.05, 0.06, half * 2]].map(([x, y, z, w, h, d], i) => (
        <mesh key={`c${i}`} position={[x, y, z]} castShadow>
          <boxGeometry args={[w, h, d]} />
          <meshStandardMaterial color={TRIM} roughness={0.5} />
        </mesh>
      ))}
      <mesh position={[-T / 2, H + 0.02, -half - T / 2]} castShadow>
        <boxGeometry args={[half * 2 + T + 0.04, 0.04, T + 0.04]} />
        <meshStandardMaterial color={CAP_COLOR} roughness={0.5} />
      </mesh>
      <mesh position={[wx, H + 0.02, 0]} castShadow>
        <boxGeometry args={[T + 0.04, 0.04, half * 2]} />
        <meshStandardMaterial color={CAP_COLOR} roughness={0.5} />
      </mesh>
      {/* corner post where the cut-away walls end */}
      <mesh position={[half - 0.015, H / 2, -half - T / 2]} castShadow>
        <boxGeometry args={[0.06, H + 0.02, T + 0.04]} />
        <meshStandardMaterial color={CAP_COLOR} roughness={0.5} />
      </mesh>
      <mesh position={[wx, H / 2, half - 0.015]} castShadow>
        <boxGeometry args={[T + 0.04, H + 0.02, 0.06]} />
        <meshStandardMaterial color={CAP_COLOR} roughness={0.5} />
      </mesh>
    </group>
  )
}

/** Curtain panel: a plane rippled into soft folds, hanging along the left wall. */
function Curtain({ z, w = 0.62 }: { z: number; w?: number }) {
  const set = useMemo(() => withRepeat(fabric('#ede8df', '#ded9cf', 7), 2, 4), [])
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(w, 2.35, 28, 6)
    const p = g.attributes.position
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i)
      const flare = 1 + (1.175 - y) * 0.12 // folds open up toward the hem
      p.setZ(i, Math.sin((x / w) * Math.PI * 7) * 0.035 * flare)
    }
    g.computeVertexNormals()
    return g
  }, [w])
  const ref = useRef<THREE.Mesh>(null!)
  const ph = useMemo(() => z * 3.1, [z])
  useFrame(({ clock }) => (ref.current.rotation.z = Math.sin(clock.elapsedTime * 0.7 + ph) * 0.012))
  return (
    <mesh ref={ref} geometry={geo} position={[-ROOM.half + 0.12, 1.92, z]} rotation={[0, Math.PI / 2, 0]} castShadow receiveShadow>
      <TexMat set={set} bump={0.5} side={THREE.DoubleSide} roughness={1} />
    </mesh>
  )
}

function Window() {
  const { half, wallT: T } = ROOM
  const x = -half - T / 2
  const cz = (WIN.z0 + WIN.z1) / 2, cy = (WIN.y0 + WIN.y1) / 2
  const W = WIN.z1 - WIN.z0, H = WIN.y1 - WIN.y0
  const frame = (key: string, pos: [number, number, number], size: [number, number, number]) => (
    <mesh key={key} position={pos} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={TRIM} roughness={0.5} />
    </mesh>
  )
  return (
    <group>
      {frame('t', [x, WIN.y1 - 0.04, cz], [T + 0.08, 0.1, W])}
      {frame('b', [x, WIN.y0 + 0.04, cz], [T + 0.08, 0.1, W])}
      {frame('l', [x, cy, WIN.z0 + 0.04], [T + 0.08, H, 0.1])}
      {frame('r', [x, cy, WIN.z1 - 0.04], [T + 0.08, H, 0.1])}
      {/* mullions (thin, so they cast crisp cross shadows on the rug) */}
      {frame('mv', [x, cy, cz], [0.06, H, 0.05])}
      {frame('mh', [x, cy + 0.15, cz], [0.06, 0.05, W])}
      {/* glass: never casts shadows so the sun passes through */}
      <mesh position={[x, cy, cz]} rotation={[0, Math.PI / 2, 0]} raycast={() => null}>
        <planeGeometry args={[W - 0.1, H - 0.1]} />
        <meshPhysicalMaterial color="#1b2550" transparent opacity={0.45} roughness={0.04} metalness={0} clearcoat={1} envMapIntensity={1.5} depthWrite={false} />
      </mesh>
      {/* inner sill with a flower pot */}
      <SoftBox size={[0.34, 0.06, W + 0.36]} radius={0.02} position={[-half + 0.12, WIN.y0 - 0.01, cz]}>
        <meshStandardMaterial color={TRIM} roughness={0.5} />
      </SoftBox>
      <PottedPlant scale={0.62} position={[-half + 0.13, WIN.y0 + 0.02, cz + 0.55]} leaf="#4c9a3c" flowers="#ef5a6f" />
      <PottedPlant scale={0.5} position={[-half + 0.13, WIN.y0 + 0.02, cz - 0.6]} leaf="#5aa846" flowers="#fbbf24" pot="#e7d7c1" />
      {/* curtain rod + curtains */}
      <mesh position={[-half + 0.16, WIN.y1 + 0.24, cz]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.018, 0.018, W + 1.5, 10]} />
        <meshStandardMaterial color="#24272e" roughness={0.3} metalness={0.6} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[-half + 0.16, WIN.y1 + 0.24, cz + s * (W / 2 + 0.75)]}>
          <sphereGeometry args={[0.038, 12, 10]} />
          <meshStandardMaterial color="#24272e" roughness={0.3} metalness={0.6} />
        </mesh>
      ))}
      <Curtain z={WIN.z0 - 0.32} />
      <Curtain z={WIN.z1 + 0.32} />
    </group>
  )
}

function Floor() {
  const { half } = ROOM
  const planks = useMemo(() => withRepeat(woodPlanks(), 2.5, 2.5), [])
  const plinth = useMemo(() => withRepeat(stoneBlocks(), 8, 0.35), [])
  const rugSet = rug()
  const EDGE_COLOR = '#c7b8a5'
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[half * 2, half * 2]} />
        <TexMat set={planks} bump={0.4} roughness={0.62} metalness={0.02} envMapIntensity={0.4} />
      </mesh>
      {/* house foundation band under the floor (modern architectural limestone / concrete) */}
      <mesh position={[-ROOM.wallT / 2, -0.175, -ROOM.wallT / 2]} receiveShadow castShadow>
        <boxGeometry args={[half * 2 + ROOM.wallT + 0.04, 0.32, half * 2 + ROOM.wallT + 0.04]} />
        <TexMat set={plinth} bump={0.8} />
      </mesh>
      {/* floor edge trim on the cut-away sides */}
      <mesh position={[half, -0.005, 0]} castShadow>
        <boxGeometry args={[0.06, 0.04, half * 2]} />
        <meshStandardMaterial color={EDGE_COLOR} roughness={0.5} />
      </mesh>
      <mesh position={[0, -0.005, half]} castShadow>
        <boxGeometry args={[half * 2, 0.04, 0.06]} />
        <meshStandardMaterial color={EDGE_COLOR} roughness={0.5} />
      </mesh>
      {/* round modern designer rug in the sun patch */}
      <mesh position={[RUG.x, 0.012, RUG.z]} receiveShadow>
        <cylinderGeometry args={[RUG.r, RUG.r, 0.025, 64]} />
        <meshStandardMaterial color="#ded7cb" roughness={0.95} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[RUG.x, 0.026, RUG.z]} receiveShadow>
        <circleGeometry args={[RUG.r, 64]} />
        <TexMat set={rugSet} bump={1.4} roughness={0.98} />
      </mesh>
    </group>
  )
}
export const RUG = { x: -0.9, z: -0.8, r: 1.55 }

function Bed() {
  const quilt = useMemo(() => withRepeat(fabric('#526e7e', '#ece7dc', 11), 1.2, 1.6), [])
  const frame = useMemo(() => withRepeat(woodGrain('#cbbda8', 6), 1, 1), [])
  const X = 4.15, Z = -3.85
  return (
    <group position={[X, 0, Z]}>
      <SoftBox size={[1.5, 0.36, 2.2]} radius={0.05} position={[0, 0.26, 0]}>
        <TexMat set={frame} bump={0.5} roughness={0.6} />
      </SoftBox>
      {[[-0.68, -1.03], [0.68, -1.03], [-0.68, 1.03], [0.68, 1.03]].map(([x, z]) => (
        <mesh key={`${x}${z}`} position={[x, 0.06, z]} castShadow>
          <cylinderGeometry args={[0.045, 0.045, 0.12, 10]} />
          <meshStandardMaterial color="#24262b" roughness={0.4} />
        </mesh>
      ))}
      {/* headboard against the back wall */}
      <SoftBox size={[1.6, 1.1, 0.12]} radius={0.05} position={[0, 0.7, -1.06]}>
        <TexMat set={frame} bump={0.5} roughness={0.6} />
      </SoftBox>
      <SoftBox size={[1.36, 0.16, 2.05]} radius={0.07} position={[0, 0.5, 0.02]}>
        <meshStandardMaterial color="#fbf8f2" roughness={0.95} />
      </SoftBox>
      {/* quilt draped over the lower two thirds */}
      <SoftBox size={[1.46, 0.12, 1.45]} radius={0.05} position={[0, 0.56, 0.32]}>
        <TexMat set={quilt} bump={0.6} roughness={1} />
      </SoftBox>
      <SoftBox size={[1.48, 0.42, 0.06]} radius={0.03} position={[0, 0.42, 1.04]}>
        <TexMat set={quilt} bump={0.6} roughness={1} />
      </SoftBox>
      <mesh position={[0, 0.66, -0.7]} scale={[1, 0.38, 0.62]} castShadow>
        <sphereGeometry args={[0.5, 24, 16]} />
        <meshStandardMaterial color="#ffffff" roughness={0.95} />
      </mesh>
    </group>
  )
}

function Painting() {
  const tex = useCanvasTexture(drawPainting, 384, 256, 0)
  return (
    <group position={[4.15, 2.45, -ROOM.half + 0.04]}>
      <SoftBox size={[1.22, 0.86, 0.05]} radius={0.02}>
        <meshStandardMaterial color="#24272e" roughness={0.4} />
      </SoftBox>
      <mesh position={[0, 0, 0.028]}>
        <planeGeometry args={[1.12, 0.76]} />
        <meshStandardMaterial map={tex} roughness={0.8} />
      </mesh>
    </group>
  )
}

/** Simple round wall clock with a ticking second hand. */
function Clock() {
  const sec = useRef<THREE.Mesh>(null!)
  const min = useRef<THREE.Mesh>(null!)
  useFrame(() => {
    const d = new Date()
    sec.current.rotation.z = -(d.getSeconds() / 60) * Math.PI * 2
    min.current.rotation.z = -((d.getMinutes() + d.getSeconds() / 60) / 60) * Math.PI * 2
  })
  return (
    <group position={[-ROOM.half + 0.05, 2.75, 3.4]} rotation={[0, Math.PI / 2, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.28, 0.28, 0.05, 32]} />
        <meshStandardMaterial color="#24272e" roughness={0.35} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0, 0.026]}>
        <circleGeometry args={[0.25, 32]} />
        <meshStandardMaterial color="#fffaf0" roughness={0.6} />
      </mesh>
      {Array.from({ length: 12 }, (_, i) => (
        <mesh key={i} position={[Math.sin((i / 12) * Math.PI * 2) * 0.2, Math.cos((i / 12) * Math.PI * 2) * 0.2, 0.028]}>
          <circleGeometry args={[i % 3 ? 0.008 : 0.016, 8]} />
          <meshBasicMaterial color="#24272e" />
        </mesh>
      ))}
      <mesh ref={min} position={[0, 0, 0.03]}>
        <planeGeometry args={[0.018, 0.34]} />
        <meshBasicMaterial color="#24272e" />
      </mesh>
      <mesh ref={sec} position={[0, 0, 0.032]}>
        <planeGeometry args={[0.006, 0.4]} />
        <meshBasicMaterial color="#e2574c" />
      </mesh>
    </group>
  )
}

/** Standing lamp between the study table and the bed: the cabin's warm interior light. */
function FloorLamp() {
  const x = 2.85, z = -4.55
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.02, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.2, 0.04, 20]} />
        <meshStandardMaterial color="#3a3f47" metalness={0.6} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.85, 0]} castShadow>
        <cylinderGeometry args={[0.015, 0.015, 1.66, 8]} />
        <meshStandardMaterial color="#d4a72c" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, 1.78, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.26, 0.32, 24, 1, true]} />
        <meshStandardMaterial color="#f6dfb2" emissive="#ffb35c" emissiveIntensity={0.9} side={THREE.DoubleSide} roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.72, 0]}>
        <sphereGeometry args={[0.06, 12, 10]} />
        <meshStandardMaterial color="#fff1c9" emissive="#ffd48a" emissiveIntensity={3} toneMapped={false} />
      </mesh>
      <pointLight position={[0, 1.6, 0.3]} color="#ffbf73" intensity={9} decay={1.7} distance={0} />
    </group>
  )
}

export function Room() {
  return (
    <group>
      <Floor />
      <Walls />
      <Window />
      <Bed />
      <Painting />
      <Clock />
      <FloorLamp />
      {/* soft warm fill so the cabin glows against the night */}
      <pointLight position={[-0.5, 3.2, -1.5]} color="#ffc787" intensity={7} decay={1.6} distance={0} />
      <PottedPlant scale={1.5} position={[4.55, 0, -2.2]} leaf="#3f8f3a" />
      <PottedPlant scale={1.25} position={[-4.55, 0, -0.45]} leaf="#4f9a3a" pot="#e7d7c1" />
    </group>
  )
}
