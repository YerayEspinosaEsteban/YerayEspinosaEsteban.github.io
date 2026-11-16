import { MotionConfig } from 'framer-motion'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { About } from './components/About'
import { Contact } from './components/Contact'
import { Experience } from './components/Experience'
import { Hero } from './components/Hero'
import { Nav } from './components/Nav'
import { Pokedex } from './components/Pokedex'
import { Projects } from './components/Projects'
import { Stack } from './components/Stack'
import { Terminal } from './components/Terminal'
import type { Palette } from './three/HeroScene'

const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']

function supportsWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

function useEnv() {
  return useMemo(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const small = window.matchMedia('(max-width: 768px)').matches
    const weak = (navigator.hardwareConcurrency ?? 8) <= 4
    return { use3D: !reduced && supportsWebGL(), lite: small || weak }
  }, [])
}

export default function App() {
  const { use3D, lite } = useEnv()
  const [holocron, setHolocron] = useState(false)
  const [dex, setDex] = useState(false)
  const toggleHolocron = useCallback(() => setHolocron((h) => !h), [])
  const openDex = useCallback(() => setDex(true), [])
  const closeDex = useCallback(() => setDex(false), [])

  useEffect(() => {
    document.documentElement.dataset.mode = holocron ? 'holocron' : 'default'
  }, [holocron])

  // ↑↑↓↓←→←→BA unlocks the Holocron protocol
  useEffect(() => {
    let i = 0
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return
      i = e.key === KONAMI[i] ? i + 1 : e.key === KONAMI[0] ? 1 : 0
      if (i === KONAMI.length) { i = 0; toggleHolocron() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [toggleHolocron])

  const palette: Palette = holocron
    ? { a: '#ff3b3b', b: '#ffb347', c: '#ffd27a' }
    : { a: '#22e6ff', b: '#a15bff', c: '#3dff9a' }

  return (
    <MotionConfig reducedMotion="user">
      <a href="#perfil" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded focus:bg-neon focus:px-3 focus:py-2 focus:text-bg">
        Saltar al contenido
      </a>
      <Nav holocron={holocron} onToggle={toggleHolocron} />
      <Hero palette={palette} use3D={use3D} lite={lite} onPokeball={openDex} />
      <main className="relative">
        <div className="grid-bg pointer-events-none absolute inset-0 opacity-25" />
        <About />
        <Stack holocron={holocron} />
        <Experience />
        <Projects holocron={holocron} />
        <Terminal onScan={openDex} onHolocron={toggleHolocron} holocron={holocron} />
        <Contact />
      </main>
      <Pokedex open={dex} onClose={closeDex} />
    </MotionConfig>
  )
}
