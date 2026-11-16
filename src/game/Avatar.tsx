import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { player, WALK } from './playerState'

const SKIN = '#f2c38f'
const HOODIE = '#2d3e78'
const PANTS = '#1e293b'
const SHOE = '#f8fafc'
const ACCENT = '#22d3ee'

/** Stylised chibi security architect: big head, cyber visor, hoodie and tactical backpack. Faces +Z. */
export function Avatar() {
  const root = useRef<THREE.Group>(null!)
  const body = useRef<THREE.Group>(null!)
  const head = useRef<THREE.Group>(null!)
  const legL = useRef<THREE.Group>(null!)
  const legR = useRef<THREE.Group>(null!)
  const armL = useRef<THREE.Group>(null!)
  const armR = useRef<THREE.Group>(null!)
  const visor = useRef<THREE.MeshStandardMaterial>(null!)
  const phase = useRef(0)

  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime
    const amt = THREE.MathUtils.clamp(player.speed / WALK, 0, 1.5)
    phase.current += dt * (4 + player.speed * 1.3) * Math.min(amt * 2, 1)
    const p = phase.current
    const air = player.h > 0.05
    const swing = air ? 0 : Math.sin(p) * 0.75 * Math.min(amt, 1.2)

    legL.current.rotation.x = air ? -0.6 : swing
    legR.current.rotation.x = air ? 0.35 : -swing
    armL.current.rotation.x = air ? -2.4 : -swing * 0.9
    armR.current.rotation.x = air ? -2.4 : swing * 0.9
    armL.current.rotation.z = air ? 0.3 : 0.08
    armR.current.rotation.z = air ? -0.3 : -0.08

    const breathe = Math.sin(t * 2.2) * 0.015
    root.current.position.y = air ? 0 : Math.abs(Math.sin(p)) * 0.09 * Math.min(amt, 1)
    body.current.scale.set(1 + breathe, 1 - breathe, 1 + breathe)
    body.current.rotation.x = THREE.MathUtils.lerp(body.current.rotation.x, amt * 0.14, 0.15)
    head.current.rotation.y = Math.sin(t * 0.7) * 0.15 * (1 - Math.min(amt, 1))
    head.current.rotation.z = Math.sin(p) * 0.04 * amt
    visor.current.emissiveIntensity = 1.4 + Math.sin(t * 3) * 0.4
  })

  return (
    <group ref={root}>
      {/* legs (pivot at hip) */}
      {[
        [legL, 0.15],
        [legR, -0.15],
      ].map(([ref, x], i) => (
        <group key={i} ref={ref as React.RefObject<THREE.Group>} position={[x as number, 0.62, 0]}>
          <mesh position={[0, -0.27, 0]} castShadow>
            <capsuleGeometry args={[0.11, 0.3, 4, 8]} />
            <meshStandardMaterial color={PANTS} />
          </mesh>
          <mesh position={[0, -0.56, 0.06]} castShadow>
            <boxGeometry args={[0.2, 0.12, 0.32]} />
            <meshStandardMaterial color={SHOE} />
          </mesh>
          <mesh position={[0, -0.5, 0.06]}>
            <boxGeometry args={[0.21, 0.03, 0.33]} />
            <meshStandardMaterial color={ACCENT} emissive={ACCENT} emissiveIntensity={0.6} />
          </mesh>
        </group>
      ))}

      <group ref={body} position={[0, 0.62, 0]}>
        {/* torso */}
        <mesh position={[0, 0.34, 0]} castShadow>
          <capsuleGeometry args={[0.3, 0.3, 4, 10]} />
          <meshStandardMaterial color={HOODIE} roughness={0.8} />
        </mesh>
        {/* hoodie zip + chest badge */}
        <mesh position={[0, 0.34, 0.29]}>
          <boxGeometry args={[0.03, 0.42, 0.02]} />
          <meshStandardMaterial color="#cbd5e1" />
        </mesh>
        <mesh position={[0.14, 0.45, 0.27]} rotation={[0, 0.3, 0]}>
          <boxGeometry args={[0.1, 0.1, 0.02]} />
          <meshStandardMaterial color={ACCENT} emissive={ACCENT} emissiveIntensity={1} />
        </mesh>
        {/* tactical backpack */}
        <group position={[0, 0.4, -0.3]}>
          <mesh castShadow>
            <boxGeometry args={[0.46, 0.5, 0.22]} />
            <meshStandardMaterial color="#334155" roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.06, -0.115]}>
            <boxGeometry args={[0.32, 0.06, 0.01]} />
            <meshStandardMaterial color={ACCENT} emissive={ACCENT} emissiveIntensity={1.2} />
          </mesh>
          <mesh position={[0.15, 0.42, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 0.4, 4]} />
            <meshStandardMaterial color="#94a3b8" />
          </mesh>
          <mesh position={[0.15, 0.64, 0]}>
            <sphereGeometry args={[0.04, 8, 6]} />
            <meshStandardMaterial color="#f43f5e" emissive="#f43f5e" emissiveIntensity={2} />
          </mesh>
        </group>

        {/* arms (pivot at shoulder) */}
        {[
          [armL, 0.38],
          [armR, -0.38],
        ].map(([ref, x], i) => (
          <group key={i} ref={ref as React.RefObject<THREE.Group>} position={[x as number, 0.56, 0]}>
            <mesh position={[0, -0.2, 0]} castShadow>
              <capsuleGeometry args={[0.09, 0.26, 4, 8]} />
              <meshStandardMaterial color={HOODIE} roughness={0.8} />
            </mesh>
            <mesh position={[0, -0.42, 0]} castShadow>
              <sphereGeometry args={[0.085, 10, 8]} />
              <meshStandardMaterial color={SKIN} />
            </mesh>
          </group>
        ))}

        {/* head */}
        <group ref={head} position={[0, 0.98, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.38, 20, 16]} />
            <meshStandardMaterial color={SKIN} roughness={0.7} />
          </mesh>
          {/* hair */}
          <mesh position={[0, 0.1, -0.03]} scale={[1.06, 0.9, 1.08]} castShadow>
            <sphereGeometry args={[0.38, 12, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#3b2416" roughness={0.9} flatShading />
          </mesh>
          <mesh position={[0.05, 0.3, 0.22]} rotation={[0.6, 0, -0.3]}>
            <coneGeometry args={[0.12, 0.25, 5]} />
            <meshStandardMaterial color="#3b2416" flatShading />
          </mesh>
          {/* cyber visor */}
          <mesh position={[0, 0.02, 0.33]}>
            <boxGeometry args={[0.6, 0.13, 0.12]} />
            <meshStandardMaterial ref={visor} color="#0e7490" emissive={ACCENT} emissiveIntensity={1.4} metalness={0.6} roughness={0.2} />
          </mesh>
          {[0.33, -0.33].map((x) => (
            <mesh key={x} position={[x, 0.02, 0.2]}>
              <boxGeometry args={[0.06, 0.1, 0.2]} />
              <meshStandardMaterial color="#1e293b" />
            </mesh>
          ))}
          {/* smile */}
          <mesh position={[0, -0.16, 0.34]} rotation={[0, 0, Math.PI]}>
            <torusGeometry args={[0.06, 0.012, 4, 10, Math.PI]} />
            <meshStandardMaterial color="#7c2d12" />
          </mesh>
        </group>
      </group>
    </group>
  )
}
