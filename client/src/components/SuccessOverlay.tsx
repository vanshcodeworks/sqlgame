import { useState } from 'react'
import { Confetti, NumberTicker } from './ui/magic-ui.tsx'
import styles from './SuccessOverlay.module.css'

interface Props {
  levelTitle: string
  xpEarned: number
  /** True when this was the last mission of its sector */
  isSectorFinale?: boolean
  sectorName?: string
  onContinue: () => void
}

export function SuccessOverlay({
  levelTitle, xpEarned, isSectorFinale, sectorName, onContinue,
}: Props) {
  // Fire once on mount — a re-render (e.g. a server sync) shouldn't re-burst.
  const [confetti] = useState(() => Date.now())

  return (
    <div className={styles.overlay}>
      <Confetti trigger={confetti} count={isSectorFinale ? 160 : 90} />

      <div className={styles.card}>
        <div className={styles.checkmark}>
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M5 12.5 10 17.5 19 7"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div className={styles.eyebrow}>
          {isSectorFinale && sectorName ? `${sectorName} restored` : 'Mission restored'}
        </div>
        <h2 className={styles.heading}>{levelTitle}</h2>

        <div className={styles.xpBadge}>
          <span className={styles.xpPlus}>+</span>
          <NumberTicker value={xpEarned} />
          <span className={styles.xpUnit}>XP</span>
        </div>

        <button className={styles.button} onClick={onContinue}>
          {isSectorFinale ? 'Share this →' : 'Continue'}
        </button>
      </div>
    </div>
  )
}