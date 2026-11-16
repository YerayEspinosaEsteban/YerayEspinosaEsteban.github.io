import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { Anchor, FONT_PIXEL, Glow, Interactive, NeonText, useHighlight } from './common'
import { ProjectsScreen, ScreenPanel } from './Panels'
import { drawArcade, useCanvasTexture } from './screens'
import { useStore } from './store'

const BODY = '#2a1450'
const SCREEN = { w: 0.62, h: 0.5 }

/** Physical arcade button: when focused it pages through projects, otherwise it just focuses the arcade. */
function ArcadeButton({ color, dir, position }: { color: string; dir: number; position: [number, number, number] }) {
  const cap = useRef<THREE.Mesh>(null!)
  const press = useRef(0)
  useFrame((_, dt) => {
    press.current = Math.max(0, press.current - dt * 4)
    cap.current.position.y = 0.03 - press.current * 0.02
  })
  const click = (e: ThreeEvent<MouseEvent>) => {
    const s = useStore.getState()
    if (s.focus !== 'projects') return // bubble up → Interactive focuses the arcade
    e.stopPropagation()
    press.current = 1
    s.nextProject(dir)
  }
  return (
    <group position={position} onClick={click}>
      <mesh position={[0, 0.01, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.02, 16]} />
        <meshStandardMaterial color="#0b0d14" />
      </mesh>
      <mesh ref={cap} position={[0, 0.03, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.03, 16]} />
        <Glow color={color} intensity={2.4} />
      </mesh>
    </group>
  )
}

