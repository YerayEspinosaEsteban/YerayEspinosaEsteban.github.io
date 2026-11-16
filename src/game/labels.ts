import { useGame } from './store'
import type { ZoneId } from './zones'

/** Height (world units above ground) of each zone's floating name tag. */
export const LABEL_HEIGHT: Record<ZoneId, number> = { base: 5.2, fortress: 5.2, hangar: 3.6, gym: 4, secret: 3.6 }

/** DOM label elements, registered by ui/ZoneLabels and positioned every frame from the 3D scene. */
export const labelEls: Partial<Record<ZoneId, HTMLDivElement | null>> = {}

/** Clicking a zone: inspect it if we're there, otherwise run to it. */
export function activateZone(id: ZoneId) {
  const s = useGame.getState()
  if (!s.started || s.open || s.encounter) return
  if (s.near === id) s.openZone(id)
  else s.goTo(id)
}
