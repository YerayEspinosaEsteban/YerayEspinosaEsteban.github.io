import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

const links = [
  ['perfil', 'Perfil'],
  ['stack', 'Stack'],
  ['experiencia', 'Trayectoria'],
  ['proyectos', 'Proyectos'],
  ['terminal', 'Terminal'],
  ['contacto', 'Contacto'],
] as const

export function Nav({ holocron, onToggle }: { holocron: boolean; onToggle: () => void }) {
  const [active, setActive] = useState('')
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' },
    )
    links.forEach(([id]) => { const el = document.getElementById(id); if (el) io.observe(el) })
    return () => io.disconnect()
  }, [])

  return (
    <motion.nav
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.4, duration: 0.6 }}
      className="fixed inset-x-0 top-0 z-50 px-4 pt-3 sm:px-6"
    >
      <div className="glass mx-auto flex max-w-6xl items-center justify-between rounded-xl px-4 py-2.5">
        <a href="#top" className="flex items-center gap-2 font-mono text-sm font-bold tracking-widest text-ink">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-term shadow-[0_0_10px_var(--term)]" />
          YE<span className="text-neon">//</span>SEC
        </a>
        <ul className="hidden items-center gap-1 md:flex">
          {links.map(([id, label]) => (
            <li key={id}>
              <a
                href={`#${id}`}
                className={`rounded-md px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors ${active === id ? 'bg-neon/10 text-neon' : 'text-muted hover:text-ink'}`}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          <button
            onClick={onToggle}
            title="Holocron Security Protocol"
            aria-pressed={holocron}
            className="rounded-md border border-line px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-widest text-muted transition hover:border-neon hover:text-neon"
          >
            {holocron ? '◆ Holocron' : '◇ Holocron'}
          </button>
          <button className="rounded-md border border-line px-2.5 py-1.5 font-mono text-xs text-ink md:hidden" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Menú">
            {open ? '✕' : '☰'}
          </button>
        </div>
      </div>
      {open && (
        <ul className="glass mx-auto mt-2 grid max-w-6xl gap-1 rounded-xl p-2 md:hidden">
          {links.map(([id, label]) => (
            <li key={id}>
              <a href={`#${id}`} onClick={() => setOpen(false)} className="block rounded-md px-3 py-2 font-mono text-sm uppercase tracking-wider text-ink hover:bg-neon/10">
                {label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </motion.nav>
  )
}
