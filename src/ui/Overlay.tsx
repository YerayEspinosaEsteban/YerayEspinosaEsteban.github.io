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
      <button onClick={() => setFocus(null)} className="back-btn mx-auto mb-3 !py-2.5">← Volver a vista general</button>
      {arrived && (
        <div className="sheet-in scroll-thin overflow-y-auto rounded-t-2xl border-t border-white/10 bg-[#0b0d14]" style={{ boxShadow: `0 -10px 40px ${FOCUS_META[focus].color}33` }}>
          <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-white/20" />
          <div className="p-2"><Body /></div>
        </div>
      )}
    </div>
  )
}

/** Minimal chrome over the diorama: brand, sound, socials, hover hint and "back" button. */
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
    <div className="ui-in pointer-events-none fixed inset-0 z-40 flex flex-col justify-between p-4 sm:p-6">
      <header className="flex items-start justify-between gap-3">
        <button onClick={() => setFocus(null)} className="pointer-events-auto text-left">
          <div className="font-display text-[15px] font-semibold tracking-tight text-white sm:text-base">YERAY <span className="text-cyan-300">//</span> SEC-ARCH</div>
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-slate-400">Security Architect · GFT</div>
        </button>
        <div className="pointer-events-auto flex items-center gap-2">
          <button onClick={() => setCv(true)} className="chip" title="Versión texto / PDF">CV</button>
          <a className="chip" href={profile.links.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><LinkedInIcon className="h-3.5 w-3.5" /></a>
          <a className="chip" href={profile.links.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub"><GitHubIcon className="h-3.5 w-3.5" /></a>
          <button onClick={toggleMute} className="chip" aria-label={muted ? 'Activar sonido' : 'Silenciar'} title={muted ? 'Activar sonido' : 'Silenciar'}>
            <span className={`sound-bars ${muted ? 'muted' : ''}`}><i /><i /><i /><i /></span>
          </button>
        </div>
      </header>

      <footer className="flex flex-col items-center gap-3">
        {focus && COMPACT ? (
          <MobileSheet />
        ) : focus ? (
          <button onClick={() => setFocus(null)} className="back-btn pointer-events-auto">
            ← Volver a vista general <span className="ml-2 hidden text-slate-400 sm:inline">ESC</span>
          </button>
        ) : (
          <>
            <div className={`h-6 font-mono text-[12px] tracking-wide transition-opacity duration-200 ${meta ? 'opacity-100' : 'opacity-0'}`} style={{ color: meta?.color }}>
              {meta && <>◉ {meta.label} <span className="text-slate-400">— {meta.hint}</span></>}
            </div>
            {!hintSeen && !meta && <div className="hint-pulse -mt-9 font-mono text-[11px] text-slate-400">Haz clic en los objetos iluminados · arrastra para orbitar</div>}
            <nav className="pointer-events-auto flex flex-wrap justify-center gap-1.5" aria-label="Ir a">
              {FOCUS_ORDER.map((id) => (
                <button
                  key={id}
                  onClick={() => setFocus(id)}
                  onMouseEnter={() => useStore.getState().setHovered(id)}
                  onMouseLeave={() => useStore.getState().setHovered(null)}
                  className="nav-dot"
                  style={{ ['--c' as string]: FOCUS_META[id].color }}
                >
                  {FOCUS_META[id].label}
                </button>
              ))}
            </nav>
          </>
        )}
      </footer>
    </div>
  )
}
