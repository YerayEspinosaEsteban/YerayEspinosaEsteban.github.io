import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

type Draw = (ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => void

/** Animated CanvasTexture redrawn at `fps` (screens in the overview). fps = 0 → static. */
export function useCanvasTexture(draw: Draw, w = 512, h = 288, fps = 12) {
  const { tex, ctx } = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = w
    c.height = h
    const ctx = c.getContext('2d')!
    const tex = new THREE.CanvasTexture(c)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = 4
    return { tex, ctx }
  }, [w, h])
  const last = useRef(-1)
  useEffect(() => { draw(ctx, 0, w, h); tex.needsUpdate = true; return () => tex.dispose() }, [ctx, draw, tex, w, h])
  useFrame(({ clock }) => {
    if (fps <= 0) return
    const t = clock.elapsedTime
    if (t - last.current < 1 / fps) return
    last.current = t
    draw(ctx, t, w, h)
    tex.needsUpdate = true
  })
  return tex
}

const SANS = '"Space Grotesk", Inter, system-ui, sans-serif'
const MONO = '"JetBrains Mono", ui-monospace, monospace'
const PIXEL = '"Press Start 2P", monospace'

function round(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
}

/* ─── desk monitor: cosy desktop with the trainer card ─── */
export const drawMain: Draw = (ctx, t, w, h) => {
  const g = ctx.createLinearGradient(0, 0, 0, h)
  g.addColorStop(0, '#9fd3ff')
  g.addColorStop(1, '#e8f6ff')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)
  // rolling hills wallpaper
  ctx.fillStyle = '#8fd16a'
  ctx.beginPath(); ctx.moveTo(0, h)
  for (let x = 0; x <= w; x += 8) ctx.lineTo(x, h * 0.78 + Math.sin(x * 0.012 + 1) * h * 0.05)
  ctx.lineTo(w, h); ctx.fill()
  ctx.fillStyle = '#6cbc4c'
  ctx.beginPath(); ctx.moveTo(0, h)
  for (let x = 0; x <= w; x += 8) ctx.lineTo(x, h * 0.88 + Math.sin(x * 0.02 + 3) * h * 0.04)
  ctx.lineTo(w, h); ctx.fill()
  // drifting cloud
  const cx = ((t * 18) % (w + 160)) - 80
  ctx.fillStyle = 'rgba(255,255,255,0.9)'
  ;[[0, 0, 26], [26, -8, 30], [54, 0, 24]].forEach(([dx, dy, r]) => { ctx.beginPath(); ctx.arc(cx + dx, h * 0.18 + dy, r, 0, 7); ctx.fill() })
  // card window
  const cw = w * 0.62, ch = h * 0.56, x0 = w * 0.07, y0 = h * 0.16
  ctx.fillStyle = 'rgba(30,41,59,0.18)'
  round(ctx, x0 + 6, y0 + 8, cw, ch, 18); ctx.fill()
  ctx.fillStyle = '#fffaf0'
  round(ctx, x0, y0, cw, ch, 18); ctx.fill()
  ctx.fillStyle = '#e2574c'
  round(ctx, x0, y0, cw, h * 0.1, 18); ctx.fill()
  ctx.fillRect(x0, y0 + h * 0.05, cw, h * 0.05)
  ctx.fillStyle = '#fff'
  ctx.font = `700 ${h * 0.05}px ${SANS}`
  ctx.fillText('FICHA DE ENTRENADOR', x0 + 20, y0 + h * 0.068)
  ctx.fillStyle = '#1f2937'
  ctx.font = `700 ${h * 0.075}px ${SANS}`
  ctx.fillText('Yeray Espinosa', x0 + 22, y0 + h * 0.21)
  ctx.fillStyle = '#475569'
  ctx.font = `500 ${h * 0.045}px ${SANS}`
  ctx.fillText('Security Architect · GFT', x0 + 22, y0 + h * 0.29)
  ctx.fillText('Zaragoza, España', x0 + 22, y0 + h * 0.36)
  // badges row
  ;['#3b82f6', '#22a35a', '#f59e0b', '#e2574c'].forEach((c, i) => {
    ctx.fillStyle = c
    ctx.beginPath(); ctx.arc(x0 + 34 + i * 40, y0 + h * 0.46, 13, 0, 7); ctx.fill()
    ctx.fillStyle = 'rgba(255,255,255,0.6)'
    ctx.beginPath(); ctx.arc(x0 + 30 + i * 40, y0 + h * 0.455 - 4, 4, 0, 7); ctx.fill()
  })
  // avatar circle
  ctx.fillStyle = '#dbeafe'
  ctx.beginPath(); ctx.arc(x0 + cw - 70, y0 + h * 0.3, 46, 0, 7); ctx.fill()
  ctx.fillStyle = '#3b82f6'
  ctx.beginPath(); ctx.arc(x0 + cw - 70, y0 + h * 0.26, 18, 0, 7); ctx.fill()
  ctx.beginPath(); ctx.ellipse(x0 + cw - 70, y0 + h * 0.37, 30, 18, 0, Math.PI, 0); ctx.fill()
  // dock
  ctx.fillStyle = 'rgba(255,255,255,0.75)'
  round(ctx, w * 0.3, h * 0.88, w * 0.4, h * 0.09, 12); ctx.fill()
  ;['#3b82f6', '#22a35a', '#f59e0b', '#e2574c', '#8b5cf6'].forEach((c, i) => {
    ctx.fillStyle = c
    round(ctx, w * 0.33 + i * w * 0.07, h * 0.895, h * 0.06, h * 0.06, 6); ctx.fill()
  })
  // blinking cursor
  if (Math.floor(t * 2) % 2) {
    ctx.fillStyle = '#1f2937'
    ctx.fillRect(x0 + 22 + ctx.measureText('Zaragoza, España').width + 6, y0 + h * 0.325, 3, h * 0.045)
  }
}

