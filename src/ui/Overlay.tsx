import { useEffect, useState } from 'react'
import { profile } from '../data/profile'
import { PANELS } from '../scene/Panels'
import { COMPACT, FOCUS_META, FOCUS_ORDER, useStore } from '../scene/store'
import { GitHubIcon, LinkedInIcon } from './Icons'

/** Phones: the zoomed object stays visible on top, the content slides up in a sheet. */
function MobileSheet() {
  const focus = useStore((s) => s.focus)
  const arrived = useStore((s) => s.arrived)
  const setFocus = useStore((s) => s.setFocus)
  if (!focus) return null
  const Body = PANELS[focus]
  return (
    <div className="pointer-events-auto fixed inset-x-0 bottom-0 flex max-h-[62svh] flex-col">
      <button onClick={() => setFocus(null)} className="back-btn mx-auto mb-3 !py-2.5">← Volver a la habitación</button>
      {arrived && (
        <div className="sheet-in scroll-thin overflow-y-auto rounded-t-3xl border-t-4 bg-[#fffaf0]" style={{ borderColor: FOCUS_META[focus].color }}>
          <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-slate-300" />
          <div className="p-2"><Body /></div>
        </div>
      )}
    </div>
  )
}

/** Warm, light HUD over the diorama: name card, quick links, zone bar. */
export function Overlay() {
  const entered = useStore((s) => s.entered)
  const focus = useStore((s) => s.focus)
  const hovered = useStore((s) => s.hovered)
  const muted = useStore((s) => s.muted)
  const toggleMute = useStore((s) => s.toggleMute)
  const setFocus = useStore((s) => s.setFocus)
  const setCv = useStore((s) => s.setCv)
  const [hintSeen, setHintSeen] = useState(false)

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      const s = useStore.getState()
      if (e.key === 'Escape' && s.focus && !s.cv) s.setFocus(null)
    }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [])
  useEffect(() => { if (focus) setHintSeen(true) }, [focus])

  if (!entered) return null
  const meta = hovered ? FOCUS_META[hovered] : null

  return (
    <div className="ui-in pointer-events-none fixed inset-0 z-40 flex flex-col justify-between p-3 sm:p-5">
      <header className="flex items-start justify-between gap-3">
        <button onClick={() => setFocus(null)} className="hud-card pointer-events-auto flex items-center gap-3 text-left">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#e2574c] font-display text-[14px] font-bold text-white">YE</span>
          <span>
            <span className="block font-display text-[15px] font-bold leading-tight text-slate-800">{profile.shortName}</span>
            <span className="block text-[11px] font-semibold text-slate-500">Security Architect · GFT</span>
          </span>
        </button>
        <div className="hud-card pointer-events-auto flex items-center gap-1.5 !p-1.5">
          <button onClick={() => setCv(true)} className="chip" title="Versión texto / PDF">CV</button>
          <a className="chip" href={profile.links.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><LinkedInIcon className="h-4 w-4" /></a>
          <a className="chip" href={profile.links.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub"><GitHubIcon className="h-4 w-4" /></a>
          <button onClick={toggleMute} className="chip" aria-label={muted ? 'Activar sonido' : 'Silenciar'} title={muted ? 'Activar sonido' : 'Silenciar'}>
            <span className={`sound-bars ${muted ? 'muted' : ''}`}><i /><i /><i /><i /></span>
          </button>
        </div>
      </header>

      <footer className="flex flex-col items-center gap-2.5">
        {focus && COMPACT ? (
          <MobileSheet />
        ) : (
          <>
            {!focus && (
              <div className={`hud-tip transition-all duration-200 ${meta ? 'opacity-100' : 'translate-y-1 opacity-0'}`}>
                {meta && <><span className="mr-1.5 inline-block h-2.5 w-2.5 rounded-full align-middle" style={{ background: meta.color }} />{meta.label} <span className="text-slate-500">— {meta.hint}</span></>}
              </div>
            )}
            {!hintSeen && !meta && !focus && <div className="hint-pulse rounded-full bg-[#fffaf0]/85 px-3 py-1 text-[12px] font-semibold text-slate-700">Haz clic en los rincones con ◆ · arrastra para girar · saluda a Simba junto al fuego</div>}
            <nav className="hud-card pointer-events-auto flex max-w-full flex-wrap items-center justify-center gap-1 !p-1.5" aria-label="Ir a">
              <button onClick={() => setFocus(null)} className={`zone-btn ${!focus ? 'zone-on' : ''}`} style={{ ['--c' as string]: '#64748b' }}>
                🏠 <span className="hidden sm:inline">Habitación</span>
              </button>
              {FOCUS_ORDER.map((id) => (
                <button
                  key={id}
                  onClick={() => setFocus(id)}
                  onMouseEnter={() => !focus && useStore.getState().setHovered(id)}
                  onMouseLeave={() => !focus && useStore.getState().setHovered(null)}
                  className={`zone-btn ${focus === id ? 'zone-on' : ''}`}
                  style={{ ['--c' as string]: FOCUS_META[id].color }}
                >
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: FOCUS_META[id].color }} />
                  {FOCUS_META[id].label}
                </button>
              ))}
              {focus && <span className="ml-1 hidden pr-2 text-[11px] font-semibold text-slate-400 sm:inline">ESC para salir</span>}
            </nav>
          </>
        )}
      </footer>
    </div>
  )
}
