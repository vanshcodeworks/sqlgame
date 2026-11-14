"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

/* ------------------------------------------------------------------ *
 * Number Ticker — counts up to a value when scrolled into view
 * ------------------------------------------------------------------ */
interface NumberTickerProps extends React.HTMLAttributes<HTMLSpanElement> {
  value: number
  direction?: "up" | "down"
  delay?: number
  decimalPlaces?: number
}

export function NumberTicker({
  value,
  direction = "up",
  delay = 0,
  decimalPlaces = 0,
  className,
  ...props
}: NumberTickerProps) {
  const ref = React.useRef<HTMLSpanElement>(null)
  const [visible, setVisible] = React.useState(false)
  // The starting value is a constant per direction, not a ref read.
  const startValue = direction === "up" ? 0 : value
  const [display, setDisplay] = React.useState(startValue)

  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true)
        obs.disconnect()
      }
    }, { threshold: 0.4 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  React.useEffect(() => {
    if (!visible) return
    const from = startValue
    const to = value
    if (from === to) {
      setDisplay(to)
      return
    }
    let raf = 0
    let startTs = 0
    const duration = 1400
    const tick = (now: number) => {
      if (!startTs) startTs = now
      const elapsed = now - startTs - delay
      if (elapsed <= 0) { raf = requestAnimationFrame(tick); return }
      const t = Math.min(elapsed / duration, 1)
      // easeOutExpo
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
      setDisplay(from + (to - from) * eased)
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [visible, value, delay, startValue])

  return (
    <span ref={ref} className={cn("tabular-nums", className)} {...props}>
      {display.toFixed(decimalPlaces)}
    </span>
  )
}

/* ------------------------------------------------------------------ *
 * Confetti — canvas celebration burst
 * ------------------------------------------------------------------ */
interface ConfettiProps {
  /** Change this number to fire a new burst */
  trigger: number
  /** Where to fire from, as a fraction of the viewport (0-1) */
  origin?: { x: number; y: number }
  colors?: string[]
  count?: number
}

export function Confetti({
  trigger,
  origin = { x: 0.5, y: 0.3 },
  colors = ["#39d0d8", "#bc8cff", "#ff79c6", "#e3b341", "#3fb950"],
  count = 120,
}: ConfettiProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)

  React.useEffect(() => {
    if (trigger <= 0) return
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = window.innerWidth * dpr
    canvas.height = window.innerHeight * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    const ox = origin.x * window.innerWidth
    const oy = origin.y * window.innerHeight

    const parts = Array.from({ length: count }, () => {
      const angle = Math.random() * Math.PI * 2
      const speed = 4 + Math.random() * 9
      return {
        x: ox,
        y: oy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 4,
        w: 4 + Math.random() * 6,
        h: 6 + Math.random() * 8,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.4,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1,
      }
    })

    let raf = 0
    const animate = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
      let alive = false

      for (const p of parts) {
        if (p.life <= 0) continue
        alive = true
        p.vy += 0.18
        p.vx *= 0.99
        p.x += p.vx
        p.y += p.vy
        p.rot += p.vr
        p.life -= 0.008

        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot)
        ctx.globalAlpha = Math.max(0, p.life)
        ctx.fillStyle = p.color
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
        ctx.restore()
      }

      if (alive) raf = requestAnimationFrame(animate)
      else ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
    }

    raf = requestAnimationFrame(animate)
    return () => {
      cancelAnimationFrame(raf)
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
    }
  }, [trigger, origin.x, origin.y, colors, count])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[70]"
    />
  )
}

/* ------------------------------------------------------------------ *
 * Border Beam — animated rotating gradient border
 * ------------------------------------------------------------------ */
interface BorderBeamProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Seconds for one full rotation */
  duration?: number
  /** Border thickness in px */
  borderWidth?: number
  colorFrom?: string
  colorTo?: string
  /** Start the beam partway around (seconds of offset) */
  delay?: number
}

