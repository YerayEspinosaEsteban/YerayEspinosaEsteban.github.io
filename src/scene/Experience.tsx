import { Environment, Lightformer, OrbitControls, PerformanceMonitor } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Bloom, EffectComposer, SMAA, ToneMapping, Vignette } from '@react-three/postprocessing'
import gsap from 'gsap'
import { ToneMappingMode } from 'postprocessing'
import { Suspense, useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { Arcade } from './Arcade'
import { Desk } from './Desk'
import { Room } from './Room'
import { ServerRack } from './ServerRack'
import { Shelf } from './Shelf'
import { anchors, COMPACT, useStore } from './store'

// camera flights must finish on time even on slow devices (no lag-smoothing slowdown)
gsap.ticker.lagSmoothing(0)

const HOME_TARGET = new THREE.Vector3(-0.5, 1.45, -0.4)
const HOME_DIR = new THREE.Vector3(1, 0.82, 1).normalize()
const INTRO_DIR = new THREE.Vector3(1.6, 0.55, 0.45).normalize()
/** Orbit limits in the overview: never see behind the walls or under the slab. */
const LIMITS = { minPolarAngle: 0.62, maxPolarAngle: 1.22, minAzimuthAngle: 0.12, maxAzimuthAngle: 1.45 }

const fovFor = (aspect: number) => (aspect < 0.8 ? 46 : 32)

function homeDistance(aspect: number) {
  // fit the diorama's ~7.2-unit half-width horizontally, never closer than the desktop framing
  const tanH = Math.tan(THREE.MathUtils.degToRad(fovFor(aspect)) / 2) * aspect
  return Math.max(21, 6.5 / tanH)
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
    const d = Math.max(dH, dW) * 1.22
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

function Lights({ mobile }: { mobile: boolean }) {
  return (
    <>
      <ambientLight intensity={0.6} color="#8b9cf6" />
      <hemisphereLight args={['#9db4ff', '#1a1030', 0.9]} />
      <directionalLight
        position={[7, 11, 6]}
        intensity={1.3}
        color="#dfe7ff"
        castShadow
        shadow-mapSize={[mobile ? 1024 : 2048, mobile ? 1024 : 2048]}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-camera-near={1}
        shadow-camera-far={30}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
        shadow-radius={6}
      />
      <pointLight position={[2.5, 3.2, 2.5]} color="#c4b5fd" intensity={6} distance={9} decay={2} />
      {/* soft reflections for metals without loading any HDR file */}
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={1.2} color="#22d3ee" position={[-4, 3, 2]} scale={[4, 2, 1]} />
        <Lightformer form="rect" intensity={1.2} color="#f472b6" position={[4, 2, -3]} scale={[4, 2, 1]} />
        <Lightformer form="ring" intensity={1.5} color="#ffffff" position={[0, 6, 0]} scale={3} />
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
      camera={{ fov: 32, near: 0.1, far: 160, position: [30, 14, 10] }}
      gl={{ antialias: false, powerPreference: 'high-performance', stencil: false }}
    >
      {/* drop resolution on struggling GPUs, raise it back when there is headroom */}
      <PerformanceMonitor onDecline={() => setDpr((d) => Math.max(1, d - 0.5))} onIncline={() => setDpr((d) => Math.min(maxDpr, d + 0.25))} flipflops={4} onFallback={() => setDpr(1)} />
      <color attach="background" args={['#0b0d14']} />
      <fog attach="fog" args={['#0b0d14', 45, 90]} />
      <Suspense fallback={null}>
        <Lights mobile={mobile} />
        <Room reflect={!mobile && fx} />
        <Desk />
        <ServerRack />
        <Shelf />
        <Arcade />
        <WarmUp onReady={onReady} />
      </Suspense>
      <CameraRig />
      {fx && (
        <EffectComposer multisampling={0}>
          <SMAA />
          <Bloom mipmapBlur luminanceThreshold={1} luminanceSmoothing={0.2} intensity={0.85} radius={0.72} />
          <Vignette offset={0.28} darkness={0.75} />
          <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        </EffectComposer>
      )}
    </Canvas>
  )
}
