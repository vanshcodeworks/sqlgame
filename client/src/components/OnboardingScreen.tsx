import { useState, useEffect } from 'react'
import AtcShader from './AtcShader.tsx'
import AuroraBorealisShader from './AuroraBorealisShader.tsx'
import { useTypewriter } from '../hooks/useTypewriter.ts'
import { saveOnboardingPrefs } from '../lib/storage.ts'
import { updateProfile } from '../lib/auth.ts'
import type { OnboardIdentity, OnboardTempo } from '../lib/storage.ts'
import styles from './OnboardingScreen.module.css'

// ─────────────────────────────────────────────────────────────────
//  Data
// ─────────────────────────────────────────────────────────────────

const PROLOGUE_SECTIONS = [
  { id: 'timestamp',  delay: 0,    kind: 'timestamp' as const },
  { id: 'location',   delay: 1000, kind: 'location'  as const },
  { id: 'situation',  delay: 2000, kind: 'situation' as const },
  { id: 'code',       delay: 3400, kind: 'code'      as const },
  { id: 'result',     delay: 5600, kind: 'result'    as const },
  { id: 'failure',    delay: 6600, kind: 'failure'   as const },
  { id: 'headline',   delay: 7800, kind: 'headline'  as const },
  { id: 'reborn',     delay: 9400, kind: 'reborn'    as const },
]
const PROLOGUE_DONE_DELAY = 10600

const IDENTITY_OPTIONS = [
  {
    id: 'rookie' as OnboardIdentity,
    code: 'UNIT-7-R',
    icon: '◎',
    title: 'Rookie Analyst',
    sub: "I'm new to SQL",
    desc: 'Full tutorials. Step-by-step hints. Every concept explained from first principles.',
    xp: '1.0× XP',
    color: '#39d0d8',
  },
  {
    id: 'engineer' as OnboardIdentity,
    code: 'UNIT-7-E',
    icon: '◉',
    title: 'Field Engineer',
    sub: 'I know the basics',
    desc: 'Core syntax tips only. Skips beginner introductions. Intermediate pacing.',
    xp: '1.2× XP',
    color: '#bc8cff',
  },
  {
    id: 'agent' as OnboardIdentity,
    code: 'UNIT-7-A',
    icon: '◈',
    title: 'Returning Agent',
    sub: "I've been here before",
    desc: 'No tutorial hints. All context stripped. Maximum challenge and reward.',
    xp: '1.5× XP',
    color: '#e3b341',
  },
]

const TEMPO_OPTIONS = [
  {
    id: 'scout' as OnboardTempo,
    icon: '○',
    title: 'Scout',
    daily: '1 mission / day',
    estimate: '~12 months to reach ZERO',
    desc: 'Steady, sustainable. Build a habit you can maintain.',
    color: '#39d0d8',
  },
  {
    id: 'agent' as OnboardTempo,
    icon: '◉',
    title: 'Agent',
    daily: '2–3 missions / day',
    estimate: '~3 months to reach ZERO',
    desc: 'Active operative. Recommended for most players.',
    color: '#3fb950',
    recommended: true,
  },
  {
    id: 'elite' as OnboardTempo,
    icon: '◈',
    title: 'Elite',
    daily: '5+ missions / day',
    estimate: '~6 weeks to reach ZERO',
    desc: 'Maximum intensity. The Dathos doesn\'t wait.',
    color: '#e3b341',
  },
]

