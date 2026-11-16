import { useFrame } from '@react-three/fiber'
import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Anchor, Fan, Glow, Interactive, NeonText, useHighlight } from './common'
import { ExperiencePanel, ScreenPanel } from './Panels'

const RACKS = [-4.35, -3.45]
const RACK = { w: 0.82, h: 2.6, d: 0.9, z: -4.45 }
const UNITS = 11

/** All rack status LEDs in one instanced mesh, blinking like real traffic. */
function Leds() {
  const leds = useMemo(() => {
    const out: { p: [number, number, number]; c: THREE.Color; rate: number }[] = []
    const palette = ['#4ade80', '#4ade80', '#22d3ee', '#fbbf24', '#4ade80', '#f472b6'].map((h) => new THREE.Color(h))
    RACKS.forEach((x, r) =>
      Array.from({ length: UNITS }, (_, u) => {
        for (let k = 0; k < 4; k++) {
          const seed = (r * 37 + u * 11 + k * 5) % palette.length
          out.push({ p: [x - 0.3 + k * 0.045, 0.32 + u * 0.2, RACK.z + RACK.d / 2 + 0.012], c: palette[seed], rate: 1.5 + ((u * 7 + k * 3 + r) % 9) })
        }
      }),
    )
    return out
  }, [])
  const ref = useRef<THREE.InstancedMesh>(null!)
  useLayoutEffect(() => {
    const m = new THREE.Matrix4()
    leds.forEach((l, i) => { ref.current.setMatrixAt(i, m.makeTranslation(...l.p)); ref.current.setColorAt(i, l.c) })
    ref.current.instanceMatrix.needsUpdate = true
    ref.current.instanceColor!.needsUpdate = true
  }, [leds])
  const off = useMemo(() => new THREE.Color('#111'), [])
  const tmp = useMemo(() => new THREE.Color(), [])
  const acc = useRef(0)
  useFrame(({ clock }, dt) => {
    acc.current += dt
    if (acc.current < 0.06) return
    acc.current = 0
    const t = clock.elapsedTime
    leds.forEach((l, i) => {
      const on = Math.sin(t * l.rate + i * 1.7) + Math.sin(t * l.rate * 2.3 + i) > -0.4
      ref.current.setColorAt(i, on ? tmp.copy(l.c).multiplyScalar(4) : off)
    })
    ref.current.instanceColor!.needsUpdate = true
  })
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, leds.length]}>
      <boxGeometry args={[0.022, 0.022, 0.01]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  )
}

function Rack({ x }: { x: number }) {
  return (
    <group position={[x, 0, RACK.z]}>
      <mesh position={[0, RACK.h / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[RACK.w, RACK.h, RACK.d]} />
        <meshStandardMaterial color="#0d0f17" metalness={0.7} roughness={0.35} />
      </mesh>
      {Array.from({ length: UNITS }, (_, u) => (
        <group key={u} position={[0, 0.32 + u * 0.2, RACK.d / 2]}>
          <mesh>
            <boxGeometry args={[RACK.w - 0.1, 0.17, 0.02]} />
            <meshStandardMaterial color={u % 3 === 0 ? '#1f2937' : '#161b29'} metalness={0.6} roughness={0.4} />
          </mesh>
          {u % 4 === 1 && <Fan r={0.06} ring={false} speed={18 + u} position={[0.24, 0, 0.012]} />}
          {u % 4 === 1 && <Fan r={0.06} ring={false} speed={20 + u} position={[0.1, 0, 0.012]} />}
          {u % 3 === 2 && (
            <mesh position={[0.15, 0, 0.012]}>
              <boxGeometry args={[0.32, 0.02, 0.005]} />
              <Glow color="#22d3ee" intensity={1.4} />
            </mesh>
          )}
        </group>
      ))}
      {/* frame rails */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (RACK.w / 2 - 0.02), RACK.h / 2, RACK.d / 2 + 0.01]}>
          <boxGeometry args={[0.04, RACK.h, 0.03]} />
          <meshStandardMaterial color="#374151" metalness={0.8} roughness={0.3} />
        </mesh>
      ))}
      <mesh position={[0, RACK.h + 0.02, 0]}>
        <boxGeometry args={[RACK.w, 0.04, RACK.d]} />
        <meshStandardMaterial color="#374151" metalness={0.8} />
      </mesh>
    </group>
  )
}

