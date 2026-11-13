import styles from './HUD.module.css'

interface Props {
  showBack: boolean
  onBack: () => void
  onOpenSettings?: () => void
}

export function HUD({ showBack, onBack, onOpenSettings }: Props) {
  return (
    <header className={styles.hud}>
      <div className={styles.brand}>QueryQuest</div>

      <div className={styles.spacer} />

      {onOpenSettings && (
        <button className={styles.settingsBtn} onClick={onOpenSettings} title="Settings">
          ⚙
        </button>
      )}

      {showBack && (
        <button className={styles.back} onClick={onBack}>
          ← Menu
        </button>
      )}
    </header>
  )
}