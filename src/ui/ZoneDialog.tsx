import { useEffect, useRef, type ReactNode } from 'react'
import { accentHex, certifications, education, experience, profile, projects, stack } from '../data/profile'
import { useGame } from '../game/store'
import { zoneById, ZONES, type ZoneId } from '../game/zones'
import { GitHubIcon, LinkedInIcon } from './Icons'
import { Typewriter } from './Typewriter'

const NPC: Record<ZoneId, string> = {
  base: '¡Hola, viajero! Has llegado a la Base Central. Aquí empieza todo: soy Yeray y diseño sistemas que son seguros desde el primer diagrama.',
  fortress: 'Bienvenido a la Fortaleza. Cada escudo que orbita es una capa de defensa. Aquí guardo mi trayectoria y mi equipamiento.',
  hangar: 'Este es el Hangar. Cada holograma es un proyecto que he construido de principio a fin. ¡Echa un vistazo!',
  gym: '¡Has entrado en el Gimnasio-Templo! Aquí se exhiben las medallas que he ganado entrenando… y estudiando.',
  secret: 'Has encontrado el Holocrón… Dicen que entre la hierba alta acechan fallos de seguridad salvajes.',
}

function Chip({ children, color }: { children: ReactNode; color: string }) {
  return (
    <span className="inline-block rounded-md border px-2 py-1 font-mono text-xs text-slate-100" style={{ borderColor: `${color}88`, background: `${color}1f` }}>
      {children}
    </span>
  )
}