/** Pedestal projecting a core protected by orbiting defensive layers. */
function Hologram({ hl }: { hl: React.RefObject<number> }) {
  const core = useRef<THREE.Mesh>(null!)
  const shells = useRef<THREE.Group[]>([])
  const beam = useRef<THREE.MeshBasicMaterial>(null!)
  const scan = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime
    core.current.rotation.y += dt * 0.8
    core.current.rotation.x += dt * 0.3
    core.current.position.y = 1.55 + Math.sin(t * 1.5) * 0.04
    shells.current.forEach((g, i) => { if (g) { g.rotation.y += dt * (0.4 + i * 0.25) * (i % 2 ? -1 : 1); g.rotation.x = Math.sin(t * 0.5 + i) * 0.3 } })
    beam.current.opacity = (0.1 + Math.sin(t * 4) * 0.02) * hl.current!
    scan.current.position.y = 1.15 + ((t * 0.5) % 1) * 0.85
  })
  return (
    <group position={[-2.75, 0, -2.55]}>
      <mesh position={[0, 0.12, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.5, 0.58, 0.24, 24]} />
        <meshStandardMaterial color="#1b1f33" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.25, 0]}>
        <torusGeometry args={[0.42, 0.02, 6, 48]} />
        <Glow color="#a78bfa" intensity={3} />
      </mesh>
      <mesh position={[0, 0.26, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.36, 32]} />
        <Glow color="#22d3ee" intensity={1.5} />
      </mesh>
      <mesh position={[0, 0.95, 0]}>
        <cylinderGeometry args={[0.55, 0.32, 1.4, 32, 1, true]} />
        <meshBasicMaterial ref={beam} color="#67e8f9" transparent opacity={0.1} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh ref={scan} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.44, 0.46, 48]} />
        <meshBasicMaterial color="#67e8f9" transparent opacity={0.6} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={core} position={[0, 1.55, 0]}>
        <icosahedronGeometry args={[0.2, 0]} />
        <Glow color="#22d3ee" intensity={4} flatShading />
      </mesh>
      {[0.32, 0.42, 0.52].map((r, i) => (
        <group key={r} ref={(el) => { if (el) shells.current[i] = el }} position={[0, 1.55, 0]}>
          <mesh rotation={[Math.PI / 2 + i * 0.5, 0, 0]}>
            <torusGeometry args={[r, 0.008, 6, 64, Math.PI * 1.5]} />
            <Glow color={['#22d3ee', '#a78bfa', '#4ade80'][i]} intensity={3} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 1.55, 0]}>
        <icosahedronGeometry args={[0.62, 1]} />
        <meshBasicMaterial color="#a78bfa" wireframe transparent opacity={0.12} toneMapped={false} />
      </mesh>
      <pointLight position={[0, 1.5, 0.2]} color="#67e8f9" intensity={4} distance={3.5} decay={2} />
    </group>
  )
}

export function ServerRack() {
  const hl = useHighlight('experience')
  const PANEL = { w: 2.3, h: 1.45 }
  return (
    <Interactive id="experience">
      {RACKS.map((x) => <Rack key={x} x={x} />)}
      <Leds />
      <Hologram hl={hl} />
      {/* holographic panel anchor floats above the projector, angled toward the default view */}
      <Anchor id="experience" width={PANEL.w} height={PANEL.h} position={[-2.65, 2.42, -2.35]} rotation={[0, 0.55, 0]}>
        <ScreenPanel id="experience" width={PANEL.w} height={PANEL.h} px={940}>
          <ExperiencePanel />
        </ScreenPanel>
      </Anchor>
      <NeonText id="experience" text="EXPERIENCE" color="#a78bfa" size={0.24} position={[-3.9, 3.35, -4.95]} intensity={4.5} />
      <NeonText id="experience" text="ZERO · TRUST · ZONE" color="#4ade80" size={0.09} position={[-3.9, 3.08, -4.95]} intensity={3.5} flicker />
    </Interactive>
  )
}
