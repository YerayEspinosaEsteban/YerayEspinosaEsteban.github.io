import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Anchor, Interactive, Marker, SoftBox, TexMat, useHighlight } from './common'
import { ProjectsScreen, ScreenPanel } from './Panels'
import { drawTV, useCanvasTexture } from './screens'
import { useStore } from './store'
import { fabric, withRepeat, woodGrain } from './textures'

const SCREEN = { w: 0.64, h: 0.48 }
const CAB = { w: 1.55, h: 0.56, d: 0.56 }
/** TV corner on the left wall; local +Z points into the room (world +X). */
const ORIGIN: [number, number, number] = [-4.66, 0, 3.35]

function Television() {
  const tex = useCanvasTexture(drawTV, 512, 384, 12)
  const hl = useHighlight('projects')
  const mat = useRef<THREE.MeshStandardMaterial>(null!)
  useFrame(() => (mat.current.emissiveIntensity = 0.85 + hl.current * 0.35))
  const screenGeo = useMemo(() => {
    // slightly bulged CRT glass
    const g = new THREE.PlaneGeometry(SCREEN.w, SCREEN.h, 16, 12)
    const p = g.attributes.position
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i) / (SCREEN.w / 2), y = p.getY(i) / (SCREEN.h / 2)
      p.setZ(i, (1 - x * x * 0.5 - y * y * 0.5) * 0.025)
    }
    g.computeVertexNormals()
    return g
  }, [])
  const y = CAB.h + 0.4
  return (
    <group position={[0, 0, 0.02]}>
      {/* chunky body + tapered back */}
      <SoftBox size={[0.94, 0.76, 0.5]} radius={0.08} position={[0, y, 0.02]}>
        <meshStandardMaterial color="#e9e3d6" roughness={0.45} />
      </SoftBox>
      <SoftBox size={[0.7, 0.56, 0.3]} radius={0.08} position={[0, y + 0.02, -0.3]}>
        <meshStandardMaterial color="#d8d1c2" roughness={0.5} />
      </SoftBox>
      <SoftBox size={[0.74, 0.58, 0.04]} radius={0.04} position={[-0.08, y + 0.03, 0.27]}>
        <meshStandardMaterial color="#3b3f46" roughness={0.5} />
      </SoftBox>
      <mesh geometry={screenGeo} position={[-0.08, y + 0.03, 0.29]}>
        <meshStandardMaterial ref={mat} map={tex} emissive="#ffffff" emissiveMap={tex} emissiveIntensity={0.85} roughness={0.15} />
      </mesh>
      {/* knobs + speaker grille on the right */}
      {[0.12, -0.02].map((dy) => (
        <mesh key={dy} position={[0.38, y + dy, 0.28]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.035, 0.035, 0.03, 16]} />
          <meshStandardMaterial color="#3b3f46" roughness={0.4} />
        </mesh>
      ))}
      {Array.from({ length: 4 }, (_, i) => (
        <mesh key={i} position={[0.38, y - 0.13 - i * 0.035, 0.276]}>
          <boxGeometry args={[0.08, 0.012, 0.005]} />
          <meshStandardMaterial color="#9ca3af" />
        </mesh>
      ))}
      <mesh position={[0.38, y - 0.3, 0.28]}>
        <sphereGeometry args={[0.012, 8, 6]} />
        <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={2} toneMapped={false} />
      </mesh>
      {/* rabbit-ear antenna */}
      {[-0.4, 0.4].map((r) => (
        <mesh key={r} position={[Math.sin(r) * 0.22, y + 0.38 + Math.cos(r) * 0.2, -0.1]} rotation={[0, 0, -r]} castShadow>
          <cylinderGeometry args={[0.006, 0.006, 0.45, 6]} />
          <meshStandardMaterial color="#c9ced6" metalness={0.9} roughness={0.2} />
        </mesh>
      ))}
      <mesh position={[0, y + 0.4, -0.1]} scale={[1, 0.5, 1]}>
        <sphereGeometry args={[0.06, 14, 10]} />
        <meshStandardMaterial color="#3b3f46" />
      </mesh>
      <Anchor id="projects" width={SCREEN.w} height={SCREEN.h} position={[-0.08, y + 0.03, 0.32]}>
        <ScreenPanel id="projects" width={SCREEN.w} height={SCREEN.h} px={640}>
          <ProjectsScreen />
        </ScreenPanel>
      </Anchor>
    </group>
  )
}

/** Generic purple game console with a cartridge sticking out; pressing its button pages projects. */
function Console() {
  const btn = useRef<THREE.Mesh>(null!)
  const press = useRef(0)
  useFrame((_, dt) => {
    press.current = Math.max(0, press.current - dt * 4)
    btn.current.position.y = 0.075 - press.current * 0.012
  })
  const click = (e: ThreeEvent<MouseEvent>) => {
    const s = useStore.getState()
    if (s.focus !== 'projects') return // bubble → focuses the TV corner
    e.stopPropagation()
    press.current = 1
    s.nextProject(1)
  }
  return (
    <group position={[0.35, CAB.h, 0.05]} onClick={click}>
      <SoftBox size={[0.42, 0.09, 0.32]} radius={0.035} position={[0, 0.045, 0]}>
        <meshStandardMaterial color="#6d5bd0" roughness={0.4} />
      </SoftBox>
      <SoftBox size={[0.18, 0.1, 0.03]} radius={0.01} position={[-0.05, 0.12, -0.04]}>
        <meshStandardMaterial color="#e2574c" roughness={0.5} />
      </SoftBox>
      <mesh ref={btn} position={[0.13, 0.075, 0.08]}>
        <cylinderGeometry args={[0.025, 0.025, 0.02, 14]} />
        <meshStandardMaterial color="#fde047" roughness={0.4} />
      </mesh>
    </group>
  )
}

