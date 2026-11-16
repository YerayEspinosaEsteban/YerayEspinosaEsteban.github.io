import { Sparkles, Stars } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { bindKeyboard } from './input'
import { Planet } from './Planet'
import { Player } from './Player'
import { R, rng, randomDir } from './sphere'
import { Zones } from './Buildings'

/** Vertical gradient sky dome (deep violet → indigo → teal at the horizon). */
function Sky() {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        uniforms: {},
        vertexShader: `varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
        fragmentShader: `varying vec3 vP;
          void main(){
            float h = vP.y * 0.5 + 0.5;
            vec3 a = vec3(0.05,0.04,0.16); vec3 b = vec3(0.16,0.10,0.38); vec3 c = vec3(0.05,0.28,0.42);
            vec3 col = mix(c, b, smoothstep(0.0,0.55,h));
            col = mix(col, a, smoothstep(0.55,1.0,h));
            gl_FragColor = vec4(col,1.0);
          }`,
      }),
    [],
  )
  return (
    <mesh material={mat}>
      <sphereGeometry args={[220, 32, 16]} />
    </mesh>
  )
}

/** Fresnel rim glow around the planet. */
function Atmosphere() {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { c: { value: new THREE.Color('#5eead4') } },
        vertexShader: `varying vec3 vN; varying vec3 vV;
          void main(){ vN = normalize(normalMatrix*normal); vec4 mv = modelViewMatrix*vec4(position,1.0); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }`,
        fragmentShader: `uniform vec3 c; varying vec3 vN; varying vec3 vV;
          void main(){ float i = pow(clamp(0.72 + dot(vN, vV), 0.0, 1.0), 4.0); gl_FragColor = vec4(c, 1.0) * i * 0.9; }`,
      }),
    [],
  )
  return (
    <mesh material={mat}>
      <sphereGeometry args={[R * 1.22, 48, 32]} />
    </mesh>
  )
}

function Cloud({ seed }: { seed: number }) {
  const r = useMemo(() => rng(seed), [seed])
  const puffs = useMemo(() => Array.from({ length: 4 + Math.floor(r() * 3) }, (_, i) => ({ x: (i - 2) * 0.55 + r() * 0.2, y: r() * 0.3, z: r() * 0.4 - 0.2, s: 0.45 + r() * 0.35 })), [r])
  return (
    <group>
      {puffs.map((p, i) => (
        <mesh key={i} position={[p.x, p.y, p.z]} scale={p.s} castShadow>
          <icosahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#ffffff" flatShading roughness={1} transparent opacity={0.92} />
        </mesh>
      ))}
    </group>
  )
}

function Clouds() {
  const items = useMemo(() => {
    const r = rng(404)
    return Array.from({ length: 11 }, (_, i) => {
      const dir = randomDir(r)
      const axis = randomDir(r)
      return { i, dir, axis, speed: 0.02 + r() * 0.03, h: R + 10 + r() * 3.5 }
    })
  }, [])
  const refs = useRef<THREE.Group[]>([])
  useFrame((_, dt) => {
    items.forEach((c, i) => {
      const g = refs.current[i]
      if (!g) return
      c.dir.applyAxisAngle(c.axis, c.speed * dt).normalize()
      g.position.copy(c.dir).multiplyScalar(c.h)
      g.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), c.dir)
    })
  })
  return (
    <>
      {items.map((c, i) => (
        <group key={i} ref={(el) => { if (el) refs.current[i] = el }}>
          <Cloud seed={c.i * 13 + 1} />
        </group>
      ))}
    </>
  )
}

/** A ringed gas giant and a moon hanging in the background. */
function Backdrop() {
  const ring = useRef<THREE.Group>(null!)
  const moon = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    ring.current.rotation.y = clock.elapsedTime * 0.02
    const t = clock.elapsedTime * 0.05
    moon.current.position.set(Math.cos(t) * 34, 10 + Math.sin(t) * 6, Math.sin(t) * 34)
  })
  return (
    <>
      <group ref={ring} position={[-70, 35, -90]}>
        <mesh>
          <sphereGeometry args={[16, 24, 16]} />
          <meshStandardMaterial color="#f472b6" emissive="#7c3aed" emissiveIntensity={0.35} flatShading />
        </mesh>
        <mesh rotation={[1.2, 0.3, 0]}>
          <ringGeometry args={[21, 30, 48]} />
          <meshBasicMaterial color="#fbcfe8" transparent opacity={0.35} side={THREE.DoubleSide} />
        </mesh>
      </group>
      <group ref={moon}>
        <mesh>
          <icosahedronGeometry args={[2.2, 1]} />
          <meshStandardMaterial color="#e2e8f0" emissive="#94a3b8" emissiveIntensity={0.4} flatShading />
        </mesh>
      </group>
    </>
  )
}

export default function World({ mobile }: { mobile: boolean }) {
  useEffect(() => bindKeyboard(), [])
  return (
    <Canvas
      shadows
      dpr={mobile ? [1, 1.25] : [1, 1.75]}
      camera={{ fov: mobile ? 62 : 50, near: 0.1, far: 500, position: [0, R + 8, 14] }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => { gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.05 }}
    >
      <Sky />
      <Stars radius={150} depth={40} count={mobile ? 1500 : 3500} factor={5} fade speed={0.6} />
      <hemisphereLight args={['#c7e3ff', '#4c3a7a', 1.1]} />
      <ambientLight intensity={0.25} />
      <Backdrop />
      <Atmosphere />
      <Planet />
      <Zones />
      <Clouds />
      <Sparkles count={mobile ? 40 : 90} scale={R * 2.6} size={4} speed={0.3} color="#a5f3fc" opacity={0.7} />
      <Player mobile={mobile} />
    </Canvas>
  )
}
