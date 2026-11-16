import { useFrame } from '@react-three/fiber'
import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { SoftBox, TexMat } from './common'
import { dirt, grass, rock, withRepeat, woodGrain } from './textures'

/** Lawn level (the house foundation pokes a little above it). */
export const G = -0.14
/** Floating island footprint. */
const ISL = { x0: -7.6, x1: 10.6, z0: -7.6, z1: 10.6 }
const ISL_W = ISL.x1 - ISL.x0
const ISL_C = (ISL.x0 + ISL.x1) / 2
const FENCE = 10.22
/** Stone patio with the campfire, in the front corner closest to the camera. */
export const PATIO = { x: 7.5, z: 7.5, r: 2.1 }
const GATE = { z0: 0.95, z1: 2.15 }

/** Deterministic PRNG so the garden looks the same on every visit. */
function rng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Is (x, z) a free lawn spot? (outside the house, path, fence and tree trunks) */
function freeSpot(x: number, z: number, pad = 0) {
  if (x < 5.35 + pad && z < 5.35 + pad) return false // house
  if (x > 5 && Math.abs(z - 1.55) < 0.75 + pad) return false // stone path
  if (Math.hypot(x - PATIO.x, z - PATIO.z) < PATIO.r + 0.35 + pad) return false // campfire patio
  if (Math.hypot(x - 5.55, z - 5.55) < 0.5 + pad) return false // lamp post
  if (x > FENCE - 0.15 || z > FENCE - 0.15) return false
  for (const t of TREES) if (Math.hypot(x - t.p[0], z - t.p[1]) < 0.55 + pad) return false
  return x > ISL.x0 + 0.25 && z > ISL.z0 + 0.25
}

