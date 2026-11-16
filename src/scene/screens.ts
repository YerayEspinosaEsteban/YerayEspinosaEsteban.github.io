import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

type Draw = (ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => void

/** Animated CanvasTexture redrawn at `fps` (screens in the overview). */
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

const MONO = '"JetBrains Mono", ui-monospace, monospace'
const PIXEL = '"Press Start 2P", monospace'

function scanlines(ctx: CanvasRenderingContext2D, w: number, h: number, a = 0.08) {
  ctx.fillStyle = `rgba(0,0,0,${a})`
  for (let y = 0; y < h; y += 3) ctx.fillRect(0, y, w, 1)
}

/* ─── main monitor: profile splash ─── */
export const drawMain: Draw = (ctx, t, w, h) => {
  const g = ctx.createLinearGradient(0, 0, w, h)
  g.addColorStop(0, '#071425')
  g.addColorStop(1, '#170a2b')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)
  // radar
  const cx = w * 0.8, cy = h * 0.52, r = h * 0.3
  ctx.strokeStyle = 'rgba(34,211,238,0.35)'
  ctx.lineWidth = 2
  for (let i = 1; i <= 3; i++) { ctx.beginPath(); ctx.arc(cx, cy, (r * i) / 3, 0, Math.PI * 2); ctx.stroke() }
  const a = t * 1.6
  ctx.fillStyle = 'rgba(34,211,238,0.25)'
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r, a, a + 0.5); ctx.closePath(); ctx.fill()
  ctx.fillStyle = '#f472b6'
  ctx.beginPath(); ctx.arc(cx + Math.cos(2.1) * r * 0.6, cy + Math.sin(2.1) * r * 0.6, 4, 0, 7); ctx.fill()
  // text
  ctx.fillStyle = '#22d3ee'
  ctx.font = `600 ${h * 0.055}px ${MONO}`
  ctx.fillText('> whoami', w * 0.06, h * 0.2)
  ctx.fillStyle = '#ffffff'
  ctx.font = `700 ${h * 0.13}px ${MONO}`
  ctx.fillText('YERAY', w * 0.06, h * 0.42)
  ctx.fillText('ESPINOSA', w * 0.06, h * 0.58)
  ctx.fillStyle = '#c4b5fd'
  ctx.font = `500 ${h * 0.052}px ${MONO}`
  ctx.fillText('Security Architect · GFT', w * 0.06, h * 0.72)
  if (Math.floor(t * 2) % 2 === 0) { ctx.fillStyle = '#22d3ee'; ctx.fillRect(w * 0.06, h * 0.8, h * 0.035, h * 0.06) }
  ctx.fillStyle = 'rgba(255,255,255,0.55)'
  ctx.font = `${h * 0.04}px ${MONO}`
  ctx.fillText('[ click → abrir perfil ]', w * 0.13, h * 0.85)
  scanlines(ctx, w, h)
}

/* ─── left monitor: scrolling code ─── */
const CODE = [
  ['#c084fc', 'resource'], ['#e2e8f0', ' "aws_iam_role" "ci" {'], ['#94a3b8', '  # OIDC: no long-lived keys'], ['#22d3ee', '  assume_role_policy = oidc()'],
  ['#e2e8f0', '}'], ['#c084fc', 'policy'], ['#e2e8f0', ' "deny-public-s3" {'], ['#4ade80', '  effect = "DENY"'], ['#e2e8f0', '}'],
  ['#94a3b8', '# pipeline gates'], ['#fbbf24', 'sast:   sonarqube'], ['#fbbf24', 'sca:    jfrog-xray'], ['#fbbf24', 'image:  prisma-cloud'],
  ['#f472b6', 'if (risk > threshold)'], ['#e2e8f0', '  block(deploy)'], ['#94a3b8', '// zero-trust by default'], ['#22d3ee', 'verify(identity, nhi)'],
  ['#4ade80', '✓ all checks passed'],
]
export const drawCode: Draw = (ctx, t, w, h) => {
  ctx.fillStyle = '#0a0f1c'
  ctx.fillRect(0, 0, w, h)
  const lh = h / 22
  const off = (t * 22) % (CODE.length * lh)
  ctx.font = `${lh * 0.62}px ${MONO}`
  for (let i = -1; i < 26; i++) {
    const idx = ((i + Math.floor(off / lh)) % CODE.length + CODE.length) % CODE.length
    const y = i * lh - (off % lh) + lh
    ctx.fillStyle = 'rgba(148,163,184,0.4)'
    ctx.fillText(String(idx + 1).padStart(2, ' '), 8, y)
    ctx.fillStyle = CODE[idx][0]
    ctx.fillText(CODE[idx][1], lh * 1.6, y)
  }
  scanlines(ctx, w, h, 0.06)
}

/* ─── right monitor: SIEM dashboard ─── */
export const drawDash: Draw = (ctx, t, w, h) => {
  ctx.fillStyle = '#0b1020'
  ctx.fillRect(0, 0, w, h)
  ctx.fillStyle = '#a78bfa'
  ctx.font = `700 ${h * 0.07}px ${MONO}`
  ctx.fillText('SIEM · LIVE', w * 0.04, h * 0.12)
  ctx.fillStyle = '#4ade80'
  ctx.fillText(`● ${(1200 + Math.floor(t * 37) % 400).toString()} ev/s`, w * 0.55, h * 0.12)
  // line chart
  ctx.strokeStyle = '#22d3ee'
  ctx.lineWidth = 3
  ctx.beginPath()
  for (let x = 0; x <= 40; x++) {
    const v = 0.5 + Math.sin(x * 0.5 + t * 2) * 0.18 + Math.sin(x * 1.3 + t * 3.1) * 0.08
    const px = w * 0.04 + (x / 40) * w * 0.92
    const py = h * 0.2 + (1 - v) * h * 0.4
    x ? ctx.lineTo(px, py) : ctx.moveTo(px, py)
  }
  ctx.stroke()
  // bars
  const cols = ['#f472b6', '#fbbf24', '#a78bfa', '#4ade80', '#22d3ee', '#f472b6']
  for (let i = 0; i < 6; i++) {
    const v = 0.3 + 0.6 * Math.abs(Math.sin(t * 1.3 + i * 1.7))
    ctx.fillStyle = cols[i]
    ctx.fillRect(w * 0.05 + i * w * 0.155, h * 0.95 - v * h * 0.3, w * 0.1, v * h * 0.3)
  }
  scanlines(ctx, w, h, 0.06)
}

