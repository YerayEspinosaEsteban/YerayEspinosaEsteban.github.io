import { MeshReflectorMaterial, Sparkles } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Cable, Fan, Glow } from './common'
import { drawPoster, makeGridTexture, useCanvasTexture } from './screens'

export const ROOM = { half: 5, wallH: 4.4, wallT: 0.3 }
const WALL = '#1b1f33'
const WALL_DARK = '#141729'
const METAL = '#3b4256'

function Walls() {
  const { half, wallH, wallT } = ROOM
  return (
    <group>
      {/* back wall (z = -half) */}
      <mesh position={[0, wallH / 2, -half - wallT / 2]} receiveShadow castShadow>
        <boxGeometry args={[half * 2 + wallT * 2, wallH, wallT]} />
        <meshStandardMaterial color={WALL} roughness={0.85} />
      </mesh>
      {/* left wall (x = -half) */}
      <mesh position={[-half - wallT / 2, wallH / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[wallT, wallH, half * 2]} />
        <meshStandardMaterial color={WALL} roughness={0.85} />
      </mesh>
      {/* acoustic / tech panelling */}
      {Array.from({ length: 9 }, (_, i) => (
        <mesh key={`b${i}`} position={[-half + 0.55 + i * 1.12, wallH / 2 + 0.05, -half + 0.02]} receiveShadow>
          <boxGeometry args={[0.06, wallH - 0.5, 0.04]} />
          <meshStandardMaterial color={WALL_DARK} roughness={0.7} />
        </mesh>
      ))}
      {Array.from({ length: 9 }, (_, i) => (
        <mesh key={`l${i}`} position={[-half + 0.02, wallH / 2 + 0.05, -half + 0.55 + i * 1.12]} receiveShadow>
          <boxGeometry args={[0.04, wallH - 0.5, 0.06]} />
          <meshStandardMaterial color={WALL_DARK} roughness={0.7} />
        </mesh>
      ))}
      {/* LED strips: top cyan, skirting magenta */}
      <mesh position={[0, wallH - 0.08, -half + 0.03]}>
        <boxGeometry args={[half * 2, 0.04, 0.03]} />
        <Glow color="#22d3ee" intensity={1.3} />
      </mesh>
      <mesh position={[-half + 0.03, wallH - 0.08, 0]}>
        <boxGeometry args={[0.03, 0.04, half * 2]} />
        <Glow color="#22d3ee" intensity={1.3} />
      </mesh>
      <mesh position={[0, 0.07, -half + 0.03]}>
        <boxGeometry args={[half * 2, 0.03, 0.03]} />
        <Glow color="#e879f9" intensity={2.5} />
      </mesh>
      <mesh position={[-half + 0.03, 0.07, 0]}>
        <boxGeometry args={[0.03, 0.03, half * 2]} />
        <Glow color="#e879f9" intensity={2.5} />
      </mesh>
      {/* wall top caps */}
      <mesh position={[0, wallH + 0.04, -half - wallT / 2]}>
        <boxGeometry args={[half * 2 + wallT * 2, 0.08, wallT + 0.04]} />
        <meshStandardMaterial color={METAL} metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[-half - wallT / 2, wallH + 0.04, 0]}>
        <boxGeometry args={[wallT + 0.04, 0.08, half * 2]} />
        <meshStandardMaterial color={METAL} metalness={0.6} roughness={0.4} />
      </mesh>
    </group>
  )
}

function Pipes() {
  const { half, wallH } = ROOM
  const y1 = wallH - 0.35
  return (
    <group>
      {[0, 0.16].map((dy, i) => (
        <group key={i}>
          <mesh position={[0.2, y1 - dy, -half + 0.16]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.05, 0.05, half * 2 - 0.4, 10]} />
            <meshStandardMaterial color={i ? '#6b7280' : '#9ca3af'} metalness={0.8} roughness={0.35} />
          </mesh>
          <mesh position={[-half + 0.16, y1 - dy, 0.2]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.05, 0.05, half * 2 - 0.4, 10]} />
            <meshStandardMaterial color={i ? '#6b7280' : '#9ca3af'} metalness={0.8} roughness={0.35} />
          </mesh>
        </group>
      ))}
      {[-3, -0.5, 2, 4.4].map((x) => (
        <mesh key={x} position={[x, y1 - 0.08, -half + 0.1]}>
          <boxGeometry args={[0.08, 0.36, 0.12]} />
          <meshStandardMaterial color={METAL} metalness={0.6} />
        </mesh>
      ))}
      {/* corner elbow */}
      <mesh position={[-half + 0.16, y1, -half + 0.16]}>
        <sphereGeometry args={[0.07, 10, 8]} />
        <meshStandardMaterial color="#9ca3af" metalness={0.8} roughness={0.35} />
      </mesh>
    </group>
  )
}

function Vent() {
  return (
    <group position={[4.0, 3.3, -ROOM.half + 0.05]}>
      <mesh>
        <boxGeometry args={[0.9, 0.9, 0.08]} />
        <meshStandardMaterial color="#2a3047" metalness={0.5} roughness={0.5} />
      </mesh>
      <Fan r={0.36} speed={5} ring={false} position={[0, 0, 0.05]} />
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={i} position={[0, -0.36 + i * 0.145, 0.09]}>
          <boxGeometry args={[0.84, 0.02, 0.02]} />
          <meshStandardMaterial color="#4b5563" metalness={0.6} />
        </mesh>
      ))}
    </group>
  )
}

