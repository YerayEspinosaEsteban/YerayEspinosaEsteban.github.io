import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

export function Section({ id, index, title, kicker, children }: { id: string; index: string; title: string; kicker?: string; children: ReactNode }) {
  return (
    <section id={id} className="relative mx-auto w-full max-w-6xl scroll-mt-24 px-4 py-24 sm:px-6 md:py-32">
      <motion.header
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="mb-12"
      >
        <div className="mb-3 flex items-center gap-3 font-mono text-xs tracking-[0.3em] text-neon">
          <span>{index}</span>
          <span className="h-px w-12 bg-neon/60" />
          <span className="text-muted">{kicker}</span>
        </div>
        <h2 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-5xl">{title}</h2>
      </motion.header>
      {children}
    </section>
  )
}

export const reveal = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
}
