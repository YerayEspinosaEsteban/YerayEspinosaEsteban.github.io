import { useEffect, useMemo, useState } from 'react'
import { sfx } from '../game/sfx'
import { useGame } from '../game/store'
import { FUN_FACTS } from './ZoneDialog'
import { useTypewriter } from './Typewriter'

type Enemy = { name: string; type: string; counter: string; color: string }

const ENEMIES: Enemy[] = [
  { name: 'BUCKET S3 PÚBLICO', type: 'CLOUD', counter: 'POLICY-AS-CODE', color: '#f97316' },
  { name: 'SECRETO EN REPO', type: 'LEAK', counter: 'OIDC LOCK', color: '#ef4444' },
  { name: 'TOKEN ETERNO', type: 'IDENTIDAD', counter: 'NHI GOVERNANCE', color: '#eab308' },
  { name: 'CONTENEDOR ROOT', type: 'RUNTIME', counter: 'CONTAINER SCAN', color: '#3b82f6' },
  { name: 'PROMPT INJECTION', type: 'IA', counter: 'AI GUARDRAILS', color: '#a855f7' },
  { name: 'ALERTA FANTASMA', type: 'SOC', counter: 'SOAR SURGE', color: '#14b8a6' },
]
const ALL_MOVES = ['SECURITY-BY-DESIGN', 'POLICY-AS-CODE', 'OIDC LOCK', 'NHI GOVERNANCE', 'CONTAINER SCAN', 'AI GUARDRAILS', 'SOAR SURGE', 'SHIFT-LEFT']

type Phase = 'intro' | 'menu' | 'moves' | 'text'

function Bug({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 64 64" className="h-full w-full drop-shadow-[0_6px_0_rgba(0,0,0,0.25)]" shapeRendering="crispEdges" aria-hidden="true">
      <rect x="18" y="20" width="28" height="30" fill={color} />
      <rect x="22" y="12" width="20" height="10" fill={color} />
      <rect x="24" y="16" width="5" height="5" fill="#fff" /><rect x="35" y="16" width="5" height="5" fill="#fff" />
      <rect x="26" y="18" width="2" height="2" fill="#000" /><rect x="37" y="18" width="2" height="2" fill="#000" />
      <rect x="10" y="24" width="8" height="3" fill="#1f2937" /><rect x="46" y="24" width="8" height="3" fill="#1f2937" />
      <rect x="8" y="34" width="10" height="3" fill="#1f2937" /><rect x="46" y="34" width="10" height="3" fill="#1f2937" />
      <rect x="10" y="44" width="8" height="3" fill="#1f2937" /><rect x="46" y="44" width="8" height="3" fill="#1f2937" />
      <rect x="24" y="6" width="3" height="7" fill="#1f2937" /><rect x="37" y="6" width="3" height="7" fill="#1f2937" />
      <rect x="29" y="28" width="6" height="12" fill="#fff" /><rect x="29" y="42" width="6" height="4" fill="#fff" />
    </svg>
  )
}

function Hero() {
  return (
    <svg viewBox="0 0 64 64" className="h-full w-full" shapeRendering="crispEdges" aria-hidden="true">
      <rect x="18" y="34" width="28" height="26" fill="#2d3e78" />
      <rect x="20" y="36" width="24" height="18" fill="#334155" />
      <rect x="24" y="42" width="16" height="3" fill="#22d3ee" />
      <rect x="16" y="10" width="32" height="26" fill="#f2c38f" />
      <rect x="14" y="8" width="36" height="14" fill="#3b2416" />
      <rect x="16" y="22" width="32" height="4" fill="#3b2416" />
      <rect x="40" y="36" width="2" height="12" fill="#94a3b8" /><rect x="39" y="32" width="4" height="4" fill="#f43f5e" />
    </svg>
  )
}

