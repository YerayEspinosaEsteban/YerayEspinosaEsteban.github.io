import { Environment, Lightformer, OrbitControls, PerformanceMonitor, Stars } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Bloom, EffectComposer, N8AO, SMAA, ToneMapping, Vignette } from '@react-three/postprocessing'
import gsap from 'gsap'
import { ToneMappingMode } from 'postprocessing'
import { Suspense, useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { Campfire } from './Campfire'
import { Desk } from './Desk'
import { Garden } from './Garden'
import { RetroTV } from './RetroTV'
import { Room } from './Room'
import { Shelf } from './Shelf'
import { Simba } from './Simba'
import { StudyCorner } from './StudyCorner'
import { skyGradient } from './textures'
import { anchors, COMPACT, useStore } from './store'

// camera flights must finish on time even on slow devices (no lag-smoothing slowdown)
gsap.ticker.lagSmoothing(0)

const HOME_TARGET = new THREE.Vector3(3, 0.3, 3)
const HOME_DIR = new THREE.Vector3(1, 0.82, 1).normalize()
const INTRO_DIR = new THREE.Vector3(1.6, 0.55, 0.45).normalize()
/** Orbit limits in the overview: never see behind the walls or under the slab. */
const LIMITS = { minPolarAngle: 0.62, maxPolarAngle: 1.3, minAzimuthAngle: 0.12, maxAzimuthAngle: 1.45 }

const fovFor = (aspect: number) => (aspect < 0.8 ? 46 : 32)

function homeDistance(aspect: number) {
  // fit the island's ~10-unit half-width horizontally, never closer than the desktop framing
  const tanH = Math.tan(THREE.MathUtils.degToRad(fovFor(aspect)) / 2) * aspect
  return Math.max(30, 11.2 / tanH)
}

/** Flies the camera between the overview and each object's anchor with GSAP. */
function CameraRig() {
  const controls = useRef<OrbitControlsImpl>(null!)
  const { camera, size } = useThree()
  const focus = useStore((s) => s.focus)
  const entered = useStore((s) => s.entered)
  const aspect = size.width / size.height
  const tween = useRef<gsap.core.Tween | null>(null)

  const fly = (pos: THREE.Vector3, target: THREE.Vector3, duration: number, onDone?: () => void) => {
    tween.current?.kill()
    const c = controls.current
    c.enabled = false
    // OrbitControls clamps in update() even when disabled → lift every limit while flying
    Object.assign(c, { minPolarAngle: 0, maxPolarAngle: Math.PI, minAzimuthAngle: -Infinity, maxAzimuthAngle: Infinity, minDistance: 0, maxDistance: Infinity })
    const from = { px: camera.position.x, py: camera.position.y, pz: camera.position.z, tx: c.target.x, ty: c.target.y, tz: c.target.z }
    tween.current = gsap.to(from, {
      px: pos.x, py: pos.y, pz: pos.z, tx: target.x, ty: target.y, tz: target.z,
      duration,
      ease: 'power3.inOut',
      onUpdate: () => {
        camera.position.set(from.px, from.py, from.pz)
        c.target.set(from.tx, from.ty, from.tz)
        c.update()
      },
      onComplete: onDone,
    })
  }

  // initial framing (far away, sideways) before entering
  useEffect(() => {
    camera.position.copy(HOME_TARGET).addScaledVector(INTRO_DIR, homeDistance(aspect) * 1.6)
    controls.current.target.copy(HOME_TARGET)
    controls.current.update()
    controls.current.enabled = false
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const persp = camera as THREE.PerspectiveCamera
    persp.fov = fovFor(aspect)
    persp.updateProjectionMatrix()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aspect])

  useEffect(() => {
    const c = controls.current
    const home = HOME_TARGET.clone().addScaledVector(HOME_DIR, homeDistance(aspect))
    if (!entered) return
    if (!focus) {
      fly(home, HOME_TARGET, 1.6, () => {
        Object.assign(c, { ...LIMITS, minDistance: homeDistance(aspect) * 0.62, maxDistance: homeDistance(aspect) * 1.25 })
        c.enabled = true
      })
      return
    }
    const a = anchors[focus]
    if (!a) return
    a.obj.updateWorldMatrix(true, false)
    const p = new THREE.Vector3().setFromMatrixPosition(a.obj.matrixWorld)
    const n = new THREE.Vector3(0, 0, 1).applyQuaternion(a.obj.getWorldQuaternion(new THREE.Quaternion())).normalize()
    // distance that fits the surface (with margin for the "back" button)
    const persp = camera as THREE.PerspectiveCamera
    const tan = Math.tan(THREE.MathUtils.degToRad(persp.fov) / 2)
    const dH = (a.height / 2) / tan
    const dW = (a.width / 2) / (tan * aspect)
    if (COMPACT) {
      // phones: keep the object in the upper ~40% of the screen, above the content sheet
      const d = Math.max(dH, dW) * 1.1
      const shift = new THREE.Vector3(0, 1, 0).multiplyScalar(d * tan * 0.62)
      fly(p.clone().addScaledVector(n, d).sub(shift), p.clone().sub(shift), 1.5, () => useStore.getState().setArrived(true))
      return
    }
    const d = Math.max(dH, dW) * 1.34
    fly(p.clone().addScaledVector(n, d), p, 1.5, () => useStore.getState().setArrived(true))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus, entered, aspect])

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enableDamping
      dampingFactor={0.08}
      enablePan={false}
      rotateSpeed={0.55}
      zoomSpeed={0.6}
    />
  )
}

