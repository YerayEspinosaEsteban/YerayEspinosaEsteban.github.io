import { motion } from 'framer-motion'
import { education, profile } from '../data/profile'
import { reveal, Section } from './Section'

const stats = [
  { v: 'Top 3%', l: 'TryHackMe mundial' },
  { v: '+134', l: 'Salas técnicas' },
  { v: 'Mención', l: 'Honorífica DAM' },
  { v: 'Shift-Left', l: 'Desde el diseño' },
]

export function About() {
  return (
    <Section id="perfil" index="01" kicker="IDENTITY RECORD" title="Seguridad desde el código hasta la infraestructura">
      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <motion.div {...reveal} transition={{ duration: 0.6 }} className="glass hud rounded-2xl p-6 sm:p-8">
          <div className="mb-4 font-mono text-xs tracking-widest text-muted">
            ROLE <span className="text-neon">::</span> {profile.role.toUpperCase()}
          </div>
          <p className="text-base leading-relaxed text-ink/90 sm:text-lg">{profile.bio}</p>
          <div className="mt-6 flex flex-wrap gap-2 font-mono text-xs text-muted">
            <span className="rounded border border-line px-2 py-1">📍 {profile.location}</span>
            <span className="rounded border border-line px-2 py-1">🏢 {profile.company}</span>
          </div>
        </motion.div>

        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            {stats.map((s, i) => (
              <motion.div key={s.l} {...reveal} transition={{ delay: i * 0.08, duration: 0.5 }} className="glass rounded-xl p-4">
                <div className="font-display text-2xl font-bold text-neon">{s.v}</div>
                <div className="mt-1 font-mono text-[11px] uppercase tracking-wider text-muted">{s.l}</div>
              </motion.div>
            ))}
          </div>
          {education.map((e, i) => (
            <motion.div key={e.title} {...reveal} transition={{ delay: 0.2 + i * 0.1 }} className="glass rounded-xl p-4">
              <div className="font-mono text-[10px] tracking-widest text-plasma">FORMACIÓN</div>
              <div className="mt-1 font-display font-semibold text-ink">{e.title}</div>
              <div className="font-mono text-xs text-muted">
                {e.school}
                {e.detail && <> · <span className="text-term">{e.detail}</span></>}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  )
}
