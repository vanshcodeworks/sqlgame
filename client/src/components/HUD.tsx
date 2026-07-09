import styles from './HUD.module.css'

interface Props {
  xp: number
  streak: number
  showBack: boolean
  onBack: () => void
}

export function HUD({ xp, streak, showBack, onBack }: Props) {
  return (
    <header className={styles.hud}>
      <div className={styles.brand}>QueryQuest</div>

      <div className={styles.stats}>
        {streak > 0 && (
          <div className={styles.streak} title="Day streak">
            <span className={styles.streakFlame}>🔥</span>
            <span className={styles.streakNum}>{streak}</span>
          </div>
        )}
        <div className={styles.xp}>
          <span className={styles.xpStar}>★</span>
          <span className={styles.xpNum}>{xp.toLocaleString()} XP</span>
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