/* ───────── island body ───────── */
function Island() {
  const turf = useMemo(() => withRepeat(grass(), 4.5, 4.5), [])
  const turfSide = useMemo(() => withRepeat(grass(), 6, 0.1), [])
  const soil = useMemo(() => withRepeat(dirt(), 5, 0.45), [])
  const stone = useMemo(() => withRepeat(rock(), 3, 1), [])
  const under = useMemo(() => {
    const r = Math.SQRT1_2 * ISL_W
    const g = new THREE.CylinderGeometry(r, 2.4, 3.8, 4, 6)
    g.rotateY(Math.PI / 4)
    const rand = rng(7)
    const p = g.attributes.position
    for (let i = 0; i < p.count; i++) {
      const y = p.getY(i)
      if (y > 1.85) continue // keep the top ring flush with the soil
      const k = (1.9 - y) / 3.8
      p.setX(i, p.getX(i) + (rand() - 0.5) * 1.3 * k)
      p.setZ(i, p.getZ(i) + (rand() - 0.5) * 1.3 * k)
      p.setY(i, y + (rand() - 0.5) * 0.4 * k)
    }
    g.computeVertexNormals()
    return g
  }, [])
  const TURF_H = 0.16, SOIL_H = 1.1
  return (
    <group>
      <mesh position={[ISL_C, G - 0.001, ISL_C]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[ISL_W, ISL_W]} />
        <TexMat set={turf} bump={1.6} roughness={1} />
      </mesh>
      <mesh position={[ISL_C, G - TURF_H / 2 - 0.004, ISL_C]} receiveShadow>
        <boxGeometry args={[ISL_W + 0.04, TURF_H, ISL_W + 0.04]} />
        <TexMat set={turfSide} bump={1} roughness={1} />
      </mesh>
      <mesh position={[ISL_C, G - TURF_H - SOIL_H / 2, ISL_C]} receiveShadow castShadow>
        <boxGeometry args={[ISL_W, SOIL_H, ISL_W]} />
        <TexMat set={soil} bump={2.5} roughness={1} />
      </mesh>
      <mesh geometry={under} position={[ISL_C, G - TURF_H - SOIL_H - 1.9, ISL_C]} receiveShadow>
        <TexMat set={stone} bump={2} roughness={1} flatShading />
      </mesh>
      {/* grass lip hanging over the cut edge */}
      {Array.from({ length: 34 }, (_, i) => {
        const side = i < 17
        const t = ((i % 17) + 0.5) / 17
        const along = ISL.x0 + t * ISL_W
        const pos: [number, number, number] = side ? [ISL.x1 + 0.02, G - 0.13, along] : [along, G - 0.13, ISL.z1 + 0.02]
        return (
          <mesh key={i} position={pos} scale={[side ? 0.12 : 0.5 + (i % 3) * 0.12, 0.14 + (i % 4) * 0.03, side ? 0.5 + (i % 3) * 0.12 : 0.12]}>
            <sphereGeometry args={[1, 10, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
            <meshStandardMaterial color={i % 2 ? '#5aa63f' : '#6bb84a'} roughness={1} />
          </mesh>
        )
      })}
      <FloatingRock position={[ISL.x1 + 1.6, G - 2.2, 2]} s={0.55} ph={0} />
      <FloatingRock position={[-1, G - 2.7, ISL.z1 + 1.5]} s={0.4} ph={2} />
      <FloatingRock position={[ISL.x1 + 0.9, G - 3.6, ISL.z1 - 3]} s={0.3} ph={4} />
    </group>
  )
}

function FloatingRock({ position, s, ph }: { position: [number, number, number]; s: number; ph: number }) {
  const ref = useRef<THREE.Group>(null!)
  const stone = rock()
  useFrame(({ clock }) => {
    const t = clock.elapsedTime + ph
    ref.current.position.y = position[1] + Math.sin(t * 0.8) * 0.15
    ref.current.rotation.y = t * 0.1
  })
  return (
    <group ref={ref} position={position} scale={s}>
      <mesh scale={[1, 0.8, 1]}>
        <dodecahedronGeometry args={[1, 0]} />
        <TexMat set={stone} bump={2} flatShading roughness={1} />
      </mesh>
      <mesh position={[0, 0.72, 0]} scale={[0.95, 0.18, 0.95]}>
        <sphereGeometry args={[1, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#6bb84a" roughness={1} />
      </mesh>
    </group>
  )
}

/* ───────── wind-swayed instanced vegetation ───────── */
const windUniform = { value: 0 }
function windMaterial(params: THREE.MeshStandardMaterialParameters, strength = 0.18) {
  const m = new THREE.MeshStandardMaterial(params)
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uWind = windUniform
    sh.vertexShader = 'uniform float uWind;\n' + sh.vertexShader.replace(
      '#include <begin_vertex>',
      `#include <begin_vertex>
      #ifdef USE_INSTANCING
        vec4 wOrigin = instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
        float wH = max(transformed.y, 0.0);
        transformed.x += sin(uWind * 1.7 + wOrigin.x * 0.6 + wOrigin.z * 0.4) * wH * ${strength.toFixed(3)};
        transformed.z += cos(uWind * 1.3 + wOrigin.z * 0.7) * wH * ${(strength * 0.6).toFixed(3)};
      #endif`,
    )
  }
  return m
}

function useScatter(count: number, seed: number, pad = 0) {
  return useMemo(() => {
    const rand = rng(seed)
    const out: { x: number; z: number; s: number; r: number; k: number }[] = []
    let guard = 0
    while (out.length < count && guard++ < count * 40) {
      const x = ISL.x0 + rand() * ISL_W, z = ISL.z0 + rand() * ISL_W
      if (!freeSpot(x, z, pad)) continue
      out.push({ x, z, s: 0.7 + rand() * 0.6, r: rand() * Math.PI * 2, k: rand() })
    }
    return out
  }, [count, seed, pad])
}

function TallGrass() {
  const geo = useMemo(() => {
    const blades = Array.from({ length: 5 }, (_, i) => {
      const g = new THREE.ConeGeometry(0.035, 0.42 + (i % 3) * 0.1, 3, 1)
      g.translate(0, (0.42 + (i % 3) * 0.1) / 2, 0)
      g.rotateZ((i - 2) * 0.22)
      g.rotateY(i * 1.3)
      g.translate(Math.cos(i * 1.3) * 0.04, 0, Math.sin(i * 1.3) * 0.04)
      return g
    })
    return mergeGeometries(blades)
  }, [])
  const mat = useMemo(() => windMaterial({ color: '#5fae43', roughness: 0.9 }), [])
  const pts = useScatter(560, 3)
  const ref = useRef<THREE.InstancedMesh>(null!)
  useLayoutEffect(() => {
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), c = new THREE.Color()
    pts.forEach((p, i) => {
      q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), p.r)
      m.compose(new THREE.Vector3(p.x, G, p.z), q, new THREE.Vector3(p.s, p.s * (0.8 + p.k * 0.6), p.s))
      ref.current.setMatrixAt(i, m)
      ref.current.setColorAt(i, c.setHSL(0.27 + p.k * 0.06, 0.5, 0.36 + p.k * 0.12))
    })
    ref.current.instanceMatrix.needsUpdate = true
    ref.current.instanceColor!.needsUpdate = true
  }, [pts])
  return <instancedMesh ref={ref} args={[geo, mat, pts.length]} receiveShadow castShadow />
}

