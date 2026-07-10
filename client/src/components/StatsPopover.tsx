import type { Level } from '../types/index.ts'
import styles from './StatsPopover.module.css'

interface Props {
  streak: number
  playedDates: string[]
  xp: number
  completedLevels: number[]
  levels: Level[]
  align: 'left' | 'right'
}

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

function lastNDays(n: number): string[] {
  const days: string[] = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86_400_000)
    days.push(d.toISOString().split('T')[0])
  }
  return days
}

export function StatsPopover({ streak, playedDates, xp, completedLevels, levels, align }: Props) {
  const days = lastNDays(7)
  const playedSet = new Set(playedDates)

  const earnedLevels = levels
    .filter(l => completedLevels.includes(l.id))
    .sort((a, b) => a.id - b.id)

  return (
    <div className={`${styles.popover} ${align === 'left' ? styles.alignLeft : styles.alignRight}`}>
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🔥</span>
          <span className={styles.sectionTitle}>{streak} day streak</span>
        </div>
        <div className={styles.dayRow}>
          {days.map(day => (
            <div key={day} className={styles.dayCell}>
              <span className={styles.dayLabel}>{DAY_LABELS[new Date(day).getUTCDay()]}</span>
              <span className={`${styles.dayDot} ${playedSet.has(day) ? styles.dayDotActive : ''}`} />
            </div>
          ))}
        </div>
      </div>

      <div className={styles.divider} />

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>★</span>
          <span className={styles.sectionTitle}>{xp.toLocaleString()} XP total</span>
        </div>
        {earnedLevels.length === 0 ? (
          <div className={styles.empty}>No missions completed yet.</div>
        ) : (
          <div className={styles.xpList}>
            {earnedLevels.map(level => (
              <div key={level.id} className={styles.xpRow}>
                <span className={styles.xpRowTitle}>{level.title}</span>
                <span className={styles.xpRowValue}>+{level.xpReward} XP</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
