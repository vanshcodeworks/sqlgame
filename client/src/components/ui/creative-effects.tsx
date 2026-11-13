"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Paper Crumple Effect - inspired by ReactBits paper interactions
 * A realistic paper texture that crumples/folds on hover/touch
 */
interface PaperCrumpleProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Number of folds/creases */
  folds?: number
  /** Intensity of the crumple (0-1) */
  intensity?: number
  /** Paper color */
  color?: string
  /** Whether to animate on mount */
  animateOnMount?: boolean
  /** Children content */
  children?: React.ReactNode
  /** Custom shader uniforms */
  className?: string
}

export function PaperCrumple({
  folds = 8,
  intensity = 0.3,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  color = "#050814",
  animateOnMount = true,
  children,
  className,
  style,
  ...props
}: PaperCrumpleProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const outerRef = React.useRef<HTMLDivElement>(null)
  const [targetProgress, setTargetProgress] = React.useState(0)
  const rafRef = React.useRef<number | null>(null)
  const foldsRef = React.useRef<number>(folds)
  const intensityRef = React.useRef<number>(intensity)

  foldsRef.current = folds
  intensityRef.current = intensity

  // Smooth animation loop
  React.useEffect(() => {
    const animate = () => {
      setTargetProgress(prev => {
        const diff = targetProgress - prev
        if (Math.abs(diff) < 0.001) return targetProgress
        return prev + diff * 0.15
      })
      rafRef.current = requestAnimationFrame(animate) as number
    }
    rafRef.current = requestAnimationFrame(animate) as number
    return () => cancelAnimationFrame(rafRef.current!)
  }, [targetProgress])

  // Mount animation
  React.useEffect(() => {
    if (!animateOnMount) return
    const timeline = [
      { progress: 0.15, delay: 0 },
      { progress: 0.35, delay: 150 },
      { progress: 0.6, delay: 350 },
      { progress: 0.85, delay: 600 },
      { progress: 1, delay: 900 },
    ]

    timeline.forEach((step) => {
      setTimeout(() => setTargetProgress(step.progress), step.delay)
    })
  }, [animateOnMount])

  // const hexToRgb = (hex: string) => { ... }

  // const paperColorRgb = React.useMemo(() => hexToRgb(paperColor), [paperColor])

  return (
    <div
      ref={outerRef}
      className={cn("relative overflow-hidden", className)}
      style={{ ...style, background: "transparent" }}
      {...props}
    >
      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: "100%", display: "block" }}
      />
      {children && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="pointer-events-auto">{children}</div>
        </div>
      )}
    </div>
  )
}

/**
 * Magnetic Button - inspired by MagicUI magnetic effects
 * Button that follows cursor with spring physics
 */
interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Magnetic strength */
  strength?: number
  /** Spring stiffness */
  stiffness?: number
  /** Spring damping */
  damping?: number
  children: React.ReactNode
}

export function MagneticButton({
  strength = 0.3,
  stiffness = 300,
  damping = 30,
  children,
  className,
  style,
  onMouseMove,
  onMouseLeave,
  ...props
}: MagneticButtonProps) {
  const ref = React.useRef<HTMLButtonElement>(null)
  const [position, setPosition] = React.useState({ x: 0, y: 0 })
  const [velocity, setVelocity] = React.useState({ x: 0, y: 0 })
  const rafRef = React.useRef<number | null>(null)
  const strengthRef = React.useRef(strength)
  const stiffnessRef = React.useRef(stiffness)
  const dampingRef = React.useRef(damping)

  strengthRef.current = strength
  stiffnessRef.current = stiffness
  dampingRef.current = damping

  React.useEffect(() => {
    const animate = () => {
      setPosition(prev => {
        const dx = -prev.x * (stiffnessRef.current / 1000) * 0.016
        const dy = -prev.y * (stiffnessRef.current / 1000) * 0.016
        
        setVelocity(v => ({
          x: (v.x + dx) * (1 - dampingRef.current / 1000),
          y: (v.y + dy) * (1 - dampingRef.current / 1000)
        }))
        
        return {
          x: prev.x + velocity.x * 0.016,
          y: prev.y + velocity.y * 0.016
        }
      })
      rafRef.current = requestAnimationFrame(animate) as number
    }
    rafRef.current = requestAnimationFrame(animate) as number
    return () => cancelAnimationFrame(rafRef.current!)
  }, [velocity])

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = (e.clientX - rect.left - rect.width / 2) * strengthRef.current
    const y = (e.clientY - rect.top - rect.height / 2) * strengthRef.current
    setPosition({ x, y })
    onMouseMove?.(e)
  }

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 })
    onMouseLeave?.(new MouseEvent("mouseleave") as unknown as React.MouseEvent<HTMLButtonElement, MouseEvent>)
  }

  return (
    <button
      ref={ref}
      className={cn(
        "relative overflow-hidden rounded-xl border border-white/10 bg-white/5",
        "px-8 py-4 font-mono text-sm uppercase tracking-wider",
        "text-white transition-all duration-300",
        "hover:border-cyan-400/50 hover:bg-white/10 hover:shadow-[0_0_30px_rgba(57,208,216,0.15)]",
        "active:scale-[0.98]",
        className
      )}
      style={{
        ...style,
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        willChange: "transform"
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      <span className="relative z-10">{children}</span>
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 via-transparent to-purple-400/10 opacity-0 hover:opacity-100 transition-opacity duration-300" />
    </button>
  )
}

/**
 * Aurora Text - animated gradient text inspired by MagicUI
 */
interface AuroraTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Base color */
  baseColor?: string
  /** Gradient colors */
  colors?: string[]
  /** Animation speed */
  speed?: number
  /** Text content */
  children: React.ReactNode
}

