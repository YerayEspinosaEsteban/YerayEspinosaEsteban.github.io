import { Text } from '@react-three/drei'
import { useFrame, type ThreeElements, type ThreeEvent } from '@react-three/fiber'
import { useEffect, useMemo, useRef, type ReactNode } from 'react'
import * as THREE from 'three'
import { anchors, useStore, type FocusId } from './store'

export const FONT_NEON = '/fonts/Audiowide-Regular.ttf'
export const FONT_PIXEL = '/fonts/PressStart2P-Regular.ttf'

type G = Omit<ThreeElements['group'], 'id'>

/** Emissive material that blooms (values > 1 exceed the bloom threshold). */
export function Glow({ color, intensity = 3, ...rest }: { color: string; intensity?: number } & Omit<ThreeElements['meshStandardMaterial'], 'color'>) {
  return <meshStandardMaterial color={color} emissive={color} emissiveIntensity={intensity} toneMapped={false} {...rest} />
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

/** Brightness multiplier for things tied to a focus target: brighter on hover, full when focused. */
export function useHighlight(id: FocusId) {
  const v = useRef(1)
  useFrame((_, dt) => {
    const s = useStore.getState()
    const goal = s.hovered === id ? 1.9 : s.focus === id ? 1.4 : 1
    v.current = THREE.MathUtils.lerp(v.current, goal, 1 - Math.exp(-10 * dt))
  })
  return v
}

/** Neon sign text with optional flicker; glows harder when its zone is hovered. */
export function NeonText({ id, text, color, size = 0.3, font = FONT_NEON, flicker = false, intensity = 4, ...rest }: {
  id?: FocusId
  text: string
  color: string
  size?: number
  font?: string
  flicker?: boolean
  intensity?: number
} & G) {
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: intensity, toneMapped: false }), [color, intensity])
  const hl = useRef(1)
  const nextFlick = useRef(2 + Math.random() * 6)
  useFrame(({ clock }, dt) => {
    const s = useStore.getState()
    const goal = id && s.hovered === id ? 1.8 : 1
    hl.current = THREE.MathUtils.lerp(hl.current, goal, 1 - Math.exp(-10 * dt))
    let f = 1
    if (flicker) {
      const t = clock.elapsedTime
      if (t > nextFlick.current) {
        f = Math.random() < 0.5 ? 0.15 : 0.6
        if (t > nextFlick.current + 0.18) nextFlick.current = t + 3 + Math.random() * 7
      }
    }
    mat.emissiveIntensity = intensity * hl.current * f
  })
  return (
    <group {...rest}>
      <Text font={font} fontSize={size} anchorX="center" anchorY="middle" material={mat} letterSpacing={0.04}>
        {text}
      </Text>
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

/** Spinning PC/server fan with glowing ring. Faces local +Z. */
export function Fan({ r = 0.12, color = '#22d3ee', speed = 12, ring = true, ...rest }: { r?: number; color?: string; speed?: number; ring?: boolean } & G) {
  const blades = useRef<THREE.Group>(null!)
  useFrame((_, dt) => (blades.current.rotation.z += dt * speed))
  return (
    <group {...rest}>
      {ring && (
        <mesh>
          <torusGeometry args={[r, r * 0.08, 6, 28]} />
          <Glow color={color} intensity={2.5} />
        </mesh>
      )}
      <group ref={blades}>
        {Array.from({ length: 7 }, (_, i) => (
          <mesh key={i} rotation={[0.35, 0, (i / 7) * Math.PI * 2]} position={[Math.cos((i / 7) * Math.PI * 2) * r * 0.45, Math.sin((i / 7) * Math.PI * 2) * r * 0.45, 0]}>
            <boxGeometry args={[r * 0.75, r * 0.32, 0.005]} />
            <meshStandardMaterial color="#1f2937" metalness={0.4} roughness={0.5} transparent opacity={0.9} />
          </mesh>
        ))}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[r * 0.22, r * 0.22, 0.02, 12]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
      </group>
    </group>
  )
}

/** Hanging cable following a catenary-like sag between two points. */
export function Cable({ from, to, sag = 0.5, color = '#111827', radius = 0.025, glow }: { from: [number, number, number]; to: [number, number, number]; sag?: number; color?: string; radius?: number; glow?: boolean }) {
  const geo = useMemo(() => {
    const a = new THREE.Vector3(...from)
    const b = new THREE.Vector3(...to)
    const pts = Array.from({ length: 16 }, (_, i) => {
      const t = i / 15
      const p = a.clone().lerp(b, t)
      p.y -= Math.sin(Math.PI * t) * sag
      return p
    })
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 48, radius, 6, false)
  }, [from, to, sag, radius])
  return (
    <mesh geometry={geo} castShadow>
      {glow ? <Glow color={color} intensity={1.6} /> : <meshStandardMaterial color={color} roughness={0.6} />}
    </mesh>
  )
}
