import { profile } from '../data/profile'
import { useGame } from '../game/store'
import { zoneById, ZONES } from '../game/zones'
import { GitHubIcon, LinkedInIcon } from './Icons'

function PlayerCard() {
  const visited = useGame((s) => s.visited.length)
  const pct = (visited / ZONES.length) * 100
  return (
    <div className="rpg pointer-events-auto flex items-center gap-3 px-3 py-2.5 sm:px-4" style={{ ['--zc' as string]: '#22d3ee' }}>
      <div className="relative grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-lg bg-gradient-to-b from-sky-300 to-indigo-500">
        <svg viewBox="0 0 32 32" className="h-10 w-10" shapeRendering="crispEdges" aria-hidden="true">
          <rect x="8" y="5" width="16" height="15" fill="#f2c38f" /><rect x="7" y="3" width="18" height="6" fill="#3b2416" />
          <rect x="8" y="11" width="16" height="3" fill="#22d3ee" /><rect x="6" y="21" width="20" height="11" fill="#2d3e78" />
          <rect x="14" y="21" width="1" height="11" fill="#cbd5e1" /><rect x="13" y="17" width="6" height="1" fill="#7c2d12" />
        </svg>
      </div>
      <div className="min-w-0">
        <div className="pixel truncate text-[8px] text-cyan-300 sm:text-[9px]">NV. 20 <span className="text-slate-500">|</span> <span className="text-white">YERAY ESPINOSA</span></div>
        <div className="pixel mt-1 truncate text-[7px] text-slate-300 sm:text-[8px]">SECURITY ARCHITECT</div>
        <div className="mt-1.5 flex items-center gap-2">
          <span className="pixel text-[7px] text-amber-300">XP</span>
          <div className="h-2 w-24 overflow-hidden rounded-full border border-slate-500 bg-slate-800 sm:w-32">
            <div className="h-full bg-gradient-to-r from-amber-300 to-emerald-400 transition-all duration-700" style={{ width: `${pct}%` }} />
          </div>
          <span className="pixel text-[7px] text-slate-400">{visited}/{ZONES.length}</span>
        </div>
      </div>
    </div>
  )
}

function ZoneBar() {
  const goTo = useGame((s) => s.goTo)
  const visited = useGame((s) => s.visited)
  const near = useGame((s) => s.near)
  return (
    <nav aria-label="Viajar a zona" className="rpg pointer-events-auto mx-auto flex max-w-full gap-1 overflow-x-auto p-1.5 sm:gap-1.5" style={{ ['--zc' as string]: '#fbbf24' }}>
      {ZONES.map((z, i) => {
        const seen = visited.includes(z.id)
        const label = z.id === 'secret' && !seen ? '???' : z.short
        return (
          <button
            key={z.id}
            onClick={() => goTo(z.id)}
            className={`group flex shrink-0 items-center gap-1.5 rounded-lg border-2 px-2.5 py-2 transition hover:-translate-y-0.5 sm:px-3 ${near === z.id ? 'bg-white/15' : 'bg-transparent'}`}
            style={{ borderColor: near === z.id ? z.color : 'transparent' }}
            title={`Ir a ${z.name}`}
          >
            <span className="grid h-6 w-6 place-items-center rounded-md text-xs font-bold text-slate-900" style={{ background: z.color }}>{z.icon}</span>
            <span className="pixel hidden text-[8px] text-white sm:inline">{i + 1}·{label}</span>
            {seen && <span className="text-[10px] text-emerald-300">✓</span>}
          </button>
        )
      })}
    </nav>
  )
}

function Prompt() {
  const near = useGame((s) => s.near)
  const open = useGame((s) => s.open)
  const openZone = useGame((s) => s.openZone)
  if (!near || open) return null
  const z = zoneById[near]
  return (
    <button
      onClick={() => openZone(near)}
      className="rpg rise pointer-events-auto mx-auto flex items-center gap-3 px-4 py-2.5"
      style={{ ['--zc' as string]: z.color }}
    >
      <kbd className="pixel grid h-7 w-7 place-items-center rounded-md bg-white text-[10px] text-slate-900">E</kbd>
      <span className="pixel text-left text-[9px] leading-5 text-white sm:text-[10px]">
        Inspeccionar <span style={{ color: z.color }}>{z.id === 'secret' ? 'el Holocrón' : z.name}</span>
      </span>
    </button>
  )
}

function Controls() {
  const help = useGame((s) => s.help)
  const setHelp = useGame((s) => s.setHelp)
  if (!help) return null
  return (
    <div className="rpg rise pointer-events-auto absolute bottom-full left-0 mb-4 w-72 p-4 text-sm" style={{ ['--zc' as string]: '#a78bfa' }}>
      <div className="pixel mb-3 flex justify-between text-[9px] text-violet-300">CONTROLES <button onClick={() => setHelp(false)} aria-label="Cerrar">✕</button></div>
      <ul className="grid gap-1.5 text-slate-200">
        <li><b className="font-mono text-cyan-300">WASD / ↑←↓→</b> moverse</li>
        <li><b className="font-mono text-cyan-300">Shift</b> correr · <b className="font-mono text-cyan-300">Espacio</b> saltar</li>
        <li><b className="font-mono text-cyan-300">E / Enter</b> inspeccionar</li>
        <li><b className="font-mono text-cyan-300">Clic</b> en el suelo: ir ahí</li>
        <li><b className="font-mono text-cyan-300">Arrastrar</b>: girar cámara</li>
        <li><b className="font-mono text-cyan-300">1-5</b>: viajar a cada zona</li>
      </ul>
    </div>
  )
}

export function HUD({ touch }: { touch: boolean }) {
  const muted = useGame((s) => s.muted)
  const toggleMute = useGame((s) => s.toggleMute)
  const setCv = useGame((s) => s.setCv)
  const help = useGame((s) => s.help)
  const setHelp = useGame((s) => s.setHelp)
  return (
    <div className="no-print pointer-events-none fixed inset-0 z-30 flex flex-col justify-between p-3 sm:p-4">
      <div className="flex items-start justify-between gap-2">
        <PlayerCard />
        <div className="pointer-events-auto flex flex-wrap justify-end gap-2">
          <button className="hud-btn" onClick={() => setCv(true)} title="Ver CV rápido / PDF">📄<span className="hidden md:inline">CV</span></button>
          <a className="hud-btn" href={profile.links.linkedin} target="_blank" rel="noopener noreferrer" title="LinkedIn" aria-label="LinkedIn"><LinkedInIcon /></a>
          <a className="hud-btn" href={profile.links.github} target="_blank" rel="noopener noreferrer" title="GitHub" aria-label="GitHub"><GitHubIcon /></a>
          <button className="hud-btn" onClick={toggleMute} title={muted ? 'Activar sonido' : 'Silenciar'} aria-label={muted ? 'Activar sonido' : 'Silenciar'}>{muted ? '🔇' : '🔊'}</button>
        </div>
      </div>
      <div className={`flex flex-col items-center gap-3 ${touch ? 'pb-1' : ''}`}>
        <Prompt />
        <div className="relative flex w-full items-end justify-center gap-2">
          {!touch && (
            <div className="pointer-events-auto absolute bottom-0 left-0 hidden lg:block">
              <Controls />
              <button className="hud-btn" onClick={() => setHelp(!help)} aria-expanded={help}>⌨ Controles</button>
            </div>
          )}
          <ZoneBar />
        </div>
      </div>
    </div>
  )
}