/* ─── laptop: little code editor ─── */
const CODE: [string, string][] = [
  ['#7c3aed', 'const trainer = {'], ['#0f766e', "  role: 'SecArch',"], ['#0f766e', "  team: 'GFT',"], ['#b45309', '  shiftLeft: true,'], ['#334155', '}'],
  ['#64748b', '// zero-trust by default'], ['#2563eb', 'verify(identity, nhi)'], ['#16a34a', '✓ checks passed'],
]
export const drawCode: Draw = (ctx, t, w, h) => {
  ctx.fillStyle = '#fdf8ee'
  ctx.fillRect(0, 0, w, h)
  const lh = h / 10
  ctx.font = `${lh * 0.55}px ${MONO}`
  const shown = Math.floor(t * 3) % (CODE.length + 4)
  CODE.slice(0, Math.min(shown, CODE.length)).forEach(([c, s], i) => {
    ctx.fillStyle = 'rgba(100,116,139,0.6)'
    ctx.fillText(String(i + 1), 10, lh * (i + 1.3))
    ctx.fillStyle = c
    ctx.fillText(s, lh * 1.1, lh * (i + 1.3))
  })
}

/* ─── CRT television: cartridge-select attract screen ─── */
const CARTS = ['#e2574c', '#3b82f6', '#8b5cf6', '#22a35a']
export const drawTV: Draw = (ctx, t, w, h) => {
  const g = ctx.createLinearGradient(0, 0, 0, h)
  g.addColorStop(0, '#2b3a8f')
  g.addColorStop(1, '#4c2a85')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)
  // twinkling stars
  for (let i = 0; i < 40; i++) {
    const x = ((i * 97) % 100) / 100 * w, y = ((i * 57) % 100) / 100 * h * 0.5
    ctx.fillStyle = `rgba(255,255,255,${0.3 + 0.7 * Math.abs(Math.sin(t * 2 + i))})`
    ctx.fillRect(x, y, 3, 3)
  }
  ctx.textAlign = 'center'
  ctx.fillStyle = '#fde047'
  ctx.font = `${h * 0.075}px ${PIXEL}`
  ctx.fillText('PROYECTOS', w / 2, h * 0.2)
  const sel = Math.floor(t * 0.8) % 4
  CARTS.forEach((c, i) => {
    const cw = w * 0.17, ch = h * 0.34
    const x = w * 0.115 + i * w * 0.2, y = h * 0.36 - (i === sel ? 10 + Math.sin(t * 6) * 4 : 0)
    ctx.fillStyle = '#d1d5db'
    round(ctx, x, y, cw, ch, 6); ctx.fill()
    ctx.fillStyle = c
    round(ctx, x + cw * 0.12, y + ch * 0.12, cw * 0.76, ch * 0.5, 4); ctx.fill()
    ctx.fillStyle = '#9ca3af'
    for (let k = 0; k < 4; k++) ctx.fillRect(x + cw * 0.15 + k * cw * 0.2, y + ch * 0.8, cw * 0.1, ch * 0.12)
    if (i === sel) {
      ctx.strokeStyle = '#fde047'
      ctx.lineWidth = 4
      round(ctx, x - 6, y - 6, cw + 12, ch + 12, 8); ctx.stroke()
    }
  })
  ctx.fillStyle = '#fff'
  ctx.font = `${h * 0.045}px ${PIXEL}`
  if (Math.floor(t * 1.6) % 2 === 0) ctx.fillText('PULSA START', w / 2, h * 0.88)
  ctx.textAlign = 'left'
  // scanlines + vignette (CRT)
  ctx.fillStyle = 'rgba(0,0,0,0.14)'
  for (let y = 0; y < h; y += 3) ctx.fillRect(0, y, w, 1)
  const v = ctx.createRadialGradient(w / 2, h / 2, h * 0.3, w / 2, h / 2, w * 0.7)
  v.addColorStop(0, 'rgba(0,0,0,0)')
  v.addColorStop(1, 'rgba(0,0,0,0.45)')
  ctx.fillStyle = v
  ctx.fillRect(0, 0, w, h)
}