export function AuroraText({
  colors = ["#39d0d8", "#bc8cff", "#ff79c6", "#39d0d8"],
  speed = 0.5,
  children,
  className,
  ...props
}: AuroraTextProps) {
  return (
    <span
      className={cn(
        "relative inline-block bg-clip-text text-transparent",
        "bg-[length:300%_100%] animate-aurora",
        className
      )}
      style={{
        ...props.style,
        backgroundImage: `linear-gradient(90deg, ${colors.join(", ")})`,
        animationDuration: `${10 / speed}s`
      } as React.CSSProperties}
      {...props}
    >
      {children}
    </span>
  )
}

/**
 * Floating Particles - ambient background particles
 */
interface FloatingParticlesProps extends React.CanvasHTMLAttributes<HTMLCanvasElement> {
  count?: number
  color?: string
  size?: number
  speed?: number
  connectDistance?: number
}

export function FloatingParticles({
  count = 50,
  color = "#39d0d8",
  size = 2,
  speed = 0.2,
  connectDistance = 150,
  className,
  ...props
}: FloatingParticlesProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const particlesRef = React.useRef<Array<{
    x: number
    y: number
    vx: number
    vy: number
    radius: number
    opacity: number
  }>>([])
  const rafRef = React.useRef<number | null>(null)
  const colorRef = React.useRef(color)
  const countRef = React.useRef(count)

  colorRef.current = color
  countRef.current = count

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")!
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let width = 0
    let height = 0

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      width = rect.width
      height = rect.height
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.scale(dpr, dpr)
    }

    const initParticles = () => {
      particlesRef.current = Array.from({ length: countRef.current }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * speed,
        vy: (Math.random() - 0.5) * speed,
        radius: Math.random() * size + 0.5,
        opacity: Math.random() * 0.5 + 0.1
      }))
    }

    const hexToRgb = (hex: string) => {
      const h = hex.replace("#", "")
      const v = parseInt(h, 16)
      return { r: (v >> 16) & 255, g: (v >> 8) & 255, b: v & 255 }
    }

    const { r, g, b } = hexToRgb(colorRef.current ?? "#39d0d8")

    const animate = () => {
      ctx.clearRect(0, 0, width, height)

      // Draw connections
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.08)`
      ctx.lineWidth = 0.5

      for (let i = 0; i < particlesRef.current.length; i++) {
        const p1 = particlesRef.current[i]
        
        for (let j = i + 1; j < particlesRef.current.length; j++) {
          const p2 = particlesRef.current[j]
          const dx = p2.x - p1.x
          const dy = p2.y - p1.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < connectDistance) {
            ctx.globalAlpha = (1 - dist / connectDistance) * 0.15
            ctx.beginPath()
            ctx.moveTo(p1.x, p1.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.stroke()
          }
        }
      }

      // Draw particles
      for (const p of particlesRef.current) {
        p.x += p.vx
        p.y += p.vy

        // Wrap around
        if (p.x < 0) p.x = width
        if (p.x > width) p.x = 0
        if (p.y < 0) p.y = height
        if (p.y > height) p.y = 0

        // Subtle noise drift
        p.vx += (Math.random() - 0.5) * 0.01
        p.vy += (Math.random() - 0.5) * 0.01
        p.vx = Math.max(-speed, Math.min(speed, p.vx))
        p.vy = Math.max(-speed, Math.min(speed, p.vy))

        ctx.globalAlpha = p.opacity
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fill()
      }

      rafRef.current = requestAnimationFrame(animate) as number
    }

    const handleResize = () => {
      const oldWidth = width
      const oldHeight = height
      resize()
      // Reposition particles proportionally
      particlesRef.current.forEach(p => {
        p.x = (p.x / oldWidth) * width
        p.y = (p.y / oldHeight) * height
      })
    }

    resize()
    initParticles()
    window.addEventListener("resize", handleResize)
    animate()

    return () => {
      cancelAnimationFrame(rafRef.current!)
      window.removeEventListener("resize", handleResize)
    }
  }, [connectDistance, size, speed])

  return (
    <canvas
      ref={canvasRef}
      className={cn("absolute inset-0 pointer-events-none", className)}
      {...props}
    />
  )
}

/**
 * Ripple Button - Material-style ripple with spring
 */
interface RippleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  rippleColor?: string
}

export function RippleButton({
  children,
  rippleColor = "rgba(57, 208, 216, 0.4)",
  className,
  onClick,
  ...props
}: RippleButtonProps) {
  const [ripples, setRipples] = React.useState<Array<{
    id: number
    x: number
    y: number
    size: number
  }>>([])
  const idRef = React.useRef(0)

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const size = Math.max(rect.width, rect.height) * 2

    const id = ++idRef.current
    setRipples(prev => [...prev, { id, x, y, size }])

    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== id))
    }, 600)

    onClick?.(e)
  }

  return (
    <button
      className={cn(
        "relative overflow-hidden rounded-xl",
        "border border-white/10 bg-white/5",
        "px-8 py-4 font-mono text-sm uppercase tracking-wider",
        "text-white transition-all duration-300",
        "hover:border-cyan-400/50 hover:bg-white/10",
        "active:scale-[0.98] focus-visible:outline-none",
        "focus-visible:ring-2 focus-visible:ring-cyan-400/50",
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute rounded-full bg-white/10 pointer-events-none"
          style={{
            left: ripple.x - ripple.size / 2,
            top: ripple.y - ripple.size / 2,
            width: ripple.size,
            height: ripple.size,
            background: `radial-gradient(circle at center, ${rippleColor} 0%, transparent 70%)`,
            animation: "ripple-expand 600ms ease-out forwards"
          }}
        />
      ))}
      <span className="relative z-10">{children}</span>
      <style>{`
        @keyframes ripple-expand {
          0% { transform: scale(0); opacity: 1; }
          100% { transform: scale(1); opacity: 0; }
        }
      `}</style>
    </button>
  )
}

/**
 * Glitch Text - cyberpunk glitch effect
 */
interface GlitchTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode
  intensity?: number
  colors?: [string, string]
  speed?: number
}

export function GlitchText({
  children,
  intensity = 0.15,
  colors = ["#39d0d8", "#bc8cff"],
  speed = 1,
  className,
  ...props
}: GlitchTextProps) {
  const [glitchOffset, setGlitchOffset] = React.useState({ x: 0, y: 0 })
  const [showGlitch, setShowGlitch] = React.useState(false)

  React.useEffect(() => {
    const interval = window.setInterval(() => {
      if (Math.random() < 0.03 * speed) {
        setShowGlitch(true)
        setGlitchOffset({
          x: (Math.random() - 0.5) * intensity * 20,
          y: (Math.random() - 0.5) * intensity * 10
        })
        setTimeout(() => setShowGlitch(false), 50 + Math.random() * 100)
      }
    }, 100)
    return () => clearInterval(interval)
  }, [intensity, speed])

  return (
    <span className={cn("relative inline-block", className)} {...props}>
      {showGlitch && (
        <>
          <span
            className="absolute inset-0 -z-10"
            style={{
              color: colors[0],
              clipPath: `polygon(0 0, 100% 0, 100% ${30 + Math.random() * 40}%, 0 ${30 + Math.random() * 40}%)`,
              transform: `translate(${glitchOffset.x}px, ${glitchOffset.y}px)`
            }}
            aria-hidden="true"
          >
            {children}
          </span>
          <span
            className="absolute inset-0 -z-10"
            style={{
              color: colors[1],
              clipPath: `polygon(0 ${60 + Math.random() * 40}%, 100% ${60 + Math.random() * 40}%, 100% 100%, 0 100%)`,
              transform: `translate(${-glitchOffset.x}px, ${-glitchOffset.y}px)`
            }}
            aria-hidden="true"
          >
            {children}
          </span>
        </>
      )}
      <span className="relative z-10">{children}</span>
    </span>
  )
}

/**
 * Blob Background - organic animated blob
 */
interface BlobBackgroundProps extends React.CanvasHTMLAttributes<HTMLCanvasElement> {
  colors?: string[]
  speed?: number
  complexity?: number
}

export function BlobBackground({
  colors = ["#39d0d8", "#bc8cff", "#ff79c6"],
  speed = 0.3,
  complexity = 5,
  className,
  ...props
}: BlobBackgroundProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const timeRef = React.useRef(0)
  const rafRef = React.useRef<number | null>(null)
  const colorsRef = React.useRef(colors)

  colorsRef.current = colors

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")!
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let width = 0
    let height = 0

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      width = rect.width
      height = rect.height
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.scale(dpr, dpr)
    }

    const hexToRgba = (hex: string, alpha: number) => {
      const h = hex.replace("#", "")
      const v = parseInt(h, 16)
      return `rgba(${(v >> 16) & 255}, ${(v >> 8) & 255}, ${v & 255}, ${alpha})`
    }

    const animate = () => {
      timeRef.current += 0.01 * speed
      ctx.clearRect(0, 0, width, height)

      const centerX = width / 2
      const centerY = height / 2
      const maxRadius = Math.min(width, height) * 0.6

      for (let layer = 0; layer < colorsRef.current.length; layer++) {
        ctx.beginPath()
        
        const points = 12 + complexity * 2
        const color = colorsRef.current[layer]
        const phase = timeRef.current + layer * 2
        
        for (let i = 0; i <= points; i++) {
          const angle = (i / points) * Math.PI * 2
          const noise = 
            Math.sin(angle * 3 + phase) * 0.3 +
            Math.sin(angle * 5 - phase * 1.3) * 0.2 +
            Math.sin(angle * 7 + phase * 0.7) * 0.15
          const radius = maxRadius * (0.3 + 0.7 * (layer + 1) / colorsRef.current.length) * (1 + noise * 0.4)
          
          const x = centerX + Math.cos(angle) * radius
          const y = centerY + Math.sin(angle) * radius
          
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        
        ctx.closePath()
        const gradient = ctx.createRadialGradient(
          centerX, centerY, maxRadius * 0.2,
          centerX, centerY, maxRadius
        )
        gradient.addColorStop(0, hexToRgba(color, 0.15))
        gradient.addColorStop(1, hexToRgba(color, 0))
        ctx.fillStyle = gradient
        ctx.fill()
      }

      rafRef.current = requestAnimationFrame(animate) as number
    }

    resize()
    window.addEventListener("resize", resize)
    animate()

    return () => {
      cancelAnimationFrame(rafRef.current!)
      window.removeEventListener("resize", resize)
    }
  }, [speed, complexity])

  return (
    <canvas
      ref={canvasRef}
      className={cn("absolute inset-0 pointer-events-none", className)}
      {...props}
    />
  )
}

/**
 * Cursor Trail - follow cursor with trail
 */
interface CursorTrailProps {
  length?: number
  color?: string
  width?: number
}

export function CursorTrail({ length = 20, color = "#39d0d8", width = 2 }: CursorTrailProps) {
  const [points, setPoints] = React.useState<Array<{ x: number; y: number }>>([])
  const rafRef = React.useRef<number | null>(null)
  const colorRef = React.useRef(color)
  const lengthRef = React.useRef(length)
  const widthRef = React.useRef(width)
  const [currentColor, setCurrentColor] = React.useState(color)
  const [currentWidth, setCurrentWidth] = React.useState(width)

  React.useLayoutEffect(() => {
    colorRef.current = color
    lengthRef.current = length
    widthRef.current = width
    setCurrentColor(color)
    setCurrentWidth(width)
  }, [color, length, width])

  React.useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      setPoints(prev => {
        const next = [{ x: e.clientX, y: e.clientY }, ...prev]
        return next.slice(0, lengthRef.current)
      })
    }

    window.addEventListener("mousemove", handleMove)

    const animate = () => {
      rafRef.current = requestAnimationFrame(animate) as number
    }
    animate()

    return () => {
      window.removeEventListener("mousemove", handleMove)
      cancelAnimationFrame(rafRef.current!)
    }
  }, [])

  return (
    <svg
      className="fixed inset-0 pointer-events-none z-50"
      style={{ width: "100vw", height: "100vh" }}
      aria-hidden="true"
    >
      {points.length > 1 && (
        <path
          d={points
            .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
            .join(" ")}
          stroke={currentColor}
          strokeWidth={currentWidth}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.6"
          filter="blur(1px)"
        />
      )}
    </svg>
  )
}