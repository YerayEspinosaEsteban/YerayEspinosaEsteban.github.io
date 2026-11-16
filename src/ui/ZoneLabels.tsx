import { activateZone, labelEls } from '../game/labels'
import { useGame } from '../game/store'
import { ZONES } from '../game/zones'

/** Floating name tags over each building; positioned by LabelProjector inside the canvas. */
export function ZoneLabels() {
  const near = useGame((s) => s.near)
  const visited = useGame((s) => s.visited)
  const started = useGame((s) => s.started)
  return (
    <div className="no-print pointer-events-none fixed inset-0 z-20 overflow-hidden" aria-hidden={!started}>
      {ZONES.map((z) => {
        const seen = visited.includes(z.id)
        return (
          <div
            key={z.id}
            ref={(el) => { labelEls[z.id] = el }}
            className="absolute left-0 top-0 select-none"
            style={{ opacity: 0, willChange: 'transform' }}
          >
            <button onClick={() => activateZone(z.id)} className="zone-label whitespace-nowrap" style={{ ['--zc' as string]: z.color }} tabIndex={-1}>
              <span className="mr-1">{z.icon}</span>
              {z.id === 'secret' && !seen ? '???' : z.name}
              {seen && <span className="ml-1 text-emerald-300">✓</span>}
            </button>
            {near === z.id && <div className="zone-hint">[E] inspeccionar</div>}
          </div>
        )
      })}
    </div>
  )
}