const FLOWER_COLORS = ['#fbbf24', '#ef4444', '#fde047', '#f472b6', '#ffffff', '#fb923c']
function Flowers() {
  const pts = useScatter(220, 11, 0.1)
  const stemGeo = useMemo(() => new THREE.CylinderGeometry(0.008, 0.01, 0.26, 4).translate(0, 0.13, 0), [])
  const headGeo = useMemo(() => {
    const petals = Array.from({ length: 5 }, (_, i) => {
      const g = new THREE.SphereGeometry(0.035, 6, 4)
      g.scale(1, 0.4, 1)
      g.translate(Math.cos((i / 5) * Math.PI * 2) * 0.035, 0.27, Math.sin((i / 5) * Math.PI * 2) * 0.035)
      return g
    })
    return mergeGeometries(petals)
  }, [])
  const centreGeo = useMemo(() => new THREE.SphereGeometry(0.022, 6, 4).translate(0, 0.28, 0), [])
  const stemMat = useMemo(() => windMaterial({ color: '#4d9a36', roughness: 0.9 }, 0.25), [])
  const headMat = useMemo(() => windMaterial({ color: '#ffffff', roughness: 0.6 }, 0.25), [])
  const centreMat = useMemo(() => windMaterial({ color: '#b45309', roughness: 0.6 }, 0.25), [])
  const refs = [useRef<THREE.InstancedMesh>(null!), useRef<THREE.InstancedMesh>(null!), useRef<THREE.InstancedMesh>(null!)]
  useLayoutEffect(() => {
    const m = new THREE.Matrix4(), c = new THREE.Color()
    pts.forEach((p, i) => {
      // flowers grow in clumps: snap colour to a coarse grid cell
      const col = FLOWER_COLORS[Math.abs(Math.floor(p.x / 2.2) * 7 + Math.floor(p.z / 2.2) * 3) % FLOWER_COLORS.length]
      m.compose(new THREE.Vector3(p.x, G, p.z), new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), p.r), new THREE.Vector3(p.s, p.s, p.s))
      refs.forEach((r) => r.current.setMatrixAt(i, m))
      refs[1].current.setColorAt(i, c.set(col))
    })
    refs.forEach((r) => (r.current.instanceMatrix.needsUpdate = true))
    refs[1].current.instanceColor!.needsUpdate = true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pts])
  return (
    <group>
      <instancedMesh ref={refs[0]} args={[stemGeo, stemMat, pts.length]} />
      <instancedMesh ref={refs[1]} args={[headGeo, headMat, pts.length]} castShadow />
      <instancedMesh ref={refs[2]} args={[centreGeo, centreMat, pts.length]} />
    </group>
  )
}

/* ───────── trees & bushes ───────── */
const TREES: { p: [number, number]; s: number; trunk: number }[] = [
  { p: [-6.4, -6.3], s: 1.35, trunk: 3.4 },
  { p: [1.8, -6.55], s: 1.05, trunk: 3.3 },
  { p: [7.05, -4.4], s: 1.05, trunk: 1.6 },
  { p: [-4.6, 7.15], s: 0.95, trunk: 1.5 },
]
const LEAF = ['#4f9a3a', '#5fae43', '#3f8a32', '#6cbc4c', '#4a9440']