function HpBox({ name, lvl, hp, align }: { name: string; lvl: number; hp: number; align: 'l' | 'r' }) {
  const col = hp > 50 ? '#22c55e' : hp > 20 ? '#eab308' : '#ef4444'
  return (
    <div className={`rpg-light w-[min(260px,60vw)] px-3 py-2 ${align === 'r' ? 'ml-auto' : ''}`}>
      <div className="pixel flex justify-between text-[9px] sm:text-[10px]"><span className="truncate">{name}</span><span>Nv{lvl}</span></div>
      <div className="mt-1.5 flex items-center gap-2">
        <span className="pixel text-[8px] text-amber-600">PS</span>
        <div className="h-2.5 flex-1 rounded-full border-2 border-slate-800 bg-slate-200">
          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${hp}%`, background: col }} />
        </div>
      </div>
    </div>
  )
}

export function Encounter() {
  const active = useGame((s) => s.encounter)
  return active ? <Battle /> : null
}

function Battle() {
  const close = useGame((s) => s.close)
  const enemy = useMemo(() => ENEMIES[Math.floor(Math.random() * ENEMIES.length)], [])
  const moves = useMemo(() => {
    const others = ALL_MOVES.filter((m) => m !== enemy.counter).sort(() => Math.random() - 0.5).slice(0, 3)
    return [...others, enemy.counter].sort(() => Math.random() - 0.5)
  }, [enemy])
  const fact = useMemo(() => FUN_FACTS[Math.floor(Math.random() * FUN_FACTS.length)], [])

  const [phase, setPhase] = useState<Phase>('intro')
  const [queue, setQueue] = useState<string[]>([`¡Un ${enemy.name} salvaje apareció!`])
  const [enemyHp, setEnemyHp] = useState(100)
  const [hit, setHit] = useState(false)
  const [after, setAfter] = useState<'menu' | 'close'>('menu')
  const msg = queue[0] ?? ''
  const { shown, done, skip } = useTypewriter(msg, 24)

  const say = (lines: string[], then: 'menu' | 'close') => { setQueue(lines); setAfter(then); setPhase('text') }

  const advance = () => {
    if (phase === 'menu' || phase === 'moves') return
    if (!done) return skip()
    sfx.blip(990, 0.04)
    if (queue.length > 1) {
      const next = queue.slice(1)
      setQueue(next)
      if (next[0].startsWith('¡Es súper') || next[0].startsWith('Es eficaz')) { setEnemyHp(0); setHit(true); sfx.hit() }
      if (next[0].includes('se debilitó')) sfx.win()
      return
    }
    if (phase === 'intro' || after === 'menu') { setPhase('menu'); return }
    close()
  }

  const attack = (m: string) => {
    const strong = m === enemy.counter || m === 'SECURITY-BY-DESIGN'
    say([`¡YERAY usó ${m}!`, strong ? '¡Es súper eficaz!' : 'Es eficaz. (Defensa en profundidad: siempre hay otra capa.)', `¡${enemy.name} se debilitó!`, `DATO DESBLOQUEADO: ${fact}`], 'close')
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'e' || e.key === 'E') { e.preventDefault(); advance() }
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const menu: [string, () => void][] = [
    ['LUCHAR', () => setPhase('moves')],
    ['MOCHILA', () => say(['Abres la MOCHILA táctica…', 'Contiene: Wazuh, TheHive, MISP, SonarQube, Fortify, Prisma Cloud y JFrog Xray.'], 'menu')],
    ['EQUIPO', () => say(['Tu equipo está listo:', 'AWS, Azure, Red Hat OpenShift y una política Zero-Trust bien entrenada.'], 'menu')],
    ['HUIR', () => say(['¡No se puede huir de una auditoría!', '…bueno, por esta vez sí. ¡Escapaste sin problemas!'], 'close')],
  ]

  return (
    <div className="no-print wipe fixed inset-0 z-50 flex flex-col bg-[#f4f1e1]" role="dialog" aria-modal="true" aria-label="Encuentro salvaje" onClick={advance}>
      <div className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'repeating-linear-gradient(0deg,#000 0 2px,transparent 2px 4px)' }} />
      <div className="relative mx-auto flex w-full max-w-3xl flex-1 flex-col justify-between px-4 pb-3 pt-6 sm:pt-10">
        {/* enemy */}
        <div className="flex items-start justify-between gap-4">
          <HpBox name={enemy.name} lvl={99} hp={enemyHp} align="l" />
          <div className="relative mr-2 sm:mr-10">
            <div className={`h-28 w-28 sm:h-40 sm:w-40 ${hit ? 'shake flash' : ''} ${enemyHp === 0 && queue.length <= 2 ? 'translate-y-8 opacity-0 transition-all duration-700' : ''}`}>
              <Bug color={enemy.color} />
            </div>
            <div className="mx-auto -mt-3 h-5 w-36 rounded-[50%] bg-[#c9c3a3] sm:w-48" />
          </div>
        </div>
        {/* hero */}
        <div className="flex items-end justify-between gap-4">
          <div className="relative ml-2 sm:ml-10">
            <div className="h-28 w-28 sm:h-40 sm:w-40"><Hero /></div>
            <div className="mx-auto -mt-3 h-5 w-36 rounded-[50%] bg-[#c9c3a3] sm:w-48" />
          </div>
          <HpBox name="YERAY" lvl={20} hp={100} align="r" />
        </div>
      </div>
      {/* text box / menu */}
      <div className="relative mx-auto mb-4 grid w-[calc(100%-1.5rem)] max-w-3xl gap-3 sm:grid-cols-[1fr_auto]">
        <div className="rpg-light min-h-[96px] p-4" aria-live="polite">
          {phase === 'menu' ? (
            <p className="pixel text-[11px] leading-7">¿Qué debe hacer YERAY?</p>
          ) : phase === 'moves' ? (
            <p className="pixel text-[10px] leading-7">TIPO del rival: <b>{enemy.type}</b>. Elige un movimiento.</p>
          ) : (
            <p className="pixel text-[10px] leading-7 sm:text-[11px]">{shown}{done && <span className="blink"> ▼</span>}</p>
          )}
        </div>
        {(phase === 'menu' || phase === 'moves') && (
          <div className="rpg-light grid grid-cols-2 gap-1 p-3 sm:w-[340px]" onClick={(e) => e.stopPropagation()}>
            {phase === 'menu'
              ? menu.map(([l, fn]) => (
                  <button key={l} onClick={() => { sfx.blip(); fn() }} className="pixel rounded px-2 py-2 text-left text-[10px] hover:bg-slate-900 hover:text-white">▸ {l}</button>
                ))
              : moves.map((m) => (
                  <button key={m} onClick={() => { sfx.blip(); attack(m) }} className="pixel rounded px-2 py-2 text-left text-[8px] leading-4 hover:bg-slate-900 hover:text-white">▸ {m}</button>
                ))}
          </div>
        )}
      </div>
    </div>
  )
}
