import { useEffect, useRef, useState } from 'react'
import { NumberTicker } from './ui/magic-ui.tsx'
import styles from './ShareCard.module.css'

interface Props {
  open: boolean
  onClose: () => void
  /** e.g. 1, 2, 3 — the sector/arc just finished */
  arcId: number
  arcTitle: string
  arcDomain: string
  /** Missions cleared in this arc */
  arcCompleted: number
  arcTotal: number
  /** Across the whole game */
  totalCompleted: number
  totalMissions: number
  /** SQL concepts the player has actually used */
  concepts: string[]
}

/** Social share targets — intent URLs work without any SDK. */
const SHARE_TEXT = (arcTitle: string, sector: string) =>
  `I restored ${sector} — "${arcTitle}" — in QueryQuest. Real SQL, one mission at a time.`

export function ShareCard({
  open, onClose, arcId, arcTitle, arcDomain,
  arcCompleted, arcTotal, totalCompleted, totalMissions, concepts,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [ready, setReady] = useState(false)
  const [copied, setCopied] = useState(false)

  const shareUrl = typeof window === 'undefined' ? '' : window.location.origin
  const sector = `Sector ${arcId}`
  const text = SHARE_TEXT(arcTitle, sector)

  // Wait for webfonts so the rendered card uses the real type, not a fallback.
  useEffect(() => {
    if (!open) return
    let alive = true
    const done = () => { if (alive) setReady(true) }
    if (document.fonts?.ready) document.fonts.ready.then(done)
    else done()
    return () => { alive = false }
  }, [open])

  useEffect(() => {
    if (!open || !ready) return
    const canvas = canvasRef.current
    if (!canvas) return
    drawShareCard(canvas, {
      sector,
      arcTitle,
      arcDomain,
      arcCompleted,
      arcTotal,
      totalCompleted,
      totalMissions,
      concepts,
    })
  }, [open, ready, sector, arcTitle, arcDomain, arcCompleted, arcTotal, totalCompleted, totalMissions, concepts])

  if (!open) return null

  async function download() {
    const canvas = canvasRef.current
    if (!canvas) return
    // Re-draw at full size so the PNG is not the preview's resolution.
    const full = document.createElement('canvas')
    full.width = 1200
    full.height = 630
    drawShareCard(full, {
      sector, arcTitle, arcDomain, arcCompleted, arcTotal, totalCompleted, totalMissions, concepts,
    })
    const blob = await new Promise<Blob | null>(res => full.toBlob(res, 'image/png'))
    if (!blob) return
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `queryquest-${sector.toLowerCase().replace(/\s+/g, '-')}.png`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  async function nativeShare() {
    const canvas = canvasRef.current
    try {
      const blob = canvas ? await new Promise<Blob | null>(res => canvas.toBlob(res, 'image/png')) : null
      if (blob && navigator.canShare?.({ files: [new File([blob], 'card.png', { type: 'image/png' })] })) {
        await navigator.share({
          files: [new File([blob], 'card.png', { type: 'image/png' })],
          title: 'QueryQuest',
          text,
        })
        return
      }
      await navigator.share({ title: 'QueryQuest', text, url: shareUrl })
    } catch { /* user cancelled */ }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(`${text} ${shareUrl}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* clipboard blocked */ }
  }

  const links = [
    {
      id: 'x',
      label: 'X',
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`,
    },
    {
      id: 'linkedin',
      label: 'LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      href: `https://wa.me/?text=${encodeURIComponent(`${text} ${shareUrl}`)}`,
    },
    {
      id: 'reddit',
      label: 'Reddit',
      href: `https://www.reddit.com/submit?title=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`,
    },
  ]

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Share your result">
      <div className={styles.backdrop} onClick={onClose} />

      <div className={styles.sheet}>
        <div className={styles.head}>
          <div>
            <div className={styles.eyebrow}>Sector {arcId} restored</div>
            <h2 className={styles.title}>Share the moment</h2>
          </div>
          <button className={styles.close} onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* Canvas preview — also the source for the PNG. */}
        <div className={styles.cardWrap}>
          <canvas ref={canvasRef} width={600} height={315} className={styles.card} aria-hidden="true" />
        </div>

        <p className={styles.caption}>
          <NumberTicker value={totalCompleted} /> of {totalMissions} missions restored across the Archive.
        </p>

        <div className={styles.actions}>
          <button className={styles.primary} onClick={download}>
            ↓ Download card
          </button>
          {'share' in navigator && (
            <button className={styles.secondary} onClick={nativeShare}>
              Share…
            </button>
          )}
          <button className={styles.secondary} onClick={copyLink}>
            {copied ? 'Copied ✓' : 'Copy link'}
          </button>
        </div>

        <div className={styles.links}>
          {links.map(l => (
            <a key={l.id} href={l.href} target="_blank" rel="noopener noreferrer" className={styles.link}>
              {l.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── Card renderer ─────────────────────────────────────────────────────
   Canvas 2D, 2× the preview resolution for a crisp PNG. Deliberately
   restrained: one accent colour, hairline rules, no gradients on text. */

interface CardData {
  sector: string
  arcTitle: string
  arcDomain: string
  arcCompleted: number
  arcTotal: number
  totalCompleted: number
  totalMissions: number
  concepts: string[]
}

const W = 1200
const H = 630
const SCALE = 2

function drawShareCard(canvas: HTMLCanvasElement, d: CardData) {
  canvas.width = W * SCALE
  canvas.height = H * SCALE
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.scale(SCALE, SCALE)

  // ── Background ──
  ctx.fillStyle = '#050814'
  ctx.fillRect(0, 0, W, H)

  // Radial cyan glow, top-left of centre.
  const glow = ctx.createRadialGradient(W * 0.28, H * 0.22, 0, W * 0.28, H * 0.22, W * 0.55)
  glow.addColorStop(0, 'rgba(57, 208, 216, 0.16)')
  glow.addColorStop(0.5, 'rgba(188, 140, 255, 0.05)')
  glow.addColorStop(1, 'rgba(5, 8, 20, 0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, W, H)

  // Fine grain — keeps it from looking like flat CSS.
  ctx.globalAlpha = 0.035
  for (let i = 0; i < 5200; i++) {
    const x = Math.random() * W
    const y = Math.random() * H
    ctx.fillStyle = i % 2 ? '#ffffff' : '#000000'
    ctx.fillRect(x, y, 1, 1)
  }
  ctx.globalAlpha = 1

  // ── Frame ──
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.09)'
  ctx.lineWidth = 2
  ctx.strokeRect(40, 40, W - 80, H - 80)

  // ── Brand ──
  ctx.fillStyle = '#e6edf3'
  ctx.font = '700 26px "InterVariable", "Inter", system-ui, sans-serif'
  ctx.letterSpacing = '2px'
  ctx.textAlign = 'left'
  ctx.fillText('QUERYQUEST', 88, 128)
  ctx.letterSpacing = '0px'

  // Brand mark
  ctx.strokeStyle = '#39d0d8'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.arc(58, 120, 13, 0, Math.PI * 2)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(68, 130)
  ctx.lineTo(78, 140)
  ctx.stroke()

  // Sector eyebrow, top right
  ctx.fillStyle = '#39d0d8'
  ctx.font = '600 20px "Berkeley Mono", "JetBrains Mono", ui-monospace, monospace'
  ctx.letterSpacing = '6px'
  ctx.textAlign = 'right'
  ctx.fillText(d.sector.toUpperCase(), W - 88, 128)
  ctx.letterSpacing = '0px'

  // Hairline under the header
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(88, 168)
  ctx.lineTo(W - 88, 168)
  ctx.stroke()

  // ── Headline ──
  ctx.textAlign = 'left'
  ctx.fillStyle = 'rgba(198, 214, 233, 0.55)'
  ctx.font = '400 24px "Berkeley Mono", "JetBrains Mono", ui-monospace, monospace'
  ctx.letterSpacing = '4px'
  ctx.fillText(`${d.arcDomain.toUpperCase()} · RESTORED`, 88, 246)
  ctx.letterSpacing = '0px'

  ctx.fillStyle = '#ffffff'
  ctx.font = '400 84px "Newsreader", "Iowan Old Style", Georgia, serif'
  const title = fitText(ctx, d.arcTitle, W - 176, 84)
  ctx.fillText(title, 88, 338)

  // ── Stats row ──
  const stats: Array<[string, string]> = [
    [String(d.arcCompleted), `of ${d.arcTotal} missions`],
    [String(d.totalCompleted), `of ${d.totalMissions} restored`],
    [String(d.concepts.length), 'SQL concepts used'],
  ]

  const startX = 88
  const gapX = 330
  stats.forEach(([value, label], i) => {
    const x = startX + i * gapX
    ctx.fillStyle = '#39d0d8'
    ctx.font = '500 62px "Newsreader", "Iowan Old Style", Georgia, serif'
    ctx.textAlign = 'left'
    ctx.fillText(value, x, 428)

    ctx.fillStyle = 'rgba(198, 214, 233, 0.55)'
    ctx.font = '400 18px "Berkeley Mono", "JetBrains Mono", ui-monospace, monospace'
    ctx.letterSpacing = '2px'
    ctx.fillText(label.toUpperCase(), x, 462)
    ctx.letterSpacing = '0px'
  })

  // ── Concept chips ──
  ctx.textAlign = 'left'
  let chipX = 88
  const chipY = 516
  ctx.font = '600 17px "Berkeley Mono", "JetBrains Mono", ui-monospace, monospace'
  for (const c of d.concepts.slice(0, 5)) {
    const label = c.length > 11 ? `${c.slice(0, 10)}…` : c
    const w = ctx.measureText(label).width + 26
    if (chipX + w > W - 96) break
    ctx.strokeStyle = 'rgba(57, 208, 216, 0.35)'
    ctx.lineWidth = 1
    roundRect(ctx, chipX, chipY, w, 34, 6)
    ctx.stroke()
    ctx.fillStyle = 'rgba(57, 208, 216, 0.85)'
    ctx.fillText(label, chipX + 13, chipY + 23)
    chipX += w + 10
  }

  // ── Footer ──
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)'
  ctx.beginPath()
  ctx.moveTo(88, H - 96)
  ctx.lineTo(W - 88, H - 96)
  ctx.stroke()

  ctx.textAlign = 'left'
  ctx.fillStyle = 'rgba(198, 214, 233, 0.42)'
  ctx.font = '400 18px "InterVariable", "Inter", system-ui, sans-serif'
  ctx.fillText('The query is always the same. You just have to ask the right question.', 88, H - 58)

  ctx.textAlign = 'right'
  ctx.fillStyle = '#39d0d8'
  ctx.font = '600 16px "Berkeley Mono", "JetBrains Mono", ui-monospace, monospace'
  ctx.letterSpacing = '3px'
  ctx.fillText('DATHOS ARCHIVE TERMINAL', W - 88, H - 58)
  ctx.letterSpacing = '0px'
}

/** Shrink the title until it fits on one line (never more than two). */
function fitText(ctx: CanvasRenderingContext2D, text: string, maxW: number, startSize: number): string {
  let size = startSize
  ctx.font = ctx.font.replace(/\d+px/, `${size}px`)
  while (ctx.measureText(text).width > maxW && size > 34) {
    size -= 4
    ctx.font = ctx.font.replace(/\d+px/, `${size}px`)
  }
  return text
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}