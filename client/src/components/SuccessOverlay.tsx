import styles from './SuccessOverlay.module.css'

interface Props {
  levelTitle: string
  xpEarned: number
  onContinue: () => void
}

export function SuccessOverlay({ levelTitle, xpEarned, onContinue }: Props) {
  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <div className={styles.checkmark}>✓</div>
        <h2 className={styles.heading}>Level Complete!</h2>
        <p className={styles.subtitle}>{levelTitle}</p>
        <div className={styles.xpBadge}>+{xpEarned} XP</div>
        <button className={styles.button} onClick={onContinue}>
          Continue
        </button>
      </div>
    </div>
  )
}
