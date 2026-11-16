import { Html } from '@react-three/drei'
import { useState, type ReactNode } from 'react'
import { certifications, education, experience, profile, projects, stack } from '../data/profile'
import { GitHubIcon, LinkedInIcon } from '../ui/Icons'
import { COMPACT, SIMBA_LINE, useStore, type FocusId } from './store'

/**
 * DOM content glued onto a 3D surface with <Html transform>.
 * drei maps 40 CSS px to 1 world unit, so we scale to make `px` wide content span `width` units.
 * Mounted only once the camera has arrived, so it never floats over the overview.
 */
export function ScreenPanel({ id, width, height, px, children }: { id: FocusId; width: number; height: number; px: number; children: ReactNode }) {
  const show = useStore((s) => s.focus === id && s.arrived)
  // on phones the same content is shown in a readable bottom sheet instead (ui/Overlay)
  if (!show || COMPACT) return null
  const pxH = Math.round((px * height) / width)
  return (
    <Html transform scale={width / (px / 40)} position={[0, 0, 0.006]} zIndexRange={[30, 0]}>
      <div className="panel-in overflow-hidden" style={{ width: px, height: pxH }} onPointerDown={(e) => e.stopPropagation()}>
        {children}
      </div>
    </Html>
  )
}

/** Per-project cartridge colour (also used by the TV attract screen). */
const CART = ['#e2574c', '#3b82f6', '#8b5cf6', '#22a35a']
const LAYER = ['#3b82f6', '#8b5cf6', '#22a35a', '#f59e0b']

const STATS = [
  ['Top 3%', 'TryHackMe mundial'],
  ['+134', 'salas técnicas'],
  ['DAM', 'Mención Honorífica'],
  ['NASA', 'Space Apps 2026'],
]

