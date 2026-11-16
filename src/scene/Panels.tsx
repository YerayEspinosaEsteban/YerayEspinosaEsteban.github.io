import { Html } from '@react-three/drei'
import { useState, type ReactNode } from 'react'
import { accentHex, certifications, education, experience, profile, projects, stack } from '../data/profile'
import { GitHubIcon, LinkedInIcon } from '../ui/Icons'
import { COMPACT, useStore, type FocusId } from './store'

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

const STATS = [
  ['Top 3%', 'TryHackMe mundial'],
  ['+134', 'salas técnicas'],
  ['DAM', 'Mención Honorífica'],
  ['NASA', 'Space Apps 2026'],
]

/* ───────── 1 · main monitor: "about me" desktop ───────── */
export function AboutScreen() {
  const setCv = useStore((s) => s.setCv)
  return (
    <div className="@container flex h-full flex-col bg-gradient-to-br from-[#06121f] via-[#0b1226] to-[#1a0b2e] font-sans text-slate-100">
      <div className="flex items-center gap-2 border-b border-cyan-400/20 bg-black/30 px-5 py-2.5 font-mono text-[13px] text-slate-400">
        <span className="h-3 w-3 rounded-full bg-rose-400" /><span className="h-3 w-3 rounded-full bg-amber-300" /><span className="h-3 w-3 rounded-full bg-emerald-400" />
        <span className="ml-3">yeray@gft:~/profile — secure session</span>
        <span className="ml-auto text-emerald-400">● online</span>
      </div>
      <div className="grid flex-1 grid-cols-1 gap-5 p-5 @3xl:grid-cols-[1fr_1.25fr] @3xl:gap-7 @3xl:p-7">
        <div className="flex flex-col">
          <div className="font-mono text-[13px] text-cyan-300">&gt; whoami</div>
          <h1 className="mt-2 font-display text-[32px] @3xl:text-[44px] font-bold leading-[1.02] text-white">Yeray<br />Espinosa Esteban</h1>
          <div className="mt-3 font-mono text-[15px] leading-snug text-cyan-200">{profile.role}</div>
          <div className="font-mono text-[15px] text-fuchsia-300">@ {profile.company}</div>
          <div className="mt-1 text-[14px] text-slate-400">📍 {profile.location}</div>
          <div className="mt-5 flex flex-wrap gap-2.5 @3xl:mt-auto">
            <a href={profile.links.linkedin} target="_blank" rel="noopener noreferrer" className="btn-neon !border-sky-400 !text-sky-200"><LinkedInIcon className="h-4 w-4" /> LinkedIn</a>
            <a href={profile.links.github} target="_blank" rel="noopener noreferrer" className="btn-neon"><GitHubIcon className="h-4 w-4" /> GitHub</a>
            <button onClick={() => setCv(true)} className="btn-neon !border-amber-300 !text-amber-200">📄 CV / PDF</button>
          </div>
        </div>
        <div className="flex flex-col">
          <p className="text-[16px] leading-relaxed text-slate-200">{profile.bio}</p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {profile.headline.split('|').map((h) => (
              <span key={h} className="rounded border border-cyan-400/40 bg-cyan-400/10 px-2 py-1 font-mono text-[12px] text-cyan-100">{h.trim()}</span>
            ))}
          </div>
          <div className="mt-5 grid grid-cols-2 gap-2 @xl:grid-cols-4 @3xl:mt-auto">
            {STATS.map(([v, l]) => (
              <div key={l} className="rounded-lg border border-fuchsia-400/30 bg-fuchsia-500/10 px-2 py-2.5 text-center">
                <div className="font-display text-[20px] font-bold text-white">{v}</div>
                <div className="font-mono text-[10px] uppercase tracking-wide text-fuchsia-200">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ───────── 2 · arcade CRT: project carousel ───────── */
export function ProjectsScreen() {
  const i = useStore((s) => s.project)
  const next = useStore((s) => s.nextProject)
  const setProject = useStore((s) => s.setProject)
  const p = projects[i]
  const c = accentHex[p.accent]
  return (
    <div className="@container crt relative flex h-full flex-col bg-[#07020f] px-6 pb-5 pt-5 text-white">
      <div className="pixel flex items-center justify-between text-[11px]">
        <span className="text-fuchsia-400">PROJECTS</span>
        <span className="text-amber-300">LVL {String(i + 1).padStart(2, '0')}/{String(projects.length).padStart(2, '0')}</span>
      </div>
      <div key={p.id} className="crt-in mt-5 flex flex-1 flex-col">
        <div className="pixel text-[9px] leading-4" style={{ color: c }}>{p.tag}</div>
        <h2 className="pixel mt-3 text-[20px] leading-[1.35]" style={{ textShadow: `0 0 12px ${c}` }}>{p.title}</h2>
        <p className="mt-4 font-mono text-[14px] leading-relaxed text-slate-200">{p.description}</p>
        <div className="mt-auto flex flex-wrap gap-1.5">
          {p.stack.map((s) => (
            <span key={s} className="border px-2 py-1 font-mono text-[11px]" style={{ borderColor: c, color: c }}>{s}</span>
          ))}
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <button onClick={() => next(-1)} className="pixel arcade-btn">◀</button>
        <div className="flex gap-2">
          {projects.map((q, k) => (
            <button key={q.id} onClick={() => setProject(k)} aria-label={q.title} className={`h-3 w-3 ${k === i ? 'bg-amber-300' : 'bg-white/25'}`} />
          ))}
        </div>
        <button onClick={() => next(1)} className="pixel arcade-btn">▶</button>
      </div>
    </div>
  )
}

/* ───────── 3 · hologram: experience & stack ───────── */
export function ExperiencePanel() {
  const [tab, setTab] = useState<'exp' | 'stack'>('exp')
  return (
    <div className="@container holo flex h-full flex-col p-5 text-slate-100 @2xl:p-6">
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-mono text-[12px] tracking-[0.3em] text-violet-300">// DEFENSE-IN-DEPTH</span>
        <div className="ml-auto flex gap-1 rounded-lg border border-violet-300/40 p-1">
          {([['exp', 'Experiencia'], ['stack', 'Stack']] as const).map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)} className={`rounded-md px-4 py-1.5 font-mono text-[13px] transition ${tab === k ? 'bg-violet-400/30 text-white' : 'text-violet-200 hover:text-white'}`}>{l}</button>
          ))}
        </div>
      </div>
      {tab === 'exp' ? (
        <ol className="mt-5 grid gap-3">
          {experience.map((e) => (
            <li key={e.role + e.period} className="rounded-xl border border-violet-300/30 bg-violet-500/10 px-5 py-3.5">
              <div className="flex flex-wrap items-center justify-between gap-x-3">
                <span className="font-display text-[19px] font-semibold text-white">{e.role}</span>
                <span className="shrink-0 font-mono text-[12px] text-cyan-200">{e.period}</span>
              </div>
              <div className="mt-0.5 flex items-center gap-2 font-mono text-[13px] text-violet-200">
                @ {e.company} · {e.type}
                {e.current && <span className="rounded bg-emerald-400/20 px-1.5 text-[11px] text-emerald-300">● ACTUAL</span>}
              </div>
              <p className="mt-1.5 text-[14px] leading-snug text-slate-300">{e.description}</p>
            </li>
          ))}
        </ol>
      ) : (
        <div className="mt-5 grid flex-1 grid-cols-1 gap-3 @2xl:grid-cols-2">
          {stack.map((s) => (
            <div key={s.id} className="rounded-xl border px-4 py-3" style={{ borderColor: `${accentHex[s.accent]}66`, background: `${accentHex[s.accent]}12` }}>
              <div className="flex items-center justify-between">
                <span className="font-display text-[16px] font-semibold text-white">{s.title}</span>
                <span className="font-mono text-[10px]" style={{ color: accentHex[s.accent] }}>{s.code}</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {s.items.map((it) => (
                  <span key={it} className="rounded border px-1.5 py-0.5 font-mono text-[11.5px] text-slate-100" style={{ borderColor: `${accentHex[s.accent]}55` }}>{it}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ───────── 4 · shelf visor: certifications & education ───────── */
const MEDAL = ['#fbbf24', '#e2e8f0', '#22d3ee', '#a78bfa', '#4ade80']

export function CertsPanel() {
  const items = [
    ...education.map((e, k) => ({ t: e.title, s: [e.school, e.detail].filter(Boolean).join(' · '), b: k === 0 ? 'DAM' : 'SMR' })),
    ...certifications.map((c) => ({ t: c.title, s: [c.issuer, c.year].filter(Boolean).join(' · '), b: c.badge })),
  ]
  return (
    <div className="@container visor flex h-full flex-col p-5 text-slate-100 @2xl:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[12px] tracking-[0.3em] text-amber-300">
        <span>// COLECCIÓN DE LOGROS</span>
        <span>{items.length}/{items.length} DESBLOQUEADOS</span>
      </div>
      <ul className="mt-5 grid flex-1 grid-cols-1 gap-3 @2xl:grid-cols-2">
        {items.map((m, k) => (
          <li key={m.t} className={`flex items-center gap-4 rounded-xl border border-amber-300/30 bg-amber-400/[0.07] px-4 py-3 ${k === items.length - 1 && items.length % 2 ? '@2xl:col-span-2' : ''}`}>
            <div className="relative grid h-14 w-14 shrink-0 place-items-center">
              <div className="absolute inset-1.5 rotate-45 rounded-md border-2 border-white/70" style={{ background: `linear-gradient(135deg, ${MEDAL[k % 5]}, ${MEDAL[k % 5]}77)`, boxShadow: `0 0 18px ${MEDAL[k % 5]}88` }} />
              <span className="pixel relative text-[8px] text-slate-900">{m.b}</span>
            </div>
            <div>
              <div className="font-display text-[16px] font-semibold leading-snug text-white">{m.t}</div>
              <div className="mt-0.5 text-[13px] text-amber-100/80">{m.s}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Panel content per focus target (also used by the mobile bottom sheet). */
export const PANELS: Record<FocusId, () => ReactNode> = {
  about: AboutScreen,
  projects: ProjectsScreen,
  experience: ExperiencePanel,
  certs: CertsPanel,
}
