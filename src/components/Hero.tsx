import { motion } from 'framer-motion'
import { lazy, Suspense } from 'react'
import { profile } from '../data/profile'
import type { Palette } from '../three/HeroScene'
import { ArrowIcon, GitHubIcon, LinkedInIcon } from './Icons'

const HeroScene = lazy(() => import('../three/HeroScene'))

function StaticCore() {
  return (
    <div className="absolute inset-0 grid place-items-center" aria-hidden="true">
      <div className="relative h-72 w-72">
        {[0, 1, 2].map((i) => (
          <div key={i} className="absolute inset-0 rounded-full border border-neon/40" style={{ transform: `scale(${1 - i * 0.22}) rotateX(65deg) rotateZ(${i * 40}deg)` }} />
        ))}
        <div className="absolute inset-[38%] rounded-full bg-neon shadow-[0_0_60px_var(--neon)]" />
      </div>
    </div>
  )
}

export function Hero({ palette, use3D, lite, onPokeball }: { palette: Palette; use3D: boolean; lite: boolean; onPokeball: () => void }) {
  return (
    <header id="top" className="relative h-[100svh] min-h-[640px] w-full overflow-hidden">
      <div className="grid-bg absolute inset-0 opacity-60" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,var(--bg)_78%)]" />
      <div className="absolute inset-0 opacity-50 md:left-[30%] md:opacity-100">
        {use3D ? (
          <Suspense fallback={<StaticCore />}>
            <HeroScene palette={palette} lite={lite} onPokeball={onPokeball} />
          </Suspense>
        ) : (
          <StaticCore />
        )}
      </div>

      {/* legibility veil behind the copy */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-full bg-gradient-to-r from-bg/90 via-bg/50 to-transparent md:w-[60%]" />

      {/* HUD readouts */}
      <div className="pointer-events-none absolute right-6 top-24 hidden text-right font-mono text-[10px] leading-5 tracking-widest text-muted lg:block">
        <div>DEFENSE-IN-DEPTH <span className="text-term">● 3 LAYERS ACTIVE</span></div>
        <div>ZERO-TRUST MESH <span className="text-neon">ENFORCED</span></div>
        <div>NHI POSTURE <span className="text-plasma">GOVERNED</span></div>
      </div>
      <div className="pointer-events-none absolute bottom-6 right-6 hidden font-mono text-[10px] tracking-widest text-muted lg:block">
        41.6488° N · 0.8891° W — ZGZ NODE
      </div>

      <div className="pointer-events-none relative z-10 mx-auto flex h-full max-w-6xl flex-col justify-center px-4 sm:px-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="mb-5 flex items-center gap-3 font-mono text-[11px] tracking-[0.25em] text-neon sm:text-xs">
          <span className="h-px w-10 bg-neon" /> SECURITY BY DESIGN · GFT
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
          className="max-w-3xl font-display text-5xl font-bold leading-[0.95] tracking-tight text-ink sm:text-7xl lg:text-8xl"
        >
          Yeray<br />
          <span className="bg-gradient-to-r from-neon via-plasma to-term bg-clip-text text-transparent">Espinosa Esteban</span>
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="mt-6 max-w-xl font-mono text-sm leading-relaxed text-ink/90 sm:text-base">
          <span className="text-neon">&gt;</span> {profile.role} @ {profile.company}
          <br />
          <span className="text-muted">{profile.headline}</span>
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }} className="pointer-events-auto mt-9 flex flex-wrap gap-3">
          <a href="#proyectos" className="group inline-flex items-center gap-2 rounded-lg bg-neon px-5 py-3 font-mono text-sm font-bold text-bg transition hover:shadow-[0_0_30px_var(--neon)]">
            Ver proyectos <ArrowIcon className="h-4 w-4 transition group-hover:translate-x-1" />
          </a>
          <a href={profile.links.linkedin} target="_blank" rel="noopener noreferrer" className="glass inline-flex items-center gap-2 rounded-lg px-5 py-3 font-mono text-sm text-ink transition hover:border-neon hover:text-neon">
            <LinkedInIcon /> LinkedIn
          </a>
          <a href={profile.links.github} target="_blank" rel="noopener noreferrer" className="glass inline-flex items-center gap-2 rounded-lg px-5 py-3 font-mono text-sm text-ink transition hover:border-neon hover:text-neon">
            <GitHubIcon /> GitHub
          </a>
        </motion.div>
        {use3D && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} transition={{ delay: 2.2 }} className="mt-8 font-mono text-[11px] text-muted">
            // algo salvaje se esconde en la red…
          </motion.p>
        )}
      </div>

      <a href="#perfil" aria-label="Bajar a perfil" className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 font-mono text-[10px] tracking-[0.3em] text-muted">
        <motion.span animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.8 }} className="block">SCROLL ↓</motion.span>
      </a>
    </header>
  )
}
