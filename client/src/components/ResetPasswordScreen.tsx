import { useEffect, useState } from 'react'
import { supabase, updatePassword } from '../lib/auth.ts'
import AuroraBorealisShader from './AuroraBorealisShader.tsx'
import styles from './AuthScreen.module.css'

interface Props {
  onDone: () => void
}

export function ResetPasswordScreen({ onDone }: Props) {
  const [ready, setReady] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Supabase JS exchanges the recovery token in the URL for a session
    // automatically (detectSessionInUrl). We just wait for that session.
    supabase.auth.getSession().then(({ data }) => setReady(!!data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') setReady(true)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setNotice('')
    setLoading(true)
    const result = await updatePassword(password)
    setLoading(false)
    if (!result.success) { setError(result.error); return }
    setNotice('Password updated. Redirecting…')
    setTimeout(onDone, 1200)
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
          <h2 className={styles.heading}>Choose a new password</h2>
          <p className={styles.sub}>
            {ready
              ? <>Pick something you&rsquo;ll remember.<br />You can change it again in settings.</>
              : <>Checking your reset link…</>}
          </p>
        </div>

        {ready && (
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

            {error && <div className={styles.error}>{error}</div>}
            {notice && <div className={styles.notice}>{notice}</div>}

            <button type="submit" className={styles.submit} disabled={!password || loading}>
              {loading ? 'SAVING…' : 'SAVE NEW PASSWORD'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
