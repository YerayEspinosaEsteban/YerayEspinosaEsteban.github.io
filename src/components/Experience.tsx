import { motion } from 'framer-motion'
import { certifications, experience } from '../data/profile'
import { reveal, Section } from './Section'

export function Experience() {
  return (
    <Section id="experiencia" index="03" kicker="MISSION LOG" title="Trayectoria">
      <ol className="relative ml-2 border-l border-line sm:ml-4">
        {experience.map((e, i) => (
          <motion.li key={e.role + e.period} {...reveal} transition={{ delay: i * 0.1, duration: 0.5 }} className="relative mb-8 pl-6 sm:pl-10">
            <span
              className={`absolute -left-[7px] top-6 h-3 w-3 rounded-full border-2 ${e.current ? 'border-term bg-term shadow-[0_0_14px_var(--term)]' : 'border-neon bg-bg'}`}
            />
            <div className="glass hud rounded-2xl p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="font-mono text-xs tracking-widest text-neon">{e.period}</div>
                <div className="flex gap-2 font-mono text-[10px] uppercase tracking-wider">
                  {e.current && <span className="rounded bg-term/15 px-2 py-0.5 text-term">● Actual</span>}
                  <span className="rounded border border-line px-2 py-0.5 text-muted">{e.type}</span>
                </div>
              </div>
              <h3 className="mt-2 font-display text-xl font-semibold text-ink sm:text-2xl">{e.role}</h3>
              <div className="font-mono text-sm text-plasma">@ {e.company}</div>
              <p className="mt-3 leading-relaxed text-ink/80">{e.description}</p>
            </div>
          </motion.li>
        ))}
      </ol>

      <div className="mt-16">
        <div className="mb-6 font-mono text-xs tracking-[0.3em] text-muted">CERTIFICACIONES & HITOS</div>
        <div className="grid gap-4 md:grid-cols-3">
          {certifications.map((c, i) => (
            <motion.div key={c.title} {...reveal} transition={{ delay: i * 0.1 }} className="glass group rounded-xl p-5 transition hover:-translate-y-1 hover:border-neon/50">
              <div className="mb-4 grid h-12 w-12 place-items-center rounded-lg border border-neon/40 bg-neon/10 font-mono text-xs font-bold text-neon">{c.badge}</div>
              <div className="font-display font-semibold text-ink">{c.title}</div>
              <div className="mt-1 font-mono text-xs text-muted">
                {c.issuer && <>{c.issuer} · </>}<span className="text-term">{c.year}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  )
}
