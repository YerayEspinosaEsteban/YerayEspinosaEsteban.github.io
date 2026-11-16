import { useFrame } from '@react-three/fiber'
import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Anchor, Interactive, Marker, PottedPlant, SoftBox, TexMat } from './common'
import { ExperiencePanel, ScreenPanel } from './Panels'
import { ROOM } from './Room'
import { drawMap, makeNote, useCanvasTexture } from './screens'
import { cork, withRepeat, woodGrain } from './textures'

const BOARD = { x: 1.15, y: 2.3, w: 2.4, h: 1.5 }
const TABLE = { x: 1.15, z: -4.66, y: 0.8, w: 2.1, d: 0.6 }
const BZ = -ROOM.half + 0.05

function Pinned({ draw, w, h, x, y, rot = 0, pin = '#e2574c', px = 256 }: { draw: Parameters<typeof useCanvasTexture>[0]; w: number; h: number; x: number; y: number; rot?: number; pin?: string; px?: number }) {
  const tex = useCanvasTexture(draw, px, Math.round((px * h) / w), 0)
  return (
    <group position={[x, y, 0.03]} rotation={[0, 0, rot]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[w, h, 0.004]} />
        <meshStandardMaterial map={tex} roughness={0.9} />
      </mesh>
      <mesh position={[0, h / 2 - 0.05, 0.02]} castShadow>
        <sphereGeometry args={[0.025, 12, 10]} />
        <meshStandardMaterial color={pin} roughness={0.3} />
      </mesh>
    </group>
  )
}

/** Red threads linking the pins, investigation-board style. */
function Threads({ pts }: { pts: [number, number][] }) {
  const geo = useMemo(() => {
    const v: number[] = []
    for (let i = 0; i < pts.length - 1; i++) v.push(pts[i][0], pts[i][1], 0.055, pts[i + 1][0], pts[i + 1][1], 0.055)
    return new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(v, 3))
  }, [pts])
  return (
    <lineSegments geometry={geo}>
      <lineBasicMaterial color="#c81e1e" />
    </lineSegments>
  )
}

function CorkBoard() {
  const set = useMemo(() => withRepeat(cork(), 2.4, 1.5), [])
  const frame = useMemo(() => withRepeat(woodGrain('#9b6a3c', 51), 2, 1), [])
  const notes = useMemo(() => ({
    gft: makeNote('GFT', ['Security Architect', '2026 — hoy'], '#fff3a3'),
    cib: makeNote('Cibergob', ['IT & Ciberseguridad', 'ENS · CVEs'], '#ffd6e0'),
    stack: makeNote('Stack', ['AWS · Azure', 'OpenShift'], '#d4f3d0'),
    soc: makeNote('SOC', ['Wazuh · TheHive', 'MISP'], '#d6e8ff'),
    nhi: makeNote('NHI', ['Governance', 'Zero-Trust'], '#ffe2bf'),
  }), [])
  const { w, h } = BOARD
  return (
    <group position={[BOARD.x, BOARD.y, BZ]}>
      <SoftBox size={[w + 0.14, h + 0.14, 0.05]} radius={0.02} position={[0, 0, 0]}>
        <TexMat set={frame} bump={0.5} roughness={0.55} />
      </SoftBox>
      <mesh position={[0, 0, 0.027]} receiveShadow>
        <planeGeometry args={[w, h]} />
        <TexMat set={set} bump={1.5} roughness={1} />
      </mesh>
      <Pinned draw={drawMap} w={0.78} h={0.56} x={-0.12} y={0.2} rot={0.02} px={384} pin="#3b82f6" />
      <Pinned draw={notes.gft} w={0.42} h={0.32} x={-0.86} y={0.38} rot={-0.06} />
      <Pinned draw={notes.cib} w={0.42} h={0.32} x={-0.82} y={-0.3} rot={0.05} pin="#22a35a" />
      <Pinned draw={notes.stack} w={0.42} h={0.32} x={0.68} y={0.4} rot={0.07} pin="#f59e0b" />
      <Pinned draw={notes.soc} w={0.42} h={0.32} x={0.78} y={-0.28} rot={-0.04} />
      <Pinned draw={notes.nhi} w={0.42} h={0.32} x={0.02} y={-0.42} rot={0.03} pin="#8b5cf6" />
      <Threads pts={[[-0.86, 0.49], [-0.12, 0.43], [0.68, 0.51], [0.78, -0.17], [0.02, -0.31], [-0.82, -0.19], [-0.86, 0.49]]} />
      <Anchor id="experience" width={w} height={h} position={[0, 0, 0.07]}>
        <ScreenPanel id="experience" width={w} height={h} px={940}>
          <ExperiencePanel />
        </ScreenPanel>
      </Anchor>
    </group>
  )
}