/* ─── landscape painting above the bed ─── */
export const drawPainting: Draw = (ctx, _t, w, h) => {
  const sky = ctx.createLinearGradient(0, 0, 0, h)
  sky.addColorStop(0, '#9fd3ff')
  sky.addColorStop(0.7, '#fff1c9')
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, w, h)
  ctx.fillStyle = '#fff6d6'
  ctx.beginPath(); ctx.arc(w * 0.78, h * 0.26, h * 0.1, 0, 7); ctx.fill()
  ctx.fillStyle = '#9aa9c8'
  ctx.beginPath(); ctx.moveTo(0, h * 0.62); ctx.lineTo(w * 0.22, h * 0.3); ctx.lineTo(w * 0.42, h * 0.58); ctx.lineTo(w * 0.6, h * 0.36); ctx.lineTo(w, h * 0.66); ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.fill()
  ctx.fillStyle = '#ffffff'
  ctx.beginPath(); ctx.moveTo(w * 0.22, h * 0.3); ctx.lineTo(w * 0.17, h * 0.38); ctx.lineTo(w * 0.27, h * 0.38); ctx.fill()
  ctx.fillStyle = '#7cc457'
  ctx.beginPath(); ctx.moveTo(0, h * 0.75)
  for (let x = 0; x <= w; x += 6) ctx.lineTo(x, h * 0.72 + Math.sin(x * 0.02) * h * 0.05)
  ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.fill()
  ctx.fillStyle = '#4f9a3a'
  ;[0.15, 0.3, 0.85].forEach((x) => { ctx.beginPath(); ctx.arc(w * x, h * 0.74, h * 0.08, 0, 7); ctx.fill() })
  // brush texture
  for (let i = 0; i < 900; i++) {
    ctx.fillStyle = `rgba(${i % 2 ? '255,255,255' : '0,0,0'},0.035)`
    ctx.fillRect((i * 37) % w, (i * 53) % h, 6, 2)
  }
}

