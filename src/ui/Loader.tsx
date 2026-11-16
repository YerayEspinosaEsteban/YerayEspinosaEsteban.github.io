import { useProgress } from '@react-three/drei'
import { useEffect, useState } from 'react'
import { sfx } from '../scene/sfx'
import { useStore } from '../scene/store'

/** Warm daylight preloader: sprouting shield, % counter, then ENTRAR. */
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
    <div className={`fixed inset-0 z-50 grid place-items-center bg-gradient-to-b from-[#070b1c] via-[#0f172a] to-[#3b2459] transition-opacity duration-700 ${entered ? 'pointer-events-none opacity-0' : 'opacity-100'}`}>
      <div className="flex w-[min(360px,86vw)] flex-col items-center rounded-3xl bg-[#fffaf0]/90 px-8 py-9 text-center shadow-[0_0_80px_rgba(255,123,41,0.25)]">
        <svg viewBox="0 0 64 72" className="loader-shield h-20 w-20" aria-hidden="true">
          <path d="M32 3 59 13v20c0 18-11.5 31-27 36C16.5 64 5 51 5 33V13Z" fill="#fff" stroke="#22a35a" strokeWidth="3" />
          <path d="M32 3 59 13v20c0 18-11.5 31-27 36C16.5 64 5 51 5 33V13Z" fill="#8fd16a" style={{ clipPath: `inset(${100 - shown}% 0 0 0)` }} opacity="0.55" />
          <path d="M32 50V30" stroke="#3f8a32" strokeWidth="3" strokeLinecap="round" />
          <path d="M32 34c-8 0-12-5-12-11 7 0 12 4 12 11Zm0 0c8 0 12-5 12-11-7 0-12 4-12 11Z" fill="#5fae43" />
        </svg>
        <div className="mt-5 font-display text-xl font-bold tracking-tight text-slate-800">Yeray Espinosa Esteban</div>
        <div className="mt-1 text-[12px] font-semibold uppercase tracking-[0.25em] text-[#e2574c]">Security Architect</div>
        <div className="mt-7 w-full">
          <div className="flex justify-between text-[12px] font-semibold text-slate-500">
            <span>Encendiendo la hoguera…</span>
            <span className="text-slate-800">{shown}%</span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-gradient-to-r from-[#22a35a] via-[#f59e0b] to-[#e2574c] transition-[width] duration-100" style={{ width: `${shown}%` }} />
          </div>
        </div>
        <button
          onClick={go}
          disabled={!ready}
          className={`mt-8 rounded-full px-10 py-3 font-display text-[15px] font-bold tracking-[0.2em] transition-all duration-500 ${ready ? 'bg-[#e2574c] text-white shadow-[0_6px_0_#b23a31] hover:-translate-y-0.5 hover:shadow-[0_8px_0_#b23a31] active:translate-y-1 active:shadow-[0_2px_0_#b23a31]' : 'bg-slate-200 text-slate-400'}`}
        >
          ENTRAR
        </button>
        <p className="mt-5 text-[11px] text-slate-500">Mejor con sonido · puedes activarlo dentro</p>
      </div>
    </div>
  )
}