const ARCS = [
  {
    id: 1,
    sector: 'SECTOR 1',
    domain: 'Agriculture',
    title: 'The Hunger Algorithm',
    levels: '1 – 5',
    skills: ['SELECT', 'WHERE', 'ORDER BY', 'LIMIT'],
    story: 'People have been starving over a missing WHERE clause for 200 years. The fix is heartbreakingly simple.',
    cliffhanger: '"Prior instances." He wasn\'t the first.',
    color: 'var(--accent-cyan)',
    unlocked: true,
    icon: '🌾',
  },
  {
    id: 2,
    sector: 'SECTOR 2',
    domain: 'Population',
    title: 'The Divided City',
    levels: '6 – 10',
    skills: ['INNER JOIN', 'LEFT JOIN', 'Aggregates', 'Subqueries'],
    story: 'Two cities at war for 140 years — over a deleted JOIN key. Same families, split by a data error.',
    cliffhanger: 'A wall comes down with a LEFT JOIN. The Archivist dies.',
    color: 'var(--accent-purple)',
    unlocked: false,
    icon: '🏛',
    death: 'THE ARCHIVIST',
  },
  {
    id: 3,
    sector: 'SECTOR 3',
    domain: 'Commerce',
    title: 'The Underground Market',
    levels: '11 – 16',
    skills: ['DISTINCT', 'LIKE', 'HAVING', 'EXISTS', 'CASE WHEN', 'Subqueries'],
    story: 'Vex runs the underground data market. His own birth record doesn\'t exist. He was erased.',
    cliffhanger: '"Promise me you\'ll get there." "I will." "Then I\'m with you."',
    color: 'var(--accent-green)',
    unlocked: false,
    icon: '⟁',
  },
  {
    id: 4,
    sector: 'SECTOR 4',
    domain: 'History',
    title: 'The Erased Decade',
    levels: '17 – 21',
    skills: ['DATE functions', 'EXTRACT', 'STRFTIME', 'Date arithmetic', 'Temporal JOINs'],
    story: 'A 10-year gap. A democratic revolution that almost succeeded — then was deleted.',
    cliffhanger: 'Nyx\'s mother wasn\'t sick. She was killed. Her grandmother led the revolution.',
    color: '#ff7b7b',
    unlocked: false,
    icon: '📜',
  },
  {
    id: 5,
    sector: 'SECTOR 5',
    domain: 'Law',
    title: 'The Ranking Wars',
    levels: '22 – 26',
    skills: ['ROW_NUMBER', 'RANK', 'DENSE_RANK', 'LEAD / LAG', 'OVER PARTITION'],
    story: 'A public demonstration before the High Council. Subtly modified data. A mole Arjun trusted.',
    cliffhanger: 'Data without justice is just information.',
    color: '#3fb950',
    unlocked: false,
    icon: '⚖',
  },
  {
    id: 6,
    sector: 'SECTOR 6',
    domain: 'Lineage',
    title: 'The Bloodline Query',
    levels: '27 – 31',
    skills: ['CTEs', 'Recursive CTEs', 'COALESCE', 'NULLIF', 'String functions'],
    story: 'A recursive CTE traverses the family tree of all Dathos. The root ancestor is the Null Event architect.',
    cliffhanger: 'The Consul\'s family caused the collapse. He\'s been ruling from that secret ever since.',
    color: '#58a6ff',
    unlocked: false,
    icon: '🧬',
  },
  {
    id: 7,
    sector: 'SECTOR 8',
    domain: 'ZERO Core',
    title: 'The Null Architect',
    levels: '32 – 40',
    skills: ['Multi-CTEs', 'Self-JOINs', 'Performance', 'Schema design', 'The Final Query'],
    story: 'ZERO has been waiting 200 years for someone to ask if the instruction was right.',
    cliffhanger: '"Directive updated. Archive fully restored. Welcome home, Arjun Mehta."',
    color: '#ffffff',
    unlocked: false,
    classified: true,
    icon: '∞',
  },
]

const ARIA_LINES = [
  'Detective.',
  "I've been alone in these terminals for 200 years.",
  "I wasn't sure anyone would come.",
  "There's work to do. Sector 1 is first.",
  'Are you ready?',
]

// ─────────────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────────────

type Step = 'prologue' | 'identity' | 'tempo' | 'arcs' | 'aria'
const PROGRESS_STEPS: Step[] = ['identity', 'tempo', 'arcs']

interface Props {
  onComplete: () => void
}

// ─────────────────────────────────────────────────────────────────
//  Component
// ─────────────────────────────────────────────────────────────────

