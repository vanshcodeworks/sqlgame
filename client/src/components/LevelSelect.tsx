import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import type { Level } from '../types/index.ts'
import { ARC_DEFS, levelArcId } from '../data/arcs.ts'
import styles from './LevelSelect.module.css'

interface Props {
  levels:          Level[]
  completedLevels: number[]
  arcAccess?:      number[]
  onSelect:        (id: number) => void
  onOpenSettings?: () => void
}

export function LevelSelect({ levels, completedLevels, arcAccess, onSelect, onOpenSettings }: Props) {
  const location = useLocation()

  useEffect(() => {
    if (!location.hash) return
    const el = document.getElementById(location.hash.slice(1))
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [location.hash])

  const safeArcAccess = arcAccess ?? ARC_DEFS.map(arc => arc.id)

  function isUnlocked(level: Level) {
    const index = levels.findIndex(l => l.id === level.id)
    if (index <= 0) return true
    return completedLevels.includes(levels[index - 1].id)
  }

  function levelStatus(level: Level): 'completed' | 'available' | 'progseq' | 'arcLocked' | 'locked' {
    const arcId = levelArcId(level.id)
    if (!safeArcAccess.includes(arcId))        return 'arcLocked'
    if (completedLevels.includes(level.id))    return 'completed'
    if (isUnlocked(level))                     return 'available'
    return 'locked'
  }

  const total     = levels.length
  const completed = completedLevels.length
  const pct       = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <main className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.breadcrumb}>Unit-7 · Dathos Archive Terminal</div>
          <h1 className={styles.heading}>Mission Select</h1>
          <p className={styles.headerSub}>Restore the Archive — one query at a time.</p>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.progressWrap}>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${pct}%` }} />
            </div>
            <span className={styles.progressLabel}>{completed}/{total} missions complete</span>
          </div>
        </div>
      </div>

      {/* Arcs */}
      <div className={styles.arcsList}>
        {ARC_DEFS.map(arc => {
          const arcLevels    = levels.filter(l => l.id >= arc.levels[0] && l.id <= arc.levels[1])
          const hasAccess    = safeArcAccess.includes(arc.id)
          const arcCompleted = arcLevels.filter(l => completedLevels.includes(l.id)).length

          if (arcLevels.length === 0 && !hasAccess) {
            return (
              <div id={`arc-${arc.id}`} key={arc.id} className={styles.arcBlock} style={{ '--arc-color': arc.color } as React.CSSProperties}>
                <ArcHeader arc={arc} completed={0} total={0} />
                {onOpenSettings && <LockedArcBanner arc={arc} onSettings={onOpenSettings} />}
              </div>
            )
          }

          if (arcLevels.length === 0) return null

          return (
            <div id={`arc-${arc.id}`} key={arc.id} className={styles.arcBlock} style={{ '--arc-color': arc.color } as React.CSSProperties}>
              <ArcHeader arc={arc} completed={arcCompleted} total={arcLevels.length} />

              {!hasAccess
                ? (onOpenSettings && <LockedArcBanner arc={arc} onSettings={onOpenSettings} />)
                : (
                  <div className={styles.levelGrid}>
                    {arcLevels.map(level => {
                      const s = levelStatus(level)
                      return (
                        <button
                          key={level.id}
                          className={`${styles.card} ${styles[s]}`}
                          onClick={() => (s === 'available' || s === 'completed') && onSelect(level.id)}
                          disabled={s === 'locked' || s === 'arcLocked'}
                        >
                          <div className={styles.cardTop}>
                            <span className={styles.num}>{String(level.id).padStart(2, '0')}</span>
                            <span className={`${styles.pill} ${styles[`pill_${s}`]}`}>
                              {s === 'completed' ? 'Done' : s === 'available' ? 'Play' : s === 'locked' ? 'Locked' : '—'}
                            </span>
                          </div>
                          <div className={styles.cardTitle}>{level.title}</div>
                          <div className={styles.cardTask}>{level.task}</div>
                        </button>
                      )
                    })}
                  </div>
                )
              }
            </div>
          )
        })}
      </div>
    </main>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ArcHeader({ arc, completed, total }: {
  arc: (typeof ARC_DEFS)[0]; completed: number; total: number
}) {
  return (
    <div className={styles.arcHeader}>
      <div className={styles.arcLeft}>
        <div className={styles.arcSector}>{arc.sector}</div>
        <h2 className={styles.arcTitle}>&ldquo;{arc.title}&rdquo;</h2>
        <div className={styles.arcSkills}>
          {arc.skills.map(s => (
            <span key={s} className={styles.arcSkill}>{s}</span>
          ))}
        </div>
      </div>
      {total > 0 && (
        <div className={styles.arcProgress}>
          <div className={styles.arcProgressNum}>{completed}<span>/{total}</span></div>
          <div className={styles.arcProgressLabel}>missions</div>
        </div>
      )}
    </div>
  )
}

function LockedArcBanner({ arc, onSettings }: {
  arc: (typeof ARC_DEFS)[0]; onSettings: () => void
}) {
  return (
    <div className={styles.lockedBanner}>
      <div className={styles.lockedIcon}>🔒</div>
      <div className={styles.lockedText}>
        <strong>Arc {arc.id} requires access.</strong>
        <span> Complete arcs 1–3 first, then request access to unlock &ldquo;{arc.title}&rdquo;.</span>
      </div>
      <button className={styles.lockedBtn} onClick={onSettings}>
        Request Access →
      </button>
    </div>
  )
}