/** Quiet wood-and-metal homelab under the table with gently blinking status LEDs. */
function Homelab() {
  const wood = useMemo(() => withRepeat(woodGrain('#8a5a2c', 53), 1, 1), [])
  const leds = useMemo(() => {
    const out: { p: [number, number, number]; c: THREE.Color; rate: number }[] = []
    const pal = ['#4ade80', '#4ade80', '#60a5fa', '#fbbf24'].map((c) => new THREE.Color(c))
    for (let u = 0; u < 3; u++) for (let k = 0; k < 4; k++) out.push({ p: [-0.2 + k * 0.04, 0.13 + u * 0.15, 0.255], c: pal[(u * 3 + k) % 4], rate: 1.2 + ((u * 5 + k * 3) % 7) })
    return out
  }, [])
  const ref = useRef<THREE.InstancedMesh>(null!)
  useLayoutEffect(() => {
    const m = new THREE.Matrix4()
    leds.forEach((l, i) => { ref.current.setMatrixAt(i, m.makeTranslation(...l.p)); ref.current.setColorAt(i, l.c) })
    ref.current.instanceMatrix.needsUpdate = true
  }, [leds])
  const tmp = useMemo(() => new THREE.Color(), [])
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    leds.forEach((l, i) => {
      const on = Math.sin(t * l.rate + i * 1.7) > -0.5
      ref.current.setColorAt(i, on ? tmp.copy(l.c).multiplyScalar(3) : tmp.set('#1f2937'))
    })
    ref.current.instanceColor!.needsUpdate = true
  })
  return (
    <group position={[TABLE.x + 0.55, 0, TABLE.z]}>
      <SoftBox size={[0.62, 0.56, 0.5]} radius={0.025} position={[0, 0.28, 0]}>
        <TexMat set={wood} bump={0.5} roughness={0.6} />
      </SoftBox>
      {[0, 1, 2].map((u) => (
        <group key={u} position={[0, 0.13 + u * 0.15, 0.24]}>
          <SoftBox size={[0.54, 0.12, 0.03]} radius={0.01}>
            <meshStandardMaterial color="#c9ced6" metalness={0.75} roughness={0.3} />
          </SoftBox>
          {Array.from({ length: 6 }, (_, k) => (
            <mesh key={k} position={[0.05 + k * 0.035, 0, 0.017]}>
              <boxGeometry args={[0.012, 0.08, 0.004]} />
              <meshStandardMaterial color="#6b7280" />
            </mesh>
          ))}
        </group>
      ))}
      <instancedMesh ref={ref} args={[undefined, undefined, leds.length]}>
        <sphereGeometry args={[0.009, 8, 6]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
    </group>
  )
}

/** Small translucent data cube floating over the books, slowly turning. */
function DataCube() {
  const g = useRef<THREE.Group>(null!)
  const core = useRef<THREE.MeshStandardMaterial>(null!)
  const edges = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(0.16, 0.16, 0.16)), [])
  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime
    g.current.rotation.y += dt * 0.6
    g.current.position.y = TABLE.y + 0.42 + Math.sin(t * 1.4) * 0.025
    core.current.emissiveIntensity = 1.6 + Math.sin(t * 2.2) * 0.6
  })
  return (
    <group position={[TABLE.x - 0.62, 0, TABLE.z + 0.05]}>
      <group ref={g} position={[0, TABLE.y + 0.42, 0]}>
        <group rotation={[0.6, 0, 0.6]}>
          <mesh>
            <boxGeometry args={[0.15, 0.15, 0.15]} />
            <meshPhysicalMaterial color="#93c5fd" roughness={0.1} transmission={0} transparent opacity={0.55} clearcoat={1} />
          </mesh>
          <lineSegments geometry={edges}>
            <lineBasicMaterial color="#d4a72c" />
          </lineSegments>
          <mesh>
            <octahedronGeometry args={[0.05, 0]} />
            <meshStandardMaterial ref={core} color="#60a5fa" emissive="#60a5fa" emissiveIntensity={1.6} toneMapped={false} />
          </mesh>
        </group>
      </group>
    </group>
  )
}

