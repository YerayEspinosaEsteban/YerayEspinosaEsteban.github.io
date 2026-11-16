import * as THREE from 'three'
import { create } from 'zustand'
import { sfx } from './sfx'
import { zoneById, type ZoneId } from './zones'

type GameState = {
  started: boolean
  near: ZoneId | null
  open: ZoneId | null
  encounter: boolean
  cv: boolean
  muted: boolean
  help: boolean
  visited: ZoneId[]
  start: () => void
  setNear: (z: ZoneId | null) => void
  openZone: (z: ZoneId) => void
  close: () => void
  startEncounter: () => void
  setCv: (v: boolean) => void
  toggleMute: () => void
  setHelp: (v: boolean) => void
  goTo: (z: ZoneId) => void
}

/** Mutable navigation state read every frame by the player controller (no re-renders). */
export const nav = {
  target: null as THREE.Vector3 | null,
  arriveOpen: null as ZoneId | null,
  since: 0,
}

export const useGame = create<GameState>((set, get) => ({
  started: false,
  near: null,
  open: null,
  encounter: false,
  cv: false,
  muted: false,
  help: false,
  visited: [],
  start: () => { set({ started: true }); sfx.start() },
  setNear: (near) => {
    if (near && near !== get().near) sfx.blip(660, 0.08)
    set({ near })
  },
  openZone: (z) => {
    sfx.open()
    nav.target = null
    const v = get().visited
    set({ open: z, visited: v.includes(z) ? v : [...v, z] })
  },
  close: () => set({ open: null, encounter: false }),
  startEncounter: () => { sfx.encounter(); nav.target = null; set({ encounter: true }) },
  setCv: (cv) => set({ cv }),
  toggleMute: () => { const m = !get().muted; sfx.muted = m; set({ muted: m }) },
  setHelp: (help) => set({ help }),
  goTo: (z) => {
    nav.target = zoneById[z].dir.clone()
    nav.arriveOpen = z
    nav.since = performance.now()
    set({ open: null, encounter: false, cv: false })
  },
}))