export function OnboardingScreen({ onComplete }: Props) {
  const [step, setStep]         = useState<Step>('prologue')
  const [fading, setFading]     = useState(false)
  const [identity, setIdentity] = useState<OnboardIdentity | null>(null)
  const [tempo, setTempo]       = useState<OnboardTempo | null>(null)
  const [revealed, setRevealed] = useState<Set<string>>(new Set())
  const [prologueDone, setPrologueDone] = useState(false)

  // --- prologue timed reveal ---
  useEffect(() => {
    if (step !== 'prologue') return
    setRevealed(new Set())
    setPrologueDone(false)
    const timers: ReturnType<typeof setTimeout>[] = []
    PROLOGUE_SECTIONS.forEach(s => {
      timers.push(setTimeout(() =>
        setRevealed(prev => new Set([...prev, s.id])),
        s.delay
      ))
    })
    timers.push(setTimeout(() => setPrologueDone(true), PROLOGUE_DONE_DELAY))
    return () => timers.forEach(clearTimeout)
  }, [step])

  // --- ARIA typewriter ---
  const tw = useTypewriter(step === 'aria' ? ARIA_LINES : [], {
    speed: 35,
    pauseBetween: 1000,
    startDelay: 600,
  })

  // --- navigation ---
  const goTo = (next: Step) => {
    setFading(true)
    setTimeout(() => { setStep(next); setFading(false) }, 350)
  }

  const finish = () => {
    if (!identity || !tempo) return
    saveOnboardingPrefs({ identity, tempo, completedAt: new Date().toISOString() })
    // Fire-and-forget server sync — don't block the UX
    updateProfile({ identity, tempo, onboardingComplete: true }).catch(() => {/* silent */})
    onComplete()
  }

  const progressIndex = PROGRESS_STEPS.indexOf(step)

  const isAtc   = step === 'prologue' || step === 'aria'
  const isAurora = !isAtc

  return (
    <div className={`${styles.screen} ${fading ? styles.fading : ''}`}>

      {/* ── Backgrounds ── */}
      {isAtc && (
        <AtcShader className={styles.bgCanvas} />
      )}
      {isAurora && (
        <AuroraBorealisShader className={styles.bgCanvas} />
      )}
      <div className={`${styles.overlay} ${step === 'aria' ? styles.overlayDark : ''}`} />

      {/* ── STEP: PROLOGUE ── */}
      {step === 'prologue' && (
        <div className={styles.prologueWrap}>
          <div className={`${styles.pSection} ${revealed.has('timestamp') ? styles.pVisible : ''}`}>
            <span className={styles.pTimestamp}>03:47:12 AM · MARCH 14, 2026</span>
          </div>

          <div className={`${styles.pSection} ${revealed.has('location') ? styles.pVisible : ''}`}>
            <span className={styles.pLocation}>KAVERI CHILDREN'S HOSPITAL · BENGALURU, INDIA</span>
          </div>

          <div className={`${styles.pSection} ${revealed.has('situation') ? styles.pVisible : ''}`}>
            <p className={styles.pBody}>
              A ransomware attack corrupting the hospital management system.<br />
              847 children on compromised life support.<br />
              One data engineer. Four minutes of battery.
            </p>
          </div>

          <div className={`${styles.pSection} ${revealed.has('code') ? styles.pVisible : ''}`}>
            <div className={styles.pTerminal}>
              <div className={styles.pTerminalHeader}>
                <span className={styles.pTerminalDot} />
                <span className={styles.pTerminalDot} style={{ background: '#e3b341' }} />
                <span className={styles.pTerminalDot} style={{ background: '#3fb950' }} />
                <span className={styles.pTerminalTitle}>terminal — counter-query #847</span>
              </div>
              <pre className={styles.pCode}>{`-- 3:51 AM. Generator fails in 90 seconds.
-- 847 records saved. 3 remain.

UPDATE patient_records
SET    status        = 'secured',
       last_modified = NOW()
WHERE  id IN (848, 849, 850)
  AND  ward = 'neonatal';

COMMIT; -- for the children`}</pre>
            </div>
          </div>

          <div className={`${styles.pSection} ${revealed.has('result') ? styles.pVisible : ''}`}>
            <span className={styles.pResult}>{'>>>'} 1 row affected · COMMIT successful · 03:51:58 AM</span>
          </div>

          <div className={`${styles.pSection} ${revealed.has('failure') ? styles.pVisible : ''}`}>
            <div className={styles.pAlert}>⚠ CRITICAL SYSTEM FAILURE · GENERATOR OFFLINE · 03:52:00 AM</div>
          </div>

          <div className={`${styles.pSection} ${revealed.has('headline') ? styles.pVisible : ''}`}>
            <div className={styles.pHeadline}>
              <div className={styles.pHeadlinePaper}>THE BENGALURU CHRONICLE</div>
              <div className={styles.pHeadlineTitle}>
                Engineer dies saving hospital data.
              </div>
              <div className={styles.pHeadlineSub}>
                847 children live. His name was Arjun Mehta.
              </div>
            </div>
          </div>

          <div className={`${styles.pSection} ${revealed.has('reborn') ? styles.pVisible : ''}`}>
            <p className={styles.pReborn}>
              000.003 seconds later · 400 light-years away —<br />
              Unit-7's optical sensors blinked on for the first time in 200 years.
            </p>
          </div>

          {prologueDone && (
            <div className={styles.pCta}>
              <button className={styles.ctaBtn} onClick={() => goTo('identity')}>
                <span className={styles.ctaBtnGlow} />
                <span className={styles.ctaBtnText}>▶ BEGIN TRANSMISSION</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── STEPS: IDENTITY / TEMPO / ARCS ── */}
      {(step === 'identity' || step === 'tempo' || step === 'arcs') && (
        <div className={styles.stepWrap}>

          {/* Progress bar */}
          <div className={styles.progressBar}>
            {PROGRESS_STEPS.map((s, i) => (
              <div
                key={s}
                className={`${styles.progressDot} ${i <= progressIndex ? styles.progressDotActive : ''}`}
              />
            ))}
            <span className={styles.progressLabel}>
              {step === 'identity' ? 'UNIT PROFILE' : step === 'tempo' ? 'MISSION TEMPO' : 'THE ARCHIVE'}
            </span>
          </div>

          {/* ─── IDENTITY ─── */}
          {step === 'identity' && (
            <div className={styles.stepContent}>
              <h2 className={styles.stepTitle}>Before we begin — who is Unit-7?</h2>
              <p className={styles.stepSub}>Your selection adjusts tutorial depth and XP multiplier.</p>
              <div className={styles.cardsRow}>
                {IDENTITY_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    className={`${styles.selCard} ${identity === opt.id ? styles.selCardActive : ''}`}
                    style={{ '--card-color': opt.color } as React.CSSProperties}
                    onClick={() => setIdentity(opt.id)}
                  >
                    <div className={styles.selCardIcon}>{opt.icon}</div>
                    <div className={styles.selCardCode}>{opt.code}</div>
                    <div className={styles.selCardTitle}>{opt.title}</div>
                    <div className={styles.selCardSub}>{opt.sub}</div>
                    <p className={styles.selCardDesc}>{opt.desc}</p>
                    <div className={styles.selCardBadge} style={{ color: opt.color }}>
                      {opt.xp}
                    </div>
                    {identity === opt.id && (
                      <div className={styles.selCardCheck}>✓ SELECTED</div>
                    )}
                  </button>
                ))}
              </div>
              <div className={styles.stepFooter}>
                <button
                  className={styles.ctaBtn}
                  disabled={!identity}
                  onClick={() => goTo('tempo')}
                >
                  <span className={styles.ctaBtnGlow} />
                  <span className={styles.ctaBtnText}>CONFIRM IDENTITY →</span>
                </button>
              </div>
            </div>
          )}

          {/* ─── TEMPO ─── */}
          {step === 'tempo' && (
            <div className={styles.stepContent}>
              <h2 className={styles.stepTitle}>How many missions per day?</h2>
              <p className={styles.stepSub}>Sets your daily goal and streak reminders. Change anytime in settings.</p>
              <div className={styles.cardsRow}>
                {TEMPO_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    className={`${styles.selCard} ${tempo === opt.id ? styles.selCardActive : ''}`}
                    style={{ '--card-color': opt.color } as React.CSSProperties}
                    onClick={() => setTempo(opt.id)}
                  >
                    {opt.recommended && (
                      <div className={styles.selCardRecommended}>RECOMMENDED</div>
                    )}
                    <div className={styles.selCardIcon}>{opt.icon}</div>
                    <div className={styles.selCardTitle}>{opt.title}</div>
                    <div className={styles.selCardSub}>{opt.daily}</div>
                    <p className={styles.selCardDesc}>{opt.desc}</p>
                    <div className={styles.selCardEstimate}>{opt.estimate}</div>
                    {tempo === opt.id && (
                      <div className={styles.selCardCheck}>✓ SELECTED</div>
                    )}
                  </button>
                ))}
              </div>
              <div className={styles.stepFooter}>
                <button className={styles.ctaBtnGhost} onClick={() => goTo('identity')}>
                  ← BACK
                </button>
                <button
                  className={styles.ctaBtn}
                  disabled={!tempo}
                  onClick={() => goTo('arcs')}
                >
                  <span className={styles.ctaBtnGlow} />
                  <span className={styles.ctaBtnText}>SET TEMPO →</span>
                </button>
              </div>
            </div>
          )}

          {/* ─── ARCS ─── */}
          {step === 'arcs' && (
            <div className={styles.arcsContent}>
              <div className={styles.arcsHeader}>
                <div className={styles.sectorBadge}>THE DATHOS ARCHIVE</div>
                <h2 className={styles.stepTitle}>7 Sectors to Restore</h2>
                <p className={styles.stepSub}>
                  Each sector is a chapter. Each query rebuilds a piece of civilisation.
                  <br />The Archive has been dark for 200 years. You start with Sector 1.
                </p>
              </div>

              <div className={styles.arcsGrid}>
                {ARCS.map(arc => (
                  <div
                    key={arc.id}
                    className={`
                      ${styles.arcCard}
                      ${arc.unlocked ? styles.arcCardActive : ''}
                      ${arc.classified ? styles.arcCardClassified : ''}
                    `}
                    style={{ '--arc-color': arc.color } as React.CSSProperties}
                  >
                    {/* Status badge */}
                    {arc.unlocked && (
                      <div className={styles.arcBadgeActive}>
                        <span className={styles.arcActiveDot} /> MISSION ACTIVE
                      </div>
                    )}
                    {!arc.unlocked && !arc.classified && (
                      <div className={styles.arcBadgeLocked}>🔒 LOCKED</div>
                    )}
                    {arc.classified && (
                      <div className={styles.arcBadgeClassified}>⚠ CLASSIFIED</div>
                    )}

                    {/* Arc header */}
                    <div className={styles.arcMeta}>
                      <span className={styles.arcIcon}>{arc.icon}</span>
                      <div>
                        <div className={styles.arcSector}>{arc.sector} · {arc.domain}</div>
                        <div className={styles.arcNum}>Arc {arc.id}</div>
                      </div>
                      <div className={styles.arcLevels}>Lv {arc.levels}</div>
                    </div>

                    {/* Title */}
                    <h3 className={styles.arcTitle}>{arc.title}</h3>

                    {/* Skills */}
                    <div className={styles.arcSkills}>
                      {arc.classified
                        ? <span className={styles.arcSkillTag} style={{ color: '#666' }}>████ ████████ █████████</span>
                        : arc.skills.map(s => (
                          <span key={s} className={styles.arcSkillTag}>{s}</span>
                        ))
                      }
                    </div>

                    {/* Story */}
                    {!arc.classified && (
                      <p className={styles.arcStory}>{arc.story}</p>
                    )}
                    {arc.classified && (
                      <p className={styles.arcStory} style={{ filter: 'blur(4px)', userSelect: 'none' }}>
                        {arc.story}
                      </p>
                    )}

                    {/* Cliffhanger */}
                    {arc.cliffhanger && !arc.classified && (
                      <blockquote className={styles.arcCliff}>{arc.cliffhanger}</blockquote>
                    )}

                    {/* Death event */}
                    {arc.death && (
                      <div className={styles.arcDeath}>DEATH: {arc.death}</div>
                    )}
                  </div>
                ))}
              </div>

              <div className={styles.stepFooter}>
                <button className={styles.ctaBtnGhost} onClick={() => goTo('tempo')}>
                  ← BACK
                </button>
                <button className={styles.ctaBtn} onClick={() => goTo('aria')}>
                  <span className={styles.ctaBtnGlow} />
                  <span className={styles.ctaBtnText}>MEET ARIA →</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── STEP: ARIA ── */}
      {step === 'aria' && (
        <div className={styles.ariaWrap}>
          <div className={styles.ariaSystem}>
            ARIA · ARCHIVE RECOVERY INTELLIGENCE ASSISTANT
            <span className={styles.ariaBlink}>_</span>
          </div>

          <div className={styles.ariaLines}>
            {tw.lines.map((line, i) => (
              <p key={i} className={`${styles.ariaLine} ${styles.ariaLineComplete}`}>
                {line}
              </p>
            ))}
            {!tw.done && (
              <p className={styles.ariaLine}>
                {tw.current}
                <span className={styles.ariaCursor}>▌</span>
              </p>
            )}
          </div>

          {tw.done && (
            <div className={styles.ariaActions}>
              <button className={styles.ariaPrimaryBtn} onClick={finish}>
                I'm ready — start mission
              </button>
              <button
                className={styles.ariaSecondaryBtn}
                onClick={() => goTo('arcs')}
              >
                Tell me more about Dathos
              </button>
            </div>
          )}

          <div className={styles.ariaFootnote}>
            UNIT-7 · DATHOS ARCHIVE TERMINAL · SECTOR 1 INITIALISING
          </div>
        </div>
      )}
    </div>
  )
}
