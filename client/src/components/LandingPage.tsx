import { useEffect, useRef, useState } from 'react'
import { useTypewriter } from '../hooks/useTypewriter.ts'
import { useWebGLBackground } from '../hooks/useWebGLBackground.ts'
import CelestialSphere from './CelestialSphere.tsx'
import AuroraBorealisShader from './AuroraBorealisShader.tsx'
import { GlassReveal21st } from './ui/liquid-glass-logo-reveal.tsx'
import {
  PaperCrumple,
  MagneticButton,
  AuroraText,
  FloatingParticles,
  GlitchText,
  BlobBackground,
  RippleButton,
} from './ui/creative-effects.tsx'
import styles from './LandingPage.module.css'

interface Props {
  onStartMission: () => void
}

const HEADLINE_LINES = [
  'He died saving 847 lives.',
  'He woke up on a planet that had forgotten everything.',
]

const STORY_CARDS = [
  {
    num: '01',
    title: 'The Last Query',
    body: "Bengaluru. 3:47 AM. A children's hospital under cyberattack. 847 patients on compromised life support. One data engineer. Four minutes of battery left. He didn't run.",
  },
  {
    num: '02',
    title: 'The Null Event',
    body: 'Two centuries ago, a weaponized SQL virus called THE NULL EVENT corrupted every byte of The Archive — the planet-wide database that held all of human knowledge. Planet DATHOS forgot itself.',
  },
  {
    num: '03',
    title: 'The Mission',
    body: "The Archive still exists. Corrupted. Waiting. Ancient Terminals are scattered across the ruins. No synthetic mind can read them. But a human one can. And now there's one on Dathos.",
  },
]

function Reveal({ children, className, threshold = 0.2 }: {
  children: React.ReactNode
  className?: string
  threshold?: number
}) {
  const ref = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          obs.disconnect()
        }
      },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return (
    <section ref={ref} className={`${className ?? ''} ${visible ? styles.sectionVisible : ''}`}>
      {children}
    </section>
  )
}

// ── RGB Glitch canvas for the Nexus card ────────────────────────
function NexusGlitch() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const gl = canvas.getContext('webgl')
    if (!gl) return

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!
      gl.shaderSource(s, src)
      gl.compileShader(s)
      return s
    }

    const prog = gl.createProgram()!
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}'))
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, `
      precision highp float;
      uniform vec2 res; uniform float t;
      void main(){
        vec2 p=(gl_FragCoord.xy*2.-res)/min(res.x,res.y);
        float d=length(p)*.15;
        float r=.02/abs(p.y+sin((p.x*(1.+d)+t)*1.5)*.8);
        float g=.05/abs(p.y+sin((p.x+t)*1.5)*.8);
        float b=.02/abs(p.y+sin((p.x*(1.-d)+t)*1.5)*.8);
        gl_FragColor=vec4(r,g,b,max(max(r,g),b)*.85);
      }
    `))
    gl.linkProgram(prog)

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, 1, -1, -1, 1, 1, 1, -1]), gl.STATIC_DRAW)
    const aPos = gl.getAttribLocation(prog, 'p')
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

    const uRes = gl.getUniformLocation(prog, 'res')
    const uT = gl.getUniformLocation(prog, 't')

    canvas.width = canvas.clientWidth
    canvas.height = canvas.clientHeight
    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE)

    const frame = (ms: number) => {
      gl.useProgram(prog)
      gl.uniform2f(uRes, canvas.width, canvas.height)
      gl.uniform1f(uT, ms * 0.001)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      rafRef.current = requestAnimationFrame(frame)
    }
    rafRef.current = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  return <canvas ref={canvasRef} className={styles.nexusGlitch} />
}