export function BorderBeam({
  duration = 6,
  borderWidth = 1.5,
  colorFrom = "#39d0d8",
  colorTo = "#bc8cff",
  delay = 0,
  className,
  style,
  ...props
}: BorderBeamProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 rounded-[inherit]", className)}
      style={{
        border: `${borderWidth}px solid transparent`,
        borderRadius: "inherit",
        backgroundImage: `conic-gradient(from 0deg, transparent 0turn, ${colorFrom} 0.08turn, ${colorTo} 0.14turn, transparent 0.2turn, transparent 1turn)`,
        maskImage: "linear-gradient(#000 0 0) padding-box, linear-gradient(#000 0 0)",
        maskComposite: "exclude",
        WebkitMaskComposite: "xor",
        animation: `border-beam-spin ${duration}s linear infinite`,
        animationDelay: `${delay}s`,
        ...style,
      }}
      {...props}
    >
      <style>{`
        @keyframes border-beam-spin {
          to { transform: rotate(1turn); }
        }
      `}</style>
    </div>
  )
}

/* ------------------------------------------------------------------ *
 * Magic Card — mouse-following spotlight
 * ------------------------------------------------------------------ */
interface MagicCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Spotlight diameter in px */
  gradientSize?: number
  gradientColor?: string
  /** 0-1 */
  gradientOpacity?: number
}

export function MagicCard({
  gradientSize = 240,
  gradientColor = "#39d0d8",
  gradientOpacity = 0.18,
  className,
  children,
  ...props
}: MagicCardProps) {
  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    const rect = el.getBoundingClientRect()
    el.style.setProperty("--mx", `${e.clientX - rect.left}px`)
    el.style.setProperty("--my", `${e.clientY - rect.top}px`)
  }

  return (
    <div
      onMouseMove={onMouseMove}
      className={cn("group relative overflow-hidden", className)}
      style={
        {
          "--gradient-size": `${gradientSize}px`,
          "--gradient-color": gradientColor,
          "--gradient-opacity": `${gradientOpacity * 100}%`,
        } as React.CSSProperties
      }
      {...props}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(var(--gradient-size) circle at var(--mx, 50%) var(--my, 50%), " +
            `color-mix(in srgb, var(--gradient-color) var(--gradient-opacity), transparent), transparent 65%)`,
        }}
      />
      {children}
    </div>
  )
}

/* ------------------------------------------------------------------ *
 * Shimmer Button — sweeping highlight on a CTA
 * ------------------------------------------------------------------ */
interface ShimmerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  shimmerColor?: string
  shimmerDuration?: string
  background?: string
}

export function ShimmerButton({
  shimmerColor = "rgba(255, 255, 255, 0.35)",
  shimmerDuration = "2.4s",
  background = "linear-gradient(135deg, rgba(57,208,216,0.9), rgba(0,200,210,0.75))",
  className,
  children,
  style,
  ...props
}: ShimmerButtonProps) {
  return (
    <button
      className={cn(
        "relative overflow-hidden rounded-xl border-none",
        "px-6 py-3 font-mono text-sm uppercase tracking-widest font-bold",
        "text-[#04121a]",
        "transition-transform duration-200 hover:scale-[1.03] active:scale-[0.98]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60",
        "disabled:opacity-40 disabled:cursor-not-allowed",
        className
      )}
      style={{ background, ...style }}
      {...props}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
      <span
        aria-hidden="true"
        className="absolute inset-0 -translate-x-full"
        style={{
          background: `linear-gradient(90deg, transparent, ${shimmerColor}, transparent)`,
          animation: `shimmer-sweep ${shimmerDuration} infinite`,
        }}
      />
      <style>{`
        @keyframes shimmer-sweep {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </button>
  )
}

/* ------------------------------------------------------------------ *
 * Marquee — seamlessly scrolling strip
 * ------------------------------------------------------------------ */
interface MarqueeProps extends React.HTMLAttributes<HTMLDivElement> {
  reverse?: boolean
  pauseOnHover?: boolean
  /** Seconds for one full pass */
  speed?: number
}

export function Marquee({
  reverse = false,
  pauseOnHover = false,
  speed = 28,
  className,
  children,
  ...props
}: MarqueeProps) {
  return (
    <div className={cn("group relative flex overflow-hidden", className)} {...props}>
      {[0, 1].map((copy) => (
        <div
          key={copy}
          aria-hidden={copy === 1}
          className={cn(
            "flex shrink-0 items-center gap-8 pr-8",
            pauseOnHover && "group-hover:[animation-play-state:paused]"
          )}
          style={{
            animation: `marquee-scroll ${speed}s linear infinite`,
            animationDirection: reverse ? "reverse" : "normal",
          }}
        >
          {children}
        </div>
      ))}
      <style>{`
        @keyframes marquee-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  )
}

/* ------------------------------------------------------------------ *
 * Dot Pattern — faded dot grid background
 * ------------------------------------------------------------------ */
interface DotPatternProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number
  color?: string
  fade?: boolean
}

