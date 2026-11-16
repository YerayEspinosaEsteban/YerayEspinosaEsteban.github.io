import { useEffect } from 'react'
import { profile } from '../data/profile'
import { useGame } from '../game/store'

export function Intro({ touch, ready }: { touch: boolean; ready: boolean }) {
  const start = useGame((s) => s.start)
  const setCv = useGame((s) => s.setCv)

  useEffect(() => {
    if (!ready) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); start() } }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [ready, start])

  return (
    <div className="no-print fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-[#0b0a24]/70 via-[#0b0a24]/35 to-[#0b0a24]/85 p-4">
      <div className="rise w-full max-w-xl text-center">
        <div className="pixel mb-4 text-[9px] tracking-widest text-cyan-300 sm:text-[10px]">— PORTFOLIO · EDICIÓN PLANETA —</div>
        <h1 className="pixel text-[22px] leading-[1.5] text-white drop-shadow-[0_4px_0_#7c3aed] sm:text-[38px]">
          YERAY<br />ESPINOSA
        </h1>
        <p className="mt-4 font-display text-lg font-semibold text-cyan-200 sm:text-xl">{profile.role}</p>
        <p className="mt-1 text-sm text-slate-300">{profile.company} · {profile.location}</p>

        <div className="rpg mx-auto mt-8 max-w-md p-5 text-left" style={{ ['--zc' as string]: '#a78bfa' }}>
          <p className="text-[15px] leading-relaxed text-slate-200">
            Explora un pequeño planeta y descubre <b className="text-white">5 zonas</b>: mi perfil, experiencia, proyectos, formación… y una zona secreta.
          </p>
          <ul className="mt-4 grid grid-cols-2 gap-2 font-mono text-xs text-slate-300">
            {touch ? (
              <>
                <li>🕹 Joystick: moverse</li>
                <li>👆 Toca el suelo: ir ahí</li>
                <li>🅴 Inspeccionar zona</li>
                <li>🗺 Barra inferior: viajar</li>
              </>
            ) : (
              <>
                <li><b className="text-cyan-300">WASD</b> moverse</li>
                <li><b className="text-cyan-300">Shift</b> correr</li>
                <li><b className="text-cyan-300">Espacio</b> saltar</li>
                <li><b className="text-cyan-300">E</b> inspeccionar</li>
                <li><b className="text-cyan-300">Clic</b> ir a un punto</li>
                <li><b className="text-cyan-300">1-5</b> viajar a zona</li>
              </>
            )}
          </ul>
        </div>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={start}
            disabled={!ready}
            className="pixel rounded-xl border-[3px] border-white bg-gradient-to-b from-amber-300 to-amber-500 px-8 py-4 text-[12px] text-slate-900 shadow-[0_6px_0_#92400e] transition hover:-translate-y-0.5 active:translate-y-1 active:shadow-[0_2px_0_#92400e] disabled:opacity-60"
          >
            {ready ? <>▶ PULSA START</> : 'CARGANDO PLANETA…'}
          </button>
          <button onClick={() => setCv(true)} className="hud-btn !h-12 !px-5 !text-[10px]">📄 Ver CV rápido</button>
        </div>
        {ready && !touch && <div className="pixel blink mt-5 text-[9px] text-slate-400">PULSA ENTER</div>}
      </div>
    </div>
  )
}
