import { type ThreeEvent } from '@react-three/fiber'
import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { ANTENNAS, CRYSTALS, FLOWERS, GRASS, PATH_W, pathDist, ROCKS, TREES, type Placed } from './decor'
import { noise3, R, sphereMatrix } from './sphere'
import { nav, useGame } from './store'
import { GRASS_CENTER, GRASS_RADIUS, ZONES } from './zones'

const C = (h: string) => new THREE.Color(h)
const GRASS_COLS = [C('#7bd35f'), C('#6cc455'), C('#8fdc6a'), C('#5fb84f')]
const PATH_COL = C('#ead39c')
const PLAZA_COL = C('#d7dee8')
const TALL_COL = C('#3f9d4a')

function useTerrain() {
  return useMemo(() => {
    const g = new THREE.IcosahedronGeometry(R, 22) // non-indexed: one color per face → flat low-poly look
    const pos = g.getAttribute('position')
    const colors = new Float32Array(pos.count * 3)
    const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), m = new THREE.Vector3()
    const col = new THREE.Color()
    for (let i = 0; i < pos.count; i += 3) {
      a.fromBufferAttribute(pos, i); b.fromBufferAttribute(pos, i + 1); c.fromBufferAttribute(pos, i + 2)
      m.copy(a).add(b).add(c).divideScalar(3).normalize()
      const n = noise3(m.x * 3, m.y * 3, m.z * 3)
      col.copy(GRASS_COLS[THREE.MathUtils.clamp(Math.floor(((n + 1.2) / 2.4) * 4), 0, 3)])
      const pd = pathDist(m)
      if (pd < PATH_W) col.copy(PATH_COL).offsetHSL(0, 0, (Math.sin(i) * 0.03))
      else if (pd < PATH_W * 1.35) col.lerp(PATH_COL, 0.45)
      for (const z of ZONES) {
        const d = m.angleTo(z.dir)
        if (d < z.trigger * 0.85) col.copy(PLAZA_COL).offsetHSL(0, 0, ((i * 7) % 5) * 0.012 - 0.02)
        else if (d < z.trigger) col.lerp(PLAZA_COL, 0.5)
      }
      if (m.angleTo(GRASS_CENTER) < GRASS_RADIUS * 1.05) col.copy(TALL_COL)
      for (let k = 0; k < 3; k++) colors.set([col.r, col.g, col.b], (i + k) * 3)
    }
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    g.computeVertexNormals()
    return g
  }, [])
}

function Instanced({ items, geometry, color, colors, yOffset = 0, sx = 1, sy = 1, emissive, cast = true, metal = 0, rough = 0.85 }: {
  items: Placed[]
  geometry: THREE.BufferGeometry
  color?: string
  colors?: string[]
  yOffset?: number
  sx?: number
  sy?: number
  emissive?: string
  cast?: boolean
  metal?: number
  rough?: number
}) {
  const ref = useRef<THREE.InstancedMesh>(null!)
  useLayoutEffect(() => {
    const m = new THREE.Matrix4()
    const local = new THREE.Matrix4()
    const col = new THREE.Color()
    items.forEach((it, i) => {
      sphereMatrix(it.dir, it.yaw, it.scale, 0, m)
      local.compose(new THREE.Vector3(0, yOffset, 0), new THREE.Quaternion(), new THREE.Vector3(sx, sy, sx))
      ref.current.setMatrixAt(i, m.multiply(local))
      if (colors) ref.current.setColorAt(i, col.set(colors[it.kind % colors.length]))
    })
    ref.current.instanceMatrix.needsUpdate = true
    if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true
  }, [items, yOffset, sx, sy, colors])
  return (
    <instancedMesh ref={ref} args={[geometry, undefined, items.length]} castShadow={cast} receiveShadow>
      <meshStandardMaterial color={colors ? '#ffffff' : color} flatShading emissive={emissive ?? '#000000'} emissiveIntensity={emissive ? 0.9 : 0} metalness={metal} roughness={rough} />
    </instancedMesh>
  )
}

