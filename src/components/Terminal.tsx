import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { certifications, experience, profile, projects, stack } from '../data/profile'
import { Section } from './Section'

type Line = { kind: 'in' | 'out'; body: ReactNode }

const PROMPT = 'guest@ye-sec:~$'

export function Terminal({ onScan, onHolocron, holocron }: { onScan: () => void; onHolocron: () => void; holocron: boolean }) {
  const [lines, setLines] = useState<Line[]>([
    { kind: 'out', body: <span className="text-muted">YE//SEC secure shell v2.0 — escribe <b className="text-neon">help</b> para ver los comandos.</span> },
  ])
  const [value, setValue] = useState('')
  const [hist, setHist] = useState<string[]>([])
  const [hIdx, setHIdx] = useState(-1)
  const bodyRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight })
  }, [lines])

  const commands: Record<string, () => ReactNode> = {
    help: () => (
      <div className="grid grid-cols-[110px_1fr] gap-x-4 sm:grid-cols-[140px_1fr]">
        {[
          ['whoami', 'Identidad y rol actual'],
          ['stack', 'Dominios técnicos'],
          ['experience', 'Trayectoria profesional'],
          ['projects', 'Proyectos destacados'],
          ['certs', 'Certificaciones e hitos'],
          ['contact', 'Canales seguros de contacto'],
          ['scan | pokedex', 'Analiza al entrenador…'],
          ['holocron', 'Holocron Security Protocol'],
          ['clear', 'Limpia la consola'],
        ].map(([c, d]) => (
          <div key={c} className="contents">
            <span className="text-neon">{c}</span>
            <span className="text-muted">{d}</span>
          </div>
        ))}
      </div>
    ),
    whoami: () => (
      <>
        <div className="text-ink">{profile.name}</div>
        <div className="text-term">{profile.role} @ {profile.company}</div>
        <div className="text-muted">{profile.headline}</div>
      </>
    ),
    stack: () => stack.map((s) => (
      <div key={s.id}>
        <span className="text-plasma">[{s.code}]</span> <span className="text-ink">{s.title}</span>
        <div className="pl-4 text-muted">{s.items.join(' · ')}</div>
      </div>
    )),
    experience: () => experience.map((e) => (
      <div key={e.role + e.period}>
        <span className="text-neon">{e.period.padEnd(20, ' ')}</span> <span className="text-ink">{e.role}</span> <span className="text-muted">@ {e.company}</span>
      </div>
    )),
    projects: () => projects.map((p) => (
      <div key={p.id}>
        <span className="text-term">▸ {p.title}</span> <span className="text-muted">— {p.stack.join(', ')}</span>
      </div>
    )),
    certs: () => certifications.map((c) => <div key={c.title}><span className="text-warn">★</span> {c.title} <span className="text-muted">({c.year})</span></div>),
    contact: () => (
      <>
        <div>LinkedIn → <a className="text-neon underline" href={profile.links.linkedin} target="_blank" rel="noopener noreferrer">{profile.links.linkedin.replace('https://www.', '')}</a></div>
        <div>GitHub &nbsp;&nbsp;→ <a className="text-neon underline" href={profile.links.github} target="_blank" rel="noopener noreferrer">{profile.links.github.replace('https://', '')}</a></div>
      </>
    ),
    scan: () => { setTimeout(onScan, 500); return <span className="text-term">Iniciando escáner biométrico… ▮▮▮▮▮▮▮▮ 100% — abriendo Pokédex.</span> },
    holocron: () => {
      onHolocron()
      return holocron
        ? <span className="text-neon">Holocron sellado. Volviendo al protocolo estándar.</span>
        : <span className="text-warn">Holocron Security Protocol activado. "Confía en la Fuerza… pero verifica cada token."</span>
    },
    sudo: () => <span className="text-red-400">Permission denied: principio de mínimo privilegio aplicado. Buen intento 😉</span>,
    hack: () => <span className="text-red-400">ACCESS DENIED — Zero-Trust: nunca confíes, siempre verifica.</span>,
    ls: () => <span className="text-muted">about.md  stack/  experience.log  projects/  .holocron  .pokeball</span>,
  }
  const aliases: Record<string, string> = { pokedex: 'scan', skills: 'stack', exp: 'experience', proyectos: 'projects', ayuda: 'help' }

  const run = (raw: string) => {
    const cmd = raw.trim()
    if (!cmd) return
    setHist((h) => [cmd, ...h].slice(0, 50))
    setHIdx(-1)
    const key = cmd.toLowerCase().split(/\s+/)[0]
    if (key === 'clear') return setLines([])
    const name = aliases[key] ?? key
    const fn = commands[name]
    const out = fn ? fn() : <span className="text-red-400">comando no encontrado: {key}. Prueba <b>help</b>.</span>
    setLines((l) => [...l, { kind: 'in', body: cmd }, { kind: 'out', body: out }])
  }

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { run(value); setValue('') }
    else if (e.key === 'ArrowUp') { e.preventDefault(); const i = Math.min(hIdx + 1, hist.length - 1); if (hist[i]) { setHIdx(i); setValue(hist[i]) } }
    else if (e.key === 'ArrowDown') { e.preventDefault(); const i = hIdx - 1; setHIdx(Math.max(i, -1)); setValue(i >= 0 ? hist[i] : '') }
  }

  return (
    <Section id="terminal" index="05" kicker="TACTICAL CONSOLE" title="Consola interactiva">
      <div className="glass hud overflow-hidden rounded-2xl" onClick={() => inputRef.current?.focus()}>
        <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
          <span className="h-3 w-3 rounded-full bg-red-500/80" />
          <span className="h-3 w-3 rounded-full bg-yellow-400/80" />
          <span className="h-3 w-3 rounded-full bg-green-500/80" />
          <span className="ml-3 font-mono text-xs text-muted">ye-sec — zsh — encrypted</span>
        </div>
        <div ref={bodyRef} className="scanlines relative h-[360px] overflow-y-auto p-4 font-mono text-[12px] leading-6 sm:text-sm" aria-live="polite">
          {lines.map((l, i) =>
            l.kind === 'in' ? (
              <div key={i}><span className="text-term">{PROMPT}</span> <span className="text-ink">{l.body}</span></div>
            ) : (
              <div key={i} className="mb-2 text-ink/90">{l.body}</div>
            ),
          )}
          <div className="flex items-center">
            <label htmlFor="term-input" className="shrink-0 text-term">{PROMPT}&nbsp;</label>
            <input
              id="term-input"
              ref={inputRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={onKey}
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              className="w-full bg-transparent text-ink caret-neon outline-none"
              aria-label="Comando de terminal"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2 border-t border-line px-4 py-3">
          {['help', 'whoami', 'stack', 'projects', 'scan', 'holocron'].map((c) => (
            <button key={c} onClick={(e) => { e.stopPropagation(); run(c) }} className="rounded border border-line px-2.5 py-1 font-mono text-xs text-muted transition hover:border-neon hover:text-neon">
              {c}
            </button>
          ))}
        </div>
      </div>
    </Section>
  )
}
