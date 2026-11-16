import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { accentHex, stack } from '../data/profile'
import { reveal, Section } from './Section'

export function Stack({ holocron }: { holocron: boolean }) {
  const [active, setActive] = useState(stack[0].id)
  const cur = stack.find((s) => s.id === active)!
  const color = (a: keyof typeof accentHex) => (holocron ? (a === 'cyan' ? '#ff3b3b' : '#ffb347') : accentHex[a])

  return (
    <Section id="stack" index="02" kicker="DEFENSE LAYERS" title="Stack por dominios">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]">
        <div role="tablist" aria-label="Dominios" className="grid gap-3">
          {stack.map((s, i) => {
            const on = s.id === active
            return (
              <motion.button
                key={s.id}
                role="tab"
                aria-selected={on}
                {...reveal}
                transition={{ delay: i * 0.06 }}
                onClick={() => setActive(s.id)}
                onMouseEnter={() => setActive(s.id)}
                className={`glass group relative overflow-hidden rounded-xl p-4 text-left transition ${on ? 'border-transparent' : 'hover:border-ink/30'}`}
                style={on ? { boxShadow: `inset 0 0 0 1px ${color(s.accent)}, 0 0 30px -10px ${color(s.accent)}` } : undefined}
              >
                <div className="flex items-center justify-between font-mono text-[10px] tracking-widest" style={{ color: color(s.accent) }}>
                  <span>{s.code}</span>
                  <span>{on ? '■ ACTIVE' : '□'}</span>
                </div>
                <div className="mt-1 font-display text-lg font-semibold text-ink">{s.title}</div>
              </motion.button>
            )
          })}
        </div>

        <div className="glass hud scanlines relative min-h-[320px] overflow-hidden rounded-2xl p-6 sm:p-8" role="tabpanel">
          <AnimatePresence mode="wait">
            <motion.div key={cur.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}>
              <div className="font-mono text-xs tracking-widest" style={{ color: color(cur.accent) }}>
                {cur.code} // {cur.title.toUpperCase()}
              </div>
              <p className="mt-3 max-w-lg text-ink/85">{cur.summary}</p>
              <ul className="mt-6 flex flex-wrap gap-2">
                {cur.items.map((it, i) => (
                  <motion.li
                    key={it}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.05 * i }}
                    className="rounded-md border px-3 py-1.5 font-mono text-xs text-ink sm:text-sm"
                    style={{ borderColor: `${color(cur.accent)}55`, background: `${color(cur.accent)}12` }}
                  >
                    {it}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </AnimatePresence>
          <motion.div
            key={`scan-${cur.id}`}
            initial={{ top: '0%' }}
            animate={{ top: '100%' }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
            className="pointer-events-none absolute inset-x-0 h-px"
            style={{ background: color(cur.accent), boxShadow: `0 0 16px ${color(cur.accent)}` }}
          />
        </div>
      </div>
    </Section>
  )
}
