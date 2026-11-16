import { useEffect } from 'react'
import { certifications, education, experience, profile, projects, stack } from '../data/profile'
import { useStore } from '../scene/store'

/** Plain, fast, printable résumé view for recruiters in a hurry (also the no-WebGL fallback). */
export function CVMode({ standalone = false }: { standalone?: boolean }) {
  const cv = useStore((s) => s.cv)
  const setCv = useStore((s) => s.setCv)
  const visible = standalone || cv

  useEffect(() => {
    if (!visible || standalone) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setCv(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [visible, standalone, setCv])

  if (!visible) return null
  return (
    <div className="cv-sheet scroll-thin fixed inset-0 z-[60] overflow-y-auto bg-slate-950/80 p-3 backdrop-blur-sm sm:p-8" onClick={() => !standalone && setCv(false)}>
      <article className="cv-card rise mx-auto max-w-3xl rounded-2xl bg-white p-6 text-slate-800 shadow-2xl sm:p-10" onClick={(e) => e.stopPropagation()}>
        <div className="no-print mb-6 flex flex-wrap justify-between gap-2">
          {standalone ? <span className="text-sm text-slate-500">Tu navegador no soporta WebGL: aquí tienes la versión clásica.</span> : (
            <button onClick={() => setCv(false)} className="rounded-lg border-2 border-slate-800 px-3 py-1.5 text-sm font-semibold hover:bg-slate-100">← Volver a la habitación</button>
          )}
          <button onClick={() => window.print()} className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white hover:bg-slate-700">⬇ Guardar PDF / Imprimir</button>
        </div>

        <header className="border-b-2 border-slate-200 pb-5">
          <h1 className="font-display text-3xl font-bold text-slate-900 sm:text-4xl">{profile.name}</h1>
          <p className="mt-1 text-lg font-semibold text-cyan-700">{profile.role} · {profile.company}</p>
          <p className="mt-1 text-sm text-slate-500">{profile.headline}</p>
          <p className="mt-2 text-sm text-slate-600">
            {profile.location} · <a className="text-cyan-700 underline" href={profile.links.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a> · <a className="text-cyan-700 underline" href={profile.links.github} target="_blank" rel="noopener noreferrer">GitHub</a>
          </p>
        </header>

        <section className="mt-6">
          <h2 className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-400">Perfil</h2>
          <p className="leading-relaxed">{profile.bio}</p>
        </section>

        <section className="mt-6">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Experiencia</h2>
          <ul className="grid gap-4">
            {experience.map((e) => (
              <li key={e.role + e.period}>
                <div className="flex flex-wrap justify-between gap-2"><b className="text-slate-900">{e.role}</b><span className="text-sm text-slate-500">{e.period}</span></div>
                <div className="text-sm text-cyan-700">{e.company} · {e.type}</div>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">{e.description}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-6">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Stack</h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {stack.map((s) => (
              <li key={s.id} className="text-sm"><b className="text-slate-900">{s.title}:</b> <span className="text-slate-600">{s.items.join(', ')}</span></li>
            ))}
          </ul>
        </section>

        <section className="mt-6">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Proyectos</h2>
          <ul className="grid gap-3">
            {projects.map((p) => (
              <li key={p.id} className="text-sm">
                <b className="text-slate-900">{p.title}</b> <span className="text-slate-400">— {p.tag}</span>
                <p className="text-slate-600">{p.description} <span className="text-slate-400">({p.stack.join(', ')})</span></p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-6 grid gap-6 sm:grid-cols-2">
          <div>
            <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Formación</h2>
            <ul className="grid gap-2 text-sm">
              {education.map((e) => <li key={e.title}><b className="text-slate-900">{e.title}</b><br /><span className="text-slate-600">{e.school}{e.detail && ` · ${e.detail}`}</span></li>)}
            </ul>
          </div>
          <div>
            <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Certificaciones e hitos</h2>
            <ul className="grid gap-2 text-sm">
              {certifications.map((c) => <li key={c.title}><b className="text-slate-900">{c.title}</b><br /><span className="text-slate-600">{[c.issuer, c.year].filter(Boolean).join(' · ')}</span></li>)}
            </ul>
          </div>
        </section>
      </article>
    </div>
  )
}