function Decor() {
  const geo = useMemo(() => ({
    trunk: new THREE.CylinderGeometry(0.09, 0.14, 0.8, 5),
    pine: new THREE.ConeGeometry(0.55, 1.4, 6),
    pine2: new THREE.ConeGeometry(0.42, 1.0, 6),
    round: new THREE.IcosahedronGeometry(0.6, 0),
    rock: new THREE.DodecahedronGeometry(0.45, 0),
    crystal: new THREE.OctahedronGeometry(0.35, 0),
    flower: new THREE.IcosahedronGeometry(0.07, 0),
    stem: new THREE.CylinderGeometry(0.012, 0.012, 0.22, 3),
    blade: new THREE.ConeGeometry(0.07, 0.9, 3),
    mast: new THREE.CylinderGeometry(0.05, 0.08, 2.4, 6),
    dish: new THREE.SphereGeometry(0.4, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2.4),
    beacon: new THREE.SphereGeometry(0.09, 8, 6),
  }), [])
  const pines = useMemo(() => TREES.filter((t) => t.kind !== 2), [])
  const rounds = useMemo(() => TREES.filter((t) => t.kind === 2), [])
  return (
    <group>
      <Instanced items={TREES} geometry={geo.trunk} color="#8b5a3c" yOffset={0.4} />
      <Instanced items={pines} geometry={geo.pine} colors={['#2f9e5b', '#3aa86a']} yOffset={1.25} />
      <Instanced items={pines} geometry={geo.pine2} colors={['#45b872', '#52c47c']} yOffset={1.85} />
      <Instanced items={rounds} geometry={geo.round} colors={['#f59e9e', '#7cc95e', '#f6c560']} yOffset={1.15} sy={1.1} />
      <Instanced items={ROCKS} geometry={geo.rock} colors={['#9aa6b8', '#b5bfcc']} yOffset={0.15} sy={0.7} />
      <Instanced items={CRYSTALS} geometry={geo.crystal} colors={['#22d3ee']} yOffset={0.55} sy={1.9} emissive="#0891b2" metal={0.2} rough={0.2} />
      <Instanced items={FLOWERS} geometry={geo.stem} color="#3f8f3a" yOffset={0.11} cast={false} />
      <Instanced items={FLOWERS} geometry={geo.flower} colors={['#ff6b9a', '#ffd166', '#ffffff', '#a78bfa']} yOffset={0.24} cast={false} />
      <Instanced items={GRASS} geometry={geo.blade} colors={['#2f8f3e', '#3ca64b', '#4cb85a']} yOffset={0.45} cast={false} />
      <Instanced items={ANTENNAS} geometry={geo.mast} color="#cbd5e1" yOffset={1.2} metal={0.6} rough={0.4} />
      <Instanced items={ANTENNAS} geometry={geo.dish} color="#e2e8f0" yOffset={2.25} metal={0.5} rough={0.4} />
      <Instanced items={ANTENNAS} geometry={geo.beacon} color="#f43f5e" emissive="#f43f5e" yOffset={2.5} cast={false} />
    </group>
  )
}

export function Planet() {
  const terrain = useTerrain()
  const onClick = (e: ThreeEvent<MouseEvent>) => {
    // ignore drags (camera orbit) and clicks while a dialog is open
    if (e.delta > 6) return
    const s = useGame.getState()
    if (!s.started || s.open || s.encounter) return
    nav.target = e.point.clone().normalize()
    nav.arriveOpen = null
    nav.since = performance.now()
  }
  return (
    <group>
      <mesh geometry={terrain} receiveShadow onClick={onClick}>
        <meshStandardMaterial vertexColors flatShading roughness={0.95} />
      </mesh>
      <Decor />
    </group>
  )
}
