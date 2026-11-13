import { useEffect, useState } from 'react'
import { signOut, supabase, updatePassword } from '../lib/auth.ts'
import AuroraBorealisShader from './AuroraBorealisShader.tsx'
import styles from './AuthScreen.module.css'

interface Props {
  onDone: () => void
}

type LinkState = 'checking' | 'ready' | 'invalid'

export function ResetPasswordScreen({ onDone }: Props) {
  const [linkState, setLinkState] = useState<LinkState>('checking')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let active = true

    // Supabase JS exchanges the recovery token in the URL for a session
    // automatically (detectSessionInUrl). Give it a moment, then show a
    // useful message instead of "Verifying…" forever.
    supabase.auth.getSession().then(({ data }) => {
      if (active && data.session) setLinkState('ready')
    })

    const { data: sub } = supabase.auth.onAuthStateChange(event => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        if (active) setLinkState('ready')
      }
    })

    const timer = window.setTimeout(() => {
      if (active) setLinkState(current => (current === 'checking' ? 'invalid' : current))
    }, 5000)

    return () => {
      active = false
      window.clearTimeout(timer)
      sub.subscription.unsubscribe()
    }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setNotice('')

    if (password !== confirm) {
      setError('The two passwords do not match.')
      return
    }

    setLoading(true)
    const result = await updatePassword(password)
    if (!result.success) {
      setLoading(false)
      setError(result.error)
      return
    }

    // The recovery link creates a temporary Supabase session. Close it and
    // let the player sign in normally with the new password.
    await signOut()
    setLoading(false)
    setNotice('Password updated. Taking you to sign in…')
    window.setTimeout(onDone, 1200)
  }

  return (
    <div className={styles.screen}>
      <AuroraBorealisShader className={styles.aurora} />
      <div className={styles.card}>
        <div className={styles.iconWrap}>
          <span className={styles.lockIcon}>🔑</span>
        </div>
        <div className={styles.cardHeader}>
          <div className={styles.unitBadge}>RESET PASSWORD</div>
          <h2 className={styles.heading}>
            {linkState === 'invalid' ? 'Link expired' : 'Choose a new password'}
          </h2>
          <p className={styles.sub}>
            {linkState === 'ready'
              ? <>Pick something you&rsquo;ll remember.<br />You can change it again in settings.</>
              : linkState === 'invalid'
                ? <>This reset link is invalid or has expired.<br />Request a fresh one from the sign-in screen.</>
                : <>Checking your reset link…</>}
          </p>
        </div>

        {linkState === 'ready' && (
          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="new-password">NEW PASSWORD</label>
              <div className={styles.inputWrap}>
                <span className={styles.inputIcon}>⌨</span>
                <input
                  id="new-password"
                  type="password"
                  className={styles.input}
                  placeholder="Min 8 characters, letters + numbers"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="confirm-password">CONFIRM PASSWORD</label>
              <div className={styles.inputWrap}>
                <span className={styles.inputIcon}>⌨</span>
                <input
                  id="confirm-password"
                  type="password"
                  className={styles.input}
                  placeholder="Type it once more"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>

            {error && <div className={styles.error}>{error}</div>}
            {notice && <div className={styles.notice}>{notice}</div>}

            <button
              type="submit"
              className={styles.submit}
              disabled={!password || !confirm || loading}
            >
              {loading ? 'SAVING…' : 'SAVE NEW PASSWORD'}
            </button>
          </form>
        )}

        {linkState === 'invalid' && (
          <button type="button" className={styles.submit} onClick={onDone}>
            BACK TO SIGN IN
          </button>
        )}
      </div>
    </div>
  )
}