export function Arcade() {
  const tex = useCanvasTexture(drawArcade, 512, 412, 12)
  const hl = useHighlight('projects')
  const screenMat = useRef<THREE.MeshStandardMaterial>(null!)
  const marquee = useRef<THREE.MeshStandardMaterial>(null!)
  useFrame(({ clock }) => {
    screenMat.current.emissiveIntensity = 1.1 * hl.current
    marquee.current.emissiveIntensity = (1.6 + Math.sin(clock.elapsedTime * 3) * 0.25) * hl.current
  })

  return (
    <Interactive id="projects">
      {/* cabinet faces +X (into the room), standing by the left wall */}
      <group position={[-4.35, 0, 3.55]} rotation={[0, Math.PI / 2 - 0.12, 0]}>
        {/* side panels with the classic silhouette */}
        {[-0.45, 0.45].map((x) => (
          <group key={x} position={[x, 0, 0]}>
            <mesh position={[0, 0.95, -0.05]} castShadow receiveShadow>
              <boxGeometry args={[0.05, 1.9, 0.82]} />
              <meshStandardMaterial color={BODY} roughness={0.5} />
            </mesh>
            <mesh position={[x > 0 ? 0.027 : -0.027, 1.1, 0.1]} rotation={[0.6, 0, 0]}>
              <boxGeometry args={[0.005, 1.2, 0.03]} />
              <Glow color="#f472b6" intensity={2.2} />
            </mesh>
            <mesh position={[x > 0 ? 0.027 : -0.027, 0.95, -0.05]} rotation={[0.6, 0, 0]}>
              <boxGeometry args={[0.005, 1.4, 0.02]} />
              <Glow color="#22d3ee" intensity={2} />
            </mesh>
          </group>
        ))}
        {/* back + lower front */}
        <mesh position={[0, 0.95, -0.44]} castShadow>
          <boxGeometry args={[0.86, 1.9, 0.04]} />
          <meshStandardMaterial color="#1a0d33" />
        </mesh>
        <mesh position={[0, 0.48, 0.3]} castShadow>
          <boxGeometry args={[0.86, 0.96, 0.05]} />
          <meshStandardMaterial color="#1a0d33" roughness={0.5} />
        </mesh>
        {/* coin door */}
        <mesh position={[0, 0.5, 0.33]}>
          <boxGeometry args={[0.3, 0.32, 0.01]} />
          <meshStandardMaterial color="#111827" metalness={0.7} roughness={0.3} />
        </mesh>
        {[-0.06, 0.06].map((x) => (
          <mesh key={x} position={[x, 0.56, 0.337]}>
            <boxGeometry args={[0.035, 0.06, 0.005]} />
            <Glow color="#ef4444" intensity={3} />
          </mesh>
        ))}
        {/* control panel */}
        <group position={[0, 1.0, 0.36]} rotation={[0.28, 0, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.86, 0.06, 0.34]} />
            <meshStandardMaterial color="#111827" roughness={0.4} />
          </mesh>
          <mesh position={[-0.22, 0.06, 0.02]}>
            <cylinderGeometry args={[0.012, 0.012, 0.12, 8]} />
            <meshStandardMaterial color="#d1d5db" metalness={0.8} />
          </mesh>
          <mesh position={[-0.22, 0.13, 0.02]} castShadow>
            <sphereGeometry args={[0.035, 14, 10]} />
            <meshStandardMaterial color="#ef4444" roughness={0.3} />
          </mesh>
          <ArcadeButton color="#22d3ee" dir={-1} position={[0.06, 0.02, 0.03]} />
          <ArcadeButton color="#f472b6" dir={1} position={[0.2, 0.02, 0.03]} />
          <ArcadeButton color="#fbbf24" dir={1} position={[0.33, 0.02, -0.05]} />
        </group>
        {/* screen bezel, tilted back */}
        <group position={[0, 1.45, 0.12]} rotation={[-0.22, 0, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.86, 0.68, 0.06]} />
            <meshStandardMaterial color="#0b0614" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0, 0.031]}>
            <planeGeometry args={[SCREEN.w, SCREEN.h]} />
            <meshStandardMaterial ref={screenMat} map={tex} emissive="#ffffff" emissiveMap={tex} emissiveIntensity={1.1} toneMapped={false} />
          </mesh>
          <Anchor id="projects" width={SCREEN.w} height={SCREEN.h} position={[0, 0, 0.035]}>
            <ScreenPanel id="projects" width={SCREEN.w} height={SCREEN.h} px={620}>
              <ProjectsScreen />
            </ScreenPanel>
          </Anchor>
        </group>
        {/* marquee */}
        <group position={[0, 1.98, 0.08]}>
          <mesh castShadow>
            <boxGeometry args={[0.9, 0.26, 0.24]} />
            <meshStandardMaterial color={BODY} />
          </mesh>
          <mesh position={[0, 0, 0.122]}>
            <planeGeometry args={[0.8, 0.2]} />
            <meshStandardMaterial ref={marquee} color="#000" emissive="#3b0764" emissiveIntensity={1.6} toneMapped={false} />
          </mesh>
          <NeonText id="projects" text="PROJECTS" font={FONT_PIXEL} color="#f472b6" size={0.075} position={[0, 0, 0.13]} intensity={5} />
        </group>
        <mesh position={[0, 2.13, -0.05]}>
          <boxGeometry args={[0.9, 0.04, 0.82]} />
          <meshStandardMaterial color="#1a0d33" />
        </mesh>
        <pointLight position={[0, 1.5, 0.9]} color="#e879f9" intensity={3.5} distance={3.2} decay={2} />
      </group>
      {/* hint: a stool + crate of cartridges next to the cabinet */}
      <group position={[-3.4, 0, 4.3]}>
        <mesh position={[0, 0.45, 0]} castShadow>
          <cylinderGeometry args={[0.22, 0.22, 0.06, 16]} />
          <meshStandardMaterial color="#f472b6" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.22, 0]} castShadow>
          <cylinderGeometry args={[0.03, 0.06, 0.44, 8]} />
          <meshStandardMaterial color="#9ca3af" metalness={0.8} />
        </mesh>
      </group>
    </Interactive>
  )
}