function Tree({ p, s, trunk, i }: { p: [number, number]; s: number; trunk: number; i: number }) {
  const canopy = useRef<THREE.Group>(null!)
  const blobs = useMemo(() => {
    const rand = rng(100 + i)
    return Array.from({ length: 9 }, (_, k) => {
      const a = rand() * Math.PI * 2
      const r = k === 0 ? 0 : 0.55 + rand() * 0.45
      return { pos: [Math.cos(a) * r, (k === 0 ? 0.3 : rand() * 0.9 - 0.2), Math.sin(a) * r] as [number, number, number], rad: k === 0 ? 1.05 : 0.55 + rand() * 0.35, c: LEAF[k % LEAF.length] }
    })
  }, [i])
  const bark = useMemo(() => withRepeat(woodGrain('#7a5131', 20 + i), 1, 2, Math.PI / 2), [i])
  useFrame(({ clock }) => {
    const t = clock.elapsedTime + i * 1.7
    canopy.current.rotation.z = Math.sin(t * 0.9) * 0.025
    canopy.current.rotation.x = Math.cos(t * 0.7) * 0.02
  })
  return (
    <group position={[p[0], G, p[1]]} scale={s}>
      <mesh position={[0, trunk / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.16, 0.26, trunk, 10]} />
        <TexMat set={bark} bump={2} roughness={1} />
      </mesh>
      {[0, 2.1, 4.2].map((a) => (
        <mesh key={a} position={[Math.cos(a) * 0.2, 0.06, Math.sin(a) * 0.2]} rotation={[0, -a, 0.9]} castShadow>
          <cylinderGeometry args={[0.05, 0.1, 0.35, 6]} />
          <meshStandardMaterial color="#6e482b" roughness={1} />
        </mesh>
      ))}
      <group ref={canopy} position={[0, trunk + 0.6, 0]}>
        {blobs.map((b, k) => (
          <mesh key={k} position={b.pos} castShadow receiveShadow>
            <icosahedronGeometry args={[b.rad, 2]} />
            <meshStandardMaterial color={b.c} roughness={0.85} />
          </mesh>
        ))}
        {/* a few fruits */}
        {[0.4, 2.3, 4.4].map((a) => (
          <mesh key={a} position={[Math.cos(a) * 1.0, -0.15, Math.sin(a) * 1.0]}>
            <sphereGeometry args={[0.08, 10, 8]} />
            <meshStandardMaterial color="#ef4444" roughness={0.4} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

function Bush({ position, s = 1, c = '#4f9a3a' }: { position: [number, number, number]; s?: number; c?: string }) {
  return (
    <group position={position} scale={s}>
      {[[0, 0.3, 0, 0.42], [0.35, 0.22, 0.1, 0.32], [-0.32, 0.2, -0.05, 0.3], [0.05, 0.22, 0.32, 0.3]].map(([x, y, z, r], k) => (
        <mesh key={k} position={[x, y, z]} castShadow receiveShadow>
          <icosahedronGeometry args={[r, 2]} />
          <meshStandardMaterial color={new THREE.Color(c).offsetHSL(0, 0, k * 0.025).getStyle()} roughness={0.85} />
        </mesh>
      ))}
    </group>
  )
}

/* ───────── fence, path, mailbox ───────── */
function Fence() {
  const posts = useMemo(() => {
    const out: [number, number, number][] = [] // x, z, rotY
    for (let z = -7.25; z <= FENCE; z += 0.3) if (z < GATE.z0 || z > GATE.z1) out.push([FENCE, z, Math.PI / 2])
    for (let x = -7.25; x < FENCE - 0.1; x += 0.3) out.push([x, FENCE, 0])
    return out
  }, [])
  const pick = useRef<THREE.InstancedMesh>(null!)
  const tip = useRef<THREE.InstancedMesh>(null!)
  useLayoutEffect(() => {
    const m = new THREE.Matrix4(), q = new THREE.Quaternion()
    posts.forEach(([x, z, r], i) => {
      q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), r)
      pick.current.setMatrixAt(i, m.compose(new THREE.Vector3(x, G + 0.28, z), q, new THREE.Vector3(1, 1, 1)))
      tip.current.setMatrixAt(i, m.compose(new THREE.Vector3(x, G + 0.6, z), q.clone().multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 4)), new THREE.Vector3(1, 1, 1)))
    })
    pick.current.instanceMatrix.needsUpdate = true
    tip.current.instanceMatrix.needsUpdate = true
  }, [posts])
  const paint = <meshStandardMaterial color="#fbfaf6" roughness={0.55} />
  const rail = (key: string, pos: [number, number, number], len: number, alongZ: boolean) => (
    <mesh key={key} position={pos} castShadow receiveShadow>
      <boxGeometry args={alongZ ? [0.04, 0.07, len] : [len, 0.07, 0.04]} />
      {paint}
    </mesh>
  )
  return (
    <group>
      <instancedMesh ref={pick} args={[undefined, undefined, posts.length]} castShadow receiveShadow>
        <boxGeometry args={[0.09, 0.56, 0.035]} />
        {paint}
      </instancedMesh>
      <instancedMesh ref={tip} args={[undefined, undefined, posts.length]} castShadow>
        <coneGeometry args={[0.064, 0.09, 4]} />
        {paint}
      </instancedMesh>
      {[0.15, 0.42].map((y) => (
        <group key={y}>
          {rail(`a${y}`, [FENCE - 0.03, G + y, (-7.3 + GATE.z0) / 2], GATE.z0 + 7.3, true)}
          {rail(`b${y}`, [FENCE - 0.03, G + y, (GATE.z1 + FENCE) / 2], FENCE - GATE.z1, true)}
          {rail(`c${y}`, [(-7.3 + FENCE) / 2, G + y, FENCE - 0.03], FENCE + 7.3, false)}
        </group>
      ))}
      {/* gate posts with round caps */}
      {[GATE.z0 - 0.08, GATE.z1 + 0.08].map((z) => (
        <group key={z} position={[FENCE, G, z]}>
          <SoftBox size={[0.14, 0.82, 0.14]} radius={0.03} position={[0, 0.41, 0]}>
            <meshStandardMaterial color="#fbfaf6" roughness={0.55} />
          </SoftBox>
          <mesh position={[0, 0.86, 0]} castShadow>
            <sphereGeometry args={[0.08, 12, 10]} />
            <meshStandardMaterial color="#fbfaf6" roughness={0.55} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function StonePath() {
  const stone = rock()
  const stones = useMemo(() => {
    const rand = rng(31)
    return [5.55, 6.2, 6.85, 7.5, 8.15, 8.8, 9.45, 10.1].map((x, i) => ({ x, z: 1.55 + (i % 2 ? 0.14 : -0.12), r: 0.27 + rand() * 0.06, rot: rand() * 3 }))
  }, [])
  return (
    <group>
      {stones.map((s, i) => (
        <mesh key={i} position={[s.x, G + 0.015, s.z]} rotation={[0, s.rot, 0]} scale={[1, 1, 0.82]} receiveShadow castShadow>
          <cylinderGeometry args={[s.r, s.r * 1.04, 0.07, 9]} />
          <TexMat set={stone} bump={1.5} roughness={0.95} color="#d8d4cc" />
        </mesh>
      ))}
    </group>
  )
}

function Mailbox() {
  const flag = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => (flag.current.rotation.x = -0.15 + Math.sin(clock.elapsedTime * 1.4) * 0.05))
  const post = useMemo(() => withRepeat(woodGrain('#9b6a3c', 33), 1, 1), [])
  return (
    <group position={[9.6, G, 2.75]} rotation={[0, Math.PI / 2, 0]}>
      <mesh position={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[0.1, 0.9, 0.1]} />
        <TexMat set={post} roughness={0.8} />
      </mesh>
      <group position={[0, 1.0, 0]}>
        <SoftBox size={[0.3, 0.26, 0.5]} radius={0.12}>
          <meshStandardMaterial color="#3b82f6" roughness={0.35} metalness={0.2} />
        </SoftBox>
        <mesh position={[0, 0, 0.252]}>
          <planeGeometry args={[0.26, 0.2]} />
          <meshStandardMaterial color="#2563eb" roughness={0.4} />
        </mesh>
        <group ref={flag} position={[0.16, 0.02, -0.12]}>
          <mesh position={[0, 0.12, 0]}>
            <boxGeometry args={[0.015, 0.24, 0.02]} />
            <meshStandardMaterial color="#ef4444" />
          </mesh>
          <mesh position={[0, 0.2, 0.06]}>
            <boxGeometry args={[0.015, 0.09, 0.12]} />
            <meshStandardMaterial color="#ef4444" />
          </mesh>
        </group>
      </group>
    </group>
  )
}

/* ───────── sky life ───────── */
function Cloud({ position, s, speed }: { position: [number, number, number]; s: number; speed: number }) {
  const ref = useRef<THREE.Group>(null!)
  const puffs = useMemo(() => {
    const rand = rng(Math.round(position[0] * 13 + position[2]))
    return Array.from({ length: 6 }, (_, k) => ({ p: [(k - 2.5) * 0.75 + rand() * 0.3, Math.sin(k * 1.1) * 0.25 + (k === 2 || k === 3 ? 0.35 : 0), rand() * 0.5] as [number, number, number], r: 0.6 + rand() * 0.5 + (k === 2 || k === 3 ? 0.35 : 0) }))
  }, [position])
  useFrame(({ clock }) => {
    const t = clock.elapsedTime * speed
    ref.current.position.set(position[0] + Math.sin(t) * 1.2, position[1] + Math.sin(t * 1.7) * 0.15, position[2] + Math.cos(t) * 0.6)
  })
  return (
    <group ref={ref} position={position} scale={s}>
      {puffs.map((p, k) => (
        <mesh key={k} position={p.p}>
          <icosahedronGeometry args={[p.r, 2]} />
          <meshStandardMaterial color="#3a3d68" emissive="#241f52" emissiveIntensity={0.5} roughness={1} />
        </mesh>
      ))}
    </group>
  )
}

/** Fireflies drifting around the trees and bushes, pulsing on and off (bloom makes them glow). */
function Fireflies() {
  const flies = useMemo(() => {
    const rand = rng(77)
    const homes: [number, number][] = [...TREES.map((t) => t.p), [-6.4, -2.2], [-6.6, 2.4], [9.4, 4.6], [2.2, 9.3], [-3.3, -6.6], [5.4, -6.6]]
    return Array.from({ length: 48 }, (_, i) => {
      const h = homes[i % homes.length]
      return { x: h[0], z: h[1], y: 0.5 + rand() * 2.6, r: 0.6 + rand() * 1.4, sp: 0.15 + rand() * 0.3, ph: rand() * 20, blink: 0.6 + rand() * 1.2 }
    })
  }, [])
  const ref = useRef<THREE.InstancedMesh>(null!)
  const m = useMemo(() => new THREE.Matrix4(), [])
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    flies.forEach((f, i) => {
      const a = t * f.sp + f.ph
      const glow = Math.max(0, Math.sin(t * f.blink + f.ph)) ** 2
      const s = 0.2 + glow
      m.makeScale(s, s, s).setPosition(f.x + Math.cos(a) * f.r, G + f.y + Math.sin(a * 1.7) * 0.35, f.z + Math.sin(a * 0.8) * f.r)
      ref.current.setMatrixAt(i, m)
    })
    ref.current.instanceMatrix.needsUpdate = true
  })
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, flies.length]} raycast={() => null}>
      <sphereGeometry args={[0.035, 8, 6]} />
      <meshBasicMaterial color={new THREE.Color('#d9f99d').multiplyScalar(4)} toneMapped={false} />
    </instancedMesh>
  )
}

