import { RoundedBox } from '@react-three/drei'
import { useFrame, type ThreeElements, type ThreeEvent } from '@react-three/fiber'
import { useEffect, useMemo, useRef, type ReactNode } from 'react'
import * as THREE from 'three'
import { anchors, FOCUS_META, useStore, type FocusId } from './store'
import type { TexSet } from './textures'

type G = Omit<ThreeElements['group'], 'id'>
type V3 = [number, number, number]

/** Emissive material that blooms (values > 1 exceed the bloom threshold). */
export function Glow({ color, intensity = 3, ...rest }: { color: string; intensity?: number } & Omit<ThreeElements['meshStandardMaterial'], 'color'>) {
  return <meshStandardMaterial color={color} emissive={color} emissiveIntensity={intensity} toneMapped={false} {...rest} />
}

/** Standard material fed by a procedural texture set (colour + bump + roughness). */
export function TexMat({ set, bump = 1, ...rest }: { set: TexSet; bump?: number } & ThreeElements['meshStandardMaterial']) {
  return <meshStandardMaterial map={set.map} bumpMap={set.bumpMap} bumpScale={bump} roughnessMap={set.roughnessMap} {...rest} />
}

/** Soft-edged box (Nintendo-ish bevels) that casts and receives shadows. */
export function SoftBox({ size, radius = 0.03, children, ...rest }: { size: V3; radius?: number; children: ReactNode } & Pick<ThreeElements['mesh'], 'position' | 'rotation' | 'scale' | 'castShadow' | 'receiveShadow'>) {
  const r = Math.min(radius, size[0] / 2.01, size[1] / 2.01, size[2] / 2.01)
  return (
    <RoundedBox args={size} radius={r} smoothness={3} castShadow receiveShadow {...rest}>
      {children}
    </RoundedBox>
  )
}

/** Clickable/hoverable region of the diorama that flies the camera to `id`. */
export function Interactive({ id, children, ...rest }: { id: FocusId; children: ReactNode } & G) {
  const over = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    const s = useStore.getState()
    if (!s.entered || s.focus === id) return
    s.setHovered(id)
    document.body.style.cursor = 'pointer'
  }
  const out = () => {
    if (useStore.getState().hovered === id) useStore.getState().setHovered(null)
    document.body.style.cursor = ''
  }
  const click = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    if (e.delta > 5) return // it was an orbit drag
    const s = useStore.getState()
    if (!s.entered) return
    document.body.style.cursor = ''
    s.setFocus(id)
  }
  return (
    <group onPointerOver={over} onPointerOut={out} onClick={click} {...rest}>
      {children}
    </group>
  )
}

/** 0→1 smoothed value: 1 while the zone is hovered. */
export function useHighlight(id: FocusId) {
  const v = useRef(0)
  useFrame((_, dt) => {
    const goal = useStore.getState().hovered === id ? 1 : 0
    v.current = THREE.MathUtils.lerp(v.current, goal, 1 - Math.exp(-10 * dt))
  })
  return v
}

/**
 * Floating gem marker above an interactive zone (classic "something to inspect here" cue).
 * Bobs and spins; grows on hover; hides while that zone is focused.
 */
export function Marker({ id, position }: { id: FocusId; position: V3 }) {
  const g = useRef<THREE.Group>(null!)
  const hl = useHighlight(id)
  const color = FOCUS_META[id].color
  const phase = useMemo(() => Math.random() * 6, [])
  useFrame(({ clock }, dt) => {
    const s = useStore.getState()
    const t = clock.elapsedTime + phase
    const hide = s.focus !== null || !s.entered
    const target = hide ? 0.001 : 1 + hl.current * 0.45
    const k = THREE.MathUtils.lerp(g.current.scale.x, target, 1 - Math.exp(-8 * dt))
    g.current.scale.setScalar(k)
    g.current.position.y = position[1] + Math.sin(t * 2.2) * 0.08
    g.current.rotation.y += dt * (1.2 + hl.current * 4)
  })
  return (
    <group ref={g} position={position}>
      <mesh castShadow>
        <octahedronGeometry args={[0.13, 0]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.55} roughness={0.25} metalness={0.1} flatShading />
      </mesh>
      <mesh scale={[1, 1.6, 1]} position={[0, 0, 0]}>
        <octahedronGeometry args={[0.07, 0]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.4} transparent opacity={0.55} />
      </mesh>
    </group>
  )
}

/** Registers a camera anchor (local +Z = out of the surface). */
export function Anchor({ id, width, height, children, ...rest }: { id: FocusId; width: number; height: number; children?: ReactNode } & G) {
  const ref = useRef<THREE.Group>(null!)
  useEffect(() => {
    anchors[id] = { obj: ref.current, width, height }
    return () => { delete anchors[id] }
  }, [id, width, height])
  return <group ref={ref} {...rest}>{children}</group>
}

/** Small terracotta pot with a leafy plant (instanced-free, a handful of meshes). */
export function PottedPlant({ scale = 1, leaf = '#4f9a3a', pot = '#c8693f', flowers, ...rest }: { scale?: number; leaf?: string; pot?: string; flowers?: string } & G) {
  const leaves = useMemo(() => Array.from({ length: 7 }, (_, i) => ({ a: (i / 7) * Math.PI * 2 + i * 0.3, r: 0.09 + (i % 3) * 0.03, y: 0.32 + (i % 2) * 0.08 })), [])
  const g = useRef<THREE.Group>(null!)
  const ph = useMemo(() => Math.random() * 5, [])
  useFrame(({ clock }) => (g.current.rotation.z = Math.sin(clock.elapsedTime * 0.9 + ph) * 0.04))
  return (
    <group scale={scale} {...rest}>
      <mesh position={[0, 0.12, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.15, 0.11, 0.24, 18]} />
        <meshStandardMaterial color={pot} roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.245, 0]} castShadow>
        <torusGeometry args={[0.145, 0.025, 8, 20]} />
        <meshStandardMaterial color={pot} roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.235, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.13, 16]} />
        <meshStandardMaterial color="#4a3020" roughness={1} />
      </mesh>
      <group ref={g} position={[0, 0.24, 0]}>
        {leaves.map((l, i) => (
          <mesh key={i} position={[Math.cos(l.a) * l.r, l.y - 0.18, Math.sin(l.a) * l.r]} scale={[1, 0.7, 1]} castShadow>
            <sphereGeometry args={[0.11, 10, 8]} />
            <meshStandardMaterial color={i % 2 ? leaf : new THREE.Color(leaf).offsetHSL(0.02, 0, 0.07).getStyle()} roughness={0.7} />
          </mesh>
        ))}
        {flowers && [0, 2.1, 4.2].map((a) => (
          <mesh key={a} position={[Math.cos(a) * 0.1, 0.24, Math.sin(a) * 0.1]}>
            <sphereGeometry args={[0.045, 10, 8]} />
            <meshStandardMaterial color={flowers} roughness={0.5} />
          </mesh>
        ))}
      </group>
    </group>
  )
}