function Books({ x, z, y, n = 6, rot = 0 }: { x: number; z: number; y: number; n?: number; rot?: number }) {
  const cols = ['#e2574c', '#3b82f6', '#f59e0b', '#22a35a', '#8b5cf6', '#f6efe2', '#0ea5e9']
  return (
    <group position={[x, y, z]} rotation={[0, rot, 0]}>
      {Array.from({ length: n }, (_, i) => (
        <SoftBox key={i} size={[0.055, 0.22 + (i % 3) * 0.03, 0.17]} radius={0.008} position={[i * 0.062, (0.22 + (i % 3) * 0.03) / 2, 0]}>
          <meshStandardMaterial color={cols[i % cols.length]} roughness={0.7} />
        </SoftBox>
      ))}
    </group>
  )
}

export function StudyCorner() {
  const top = useMemo(() => withRepeat(woodGrain('#c48a52', 55), 2, 1), [])
  return (
    <Interactive id="experience">
      <CorkBoard />
      {/* wall table with hairpin legs */}
      <SoftBox size={[TABLE.w, 0.06, TABLE.d]} radius={0.02} position={[TABLE.x, TABLE.y - 0.03, TABLE.z]}>
        <TexMat set={top} bump={0.5} roughness={0.5} />
      </SoftBox>
      {[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([sx, sz]) => (
        <mesh key={`${sx}${sz}`} position={[TABLE.x + sx * (TABLE.w / 2 - 0.1), (TABLE.y - 0.06) / 2, TABLE.z + sz * (TABLE.d / 2 - 0.08)]} rotation={[sz * 0.06, 0, -sx * 0.06]} castShadow>
          <cylinderGeometry args={[0.014, 0.014, TABLE.y - 0.06, 8]} />
          <meshStandardMaterial color="#3a3f47" metalness={0.7} roughness={0.35} />
        </mesh>
      ))}
      <Homelab />
      <Books x={TABLE.x - 0.85} z={TABLE.z - 0.05} y={TABLE.y} n={5} />
      {/* book stack lying flat under the cube */}
      {['#3b82f6', '#e2574c', '#f59e0b'].map((c, i) => (
        <SoftBox key={c} size={[0.28, 0.05, 0.2]} radius={0.01} position={[TABLE.x - 0.62 + i * 0.01, TABLE.y + 0.025 + i * 0.05, TABLE.z + 0.05]} rotation={[0, i * 0.15, 0]}>
          <meshStandardMaterial color={c} roughness={0.7} />
        </SoftBox>
      ))}
      <DataCube />
      {/* warm lantern lighting the investigation board */}
      <group position={[TABLE.x + 0.45, TABLE.y, TABLE.z + 0.08]}>
        <mesh position={[0, 0.02, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.09, 0.04, 6]} />
          <meshStandardMaterial color="#2b2b2f" metalness={0.6} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.15, 0]}>
          <cylinderGeometry args={[0.065, 0.065, 0.22, 6]} />
          <meshStandardMaterial color="#ffd48a" emissive="#ffb347" emissiveIntensity={2.2} toneMapped={false} transparent opacity={0.9} />
        </mesh>
        <mesh position={[0, 0.29, 0]} castShadow>
          <coneGeometry args={[0.09, 0.08, 6]} />
          <meshStandardMaterial color="#2b2b2f" metalness={0.6} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.36, 0]}>
          <torusGeometry args={[0.03, 0.006, 6, 12]} />
          <meshStandardMaterial color="#2b2b2f" metalness={0.6} />
        </mesh>
        <pointLight position={[0, 0.5, 0.3]} color="#ffbf73" intensity={3.5} decay={1.8} distance={0} />
      </group>
      {/* little globe */}
      <group position={[TABLE.x + 0.15, TABLE.y, TABLE.z]}>
        <mesh position={[0, 0.02, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.08, 0.04, 16]} />
          <meshStandardMaterial color="#8a5a2c" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.2, 0]} rotation={[0, 0, 0.4]} castShadow>
          <sphereGeometry args={[0.13, 24, 16]} />
          <meshStandardMaterial color="#60a5fa" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.2, 0]} rotation={[Math.PI / 2, 0.4, 0]}>
          <torusGeometry args={[0.15, 0.008, 6, 32, Math.PI]} />
          <meshStandardMaterial color="#d4a72c" metalness={0.8} roughness={0.3} />
        </mesh>
      </group>
      <PottedPlant scale={0.7} position={[TABLE.x + 0.82, TABLE.y, TABLE.z]} leaf="#4f9a3a" flowers="#f472b6" pot="#3b82f6" />
      <Marker id="experience" position={[BOARD.x, BOARD.y + BOARD.h / 2 + 0.45, BZ + 0.3]} />
    </Interactive>
  )
}