export function Garden() {
  useFrame(({ clock }) => (windUniform.value = clock.elapsedTime))
  return (
    <group>
      <Island />
      <TallGrass />
      <Flowers />
      {TREES.map((t, i) => <Tree key={i} i={i} {...t} />)}
      <Bush position={[-6.4, G, -2.2]} s={1.2} />
      <Bush position={[-6.6, G, 2.4]} s={1.0} c="#5fae43" />
      <Bush position={[-3.3, G, -6.6]} s={1.15} c="#3f8a32" />
      <Bush position={[5.4, G, -6.6]} s={1.05} />
      <Bush position={[9.4, G, 4.6]} s={0.85} c="#6cbc4c" />
      <Bush position={[2.2, G, 9.3]} s={0.9} />
      <Fence />
      <StonePath />
      <Mailbox />
      <Fireflies />
      <Cloud position={[-14, 7.5, -10]} s={1.5} speed={0.05} />
      <Cloud position={[4, 10, -17]} s={1.8} speed={0.04} />
      <Cloud position={[-18, 4.5, 4]} s={1.3} speed={0.06} />
      <Cloud position={[15, 6, -12]} s={1.2} speed={0.05} />
      <Cloud position={[-8, 12, -20]} s={2.2} speed={0.03} />
    </group>
  )
}
