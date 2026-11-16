import { Canvas, useFrame, type ThreeEvent } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

export type Palette = { a: string; b: string; c: string }

type Props = { palette: Palette; lite: boolean; onPokeball: () => void }

/** Smoothed scroll progress over the hero (0 → 1) without React re-renders. */
function useScrollRef() {
  const ref = useRef(0)
  useEffect(() => {
    const onScroll = () => (ref.current = Math.min(window.scrollY / window.innerHeight, 1.5))
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return ref
}

function Core({ palette }: { palette: Palette }) {
  const outer = useRef<THREE.Mesh>(null!)
  const inner = useRef<THREE.Mesh>(null!)
  const glow = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime
    outer.current.rotation.y += dt * 0.18
    outer.current.rotation.x += dt * 0.07
    inner.current.rotation.y -= dt * 0.35
    inner.current.rotation.z += dt * 0.12
    const s = 1 + Math.sin(t * 2.2) * 0.04
    glow.current.scale.setScalar(s)
  })
  return (
    <group>
      {/* pulsing energy heart */}
      <mesh ref={glow}>
        <sphereGeometry args={[0.55, 32, 32]} />
        <meshBasicMaterial color={palette.a} transparent opacity={0.9} />
      </mesh>
      <mesh scale={1.5}>
        <sphereGeometry args={[0.55, 24, 24]} />
        <meshBasicMaterial color={palette.a} transparent opacity={0.08} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      {/* architectural crystal */}
      <mesh ref={inner}>
        <octahedronGeometry args={[0.95, 0]} />
        <meshStandardMaterial color="#0b1224" emissive={palette.b} emissiveIntensity={0.35} metalness={0.9} roughness={0.25} flatShading transparent opacity={0.85} />
      </mesh>
      <mesh ref={outer}>
        <icosahedronGeometry args={[1.35, 1]} />
        <meshBasicMaterial color={palette.a} wireframe transparent opacity={0.45} />
      </mesh>
    </group>
  )
}

/** One defensive layer: a ring plus satellites orbiting it. */
function ShieldRing({ radius, tilt, speed, color, sats }: { radius: number; tilt: [number, number, number]; speed: number; color: string; sats: number }) {
  const g = useRef<THREE.Group>(null!)
  useFrame((_, dt) => (g.current.rotation.z += dt * speed))
  const satPos = useMemo(
    () => Array.from({ length: sats }, (_, i) => {
      const a = (i / sats) * Math.PI * 2
      return [Math.cos(a) * radius, Math.sin(a) * radius, 0] as [number, number, number]
    }),
    [radius, sats],
  )
  return (
    <group rotation={tilt}>
      <group ref={g}>
        <mesh>
          <torusGeometry args={[radius, 0.012, 8, 160]} />
          <meshBasicMaterial color={color} transparent opacity={0.7} />
        </mesh>
        {/* segmented shield plates */}
        <mesh>
          <torusGeometry args={[radius, 0.06, 2, 48, Math.PI * 0.35]} />
          <meshBasicMaterial color={color} transparent opacity={0.35} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI]}>
          <torusGeometry args={[radius, 0.06, 2, 48, Math.PI * 0.2]} />
          <meshBasicMaterial color={color} transparent opacity={0.35} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
        {satPos.map((p, i) => (
          <mesh key={i} position={p}>
            <boxGeometry args={[0.07, 0.07, 0.07]} />
            <meshBasicMaterial color={color} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

/** Network of nodes on a shell, linked to near neighbours. */
function Network({ color, count }: { color: string; count: number }) {
  const ref = useRef<THREE.Group>(null!)
  const { points, lines } = useMemo(() => {
    const pts: THREE.Vector3[] = []
    // Fibonacci sphere with radial jitter, deterministic
    for (let i = 0; i < count; i++) {
      const y = 1 - (i / (count - 1)) * 2
      const r = Math.sqrt(1 - y * y)
      const th = i * 2.399963
      const R = 4.2 + Math.sin(i * 12.9898) * 0.9
      pts.push(new THREE.Vector3(Math.cos(th) * r * R, y * R, Math.sin(th) * r * R))
    }
    const seg: number[] = []
    for (let i = 0; i < pts.length; i++)
      for (let j = i + 1; j < pts.length; j++)
        if (pts[i].distanceTo(pts[j]) < 1.55) seg.push(...pts[i].toArray(), ...pts[j].toArray())
    const pg = new THREE.BufferGeometry().setFromPoints(pts)
    const lg = new THREE.BufferGeometry()
    lg.setAttribute('position', new THREE.Float32BufferAttribute(seg, 3))
    return { points: pg, lines: lg }
  }, [count])
  useFrame((_, dt) => (ref.current.rotation.y += dt * 0.03))
  return (
    <group ref={ref}>
      <points geometry={points}>
        <pointsMaterial color={color} size={0.06} sizeAttenuation transparent opacity={0.9} />
      </points>
      <lineSegments geometry={lines}>
        <lineBasicMaterial color={color} transparent opacity={0.13} />
      </lineSegments>
    </group>
  )
}

function Dust({ count, color }: { count: number; color: string }) {
  const geo = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const s = Math.sin(i * 78.233) * 43758.5453
      const f = (k: number) => ((Math.sin(s * k) + 1) / 2 - 0.5) * 30
      arr.set([f(1.1), f(2.3), f(3.7) - 6], i * 3)
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(arr, 3))
    return g
  }, [count])
  return (
    <points geometry={geo}>
      <pointsMaterial color={color} size={0.025} transparent opacity={0.5} />
    </points>
  )
}

