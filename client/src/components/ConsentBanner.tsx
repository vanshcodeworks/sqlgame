import { useState } from 'react'
import { setTrackingEnabled, isTrackingEnabled } from '../lib/analytics.ts'
import styles from './ConsentBanner.module.css'

const KEY = 'qq_consent'

/**
 * Collecting IP-derived location and behaviour needs consent under GDPR/DPDP.
 * This is the honest version: plain language, both buttons are equal weight,
 * "reject" is as quick as "accept", and the choice is reversible in settings.
 */
export function ConsentBanner() {
  const [choice, setChoice] = useState<string | null>(() => {
    try { return localStorage.getItem(KEY) } catch { return null }
  })

  if (choice) return null

  function decide(granted: boolean) {
    setTrackingEnabled(granted)
    try { localStorage.setItem(KEY, granted ? 'granted' : 'denied') } catch { /* ignore */ }
    setChoice(granted ? 'granted' : 'denied')
  }

  return (
    <div className={styles.banner} role="region" aria-label="Privacy choices">
      <div className={styles.inner}>
        <p className={styles.text}>
          <strong className={styles.title}>Improve the Archive.</strong>{' '}
          We measure which missions players abandon and how long they take, so we can fix
          the hard ones. That means storing your country, device type and timezone —
          never your email or full IP. Read the{' '}
          <a href="/privacy" className={styles.link}>privacy note</a>.
        </p>
        <div className={styles.actions}>
          <button className={styles.reject} onClick={() => decide(false)}>
            No thanks
          </button>
          <button className={styles.accept} onClick={() => decide(true)}>
            Count me in
          </button>
        </div>
      </div>
    </div>
  )
}

/** Rendered inside Settings so the choice is always reversible. */
export function TrackingToggle() {
  const [on, setOn] = useState(() => isTrackingEnabled())

  return (
    <label className={styles.toggle}>
      <input
        type="checkbox"
        checked={on}
        onChange={e => {
          const next = e.target.checked
          setTrackingEnabled(next)
          setOn(next)
        }}
      />
      <span className={styles.toggleTrack} aria-hidden="true">
        <span className={styles.toggleThumb} />
      </span>
      <span className={styles.toggleLabel}>
        Share anonymous usage data
        <small>Country, device type, timezone, page and mission events</small>
      </span>
    </label>
  )
}