// ── Liquid Glass Logo for Hero ───────────────────────────────────
function HeroLogo() {
  return (
    <GlassReveal21st
      className="w-[280px] h-[280px] sm:w-[340px] sm:h-[340px] mx-auto"
      tileSize={340}
      logoScale={0.55}
      finalScale={0.85}
      hold={2}
      speed={1}
      tuning={{
        startZoom: 2.8,
        glide: 2.8,
        present: 3.2,
        dispersion: 1.4,
        colorBleed: 1.1,
        opticalDepth: 1.0,
        corner: 5.2,
        sheen: 1.2,
        lightTurn: 1.4,
        ripple: 0.8,
        halo: 0.3,
        shadow: 0.8,
      }}
    />
  )
}

// ── Animated Stats Counter ──────────────────────────────────────
function StatCounter({ value, label, delay = 0 }: { value: number; label: string; delay?: number }) {
  const [count, setCount] = useState(0)
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true)
        obs.disconnect()
      }
    }, { threshold: 0.3 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (!visible) return
    const start = Date.now()
    const duration = 1800
    const animate = () => {
      const elapsed = Date.now() - start - delay
      if (elapsed <= 0) return
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(value * eased))
      if (progress < 1) requestAnimationFrame(animate)
    }
    const timer = setTimeout(animate, delay)
    return () => clearTimeout(timer)
  }, [visible, value, delay])

  return (
    <div ref={ref} className={styles.statItem}>
      <div className={styles.statNumber}>{count.toLocaleString()}</div>
      <div className={styles.statLabel}>{label}</div>
    </div>
  )
}