/** Controller resting on the floor, with its cable curving back to the console. */
function Controller({ position, rot, color }: { position: [number, number, number]; rot: number; color: string }) {
  return (
    <group position={position} rotation={[0, rot, 0]}>
      <mesh position={[0, 0.03, 0]} scale={[1, 0.35, 0.6]} castShadow>
        <capsuleGeometry args={[0.07, 0.14, 6, 14]} />
        <meshStandardMaterial color="#e9e3d6" roughness={0.45} />
      </mesh>
      {[[-0.07, '#3b3f46'], [0.07, color], [0.1, '#3b82f6']].map(([x, c], i) => (
        <mesh key={i} position={[x as number, 0.058, i === 2 ? -0.025 : 0]}>
          <cylinderGeometry args={[i === 0 ? 0.025 : 0.014, i === 0 ? 0.025 : 0.014, 0.012, 12]} />
          <meshStandardMaterial color={c as string} roughness={0.4} />
        </mesh>
      ))}
    </group>
  )
}

function Cable({ from, to }: { from: THREE.Vector3; to: THREE.Vector3 }) {
  const geo = useMemo(() => {
    const mid = from.clone().lerp(to, 0.5)
    mid.y = 0.02
    const pts = [from, from.clone().lerp(mid, 0.5).setY(0.02), mid, mid.clone().lerp(to, 0.5).add(new THREE.Vector3(0.2, 0, 0.1)), to]
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.008, 5, false)
  }, [from, to])
  return (
    <mesh geometry={geo}>
      <meshStandardMaterial color="#3b3f46" roughness={0.6} />
    </mesh>
  )
}

export function RetroTV() {
  const wood = useMemo(() => withRepeat(woodGrain('#a8713f', 41), 1.5, 0.6), [])
  const bag = useMemo(() => withRepeat(fabric('#f59e0b', undefined, 44), 3, 3), [])
  const mat = useMemo(() => withRepeat(fabric('#5b9a5a', '#4f8a4e', 45), 3, 2), [])
  return (
    <Interactive id="projects">
      <group position={ORIGIN} rotation={[0, Math.PI / 2, 0]}>
        {/* low TV cabinet with two doors and an open cubby */}
        <SoftBox size={[CAB.w, CAB.h, CAB.d]} radius={0.03} position={[0, CAB.h / 2, 0]}>
          <TexMat set={wood} bump={0.6} roughness={0.55} />
        </SoftBox>
        {[-0.48, 0.0].map((x) => (
          <group key={x} position={[x, CAB.h / 2, CAB.d / 2 + 0.005]}>
            <SoftBox size={[0.44, 0.44, 0.02]} radius={0.01}>
              <meshStandardMaterial color="#c48a52" roughness={0.5} />
            </SoftBox>
            <mesh position={[0.15, 0, 0.02]}>
              <sphereGeometry args={[0.022, 10, 8]} />
              <meshStandardMaterial color="#d4a72c" metalness={0.8} roughness={0.25} />
            </mesh>
          </group>
        ))}
        <mesh position={[0.5, CAB.h / 2, CAB.d / 2 - 0.02]}>
          <boxGeometry args={[0.44, 0.44, 0.02]} />
          <meshStandardMaterial color="#5b3a1e" roughness={0.8} />
        </mesh>
        {/* game cartridges stacked in the cubby */}
        {['#e2574c', '#3b82f6', '#8b5cf6', '#22a35a'].map((c, i) => (
          <SoftBox key={c} size={[0.07, 0.24, 0.3]} radius={0.01} position={[0.35 + i * 0.09, 0.17, CAB.d / 2 - 0.2]} rotation={[0, 0, i === 3 ? -0.2 : 0]}>
            <meshStandardMaterial color={c} roughness={0.5} />
          </SoftBox>
        ))}
        <Television />
        <pointLight position={[-0.08, CAB.h + 0.45, 0.9]} color="#8aa8ff" intensity={1.6} decay={2} distance={0} />
        <Console />
        {/* floor play area */}
        <mesh position={[0, 0.008, 1.25]} receiveShadow>
          <boxGeometry args={[1.9, 0.016, 1.4]} />
          <TexMat set={mat} bump={0.8} roughness={1} />
        </mesh>
        <Controller position={[-0.3, 0.016, 1.0]} rot={0.4} color="#e2574c" />
        <Controller position={[0.35, 0.016, 1.2]} rot={-0.6} color="#22a35a" />
        <Cable from={new THREE.Vector3(0.3, CAB.h + 0.02, 0.2)} to={new THREE.Vector3(-0.3, 0.03, 0.92)} />
        <Cable from={new THREE.Vector3(0.42, CAB.h + 0.02, 0.2)} to={new THREE.Vector3(0.32, 0.03, 1.1)} />
        {/* beanbag */}
        <mesh position={[-0.05, 0.27, 1.95]} scale={[1, 0.62, 1]} castShadow receiveShadow>
          <sphereGeometry args={[0.48, 28, 20]} />
          <TexMat set={bag} bump={0.6} roughness={1} />
        </mesh>
        <mesh position={[-0.05, 0.42, 2.18]} scale={[1, 0.5, 0.5]} castShadow>
          <sphereGeometry args={[0.4, 24, 16]} />
          <TexMat set={bag} bump={0.6} roughness={1} />
        </mesh>
      </group>
      <Marker id="projects" position={[ORIGIN[0] + 0.1, 1.95, ORIGIN[2] + 0.08]} />
    </Interactive>
  )
}