/** Big soft moon behind the cabin with a faint halo. */
function Moon() {
  return (
    <group position={[-34, 30, -44]}>
      <mesh>
        <sphereGeometry args={[2.6, 32, 24]} />
        <meshBasicMaterial color={new THREE.Color('#eef2ff').multiplyScalar(1.6)} toneMapped={false} fog={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[5.5, 32, 24]} />
        <meshBasicMaterial color="#8ea2e6" transparent opacity={0.08} depthWrite={false} fog={false} />
      </mesh>
    </group>
  )
}

function Lights({ mobile }: { mobile: boolean }) {
  const map = mobile ? 1024 : 2048
  return (
    <>
      <primitive object={skyGradient()} attach="background" />
      <fog attach="fog" args={['#121733', 75, 160]} />
      <Stars radius={90} depth={40} count={mobile ? 1500 : 3000} factor={3.2} saturation={0.2} fade speed={0.6} />
      <Moon />
      {/* low global light: the warm practical lights take centre stage */}
      <hemisphereLight args={['#3b4a8a', '#1a2414', 0.5]} />
      <ambientLight intensity={0.12} color="#4b4f8f" />
      {/* cool moonlight from behind the cabin: rim light that carves Simba's black silhouette */}
      <directionalLight
        position={[-14, 17, -18]}
        intensity={1.1}
        color="#9db4ff"
        castShadow
        shadow-mapSize={[map, map]}
        shadow-camera-left={-16}
        shadow-camera-right={16}
        shadow-camera-top={16}
        shadow-camera-bottom={-16}
        shadow-camera-near={1}
        shadow-camera-far={60}
        shadow-bias={-0.0005}
        shadow-normalBias={0.025}
        shadow-radius={4}
      />
      {/* faint blue fill from the viewer's side so nothing goes pitch black */}
      <directionalLight position={[14, 8, 16]} intensity={0.2} color="#7083c9" />
      <Environment resolution={256} frames={1} environmentIntensity={0.45}>
        <color attach="background" args={['#121833']} />
        <Lightformer form="rect" intensity={0.6} color="#3b4a8a" position={[0, 12, 0]} rotation-x={Math.PI / 2} scale={[30, 30, 1]} />
        <Lightformer form="circle" intensity={4} color="#cfe0ff" position={[-10, 8, -12]} scale={3} />
        <Lightformer form="circle" intensity={3} color="#ff8a3d" position={[8, 1.5, 8]} scale={3} />
      </Environment>
    </>
  )
}

/** Pre-compiles every material (even off-screen ones) and reports once real frames are drawn. */
function WarmUp({ onReady }: { onReady: () => void }) {
  const frames = useRef(0)
  useFrame(({ gl, scene, camera }) => {
    frames.current++
    if (frames.current === 2) gl.compile(scene, camera)
    if (frames.current === 6) onReady()
  })
  return null
}

export default function Experience({ mobile, onReady }: { mobile: boolean; onReady: () => void }) {
  const params = new URLSearchParams(window.location.search)
  const fx = !params.has('nofx')
  const maxDpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2)
  const [dpr, setDpr] = useState(maxDpr)
  return (
    <Canvas
      shadows="soft"
      dpr={dpr}
      camera={{ fov: 32, near: 0.1, far: 200, position: [40, 18, 14] }}
      gl={{ antialias: !fx, powerPreference: 'high-performance', stencil: false }}
      onCreated={({ gl }) => { gl.toneMapping = THREE.NeutralToneMapping }}
    >
      {/* drop resolution on struggling GPUs, raise it back when there is headroom */}
      <PerformanceMonitor onDecline={() => setDpr((d) => Math.max(1, d - 0.5))} onIncline={() => setDpr((d) => Math.min(maxDpr, d + 0.25))} flipflops={4} onFallback={() => setDpr(1)} />
      <Suspense fallback={null}>
        <Lights mobile={mobile} />
        <Room />
        <Garden />
        <Desk />
        <RetroTV />
        <StudyCorner />
        <Shelf />
        <Campfire shadows={!mobile} />
        <Simba />
        <WarmUp onReady={onReady} />
      </Suspense>
      <CameraRig />
      {fx && (
        <EffectComposer multisampling={0}>
          <N8AO halfRes={mobile} quality={mobile ? 'performance' : 'medium'} aoRadius={0.55} distanceFalloff={0.6} intensity={1.8} color="#05060d" />
          <SMAA />
          <Bloom mipmapBlur luminanceThreshold={1} luminanceSmoothing={0.3} intensity={1.1} radius={0.75} />
          <Vignette offset={0.3} darkness={0.6} />
          <ToneMapping mode={ToneMappingMode.NEUTRAL} />
        </EffectComposer>
      )}
    </Canvas>
  )
}