/** Easter egg: a holographic Pokéball drifting at the edge of the network. */
function HoloBall({ onFound }: { onFound: () => void }) {
  const g = useRef<THREE.Group>(null!)
  const [hover, setHover] = useState(false)
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    g.current.position.y = -1.9 + Math.sin(t * 1.3) * 0.12
    g.current.rotation.y = t * 0.8
    g.current.rotation.z = Math.sin(t * 0.9) * 0.25
    const s = THREE.MathUtils.lerp(g.current.scale.x, hover ? 1.35 : 1, 0.12)
    g.current.scale.setScalar(s)
  })
  const over = (e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); setHover(true); document.body.style.cursor = 'pointer' }
  const out = () => { setHover(false); document.body.style.cursor = '' }
  const op = hover ? 0.95 : 0.55
  return (
    <group ref={g} position={[3.4, -1.9, -0.6]} onPointerOver={over} onPointerOut={out} onClick={(e) => { e.stopPropagation(); onFound() }}>
      <mesh>
        <sphereGeometry args={[0.2, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshBasicMaterial color="#ff3355" transparent opacity={op} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.2, 24, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
        <meshBasicMaterial color="#e8f6ff" transparent opacity={op} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.2, 0.018, 6, 32]} />
        <meshBasicMaterial color="#0a0a12" />
      </mesh>
      <mesh position={[0, 0, 0.2]}>
        <circleGeometry args={[0.055, 20]} />
        <meshBasicMaterial color={hover ? '#22e6ff' : '#ffffff'} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.24, 16, 12]} />
        <meshBasicMaterial color="#22e6ff" wireframe transparent opacity={hover ? 0.5 : 0.15} />
      </mesh>
    </group>
  )
}

function Rig({ children }: { children: React.ReactNode }) {
  const g = useRef<THREE.Group>(null!)
  const scroll = useScrollRef()
  useFrame(({ pointer, camera }) => {
    const p = scroll.current
    g.current.rotation.y = THREE.MathUtils.lerp(g.current.rotation.y, pointer.x * 0.45 + p * 1.2, 0.05)
    g.current.rotation.x = THREE.MathUtils.lerp(g.current.rotation.x, -pointer.y * 0.3 + p * 0.4, 0.05)
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, 7 + p * 2.5, 0.08)
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, -p * 1.2, 0.08)
  })
  return <group ref={g}>{children}</group>
}

export default function HeroScene({ palette, lite, onPokeball }: Props) {
  const wrap = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting))
    if (wrap.current) io.observe(wrap.current)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={wrap} className="absolute inset-0">
      <Canvas
        frameloop={visible ? 'always' : 'never'}
        dpr={lite ? 1 : [1, 1.75]}
        camera={{ position: [0, 0, 7], fov: 50 }}
        gl={{ antialias: !lite, powerPreference: 'high-performance', alpha: true }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[4, 4, 4]} intensity={30} color={palette.a} />
        <pointLight position={[-4, -3, 2]} intensity={20} color={palette.b} />
        <Rig>
          <Core palette={palette} />
          <ShieldRing radius={1.95} tilt={[1.2, 0.2, 0]} speed={0.4} color={palette.a} sats={3} />
          <ShieldRing radius={2.45} tilt={[0.4, -0.9, 0.3]} speed={-0.28} color={palette.b} sats={4} />
          <ShieldRing radius={2.95} tilt={[-0.6, 0.5, 0.9]} speed={0.18} color={palette.c} sats={5} />
          <Network color={palette.a} count={lite ? 70 : 150} />
          <HoloBall onFound={onPokeball} />
        </Rig>
        <Dust count={lite ? 200 : 600} color={palette.b} />
      </Canvas>
    </div>
  )
}