function Poster() {
  const tex = useCanvasTexture(drawPoster, 360, 520, 0)
  return (
    <group position={[-ROOM.half + 0.04, 2.35, -2.9]} rotation={[0, Math.PI / 2, 0]}>
      <mesh>
        <planeGeometry args={[0.95, 1.37]} />
        <meshStandardMaterial map={tex} emissive="#ffffff" emissiveMap={tex} emissiveIntensity={0.35} roughness={0.6} />
      </mesh>
    </group>
  )
}

function Plant({ position }: { position: [number, number, number] }) {
  const leaves = useMemo(() => Array.from({ length: 9 }, (_, i) => ({ a: (i / 9) * Math.PI * 2, tilt: 0.5 + (i % 3) * 0.2, h: 0.55 + (i % 4) * 0.1 })), [])
  const g = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => (g.current.rotation.z = Math.sin(clock.elapsedTime * 0.8) * 0.03))
  return (
    <group position={position}>
      <mesh position={[0, 0.25, 0]} castShadow>
        <cylinderGeometry args={[0.24, 0.18, 0.5, 12]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.49, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.02, 12]} />
        <meshStandardMaterial color="#3f2d1f" />
      </mesh>
      <group ref={g} position={[0, 0.5, 0]}>
        {leaves.map((l, i) => (
          <mesh key={i} rotation={[l.tilt, l.a, 0]} position={[Math.sin(l.a) * 0.05, l.h / 2, Math.cos(l.a) * 0.05]} castShadow>
            <coneGeometry args={[0.07, l.h * 1.4, 4]} />
            <meshStandardMaterial color={i % 2 ? '#22c55e' : '#16a34a'} roughness={0.6} flatShading />
          </mesh>
        ))}
      </group>
    </group>
  )
}

function Floor({ reflect }: { reflect: boolean }) {
  const grid = useMemo(() => makeGridTexture(), [])
  const { half } = ROOM
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[half * 2, half * 2]} />
        {reflect ? (
          <MeshReflectorMaterial
            map={grid}
            blur={[400, 120]}
            resolution={512}
            mixBlur={1}
            mixStrength={1.6}
            mirror={0.45}
            roughness={0.75}
            depthScale={0.8}
            minDepthThreshold={0.3}
            maxDepthThreshold={1.4}
            metalness={0.5}
            color="#9aa3c7"
          />
        ) : (
          <meshStandardMaterial map={grid} roughness={0.5} metalness={0.4} color="#9aa3c7" />
        )}
      </mesh>
      {/* floating slab */}
      <mesh position={[-0.075, -0.35, -0.075]} castShadow receiveShadow>
        <boxGeometry args={[half * 2 + 0.15, 0.7, half * 2 + 0.15]} />
        <meshStandardMaterial color="#20253b" roughness={0.6} metalness={0.3} />
      </mesh>
      <mesh position={[-0.075, -0.95, -0.075]}>
        <boxGeometry args={[half * 2 - 0.4, 0.5, half * 2 - 0.4]} />
        <meshStandardMaterial color="#161a2b" roughness={0.7} />
      </mesh>
      {/* glowing trims along the two open edges */}
      <mesh position={[half + 0.005, -0.04, 0]}>
        <boxGeometry args={[0.02, 0.04, half * 2]} />
        <Glow color="#22d3ee" intensity={3} />
      </mesh>
      <mesh position={[0, -0.04, half + 0.005]}>
        <boxGeometry args={[half * 2, 0.04, 0.02]} />
        <Glow color="#22d3ee" intensity={3} />
      </mesh>
      <mesh position={[half + 0.005, -0.66, 0]}>
        <boxGeometry args={[0.02, 0.03, half * 2]} />
        <Glow color="#e879f9" intensity={2.4} />
      </mesh>
      <mesh position={[0, -0.66, half + 0.005]}>
        <boxGeometry args={[half * 2, 0.03, 0.02]} />
        <Glow color="#e879f9" intensity={2.4} />
      </mesh>
      {/* rug */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.9, 0.012, -1.5]} receiveShadow>
        <circleGeometry args={[1.7, 48]} />
        <meshStandardMaterial color="#1e1b4b" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.9, 0.015, -1.5]}>
        <ringGeometry args={[1.5, 1.56, 64]} />
        <Glow color="#a78bfa" intensity={1.4} />
      </mesh>
    </group>
  )
}

export function Room({ reflect }: { reflect: boolean }) {
  return (
    <group>
      <Floor reflect={reflect} />
      <Walls />
      <Pipes />
      <Vent />
      <Poster />
      <Plant position={[-1.85, 0, -4.45]} />
      {/* cable runs */}
      <Cable from={[-3.9, 2.62, -4.5]} to={[-1.2, ROOM.wallH - 0.42, -4.84]} sag={0.55} color="#22d3ee" radius={0.018} glow />
      <Cable from={[-3.4, 2.62, -4.6]} to={[0.6, ROOM.wallH - 0.42, -4.84]} sag={0.8} color="#111827" radius={0.03} />
      <Cable from={[-4.6, 2.62, -4.3]} to={[-4.84, ROOM.wallH - 0.42, -2.5]} sag={0.5} color="#f472b6" radius={0.018} glow />
      <Cable from={[-3.0, 0.05, -4.0]} to={[2.9, 0.05, -4.3]} sag={-0.02} color="#0b0f19" radius={0.035} />
      <Cable from={[2.4, 0.05, -4.3]} to={[3.3, 0.05, -3.6]} sag={-0.02} color="#0b0f19" radius={0.03} />
      <Sparkles count={70} scale={[9, 4, 9]} position={[0, 2.2, 0]} size={2.2} speed={0.25} opacity={0.5} color="#c7d2fe" />
    </group>
  )
}
