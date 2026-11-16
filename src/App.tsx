import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { useGame } from './game/store'
import { ZONES } from './game/zones'
import { CVMode } from './ui/CVMode'
import { Encounter } from './ui/Encounter'
import { HUD } from './ui/HUD'
import { Intro } from './ui/Intro'
import { Joystick } from './ui/Joystick'
import { ZoneDialog } from './ui/ZoneDialog'
import { ZoneLabels } from './ui/ZoneLabels'

const World = lazy(() => import('./game/World'))

function supportsWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

function Ready({ onReady }: { onReady: () => void }) {
  useEffect(onReady, [onReady])
  return null
}

export default function App() {
  const env = useMemo(() => ({
    webgl: supportsWebGL(),
    touch: window.matchMedia('(pointer: coarse)').matches,
    mobile: window.matchMedia('(max-width: 768px)').matches || window.matchMedia('(pointer: coarse)').matches,
  }), [])
  const [ready, setReady] = useState(false)
  const started = useGame((s) => s.started)

  // global game keys: E/Enter inspect, Esc close, 1-5 travel
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const s = useGame.getState()
      if (!s.started || s.encounter || s.cv) return
      if (e.key === 'Escape') { if (s.open) s.close(); return }
      if (s.open) return
      if ((e.key === 'e' || e.key === 'E' || e.key === 'Enter') && s.near) { e.preventDefault(); s.openZone(s.near) }
      const n = Number(e.key)
      if (n >= 1 && n <= ZONES.length) s.goTo(ZONES[n - 1].id)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (!env.webgl) return <CVMode standalone />

  return (
    <>
      <div className="no-print fixed inset-0">
        <Suspense fallback={null}>
          <World mobile={env.mobile} />
          <Ready onReady={() => setReady(true)} />
        </Suspense>
      </div>
      <ZoneLabels />
      {started ? (
        <>
          <HUD touch={env.touch} />
          {env.touch && <Joystick />}
        </>
      ) : (
        <Intro touch={env.touch} ready={ready} />
      )}
      <ZoneDialog />
      <Encounter />
      <CVMode />
    </>
  )
}
