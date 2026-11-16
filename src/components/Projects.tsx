import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import type { MouseEvent } from 'react'
import { accentHex, projects } from '../data/profile'
import { Section } from './Section'

function ProjectCard({ p, i, holocron }: { p: (typeof projects)[number]; i: number; holocron: boolean }) {
  const mx = useMotionValue(0.5)
  const my = useMotionValue(0.5)
  const rx = useSpring(useTransform(my, [0, 1], [8, -8]), { stiffness: 200, damping: 20 })
  const ry = useSpring(useTransform(mx, [0, 1], [-10, 10]), { stiffness: 200, damping: 20 })
  const glowX = useTransform(mx, (v) => `${v * 100}%`)
  const glowY = useTransform(my, (v) => `${v * 100}%`)
  const c = holocron ? (i % 2 ? '#ffb347' : '#ff3b3b') : accentHex[p.accent]

  const onMove = (e: MouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    mx.set((e.clientX - r.left) / r.width)
    my.set((e.clientY - r.top) / r.height)
  }
  const reset = () => { mx.set(0.5); my.set(0.5) }

  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ delay: i * 0.1, duration: 0.6 }}
      style={{ perspective: 1000 }}
    >
      <motion.div
        onMouseMove={onMove}
        onMouseLeave={reset}
        style={{ rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d' }}
        className="glass hud group relative h-full overflow-hidden rounded-2xl p-6 sm:p-7"
      >
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: useTransform([glowX, glowY], ([x, y]) => `radial-gradient(400px circle at ${x} ${y}, ${c}22, transparent 60%)`) }}
        />
        <div style={{ transform: 'translateZ(40px)' }} className="relative">
          <div className="flex items-start justify-between gap-4">
            <span className="font-mono text-[10px] uppercase tracking-[0.25em]" style={{ color: c }}>
              {String(i + 1).padStart(2, '0')} · {p.tag}
            </span>
            <span className="h-2 w-2 rounded-full" style={{ background: c, boxShadow: `0 0 12px ${c}` }} />
          </div>
          <h3 className="mt-4 font-display text-2xl font-bold text-ink sm:text-3xl">{p.title}</h3>
          <p className="mt-3 leading-relaxed text-ink/80">{p.description}</p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {p.stack.map((s) => (
              <li key={s} className="rounded border px-2 py-1 font-mono text-[11px] text-ink/90" style={{ borderColor: `${c}44` }}>
                {s}
              </li>
            ))}
          </ul>
        </div>
      </motion.div>
    </motion.article>
  )
}

export function Projects({ holocron }: { holocron: boolean }) {
  return (
    <Section id="proyectos" index="04" kicker="ARTIFACT VAULT" title="Proyectos destacados">
      <div className="grid gap-6 md:grid-cols-2">
        {projects.map((p, i) => (
          <ProjectCard key={p.id} p={p} i={i} holocron={holocron} />
        ))}
      </div>
    </Section>
  )
}
