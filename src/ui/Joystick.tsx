import { useRef, useState, type PointerEvent } from 'react'
import { input } from '../game/input'
import { useGame } from '../game/store'

/** Virtual thumbstick + action buttons for touch devices. */
export function Joystick() {
  const base = useRef<HTMLDivElement>(null)
  const [knob, setKnob] = useState({ x: 0, y: 0 })
  const near = useGame((s) => s.near)
  const openZone = useGame((s) => s.openZone)
  const RADIUS = 46

  const update = (e: PointerEvent) => {
    const r = base.current!.getBoundingClientRect()
    let dx = e.clientX - (r.left + r.width / 2)
    let dy = e.clientY - (r.top + r.height / 2)
    const l = Math.hypot(dx, dy)
    if (l > RADIUS) { dx = (dx / l) * RADIUS; dy = (dy / l) * RADIUS }
    setKnob({ x: dx, y: dy })
    input.joy.x = dx / RADIUS
    input.joy.y = -dy / RADIUS
  }
  const end = () => { setKnob({ x: 0, y: 0 }); input.joy.x = 0; input.joy.y = 0 }

  return (
    <div className="no-print pointer-events-none fixed inset-x-0 bottom-[84px] z-30 flex items-end justify-between px-5">
      <div
        ref={base}
        className="pointer-events-auto relative h-[120px] w-[120px] touch-none rounded-full border-2 border-white/60 bg-slate-900/45 backdrop-blur-sm"
        onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); update(e) }}
        onPointerMove={(e) => e.buttons && update(e)}
        onPointerUp={end}
        onPointerCancel={end}
        aria-label="Joystick de movimiento"
      >
        <div className="absolute left-1/2 top-1/2 h-14 w-14 rounded-full border-2 border-white bg-cyan-400/80 shadow-[0_0_20px_#22d3ee]" style={{ transform: `translate(calc(-50% + ${knob.x}px), calc(-50% + ${knob.y}px))` }} />
      </div>
      <div className="pointer-events-auto flex flex-col items-center gap-3">
        {near && (
          <button onClick={() => openZone(near)} className="pixel grid h-16 w-16 place-items-center rounded-full border-2 border-white bg-amber-400 text-[12px] text-slate-900 shadow-lg active:scale-95">E</button>
        )}
        <button onPointerDown={() => (input.jump = true)} className="pixel grid h-16 w-16 touch-none place-items-center rounded-full border-2 border-white bg-rose-500/90 text-[9px] text-white shadow-lg active:scale-95" aria-label="Saltar">
          JUMP
        </button>
      </div>
    </div>
  )
}