export function LandingPage({ onStartMission }: Props) {
  const bgRef = useWebGLBackground()
  const tw = useTypewriter(HEADLINE_LINES, { speed: 38, pauseBetween: 700, startDelay: 600 })

  return (
    <div className={styles.page}>

      {/* SVG glass-filter used by the liquid button */}
      <svg style={{ display: 'none' }}>
        <defs>
          <filter id="glass-filter" x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.05 0.05" numOctaves="1" seed="1" result="turbulence" />
            <feGaussianBlur in="turbulence" stdDeviation="2" result="blurredNoise" />
            <feDisplacementMap in="SourceGraphic" in2="blurredNoise" scale="30" xChannelSelector="R" yChannelSelector="B" result="displaced" />
            <feGaussianBlur in="displaced" stdDeviation="2" result="finalBlur" />
            <feComposite in="finalBlur" in2="finalBlur" operator="over" />
          </filter>
        </defs>
      </svg>

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <canvas ref={bgRef} className={styles.shaderCanvas} />
        <div className={styles.radialOverlay} />
        <div className={styles.scanlines} />

        {/* Floating particles ambient */}
        <FloatingParticles
          count={60}
          color="#39d0d8"
          size={1.5}
          speed={0.15}
          connectDistance={180}
          className={styles.particlesLayer}
        />

        {/* Blob background for depth */}
        <BlobBackground
          colors={["#39d0d8", "#bc8cff", "#ff79c6"]}
          speed={0.15}
          complexity={6}
          className={styles.blobLayer}
        />

        <nav className={styles.nav}>
          <span className={styles.navLogo}>QueryQuest</span>
          <span className={styles.navTag}>Planet Dathos · Arc I</span>
        </nav>

        <div className={styles.heroContent}>

          <div className={styles.planetBadge}>
            <span className={styles.planetDot} />
            Planet Dathos · Sector 1
          </div>

          {/* Liquid Glass Logo */}
          <div className={styles.logoWrap}>
            <HeroLogo />
          </div>

          {/* Aurora Text for Quest Line */}
          <div className={styles.questLineWrap}>
            <AuroraText
              colors={["#39d0d8", "#bc8cff", "#ff79c6", "#39d0d8"]}
              speed={0.4}
              className={styles.questLine}
            >
              QUERYQUEST
              <span className={styles.questSub}> · SQL FOUNDATION · SEASON ONE</span>
            </AuroraText>
          </div>

          {/* Typewriter Headline */}
          <div className={styles.headlineWrap}>
            {tw.lines.map((line, i) => (
              <GlitchText
                key={i}
                intensity={0.08}
                colors={["#39d0d8", "#bc8cff"]}
                speed={0.5}
                className={styles.headlineLine}
              >
                {line}
              </GlitchText>
            ))}
            {!tw.done && (
              <GlitchText
                intensity={0.08}
                colors={["#39d0d8", "#bc8cff"]}
                speed={0.5}
                className={styles.headlineLine}
              >
                {tw.current}<span className={styles.cursor}>▌</span>
              </GlitchText>
            )}
          </div>

          {/* CTA with Magnetic Button */}
          <div className={styles.ctaWrap}>
            <MagneticButton
              strength={0.25}
              stiffness={400}
              damping={35}
              className={styles.ctaBtn}
              onClick={onStartMission}
            >
              <div className={styles.ctaBtnGlowRing} />
              <div
                className={styles.ctaBtnGlass}
                style={{ backdropFilter: 'url("#glass-filter")' }}
              />
              <span className={styles.ctaBtnContent}>
                <span className={styles.ctaBtnIcon}>▶</span>
                START MISSION
              </span>
            </MagneticButton>
            <p className={styles.ctaSub}>Free to play · No credit card · Start in 30 seconds</p>
          </div>

          {/* Live Stats */}
          <div className={styles.liveStats}>
            <StatCounter value={847} label="Lives Saved" delay={0} />
            <StatCounter value={16} label="Missions" delay={200} />
            <StatCounter value={3} label="Arcs Live" delay={400} />
            <StatCounter value={200} label="Years Lost" delay={600} />
          </div>

        </div>

        <div className={styles.scrollCue}>
          <span className={styles.scrollArrow}>↓</span>
          <span className={styles.scrollText}>The story</span>
        </div>
      </section>

      {/* ── Lower sections — Aurora background ── */}
      <div className={styles.lowerSections}>
        <AuroraBorealisShader className={styles.auroraBackground} />

        {/* ── Story Panels ── */}
        <Reveal className={styles.storySection} threshold={0.1}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionLabel}>THE ORIGIN</div>
            <h2 className={styles.sectionTitle}>How it begins</h2>
          </div>

          <div className={styles.storyGrid}>
            {STORY_CARDS.map((card, i) => (
              <PaperCrumple
                key={card.num}
                folds={6}
                intensity={0.15}
                color="#0a0f1a"
                animateOnMount={true}
                className={styles.storyCard}
                style={{ animationDelay: `${i * 120}ms` }}
              >
                <div className={styles.storyCardInner}>
                  <div className={styles.storyNum}>{card.num}</div>
                  <h3 className={styles.storyCardTitle}>{card.title}</h3>
                  <p className={styles.storyCardBody}>{card.body}</p>
                </div>
              </PaperCrumple>
            ))}
          </div>

          <div className={styles.archiveQuote}>
            <span className={styles.archiveQuoteMark}>"</span>
            <GlitchText intensity={0.04} colors={["#39d0d8", "#bc8cff"]} speed={0.3}>
              The query is always the same. You just have to ask the right question.
            </GlitchText>
            <span className={styles.archiveQuoteMark}>"</span>
            <div className={styles.archiveQuoteBy}>— Final entry, Archivist's Journal</div>
          </div>
        </Reveal>

        {/* ── Worlds ── */}
        <Reveal className={styles.worldsSection} threshold={0.1}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionLabel}>CHOOSE YOUR WORLD</div>
            <h2 className={styles.sectionTitle}>Where do you want to go?</h2>
          </div>

          <div className={styles.worldsGrid}>
            {/* DATHOS */}
            <PaperCrumple
              folds={5}
              intensity={0.12}
              color="#080d16"
              className={styles.worldCard}
            >
              <div className={styles.worldCardInner}>
                <CelestialSphere
                  hue={200}
                  speed={0.25}
                  zoom={1.3}
                  particleSize={4.0}
                  className={styles.dathosCelestial}
                />
                <div className={styles.worldStatus}>
                  <span className={styles.worldStatusDot} />
                  AVAILABLE NOW
                </div>
                <div className={styles.worldPlanetIcon}>◉</div>
                <h3 className={styles.worldName}>Planet DATHOS</h3>
                <div className={styles.worldSkill}>SQL Foundation</div>
                <p className={styles.worldDesc}>
                  Restore The Archive. End the famine. Tear down the wall.
                  Every query you write changes this world.
                </p>
                <div className={styles.worldStats}>
                  <span>16 missions</span>
                  <span>3 arcs live</span>
                  <span>∞ stakes</span>
                </div>
                <RippleButton
                  rippleColor="rgba(57, 208, 216, 0.35)"
                  className={styles.worldCta}
                  onClick={onStartMission}
                >
                  ▶ Start Mission
                </RippleButton>
              </div>
            </PaperCrumple>

            {/* NEXUS */}
            <PaperCrumple
              folds={5}
              intensity={0.12}
              color="#050814"
              className={`${styles.worldCard} ${styles.worldCardLocked}`}
            >
              <div className={styles.worldCardInner}>
                <NexusGlitch />
                <div className={`${styles.worldStatus} ${styles.worldStatusLocked}`}>
                  <span className={styles.lockIcon}>🔒</span>
                  COMING SOON
                </div>
                <div className={`${styles.worldPlanetIcon} ${styles.worldPlanetLocked}`}>◎</div>
                <h3 className={styles.worldName}>Planet Nexus</h3>
                <div className={styles.worldSkill}>Machine Learning</div>
                <p className={styles.worldDesc}>
                  The Archive is restored. But knowing what IS is not the same
                  as knowing what SHOULD BE.
                </p>
                <blockquote className={styles.zeroQuote}>
                  "Knowing what IS is not the same as knowing what SHOULD BE."
                  <cite>— ZERO</cite>
                </blockquote>
                <button className={styles.worldCtaLocked} disabled>
                  🔒 Join Waitlist
                </button>
              </div>
            </PaperCrumple>
          </div>
        </Reveal>

        {/* ── Features / Tech Stack ── */}
        <Reveal className={styles.featuresSection} threshold={0.1}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionLabel}>BUILT FOR DEVELOPERS</div>
            <h2 className={styles.sectionTitle}>Real SQL. Real Database. Real Learning.</h2>
          </div>

          <div className={styles.featuresGrid}>
            <FeatureCard
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path d="M4 7V4h16v3M9 20h6M12 4v16" strokeLinecap="round" strokeLinejoin="round" />
                  <rect x="2" y="7" width="20" height="13" rx="1" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              }
              title="Real SQLite in WASM"
              desc="Execute actual SQL against a real database engine compiled to WebAssembly. No simulation, no tricks."
            />
            <FeatureCard
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              }
              title="Instant Feedback"
              desc="See results instantly. Query validation runs server-side with the same engine. Sub-100ms latency."
            />
            <FeatureCard
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="9" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              }
              title="Story-Driven Progress"
              desc="16 missions across 3 arcs. Each query restores a piece of the Dathos Archive. Your code has consequences."
            />
            <FeatureCard
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <circle cx="12" cy="12" r="10" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 6v6l4 2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              }
              title="Streaks & Mastery"
              desc="Daily streaks, XP, identity choices (Rookie/Engineer/Agent), and tempo settings. Build a habit that sticks."
            />
          </div>
        </Reveal>

        {/* ── Footer ── */}
        <footer className={styles.footer}>
          <div className={styles.footerLogo}>QueryQuest</div>
          <p className={styles.footerLine}>
            The query is always the same. You just have to ask the right question.
          </p>
          <p className={styles.footerCopy}>© 2026 QueryQuest · All data belongs to the people</p>
        </footer>

      </div>{/* end lowerSections */}

    </div>
  )
}

// ── Feature Card Component ──────────────────────────────────────
function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode
  title: string
  desc: string
}) {
  return (
    <PaperCrumple
      folds={4}
      intensity={0.08}
      color="#0a0f1a"
      className={styles.featureCard}
    >
      <div className={styles.featureCardInner}>
        <div className={styles.featureIcon}>
          {icon}
        </div>
        <h3 className={styles.featureTitle}>{title}</h3>
        <p className={styles.featureDesc}>{desc}</p>
      </div>
    </PaperCrumple>
  )
}