export function DotPattern({
  size = 18,
  color = "rgba(57, 208, 216, 0.18)",
  fade = true,
  className,
  style,
  ...props
}: DotPatternProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0", className)}
      style={{
        backgroundImage: `radial-gradient(${color} 1px, transparent 1px)`,
        backgroundSize: `${size}px ${size}px`,
        maskImage: fade
          ? "radial-gradient(ellipse 70% 60% at 50% 40%, #000 30%, transparent 100%)"
          : undefined,
        WebkitMaskImage: fade
          ? "radial-gradient(ellipse 70% 60% at 50% 40%, #000 30%, transparent 100%)"
          : undefined,
        ...style,
      }}
      {...props}
    />
  )
}

/* ------------------------------------------------------------------ *
 * Ripple — expanding rings, draws the eye to a target
 * ------------------------------------------------------------------ */
interface RippleProps {
  mainCircleSize?: number
  numCircles?: number
  color?: string
}

export function Ripple({
  mainCircleSize = 180,
  numCircles = 6,
  color = "rgba(57, 208, 216, 0.22)",
}: RippleProps) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
    >
      {Array.from({ length: numCircles }, (_, i) => (
        <div
          key={i}
          className="absolute rounded-full border"
          style={{
            width: mainCircleSize,
            height: mainCircleSize,
            borderColor: color,
            animation: `ripple-ring 3.2s ${i * 0.45}s linear infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes ripple-ring {
          0%   { transform: scale(0.2); opacity: 0; }
          30%  { opacity: 0.9; }
          100% { transform: scale(1.9); opacity: 0; }
        }
      `}</style>
    </div>
  )
}

/* ------------------------------------------------------------------ *
 * Progress Ring — daily goal / completion ring
 * ------------------------------------------------------------------ */
interface ProgressRingProps {
  value: number
  max: number
  size?: number
  thickness?: number
  color?: string
  trackColor?: string
  label?: string
  sublabel?: string
}

export function ProgressRing({
  value,
  max,
  size = 92,
  thickness = 8,
  color = "#39d0d8",
  trackColor = "rgba(255,255,255,0.08)",
  label,
  sublabel,
}: ProgressRingProps) {
  const pct = max > 0 ? Math.min(Math.max(value / max, 0), 1) : 0
  const r = (size - thickness) / 2
  const c = 2 * Math.PI * r
  const done = pct >= 1

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={trackColor}
          strokeWidth={thickness}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          style={{
            transition: "stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
            filter: done ? `drop-shadow(0 0 8px ${color})` : undefined,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center leading-none">
        <span className="font-cinzel font-bold" style={{ color, fontSize: done ? 22 : 20 }}>
          {done ? "✓" : (label ?? value)}
        </span>
        {!done && sublabel && (
          <span className="mt-1 font-mono text-[9px] uppercase tracking-widest text-white/40">
            {sublabel}
          </span>
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ *
 * Pulse Dot — "you are here" marker for the lesson path
 * ------------------------------------------------------------------ */
interface PulseDotProps extends React.HTMLAttributes<HTMLSpanElement> {
  color?: string
}

export function PulseDot({ color = "#39d0d8", className, ...props }: PulseDotProps) {
  return (
    <span
      className={cn(
        "pointer-events-none absolute inset-0 rounded-full",
        "animate-[pulse-ring_1.8s_ease-out_infinite]",
        className
      )}
      style={{ boxShadow: `0 0 0 0 ${color}` }}
      {...props}
    >
      <style>{`
        @keyframes pulse-ring {
          0%   { box-shadow: 0 0 0 0 var(--pulse-color); opacity: 1; }
          70%  { box-shadow: 0 0 0 14px transparent; opacity: 0; }
          100% { box-shadow: 0 0 0 0 transparent; opacity: 0; }
        }
      `}</style>
    </span>
  )
}