/* ─── arcade attract mode ─── */
const STARS = Array.from({ length: 70 }, (_, i) => [((i * 97) % 100) / 100, ((i * 57) % 100) / 100, 0.3 + ((i * 13) % 10) / 10] as const)
export const drawArcade: Draw = (ctx, t, w, h) => {
  ctx.fillStyle = '#05010f'
  ctx.fillRect(0, 0, w, h)
  for (const [x, y, s] of STARS) {
    ctx.fillStyle = `rgba(255,255,255,${0.4 + 0.6 * s})`
    ctx.fillRect(x * w, ((y + t * 0.06 * s) % 1) * h, 2 * s + 1, 2 * s + 1)
  }
  // pixel shield sprite
  const px = h * 0.03, sx = w / 2 - px * 5, sy = h * 0.14
  const shield = ['0011111100', '0111111110', '1111001111', '1110000111', '1111001111', '0111111110', '0011111100', '0001111000', '0000110000']
  shield.forEach((row, ry) => [...row].forEach((c, rx) => {
    if (c === '1') { ctx.fillStyle = ry % 2 ? '#22d3ee' : '#67e8f9'; ctx.fillRect(sx + rx * px, sy + ry * px, px, px) }
  }))
  ctx.textAlign = 'center'
  ctx.fillStyle = '#f472b6'
  ctx.font = `${h * 0.085}px ${PIXEL}`
  ctx.fillText('PROJECTS', w / 2, h * 0.6)
  ctx.fillStyle = '#fbbf24'
  ctx.font = `${h * 0.045}px ${PIXEL}`
  if (Math.floor(t * 1.6) % 2 === 0) ctx.fillText('INSERT COIN', w / 2, h * 0.75)
  ctx.fillStyle = 'rgba(255,255,255,0.6)'
  ctx.font = `${h * 0.032}px ${PIXEL}`
  ctx.fillText('4 LEVELS · 1 PLAYER', w / 2, h * 0.88)
  ctx.textAlign = 'left'
  scanlines(ctx, w, h, 0.18)
}

/* ─── static wall poster ─── */
export const drawPoster: Draw = (ctx, _t, w, h) => {
  const g = ctx.createLinearGradient(0, 0, 0, h)
  g.addColorStop(0, '#1e1b4b')
  g.addColorStop(1, '#0f172a')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)
  ctx.strokeStyle = '#22d3ee'
  ctx.lineWidth = 6
  ctx.strokeRect(14, 14, w - 28, h - 28)
  // shield
  ctx.fillStyle = '#22d3ee'
  ctx.beginPath()
  const cx = w / 2, top = h * 0.14
  ctx.moveTo(cx, top); ctx.lineTo(cx + w * 0.22, top + h * 0.07); ctx.lineTo(cx + w * 0.2, top + h * 0.25)
  ctx.quadraticCurveTo(cx + w * 0.12, top + h * 0.36, cx, top + h * 0.42)
  ctx.quadraticCurveTo(cx - w * 0.12, top + h * 0.36, cx - w * 0.2, top + h * 0.25)
  ctx.lineTo(cx - w * 0.22, top + h * 0.07); ctx.closePath(); ctx.fill()
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(cx - w * 0.04, top + h * 0.16, w * 0.08, h * 0.12)
  ctx.beginPath(); ctx.arc(cx, top + h * 0.16, w * 0.06, Math.PI, 0); ctx.lineWidth = 10; ctx.strokeStyle = '#0f172a'; ctx.stroke()
  ctx.textAlign = 'center'
  ctx.fillStyle = '#ffffff'
  ctx.font = `700 ${h * 0.085}px ${MONO}`
  ctx.fillText('ZERO', cx, h * 0.7)
  ctx.fillText('TRUST', cx, h * 0.79)
  ctx.fillStyle = '#f472b6'
  ctx.font = `${h * 0.032}px ${MONO}`
  ctx.fillText('never trust · always verify', cx, h * 0.88)
  ctx.textAlign = 'left'
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

/* ─── floor tiles with a tactical grid ─── */
export function makeGridTexture() {
  const s = 512
  const c = document.createElement('canvas')
  c.width = c.height = s
  const ctx = c.getContext('2d')!
  ctx.fillStyle = '#10131f'
  ctx.fillRect(0, 0, s, s)
  ctx.fillStyle = '#141828'
  ctx.fillRect(4, 4, s / 2 - 8, s / 2 - 8)
  ctx.fillRect(s / 2 + 4, s / 2 + 4, s / 2 - 8, s / 2 - 8)
  ctx.strokeStyle = 'rgba(34,211,238,0.22)'
  ctx.lineWidth = 3
  ctx.strokeRect(0, 0, s, s)
  ctx.beginPath(); ctx.moveTo(s / 2, 0); ctx.lineTo(s / 2, s); ctx.moveTo(0, s / 2); ctx.lineTo(s, s / 2); ctx.stroke()
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(5, 5)
  tex.anisotropy = 8
  return tex
}
