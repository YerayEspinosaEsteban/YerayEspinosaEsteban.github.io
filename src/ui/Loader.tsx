import { useProgress } from '@react-three/drei'
import { useEffect, useState } from 'react'
import { sfx } from '../scene/sfx'
import { useStore } from '../scene/store'

/** Minimal dark preloader: shield icon, % counter, then ENTRAR. */
export function Loader({ sceneReady }: { sceneReady: boolean }) {
  const { progress, active } = useProgress()
  const entered = useStore((s) => s.entered)
  const enter = useStore((s) => s.enter)
  const [shown, setShown] = useState(0)
  const [gone, setGone] = useState(false)

  // smooth counter that never runs ahead of the real loading state
  useEffect(() => {
    const goal = sceneReady && !active ? 100 : Math.min(92, Math.max(progress, 30))
    const id = setInterval(() => setShown((v) => (v >= goal ? v : Math.min(goal, v + 2))), 24)
    return () => clearInterval(id)
  }, [progress, active, sceneReady])

  const ready = shown >= 100
  const go = () => {
    if (!ready) return
    sfx.enter()
    enter()
    setTimeout(() => setGone(true), 900)
  }

  useEffect(() => {
    if (!ready || entered) return
    const k = (e: KeyboardEvent) => { if (e.key === 'Enter') go() }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  })

  if (gone) return null
  return (
    <div className={`fixed inset-0 z-50 grid place-items-center bg-[#0b0d14] transition-opacity duration-700 ${entered ? 'pointer-events-none opacity-0' : 'opacity-100'}`}>
      <div className="flex w-[min(360px,86vw)] flex-col items-center text-center">
        <svg viewBox="0 0 64 72" className="loader-shield h-20 w-20" aria-hidden="true">
          <path d="M32 3 59 13v20c0 18-11.5 31-27 36C16.5 64 5 51 5 33V13Z" fill="none" stroke="#22d3ee" strokeWidth="3" />
          <path d="M32 3 59 13v20c0 18-11.5 31-27 36C16.5 64 5 51 5 33V13Z" fill="#22d3ee" style={{ clipPath: `inset(${100 - shown}% 0 0 0)` }} opacity="0.18" />
          <rect x="24" y="32" width="16" height="14" rx="2" fill="none" stroke="#f472b6" strokeWidth="3" />
          <path d="M27 32v-5a5 5 0 0 1 10 0v5" fill="none" stroke="#f472b6" strokeWidth="3" />
        </svg>
        <div className="mt-6 font-display text-xl font-semibold tracking-tight text-white">Yeray Espinosa Esteban</div>
        <div className="mt-1 font-mono text-[11px] uppercase tracking-[0.3em] text-cyan-300/80">Security Architect</div>
        <div className="mt-8 w-full">
          <div className="flex justify-between font-mono text-[11px] text-slate-400">
            <span>Inicializando arquitectura 3D…</span>
            <span className="text-white">{shown}%</span>
          </div>
          <div className="mt-2 h-[3px] w-full overflow-hidden rounded bg-white/10">
            <div className="h-full bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 transition-[width] duration-100" style={{ width: `${shown}%` }} />
          </div>
        </div>
        <button
          onClick={go}
          disabled={!ready}
          className={`mt-9 rounded-full border px-10 py-3 font-mono text-sm tracking-[0.35em] transition-all duration-500 ${ready ? 'border-cyan-300 text-white hover:bg-cyan-300 hover:text-[#0b0d14] hover:shadow-[0_0_30px_#22d3ee]' : 'border-white/10 text-white/20'}`}
        >
          ENTRAR
        </button>
        <p className="mt-5 font-mono text-[10px] text-slate-500">Mejor con sonido · puedes activarlo dentro</p>
      </div>
    </div>
  )
}