function BaseContent() {
  const setCv = useGame((s) => s.setCv)
  const goTo = useGame((s) => s.goTo)
  return (
    <div className="grid gap-5">
      <div>
        <div className="pixel text-[10px] text-cyan-300">JUGADOR · NV. 20</div>
        <h3 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">{profile.name}</h3>
        <div className="mt-1 font-mono text-sm text-cyan-200">{profile.role} @ {profile.company}</div>
        <div className="mt-1 text-sm text-slate-400">📍 {profile.location}</div>
      </div>
      <p className="text-[15px] leading-relaxed text-slate-200">{profile.bio}</p>
      <div className="flex flex-wrap gap-2">
        {profile.headline.split('|').map((h) => <Chip key={h} color="#22d3ee">{h.trim()}</Chip>)}
      </div>
      <div className="flex flex-wrap gap-3">
        <a href={profile.links.linkedin} target="_blank" rel="noopener noreferrer" className="hud-btn !h-11 !bg-[#0a66c2] !px-4 !text-[10px]"><LinkedInIcon /> LinkedIn</a>
        <a href={profile.links.github} target="_blank" rel="noopener noreferrer" className="hud-btn !h-11 !px-4 !text-[10px]"><GitHubIcon /> GitHub</a>
        <button onClick={() => setCv(true)} className="hud-btn !h-11 !border-amber-300 !px-4 !text-[10px] !text-amber-200">📄 Ver CV / PDF</button>
      </div>
      <div>
        <div className="pixel mb-2 text-[9px] text-slate-400">MAPA DEL PLANETA</div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {ZONES.filter((z) => z.id !== 'base' && z.id !== 'secret').map((z) => (
            <button key={z.id} onClick={() => goTo(z.id)} className="rounded-lg border-2 px-3 py-2 text-left text-sm text-white transition hover:-translate-y-0.5" style={{ borderColor: z.color, background: `${z.color}18` }}>
              <span className="mr-1">{z.icon}</span>{z.short} →
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function FortressContent() {
  return (
    <div className="grid gap-6">
      <section>
        <div className="pixel mb-3 text-[10px] text-violet-300">▸ REGISTRO DE MISIONES</div>
        <ol className="grid gap-3">
          {experience.map((e) => (
            <li key={e.role + e.period} className="rounded-xl border border-slate-600/70 bg-slate-800/60 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-xs text-violet-300">{e.period}</span>
                <span className="flex gap-2 text-[11px]">
                  {e.current && <span className="rounded bg-emerald-500/20 px-2 py-0.5 font-semibold text-emerald-300">● ACTUAL</span>}
                  <span className="rounded border border-slate-600 px-2 py-0.5 text-slate-300">{e.type}</span>
                </span>
              </div>
              <div className="mt-1.5 font-display text-lg font-semibold text-white">{e.role}</div>
              <div className="text-sm text-violet-200">@ {e.company}</div>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">{e.description}</p>
            </li>
          ))}
        </ol>
      </section>
      <section>
        <div className="pixel mb-3 text-[10px] text-violet-300">▸ EQUIPAMIENTO</div>
        <div className="grid gap-3 sm:grid-cols-2">
          {stack.map((s) => (
            <div key={s.id} className="rounded-xl border-2 p-3" style={{ borderColor: `${accentHex[s.accent]}66`, background: `${accentHex[s.accent]}10` }}>
              <div className="flex items-center justify-between">
                <span className="font-display font-semibold text-white">{s.title}</span>
                <span className="pixel text-[8px]" style={{ color: accentHex[s.accent] }}>{s.code}</span>
              </div>
              <p className="mt-1 text-xs text-slate-400">{s.summary}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {s.items.map((i) => <Chip key={i} color={accentHex[s.accent]}>{i}</Chip>)}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

const PROJECT_ICON: Record<string, string> = { mars: '🚀', car: '🚗', unnion: '🤝', labs: '🛡️' }

function HangarContent() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {projects.map((p) => (
        <article key={p.id} className="rounded-xl border-2 p-4" style={{ borderColor: `${accentHex[p.accent]}77`, background: `${accentHex[p.accent]}10` }}>
          <div className="flex items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg text-2xl" style={{ background: `${accentHex[p.accent]}25` }}>{PROJECT_ICON[p.id]}</span>
            <div>
              <div className="pixel text-[8px]" style={{ color: accentHex[p.accent] }}>{p.tag}</div>
              <h3 className="mt-1 font-display text-xl font-bold text-white">{p.title}</h3>
            </div>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">{p.description}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {p.stack.map((s) => <Chip key={s} color={accentHex[p.accent]}>{s}</Chip>)}
          </div>
        </article>
      ))}
    </div>
  )
}

const MEDAL_COLORS = ['#fbbf24', '#e5e7eb', '#22d3ee', '#a78bfa', '#4ade80']

function Medal({ color, label }: { color: string; label: string }) {
  return (
    <div className="relative grid h-14 w-14 shrink-0 place-items-center">
      <div className="absolute inset-0 rotate-45 rounded-lg border-[3px] border-white/80" style={{ background: `linear-gradient(135deg, ${color}, ${color}88)`, boxShadow: `0 0 18px ${color}88` }} />
      <span className="pixel relative text-[8px] text-slate-900">{label}</span>
    </div>
  )
}

function GymContent() {
  const medals = [
    ...education.map((e, i) => ({ title: e.title, sub: `${e.school}${e.detail ? ' · ' + e.detail : ''}`, label: i === 0 ? 'DAM' : 'SMR' })),
    ...certifications.map((c) => ({ title: c.title, sub: [c.issuer, c.year].filter(Boolean).join(' · '), label: c.badge })),
  ]
  return (
    <div>
      <div className="pixel mb-4 text-[10px] text-rose-300">▸ ESTUCHE DE MEDALLAS · {medals.length}/{medals.length}</div>
      <ul className="grid gap-3">
        {medals.map((m, i) => (
          <li key={m.title} className="flex items-center gap-4 rounded-xl border border-slate-600/70 bg-slate-800/60 p-3 pl-4">
            <Medal color={MEDAL_COLORS[i % MEDAL_COLORS.length]} label={m.label} />
            <div>
              <div className="font-display font-semibold text-white">{m.title}</div>
              <div className="text-sm text-slate-400">{m.sub}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export const FUN_FACTS = [
  'Está en el Top 3% mundial de TryHackMe, con más de 134 salas técnicas completadas.',
  'Participó en el NASA Space Apps Challenge 2026 en Zaragoza con «60 Seconds to Mars», un juego con Three.js y Gemini API.',
  'Se graduó en DAM con Mención Honorífica en el Centro San Valero.',
  'Empezó montando redes en SMR… y ahora diseña arquitecturas multicloud Security-by-Design.',
  'Su TFG, Unnion, es una plataforma de voluntariado full-stack con React Native, NestJS, AWS y MongoDB.',
  'Car Conquest identifica coches con IA y estima su valor de mercado en tiempo real.',
]

function SecretContent() {
  const startEncounter = useGame((s) => s.startEncounter)
  return (
    <div className="grid gap-5">
      <blockquote className="rounded-xl border-2 border-amber-400/60 bg-amber-500/10 p-4 font-display text-lg italic text-amber-100">
        «Confía en la Fuerza… pero verifica cada token.»
        <div className="mt-1 text-right font-mono text-xs not-italic text-amber-300/80">— Holocron Security Protocol</div>
      </blockquote>
      <div>
        <div className="pixel mb-3 text-[10px] text-emerald-300">▸ DATOS DEL HOLOCRÓN</div>
        <ul className="grid gap-2">
          {FUN_FACTS.map((f) => (
            <li key={f} className="flex gap-2 text-sm leading-relaxed text-slate-200"><span className="text-emerald-400">✦</span>{f}</li>
          ))}
        </ul>
      </div>
      <button onClick={startEncounter} className="hud-btn !h-12 !w-full !border-emerald-400 !text-[10px] !text-emerald-200">🌿 Buscar en la hierba alta</button>
    </div>
  )
}

const CONTENT: Record<ZoneId, () => ReactNode> = {
  base: BaseContent,
  fortress: FortressContent,
  hangar: HangarContent,
  gym: GymContent,
  secret: SecretContent,
}

export function ZoneDialog() {
  const open = useGame((s) => s.open)
  const close = useGame((s) => s.close)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => { if (open) ref.current?.focus() }, [open])
  if (!open) return null
  const z = zoneById[open]
  const Body = CONTENT[open]
  return (
    <div className="no-print fixed inset-0 z-40 flex items-end justify-center bg-slate-950/45 p-3 sm:items-center sm:p-6" onClick={close}>
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={z.name}
        onClick={(e) => e.stopPropagation()}
        className="rpg rise flex max-h-[88svh] w-full max-w-3xl flex-col overflow-hidden outline-none"
        style={{ ['--zc' as string]: z.color }}
      >
        <header className="flex items-center gap-3 border-b-2 border-slate-700 px-4 py-3 sm:px-6" style={{ background: `linear-gradient(90deg, ${z.color}33, transparent)` }}>
          <span className="grid h-9 w-9 place-items-center rounded-lg text-lg" style={{ background: z.color, color: '#0f172a' }}>{z.icon}</span>
          <h2 className="pixel flex-1 text-[11px] text-white sm:text-[13px]">{z.name.toUpperCase()}</h2>
          <button onClick={close} className="hud-btn !h-9 !min-w-9 !px-2" aria-label="Cerrar">✕</button>
        </header>
        <div className="scroll-thin overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
          <Typewriter key={open} text={NPC[open]} className="mb-5 rounded-lg border-l-4 bg-slate-800/70 px-4 py-3 font-mono text-sm leading-relaxed text-slate-100" />
          <Body />
        </div>
        <footer className="pixel border-t-2 border-slate-700 px-4 py-2 text-right text-[8px] text-slate-400 sm:px-6">[ESC] CERRAR</footer>
      </div>
    </div>
  )
}
