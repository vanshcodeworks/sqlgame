import { useEffect, useRef, useState } from 'react'
import type { Level } from '../types/index.ts'
import { StatsPopover } from './StatsPopover.tsx'
import styles from './HUD.module.css'

interface Props {
  xp: number
  streak: number
  playedDates: string[]
  completedLevels: number[]
  levels: Level[]
  showBack: boolean
  onBack: () => void
}

export function HUD({ xp, streak, playedDates, completedLevels, levels, showBack, onBack }: Props) {
  const [openPopover, setOpenPopover] = useState<'streak' | 'xp' | null>(null)
  const statsRef = useRef<HTMLDivElement>(null)

  function toggle(which: 'streak' | 'xp') {
    setOpenPopover(prev => (prev === which ? null : which))
  }

  useEffect(() => {
    if (!openPopover) return

    function handleClick(e: MouseEvent) {
      if (statsRef.current && !statsRef.current.contains(e.target as Node)) {
        setOpenPopover(null)
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpenPopover(null)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [openPopover])

  return (
    <header className={styles.hud}>
      <div className={styles.brand}>QueryQuest</div>

      <div className={styles.stats} ref={statsRef}>
        {streak > 0 && (
          <div className={styles.statWrap}>
            <button
              className={styles.streak}
              title="Day streak"
              onClick={() => toggle('streak')}
            >
              <span className={styles.streakFlame}>🔥</span>
              <span className={styles.streakNum}>{streak}</span>
            </button>
            {openPopover === 'streak' && (
              <StatsPopover
                streak={streak}
                playedDates={playedDates}
                xp={xp}
                completedLevels={completedLevels}
                levels={levels}
                align="left"
              />
            )}
          </div>
        )}
        <div className={styles.statWrap}>
          <button className={styles.xp} onClick={() => toggle('xp')}>
            <span className={styles.xpStar}>★</span>
            <span className={styles.xpNum}>{xp.toLocaleString()} XP</span>
          </button>
          {openPopover === 'xp' && (
            <StatsPopover
              streak={streak}
              playedDates={playedDates}
              xp={xp}
              completedLevels={completedLevels}
              levels={levels}
              align="right"
            />
          )}
        </div>
      </div>

      {showBack && (
        <button className={styles.back} onClick={onBack}>
          ← Menu
        </button>
      )}
    </header>
  )
}
