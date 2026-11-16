import type * as THREE from 'three'
import { create } from 'zustand'
import { projects } from '../data/profile'
import { sfx } from './sfx'

export type FocusId = 'about' | 'projects' | 'experience' | 'certs'

/** Narrow screens: panels go to a bottom sheet instead of being glued in 3D (tiny text otherwise). */
export const COMPACT = typeof window !== 'undefined' && window.matchMedia('(max-width: 700px)').matches

export const FOCUS_META: Record<FocusId, { label: string; hint: string; color: string }> = {
  about: { label: 'Sobre mí', hint: 'Setup multi-monitor', color: '#22d3ee' },
  projects: { label: 'Proyectos', hint: 'Máquina arcade', color: '#f472b6' },
  experience: { label: 'Experiencia & Stack', hint: 'Rack y escudo holográfico', color: '#a78bfa' },
  certs: { label: 'Logros', hint: 'Estantería de coleccionista', color: '#fbbf24' },
}
export const FOCUS_ORDER: FocusId[] = ['about', 'projects', 'experience', 'certs']

/**
 * Camera anchors: each interactive object registers an Object3D placed at the centre of its
 * screen/panel, with local +Z pointing out of the surface. The camera rig flies in front of it.
 */
export const anchors: Partial<Record<FocusId, { obj: THREE.Object3D; width: number; height: number }>> = {}

type State = {
  entered: boolean
  focus: FocusId | null
  /** true once the camera finished flying to the focused object (panels fade in then) */
  arrived: boolean
  hovered: FocusId | null
  muted: boolean
  project: number
  cv: boolean
  enter: () => void
  setFocus: (f: FocusId | null) => void
  setArrived: (v: boolean) => void
  setHovered: (f: FocusId | null) => void
  toggleMute: () => void
  nextProject: (d: number) => void
  setProject: (i: number) => void
  setCv: (v: boolean) => void
}

export const useStore = create<State>((set, get) => ({
  entered: false,
  focus: null,
  arrived: false,
  hovered: null,
  muted: true,
  project: 0,
  cv: false,
  enter: () => set({ entered: true }),
  setFocus: (focus) => {
    if (focus === get().focus) return
    sfx.whoosh()
    set({ focus, arrived: false, hovered: null })
  },
  setArrived: (arrived) => set({ arrived }),
  setHovered: (hovered) => {
    if (hovered && hovered !== get().hovered) sfx.tick()
    set({ hovered })
  },
  toggleMute: () => {
    const muted = !get().muted
    sfx.setMuted(muted)
    set({ muted })
  },
  nextProject: (d) => {
    sfx.bloop()
    set({ project: (get().project + d + projects.length) % projects.length })
  },
  setProject: (project) => { sfx.bloop(); set({ project }) },
  setCv: (cv) => set({ cv }),
}))
