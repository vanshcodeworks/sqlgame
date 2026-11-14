import { useEffect, useRef, useState } from 'react'
import { useTypewriter } from '../hooks/useTypewriter.ts'
import { useWebGLBackground } from '../hooks/useWebGLBackground.ts'
import CelestialSphere from './CelestialSphere.tsx'
import AuroraBorealisShader from './AuroraBorealisShader.tsx'
import { trackPage, trackScrollDepth, trackClick } from '../lib/analytics.ts'
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

export function LandingPage({ onStartMission }: Props) {
  const bgRef = useWebGLBackground()
  const tw = useTypewriter(HEADLINE_LINES, { speed: 38, pauseBetween: 700, startDelay: 600 })

  // Pre-signup funnel: how long people stay and whether they ever reach the
  // story section. This is the only place we can measure the hero's hook.
  useEffect(() => {
    trackPage('landing')
    trackScrollDepth('landing')
  }, [])

  function handleCta(target: string) {
    trackClick('landing', target)
    onStartMission()
  }

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

        <nav className={styles.nav}>
          <span className={styles.navBrand}>
            <span className={styles.navMark} aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <circle cx="10.5" cy="10.5" r="6" stroke="#39d0d8" strokeWidth="2.1" />
                <path d="M15 15l5 5" stroke="#39d0d8" strokeWidth="2.1" strokeLinecap="round" />
                <path d="M8 10.5h5" stroke="#ff79c6" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </span>
            <span className={styles.navLogo}>QueryQuest</span>
          </span>
          <span className={styles.navTag}>Planet Dathos · Arc I</span>
        </nav>

        <div className={styles.heroContent}>

          <div className={styles.planetBadge}>
            <span className={styles.planetDot} />
            Planet Dathos · Sector 1
          </div>

          <div className={styles.logoWrap}>
            <h1 className={styles.archiveTitle}>
              THE<br />ARCHIVE
            </h1>
            <div className={styles.questLineWrap}>
              <span className={styles.questWord}>QueryQuest</span>
              <span className={styles.questSub}>SQL Foundation · Season One</span>
            </div>
          </div>

          <div className={styles.headlineWrap}>
            {tw.lines.map((line, i) => (
              <p key={i} className={styles.headlineLine}>{line}</p>
            ))}
            {!tw.done && (
              <p className={styles.headlineLine}>
                {tw.current}<span className={styles.cursor}>▌</span>
              </p>
            )}
          </div>

          <div className={styles.ctaWrap}>
            <button className={styles.ctaBtn} onClick={() => handleCta('hero_cta')}>
              <div className={styles.ctaBtnGlowRing} />
              <div
                className={styles.ctaBtnGlass}
                style={{ backdropFilter: 'url("#glass-filter")' }}
              />
              <span className={styles.ctaBtnContent}>
                <span className={styles.ctaBtnIcon}>▶</span>
                START MISSION
              </span>
            </button>
            <p className={styles.ctaSub}>Free to play · No credit card · Start in 30 seconds</p>
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
            <div
              key={card.num}
              className={styles.storyCard}
              style={{ animationDelay: `${i * 120}ms` }}
            >
              <div className={styles.storyNum}>{card.num}</div>
              <h3 className={styles.storyCardTitle}>{card.title}</h3>
              <p className={styles.storyCardBody}>{card.body}</p>
            </div>
          ))}
        </div>

        <div className={styles.archiveQuote}>
          <span className={styles.archiveQuoteMark}>"</span>
          The query is always the same. You just have to ask the right question.
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
          <div className={styles.worldCard}>
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
            <button className={styles.worldCta} onClick={() => handleCta('world_card_cta')}>
              ▶ Start Mission
            </button>
          </div>

          {/* NEXUS */}
          <div className={`${styles.worldCard} ${styles.worldCardLocked}`}>
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