/* ───────── 1 · desk monitor: trainer card ───────── */
export function AboutScreen() {
  const setCv = useStore((s) => s.setCv)
  return (
    <div className="@container flex h-full flex-col bg-[#fffaf0] font-sans text-slate-800">
      <div className="flex items-center gap-3 bg-[#e2574c] px-6 py-3 text-white">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-white/25 text-[15px]">★</span>
        <span className="font-display text-[17px] font-bold tracking-wide">FICHA DE ENTRENADOR</span>
        <span className="ml-auto rounded-full bg-white/20 px-3 py-0.5 font-mono text-[12px]">ID 2026·ZGZ</span>
      </div>
      <div className="grid flex-1 grid-cols-1 gap-5 p-6 @3xl:grid-cols-[1fr_1.25fr] @3xl:gap-8 @3xl:p-7">
        <div className="flex flex-col">
          <div className="flex items-center gap-4">
            <div className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl border-4 border-white bg-gradient-to-br from-sky-200 to-blue-400 font-display text-[30px] font-bold text-white shadow-md">YE</div>
            <div>
              <h1 className="font-display text-[30px] font-bold leading-[1.05] text-slate-900 @3xl:text-[36px]">Yeray<br />Espinosa Esteban</h1>
            </div>
          </div>
          <dl className="mt-5 grid gap-1.5 text-[15px]">
            <div className="flex gap-2"><dt className="w-20 shrink-0 font-semibold text-slate-500">Rol</dt><dd>{profile.role}</dd></div>
            <div className="flex gap-2"><dt className="w-20 shrink-0 font-semibold text-slate-500">Equipo</dt><dd>{profile.company}</dd></div>
            <div className="flex gap-2"><dt className="w-20 shrink-0 font-semibold text-slate-500">Base</dt><dd>{profile.location}</dd></div>
          </dl>
          <div className="mt-5 flex flex-wrap gap-2.5 @3xl:mt-auto">
            <a href={profile.links.linkedin} target="_blank" rel="noopener noreferrer" className="btn-cozy !bg-[#0a66c2] !text-white"><LinkedInIcon className="h-4 w-4" /> LinkedIn</a>
            <a href={profile.links.github} target="_blank" rel="noopener noreferrer" className="btn-cozy !bg-slate-800 !text-white"><GitHubIcon className="h-4 w-4" /> GitHub</a>
            <button onClick={() => setCv(true)} className="btn-cozy">📄 CV / PDF</button>
          </div>
        </div>
        <div className="flex flex-col">
          <p className="text-[15.5px] leading-relaxed text-slate-700">{profile.bio}</p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {profile.headline.split('|').map((h, i) => (
              <span key={h} className="rounded-full px-3 py-1 text-[12.5px] font-semibold text-white" style={{ background: LAYER[i % LAYER.length] }}>{h.trim()}</span>
            ))}
          </div>
          <div className="mt-5 grid grid-cols-2 gap-2 @xl:grid-cols-4 @3xl:mt-auto">
            {STATS.map(([v, l]) => (
              <div key={l} className="rounded-xl border-2 border-amber-200 bg-amber-50 px-2 py-2.5 text-center">
                <div className="font-display text-[20px] font-bold text-slate-900">{v}</div>
                <div className="text-[10.5px] font-semibold uppercase tracking-wide text-amber-700">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ───────── 2 · CRT television: cartridge select ───────── */
export function ProjectsScreen() {
  const i = useStore((s) => s.project)
  const next = useStore((s) => s.nextProject)
  const setProject = useStore((s) => s.setProject)
  const p = projects[i]
  const c = CART[i % CART.length]
  return (
    <div className="@container crt relative flex h-full flex-col bg-gradient-to-b from-[#2b3a8f] to-[#4c2a85] px-6 pb-5 pt-5 text-white">
      <div className="pixel flex items-center justify-between text-[11px]">
        <span className="text-yellow-300">ELIGE UN CARTUCHO</span>
        <span className="text-white/70">{String(i + 1).padStart(2, '0')}/{String(projects.length).padStart(2, '0')}</span>
      </div>
      <div className="mt-4 flex justify-center gap-3">
        {projects.map((q, k) => (
          <button
            key={q.id}
            onClick={() => setProject(k)}
            aria-label={q.title}
            className={`cart ${k === i ? 'cart-on' : ''}`}
            style={{ ['--c' as string]: CART[k % CART.length] }}
          >
            <span className="pixel block truncate text-[6px] leading-3">{q.title}</span>
          </button>
        ))}
      </div>
      <div key={p.id} className="crt-in mt-4 flex flex-1 flex-col rounded-lg bg-black/25 p-4">
        <div className="pixel text-[9px] leading-4" style={{ color: c === '#3b82f6' ? '#93c5fd' : c }}>{p.tag}</div>
        <h2 className="pixel mt-2.5 text-[17px] leading-[1.4] text-yellow-200">{p.title}</h2>
        <p className="mt-3 text-[14px] leading-relaxed text-white/90">{p.description}</p>
        <div className="mt-auto flex flex-wrap gap-1.5 pt-3">
          {p.stack.map((s) => (
            <span key={s} className="rounded-md bg-white/15 px-2 py-0.5 font-mono text-[11px] text-white">{s}</span>
          ))}
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <button onClick={() => next(-1)} className="pixel pad-btn">◀</button>
        <span className="pixel text-[8px] text-white/60">◀ ▶ PARA CAMBIAR</span>
        <button onClick={() => next(1)} className="pixel pad-btn">▶</button>
      </div>
    </div>
  )
}

/* ───────── 3 · cork board: experience & stack ───────── */
export function ExperiencePanel() {
  const [tab, setTab] = useState<'exp' | 'stack'>('exp')
  return (
    <div className="@container cork flex h-full flex-col p-5 text-slate-800 @2xl:p-6">
      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-md bg-white/90 px-3 py-1 font-display text-[15px] font-bold text-slate-800 shadow-sm">📌 Mapa de ruta</span>
        <div className="ml-auto flex gap-1 rounded-full bg-white/80 p-1 shadow-sm">
          {([['exp', 'Experiencia'], ['stack', 'Stack']] as const).map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)} className={`rounded-full px-4 py-1.5 text-[13px] font-semibold transition ${tab === k ? 'bg-[#22a35a] text-white' : 'text-slate-600 hover:text-slate-900'}`}>{l}</button>
          ))}
        </div>
      </div>
      {tab === 'exp' ? (
        <ol className="mt-4 grid gap-3">
          {experience.map((e, k) => (
            <li key={e.role + e.period} className="note" style={{ ['--r' as string]: `${[-0.6, 0.5, -0.3][k % 3]}deg`, background: ['#fff7c2', '#ffe1ea', '#dcf2ff'][k % 3] }}>
              <div className="flex flex-wrap items-center justify-between gap-x-3">
                <span className="font-display text-[18px] font-bold text-slate-900">{e.role}</span>
                <span className="shrink-0 font-mono text-[12px] text-slate-500">{e.period}</span>
              </div>
              <div className="mt-0.5 flex items-center gap-2 text-[13px] font-semibold text-slate-600">
                @ {e.company} · {e.type}
                {e.current && <span className="rounded-full bg-emerald-500 px-2 text-[11px] text-white">ACTUAL</span>}
              </div>
              <p className="mt-1.5 text-[14px] leading-snug text-slate-700">{e.description}</p>
            </li>
          ))}
        </ol>
      ) : (
        <div className="mt-4 grid flex-1 grid-cols-1 gap-3 @2xl:grid-cols-2">
          {stack.map((s, k) => (
            <div key={s.id} className="note !p-3.5" style={{ ['--r' as string]: `${[0.4, -0.5, 0.3, -0.4][k]}deg`, background: '#fffdf6' }}>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full" style={{ background: LAYER[k] }} />
                <span className="font-display text-[15.5px] font-bold text-slate-900">{s.title}</span>
                <span className="ml-auto text-[11px] font-semibold text-slate-400">{s.items.length} skills</span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full rounded-full" style={{ width: `${Math.min(100, s.items.length * 12.5)}%`, background: LAYER[k] }} />
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {s.items.map((it) => (
                  <span key={it} className="rounded-md px-1.5 py-0.5 text-[11.5px] font-medium" style={{ background: `${LAYER[k]}1f`, color: '#1e293b' }}>{it}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ───────── 4 · bookcase: certifications & education ───────── */
const MEDAL = ['#f5c542', '#d6d3cc', '#3b82f6', '#8b5cf6', '#22a35a']

export function CertsPanel() {
  const items = [
    ...education.map((e, k) => ({ t: e.title, s: [e.school, e.detail].filter(Boolean).join(' · '), b: k === 0 ? 'DAM' : 'SMR' })),
    ...certifications.map((c) => ({ t: c.title, s: [c.issuer, c.year].filter(Boolean).join(' · '), b: c.badge })),
  ]
  return (
    <div className="@container woodpanel flex h-full flex-col p-5 text-slate-800 @2xl:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="rounded-md bg-[#fffaf0] px-3 py-1 font-display text-[15px] font-bold shadow-sm">🏆 Colección de logros</span>
        <span className="rounded-full bg-[#fffaf0]/90 px-3 py-1 text-[12px] font-semibold text-amber-700">{items.length}/{items.length} conseguidos</span>
      </div>
      <ul className="mt-4 grid flex-1 grid-cols-1 gap-3 @2xl:grid-cols-2">
        {items.map((m, k) => (
          <li key={m.t} className={`flex items-center gap-4 rounded-2xl border-2 border-[#e9d9bd] bg-[#fffaf0] px-4 py-3 shadow-sm ${k === items.length - 1 && items.length % 2 ? '@2xl:col-span-2' : ''}`}>
            <div className="relative grid h-14 w-14 shrink-0 place-items-center">
              <div className="absolute inset-1 rounded-full border-4 border-white shadow" style={{ background: `radial-gradient(circle at 35% 30%, #fff8, transparent 45%), ${MEDAL[k % 5]}` }} />
              <span className="relative text-[11px] font-black text-slate-900/80">{m.b}</span>
            </div>
            <div>
              <div className="font-display text-[15.5px] font-bold leading-snug text-slate-900">{m.t}</div>
              <div className="mt-0.5 text-[13px] text-slate-600">{m.s}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ───────── 5 · Simba (only used by the phone bottom sheet; desktop shows a 3D speech bubble) ───────── */
export function SimbaCard() {
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-[#fffaf0] p-5 text-slate-800">
      <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-slate-900 text-[26px]">🐾</span>
      <p className="font-display text-[15px] font-bold leading-snug">{SIMBA_LINE}</p>
    </div>
  )
}

/** Panel content per focus target (also used by the mobile bottom sheet). */
export const PANELS: Record<FocusId, () => ReactNode> = {
  about: AboutScreen,
  projects: ProjectsScreen,
  experience: ExperiencePanel,
  certs: CertsPanel,
  simba: SimbaCard,
}
