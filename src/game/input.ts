/** Global input state, polled by the player controller every frame. */
export const input = {
  keys: new Set<string>(),
  joy: { x: 0, y: 0 },
  jump: false,
  dragYaw: 0,
}

const MOVE_KEYS = new Set(['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ShiftLeft', 'ShiftRight', 'Space'])

let bound = false
export function bindKeyboard() {
  if (bound) return
  bound = true
  window.addEventListener('keydown', (e) => {
    const t = e.target as HTMLElement
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return
    if (MOVE_KEYS.has(e.code)) {
      e.preventDefault()
      if (e.code === 'Space' && !e.repeat) input.jump = true
      input.keys.add(e.code)
    }
  })
  window.addEventListener('keyup', (e) => input.keys.delete(e.code))
  window.addEventListener('blur', () => input.keys.clear())
}

export const k = (...codes: string[]) => codes.some((c) => input.keys.has(c))
