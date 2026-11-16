import { AnimatePresence, motion } from 'framer-motion'
import { useEffect } from 'react'
import { profile } from '../data/profile'

// Easter egg "trainer card". Stats are playful flavour, not a self-assessment.
const stats = [
  ['Cloud Sec', 92],
  ['DevSecOps', 90],
  ['Blue Team', 86],
  ['AI Security', 88],
  ['Dev Full-Stack', 87],
  ['Curiosidad', 100],
] as const

const moves = [
  ['Shift-Left Strike', 'Tipo Diseño'],
  ['Policy-as-Code', 'Tipo Cloud'],
  ['OIDC Lock', 'Tipo Pipeline'],
  ['SOAR Surge', 'Tipo Blue Team'],
]

export function Pokedex({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] grid place-items-center bg-black/70 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="Pokédex del entrenador"
        >
          <motion.div
            initial={{ scale: 0.6, rotateX: 40, opacity: 0 }}
            animate={{ scale: 1, rotateX: 0, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 180, damping: 18 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md overflow-hidden rounded-3xl border-2 border-[#ff3355]/70 bg-[#12060b]/95 shadow-[0_0_60px_rgba(255,51,85,0.35)]"
          >
            <div className="flex items-center gap-3 bg-gradient-to-r from-[#ff3355] to-[#b3123a] px-5 py-4">
              <span className="h-10 w-10 rounded-full border-4 border-white/80 bg-[radial-gradient(circle_at_35%_35%,#bff6ff,#22e6ff_45%,#0a5a7a)] shadow-[0_0_20px_#22e6ff]" />
              <span className="h-3 w-3 rounded-full bg-red-300" />
              <span className="h-3 w-3 rounded-full bg-yellow-300" />
              <span className="h-3 w-3 rounded-full bg-green-300" />
              <span className="ml-auto font-mono text-xs font-bold tracking-widest text-white">HOLO-DEX</span>
            </div>
            <div className="p-5 font-mono">
              <div className="scanlines relative rounded-xl border border-[#22e6ff]/40 bg-[#041218] p-4">
                <div className="text-[10px] tracking-widest text-[#22e6ff]">#0001 · ENTRENADOR / ARQUITECTO</div>
                <div className="mt-1 font-display text-2xl font-bold text-white">{profile.shortName}</div>
                <div className="mt-2 flex gap-2 text-[10px] font-bold uppercase">
                  <span className="rounded-full bg-[#22e6ff] px-2.5 py-0.5 text-black">Security</span>
                  <span className="rounded-full bg-[#a15bff] px-2.5 py-0.5 text-white">Cloud</span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-white/80">
                  <div>Habilidad: <span className="text-[#3dff9a]">Shift-Left</span></div>
                  <div>Oculta: <span className="text-[#3dff9a]">Zero-Trust</span></div>
                  <div>Región: <span className="text-white">Zaragoza</span></div>
                  <div>Gimnasio: <span className="text-white">GFT</span></div>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {stats.map(([label, v], i) => (
                  <div key={label} className="grid grid-cols-[110px_1fr_32px] items-center gap-2 text-[11px] text-white/80">
                    <span>{label}</span>
                    <div className="h-2 overflow-hidden rounded-full bg-white/10">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${v}%` }}
                        transition={{ delay: 0.3 + i * 0.08, duration: 0.8 }}
                        className="h-full rounded-full bg-gradient-to-r from-[#22e6ff] to-[#3dff9a]"
                      />
                    </div>
                    <span className="text-right text-white">{v}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {moves.map(([m, t]) => (
                  <div key={m} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                    <div className="text-xs text-white">{m}</div>
                    <div className="text-[10px] text-white/50">{t}</div>
                  </div>
                ))}
              </div>
              <button onClick={onClose} className="mt-5 w-full rounded-lg border border-[#ff3355]/60 py-2 text-xs tracking-widest text-[#ff8099] transition hover:bg-[#ff3355]/15">
                CERRAR [ESC]
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
