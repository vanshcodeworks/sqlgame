import type { Level } from '../types/index.ts'
import styles from './LevelSelect.module.css'

interface Props {
  levels:          Level[]
  completedLevels: number[]
  arcAccess?:      number[]
  onSelect:        (id: number) => void
  onOpenSettings?: () => void
}

// Arc metadata — maps arcId → levels within it
const ARC_DEFS: Array<{
  id:      number
  title:   string
  sector:  string
  levels:  [number, number]  // [min, max] level IDs inclusive
  color:   string
  skills:  string[]
  story:   string
}> = [
  {
    id: 1, title: 'The Hunger Algorithm', sector: 'SECTOR 1 · Agriculture',
    levels: [1, 5], color: 'var(--accent-cyan)',
    skills: ['SELECT', 'WHERE', 'ORDER BY', 'LIMIT'],
    story: 'People starving over a missing WHERE clause. The fix is heartbreakingly simple.',
  },
  {
    id: 2, title: 'The Divided City', sector: 'SECTOR 2 · Population',
    levels: [6, 10], color: 'var(--accent-purple)',
    skills: ['INNER JOIN', 'LEFT JOIN', 'Aggregates', 'Subqueries'],
    story: 'Two cities at war for 140 years — over a deleted JOIN key.',
  },
  {
    id: 3, title: 'The Underground Market', sector: 'SECTOR 3 · Commerce',
    levels: [11, 16], color: 'var(--accent-green)',
    skills: ['DISTINCT', 'LIKE', 'HAVING', 'EXISTS', 'CASE WHEN'],
    story: 'Black-market data traded by rebels who know what the Archive hides.',
  },
]

function levelArcId(levelId: number): number {
  for (const arc of ARC_DEFS) {
    if (levelId >= arc.levels[0] && levelId <= arc.levels[1]) return arc.id
  }
  return 1
}

export function LevelSelect({ levels, completedLevels, arcAccess, onSelect, onOpenSettings }: Props) {
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
          <div className={styles.breadcrumb}>UNIT-7 · DATHOS ARCHIVE TERMINAL</div>
          <h1 className={styles.heading}>Mission Select</h1>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.progressWrap}>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${pct}%` }} />
            </div>
            <span className={styles.progressLabel}>{completed}/{total} missions complete</span>
          </div>
          {onOpenSettings && (
            <button className={styles.settingsBtn} onClick={onOpenSettings} title="Settings">
              ⚙ Settings
            </button>
          )}
        </div>
      </div>

      {/* Arcs */}
      <div className={styles.arcsList}>
        {ARC_DEFS.map(arc => {
          const arcLevels    = levels.filter(l => l.id >= arc.levels[0] && l.id <= arc.levels[1])
          const hasAccess    = safeArcAccess.includes(arc.id)
          const arcCompleted = arcLevels.filter(l => completedLevels.includes(l.id)).length

          if (arcLevels.length === 0 && !hasAccess) {
            // Arc not yet in game data but exists — show locked banner
            return (
              <div key={arc.id} className={styles.arcBlock} style={{ '--arc-color': arc.color } as React.CSSProperties}>
                <ArcHeader arc={arc} completed={0} total={0} />
                {onOpenSettings && <LockedArcBanner arc={arc} onSettings={onOpenSettings} />}
              </div>
            )
          }

          if (arcLevels.length === 0) return null

          return (
            <div key={arc.id} className={styles.arcBlock} style={{ '--arc-color': arc.color } as React.CSSProperties}>
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
                            <span className={styles.xp}>{level.xpReward} XP</span>
                            {s === 'completed' && <span className={styles.check}>✓</span>}
                            {s === 'locked'    && <span className={styles.lock}>◌</span>}
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
    <div className={styles.arcHeader} style={{ '--arc-color': arc.color } as React.CSSProperties}>
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
