import { motion } from 'framer-motion'
import { profile } from '../data/profile'
import { GitHubIcon, LinkedInIcon } from './Icons'
import { Section } from './Section'

export function Contact() {
  return (
    <>
      <Section id="contacto" index="06" kicker="SECURE CHANNEL" title="Abramos un canal seguro">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass hud relative overflow-hidden rounded-3xl p-8 sm:p-12"
        >
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-plasma/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-neon/20 blur-3xl" />
          <p className="relative max-w-2xl text-lg leading-relaxed text-ink/90 sm:text-xl">
            ¿Arquitectura multicloud, DevSecOps, seguridad en contenedores o IA segura? Hablemos de cómo integrar la seguridad desde el primer diagrama.
          </p>
          <div className="relative mt-8 flex flex-wrap gap-4">
            <a href={profile.links.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 rounded-xl bg-neon px-6 py-4 font-mono text-sm font-bold text-bg transition hover:shadow-[0_0_36px_var(--neon)]">
              <LinkedInIcon className="h-5 w-5" /> Conectar en LinkedIn
            </a>
            <a href={profile.links.github} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 rounded-xl border border-line bg-bg/40 px-6 py-4 font-mono text-sm font-bold text-ink transition hover:border-neon hover:text-neon">
              <GitHubIcon className="h-5 w-5" /> Ver GitHub
            </a>
          </div>
        </motion.div>
      </Section>
      <footer className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-8 font-mono text-[11px] text-muted sm:px-6">
        <span>© {new Date().getFullYear()} {profile.name} · Secure by design.</span>
        <span className="flex gap-4">
          <a href="/legacy/" className="hover:text-neon">Portfolio v1</a>
          <span title="↑ ↑ ↓ ↓ ← → ← → B A" className="cursor-help">◇ ¿Conoces el código?</span>
        </span>
      </footer>
    </>
  )
}
