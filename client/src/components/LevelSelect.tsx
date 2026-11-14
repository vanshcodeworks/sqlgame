import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import type { Level } from '../types/index.ts'
import { ARC_DEFS, levelArcId } from '../data/arcs.ts'
import { NumberTicker, ProgressRing, ShimmerButton, DotPattern, Confetti } from './ui/magic-ui.tsx'
import { ShareCard } from './ShareCard.tsx'
import { loadOnboardingPrefs } from '../lib/storage.ts'
import styles from './LevelSelect.module.css'

interface Props {
  levels:          Level[]
  completedLevels: number[]
  arcAccess?:      number[]
  todayCount?:     number
  onSelect:        (id: number) => void
  onOpenSettings?: () => void
}

/** Daily mission targets that match the onboarding tempo copy. */
const TEMPO_TARGET: Record<string, number> = { scout: 1, agent: 3, elite: 5 }

export function LevelSelect({
  levels, completedLevels, arcAccess, todayCount = 0, onSelect, onOpenSettings,
}: Props) {
  const location = useLocation()

  useEffect(() => {
    if (!location.hash) return
    const el = document.getElementById(location.hash.slice(1))
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [location.hash])

  // ── Sector-completion detection ──────────────────────────────
  // When an arc transitions from "some levels done" to "all levels done",
  // celebrate and offer the share card. The first run only records state so
  // returning players don't get a share prompt for arcs finished long ago.
  const arcsDoneRef = useRef<Set<number> | null>(null)
  const [shareArc, setShareArc] = useState<typeof ARC_DEFS[number] | null>(null)
  const [confetti, setConfetti] = useState(0)

  useEffect(() => {
    // Which arcs now have every mission cleared.
    const nowDone = new Set<number>()
    for (const arc of ARC_DEFS) {
      const arcLevels = levels.filter(l => l.id >= arc.levels[0] && l.id <= arc.levels[1])
      if (arcLevels.length > 0 && arcLevels.every(l => completedLevels.includes(l.id))) {
        nowDone.add(arc.id)
      }
    }

    // First run only records the baseline — never prompt on mount.
    if (arcsDoneRef.current === null) {
      arcsDoneRef.current = nowDone
      return
    }
    const newly = [...nowDone].find(id => !arcsDoneRef.current!.has(id))
    arcsDoneRef.current = nowDone
    if (newly !== undefined) {
      const arc = ARC_DEFS.find(a => a.id === newly)
      if (arc) {
        setShareArc(arc)
        setConfetti(c => c + 1)
      }
    }
  }, [completedLevels, levels])

  // SQL concepts the player has actually used across completed missions.
  const conceptsUsed = (): string[] => {
    const set = new Set<string>()
    for (const level of levels) {
      if (!completedLevels.includes(level.id)) continue
      for (const c of conceptsOf(level)) set.add(c)
    }
    return [...set]
  }

  const safeArcAccess = arcAccess ?? ARC_DEFS.map(arc => arc.id)
  const prefs          = loadOnboardingPrefs()
  const dailyTarget    = TEMPO_TARGET[prefs?.tempo ?? 'agent'] ?? 3

  function isUnlocked(level: Level) {
    const index = levels.findIndex(l => l.id === level.id)
    if (index <= 0) return true
    return completedLevels.includes(levels[index - 1].id)
  }

  type Status = 'completed' | 'current' | 'available' | 'locked' | 'arcLocked'
  function levelStatus(level: Level): Status {
    const arcId = levelArcId(level.id)
    if (!safeArcAccess.includes(arcId)) return 'arcLocked'
    if (completedLevels.includes(level.id)) return 'completed'
    if (isUnlocked(level)) return 'current'
    return 'locked'
  }

  const total     = levels.length
  const completed = completedLevels.length
  const remaining = total - completed

  // "Continue" always points at the first unfinished level, never level 1.
  const nextLevel = levels.find(l => !completedLevels.includes(l.id)) ?? levels[0]
  const arcOfNext = nextLevel ? levelArcId(nextLevel.id) : 1
  const nextArc   = ARC_DEFS.find(a => a.id === arcOfNext)

  return (
    <main className={styles.page}>
      <DotPattern className={styles.backdrop} size={22} color="oklch(1 0 0 / 0.05)" />

      {/* ── Masthead ────────────────────────────────────────────── */}
      <header className={styles.masthead}>
        <div className={styles.mastheadRow}>
          <div className={styles.mastheadLeft}>
            <div className={styles.eyebrow}>
              <span className={styles.eyebrowDot} />
              Unit-7 · Dathos Archive Terminal
            </div>
            <h1 className={styles.title}>Mission Index</h1>
            <p className={styles.deck}>
              {remaining > 0
                ? <>Restore the Archive — <strong className={styles.remainingCount}>{remaining}</strong> mission{remaining !== 1 ? 's' : ''} left, one query at a time.</>
                : <>Every fragment recovered. The Archive is whole.</>}
            </p>
          </div>

          <div className={styles.mastheadRight}>
            <ProgressRing
              value={Math.min(todayCount, dailyTarget)}
              max={dailyTarget}
              label={String(Math.min(todayCount, dailyTarget))}
              sublabel={`/ ${dailyTarget} today`}
              color={todayCount >= dailyTarget ? 'var(--accent-green)' : 'var(--accent-cyan)'}
            />
            <div className={styles.overallProgress}>
              <div className={styles.overallNumbers}>
                <NumberTicker value={completed} className={styles.overallDone} />
                <span className={styles.overallTotal}>/ {total}</span>
              </div>
              <div className={styles.overallLabel}>missions restored</div>
              <div className={styles.overallMeter} aria-hidden="true">
                <div
                  className={styles.overallMeterFill}
                  style={{ width: `${total ? (completed / total) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Persistent continuation — the single strongest retention element. */}
        {nextLevel && remaining > 0 && (
          <div className={styles.resume}>
            <div className={styles.resumeMeta}>
              <span className={styles.resumeLabel}>Continue</span>
              <span className={styles.resumeArc}>
                Arc {arcOfNext}{nextArc ? ` · ${nextArc.title}` : ''}
              </span>
            </div>
            <div className={styles.resumeBody}>
              <span className={styles.resumeIndex}>{String(nextLevel.id).padStart(2, '0')}</span>
              <span className={styles.resumeTitle}>{nextLevel.title}</span>
            </div>
            <ShimmerButton onClick={() => onSelect(nextLevel.id)}>
              Resume ▸
            </ShimmerButton>
          </div>
        )}
      </header>

      {/* ── Arc sections ────────────────────────────────────────── */}
      <div className={styles.arcs}>
        {ARC_DEFS.map(arc => {
          const arcLevels    = levels.filter(l => l.id >= arc.levels[0] && l.id <= arc.levels[1])
          const hasAccess    = safeArcAccess.includes(arc.id)
          const arcCompleted = arcLevels.filter(l => completedLevels.includes(l.id)).length

          if (arcLevels.length === 0 && !hasAccess) {
            return (
              <section
                id={`arc-${arc.id}`}
                key={arc.id}
                className={styles.arc}
                style={{ '--arc-color': arc.color } as React.CSSProperties}
              >
                <ArcMasthead arc={arc} completed={0} total={0} />
                {onOpenSettings && <LockedBanner arc={arc} onSettings={onOpenSettings} />}
              </section>
            )
          }

          if (arcLevels.length === 0) return null

          const allDone = arcCompleted === arcLevels.length

          return (
            <section
              id={`arc-${arc.id}`}
              key={arc.id}
              className={styles.arc}
              style={{ '--arc-color': arc.color } as React.CSSProperties}
            >
              <ArcMasthead arc={arc} completed={arcCompleted} total={arcLevels.length} />

              {!hasAccess ? (
                onOpenSettings && <LockedBanner arc={arc} onSettings={onOpenSettings} />
              ) : (
                <>
                  <div className={styles.index} role="list">
                    <div className={styles.indexHead} aria-hidden="true">
                      <span>№</span>
                      <span>Mission</span>
                      <span>Concepts</span>
                      <span>Status</span>
                    </div>
                    {arcLevels.map(level => {
                      const s      = levelStatus(level)
                      const isBoss = level.id === arc.levels[1]
                      return (
                        <div
                          key={level.id}
                          role="listitem"
                          className={`${styles.row} ${styles[s]} ${isBoss ? styles.boss : ''}`}
                        >
                          <button
                            className={styles.rowHit}
                            onClick={() => (s === 'available' || s === 'completed' || s === 'current') && onSelect(level.id)}
                            disabled={s === 'locked' || s === 'arcLocked'}
                            aria-label={`Level ${level.id}: ${level.title} — ${
                              s === 'completed' ? 'complete' : s === 'locked' || s === 'arcLocked' ? 'locked' : 'play'
                            }`}
                          >
                            <span className={styles.cellIndex}>
                              {String(level.id).padStart(2, '0')}
                            </span>

                            <span className={styles.cellTitle}>
                              <span className={styles.rowTitle}>
                                {level.title}
                                {isBoss && <span className={styles.bossTag}>Final</span>}
                              </span>
                              <span className={styles.rowTask}>{level.task}</span>
                            </span>

                            <span className={styles.cellConcepts}>
                              {conceptsOf(level).slice(0, 3).map(c => (
                                <span key={c} className={styles.concept}>{c}</span>
                              ))}
                            </span>

                            <span className={styles.cellStatus}>
                              {s === 'completed' && (
                                <span className={styles.glyphDone} title="Complete">
                                  <svg viewBox="0 0 12 12" aria-hidden="true">
                                    <path d="M2 6.5 4.8 9.2 10 3.4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                </span>
                              )}
                              {s === 'current' && (
                                <span className={styles.glyphPlay} title="Next up">
                                  <svg viewBox="0 0 12 12" aria-hidden="true">
                                    <path d="M3.5 2.5 9.5 6 3.5 9.5Z" fill="currentColor" />
                                  </svg>
                                </span>
                              )}
                              {(s === 'locked' || s === 'arcLocked') && (
                                <span className={styles.glyphLock} title="Locked">
                                  <svg viewBox="0 0 12 12" aria-hidden="true">
                                    <rect x="2.5" y="5.2" width="7" height="5.3" rx="1.2" fill="none" stroke="currentColor" strokeWidth="1.2" />
                                    <path d="M4.4 5.2V3.8a1.6 1.6 0 0 1 3.2 0v1.4" fill="none" stroke="currentColor" strokeWidth="1.2" />
                                  </svg>
                                </span>
                              )}
                              <span className={styles.statusWord}>
                                {s === 'completed' ? 'Done' : s === 'current' ? 'Next' : 'Locked'}
                              </span>
                            </span>
                          </button>
                        </div>
                      )
                    })}
                  </div>

                  {allDone && (
                    <div className={styles.arcDone}>
                      <span className={styles.arcDoneMark}>◆</span>
                      Arc {arc.id} fully restored
                    </div>
                  )}
                </>
              )}
            </section>
          )
        })}
      </div>

      {/* Celebration + share prompt when a sector is fully restored */}
      <Confetti trigger={confetti} />
      {shareArc && (
        <ShareCard
          open
          onClose={() => setShareArc(null)}
          arcId={shareArc.id}
          arcTitle={shareArc.title}
          arcDomain={shareArc.sector.split('·').pop()?.trim() ?? shareArc.sector}
          arcCompleted={levels.filter(l => l.id >= shareArc.levels[0] && l.id <= shareArc.levels[1]).length}
          arcTotal={levels.filter(l => l.id >= shareArc.levels[0] && l.id <= shareArc.levels[1]).length}
          totalCompleted={completed}
          totalMissions={total}
          concepts={conceptsUsed()}
        />
      )}
    </main>
  )
}

/* ── Sub-components ────────────────────────────────────────────────────── */

/** SQL clauses that actually teach something (not "AND"/"IN"/"AS"). */
const SQL_CONCEPTS = [
  'DISTINCT', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL JOIN', 'JOIN',
  'GROUP BY', 'HAVING', 'ORDER BY', 'LIMIT', 'OFFSET', 'UNION',
  'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'ROUND',
  'LIKE', 'EXISTS', 'NOT IN', 'IS NULL', 'IS NOT NULL', 'BETWEEN',
  'CASE', 'COALESCE', 'NULLIF', 'SUBSTR', 'LOWER', 'UPPER', 'TRIM',
  'LENGTH', 'DATE', 'STRFTIME', 'JULIANDAY', 'EXTRACT',
]

/**
 * Concepts a mission actually exercises, read off the reference SQL with
 * word boundaries. Matching against the task prose produced nonsense like
 * "IN" from "archive" and "AND" from "command".
 */
function conceptsOf(level: Level): string[] {
  const sql = level.expectedQuery.toUpperCase()
  return SQL_CONCEPTS
    .filter(c => new RegExp(`\\b${c}\\b`).test(sql))
    .slice(0, 3)
}

function ArcMasthead({ arc, completed, total }: {
  arc: (typeof ARC_DEFS)[0]; completed: number; total: number
}) {
  return (
    <div className={styles.arcHead}>
      <div className={styles.arcHeadMain}>
        <div className={styles.arcNumeral} aria-hidden="true">{String(arc.id).padStart(2, '0')}</div>
        <div className={styles.arcHeadText}>
          <div className={styles.arcSector}>{arc.sector}</div>
          <h2 className={styles.arcTitle}>{arc.title}</h2>
          <div className={styles.arcSkills}>
            {arc.skills.map((s, i) => (
              <span key={s}>
                {i > 0 && <span className={styles.skillSep}>/</span>}
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
      {total > 0 && (
        <div className={styles.arcProgress}>
          <div className={styles.arcProgressNum}>
            <span className={styles.tabular}>{completed}</span>
            <span className={styles.arcProgressTotal}>/{total}</span>
          </div>
          <div className={styles.arcProgressLabel}>missions</div>
        </div>
      )}
    </div>
  )
}

function LockedBanner({ arc, onSettings }: {
  arc: (typeof ARC_DEFS)[0]; onSettings: () => void
}) {
  return (
    <div className={styles.locked}>
      <span className={styles.lockedMark}>—</span>
      <p className={styles.lockedText}>
        <strong>Arc {arc.id} not yet provisioned.</strong> Finish arcs 1–3, then request access —
        the Council reviews each request manually.
      </p>
      <button className={styles.lockedBtn} onClick={onSettings}>Request access →</button>
    </div>
  )
}