/* ─── framed diploma on the shelf ─── */
export const drawDiploma: Draw = (ctx, _t, w, h) => {
  ctx.fillStyle = '#fdf6e3'
  ctx.fillRect(0, 0, w, h)
  ctx.strokeStyle = '#b45309'
  ctx.lineWidth = 8
  ctx.strokeRect(12, 12, w - 24, h - 24)
  ctx.textAlign = 'center'
  ctx.fillStyle = '#78350f'
  ctx.font = `700 ${h * 0.14}px Georgia, serif`
  ctx.fillText('DAM', w / 2, h * 0.38)
  ctx.font = `italic ${h * 0.085}px Georgia, serif`
  ctx.fillText('Mención Honorífica', w / 2, h * 0.58)
  ctx.font = `${h * 0.07}px Georgia, serif`
  ctx.fillText('Centro San Valero · 2026', w / 2, h * 0.76)
  ctx.fillStyle = '#dc2626'
  ctx.beginPath(); ctx.arc(w * 0.82, h * 0.82, h * 0.08, 0, 7); ctx.fill()
  ctx.textAlign = 'left'
}

/* ─── region map pinned on the cork board ─── */
export const drawMap: Draw = (ctx, _t, w, h) => {
  ctx.fillStyle = '#9fd3ff'
  ctx.fillRect(0, 0, w, h)
  ctx.fillStyle = '#b9e28c'
  ctx.beginPath()
  ctx.moveTo(w * 0.08, h * 0.2); ctx.bezierCurveTo(w * 0.4, h * 0.02, w * 0.7, h * 0.15, w * 0.92, h * 0.25)
  ctx.bezierCurveTo(w * 0.98, h * 0.6, w * 0.8, h * 0.95, w * 0.5, h * 0.9)
  ctx.bezierCurveTo(w * 0.2, h * 0.92, w * 0.02, h * 0.6, w * 0.08, h * 0.2); ctx.fill()
  ctx.fillStyle = '#7cc457'
  ;[[0.3, 0.35, 0.1], [0.65, 0.6, 0.12], [0.5, 0.3, 0.07]].forEach(([x, y, r]) => { ctx.beginPath(); ctx.arc(w * x, h * y, w * r, 0, 7); ctx.fill() })
  ctx.strokeStyle = '#d6a75a'
  ctx.lineWidth = 6
  ctx.setLineDash([])
  ctx.beginPath(); ctx.moveTo(w * 0.2, h * 0.7); ctx.lineTo(w * 0.42, h * 0.48); ctx.lineTo(w * 0.62, h * 0.5); ctx.lineTo(w * 0.8, h * 0.32); ctx.stroke()
  ;[[0.2, 0.7, '#e2574c'], [0.42, 0.48, '#3b82f6'], [0.62, 0.5, '#f59e0b'], [0.8, 0.32, '#22a35a']].forEach(([x, y, c]) => {
    ctx.fillStyle = '#fff'
    ctx.fillRect(w * (x as number) - 11, h * (y as number) - 11, 22, 22)
    ctx.fillStyle = c as string
    ctx.fillRect(w * (x as number) - 8, h * (y as number) - 8, 16, 16)
  })
}

/* ─── handwritten sticky note ─── */
export const makeNote = (title: string, lines: string[], bg: string): Draw => (ctx, _t, w, h) => {
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, w, h)
  ctx.fillStyle = 'rgba(0,0,0,0.06)'
  ctx.fillRect(0, 0, w, h * 0.16)
  ctx.fillStyle = '#1f2937'
  ctx.font = `700 ${h * 0.12}px ${SANS}`
  ctx.fillText(title, w * 0.08, h * 0.32)
  ctx.font = `500 ${h * 0.085}px ${SANS}`
  ctx.fillStyle = '#334155'
  lines.forEach((l, i) => ctx.fillText(l, w * 0.08, h * (0.5 + i * 0.14)))
}
