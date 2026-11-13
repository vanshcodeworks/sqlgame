import { useState } from 'react'
import { signUp, signIn, signInAsDemo, requestPasswordReset, supabaseConfigured } from '../lib/auth.ts'
import AuroraBorealisShader from './AuroraBorealisShader.tsx'
import styles from './AuthScreen.module.css'

interface Props {
  onAuth: () => void
  onBack: () => void
}

type Mode = 'signup' | 'login' | 'reset'

function AuthScreenContent({ onAuth, onBack }: Props) {
  const [mode, setMode] = useState<Mode>('signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(false)
  const [demoLoading, setDemoLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setNotice('')

    if (mode === 'reset') {
      setLoading(true)
      const result = await requestPasswordReset(email)
      setLoading(false)
      if (!result.success) { setError(result.error); return }
      setNotice('If that email has an account, a reset link is on its way.')
      return
    }

    setLoading(true)
    const result = mode === 'signup'
      ? await signUp(email, password)
      : await signIn(email, password)
    setLoading(false)
    if (!result.success) {
      setError(result.error)
      return
    }
    if (result.needsEmailConfirm) {
      setNotice('Check your inbox to confirm your email, then sign in.')
      return
    }
    onAuth()
  }

  async function handleDemoLogin() {
    setError('')
    setNotice('')
    setDemoLoading(true)
    const result = await signInAsDemo()
    setDemoLoading(false)
    if (!result.success) {
      setError(result.error)
      return
    }
    onAuth()
  }

  function switchMode(next: Mode) {
    setMode(next)
    setError('')
    setNotice('')
  }

  return (
    <div className={styles.screen}>
      <AuroraBorealisShader className={styles.aurora} />

      <div className={styles.card}>

        {/* Lock icon */}
        <div className={styles.iconWrap}>
          <span className={styles.lockIcon}>🔒</span>
        </div>

        <div className={styles.cardHeader}>
          <div className={styles.unitBadge}>WELCOME TO QUERYQUEST</div>
          <h2 className={styles.heading}>
            {mode === 'reset' ? 'Reset your password' : mode === 'signup' ? 'Create your account' : 'Welcome back'}
          </h2>
          <p className={styles.sub}>
            {mode === 'reset'
              ? <>Enter your email and we&rsquo;ll send you<br />a link to reset your password.</>
              : mode === 'signup'
                ? <>Start your first mission in under<br />a minute. No credit card needed.</>
                : <>Sign in to pick up exactly<br />where you left off.</>}
          </p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">EMAIL</label>
            <div className={styles.inputWrap}>
              <span className={styles.inputIcon}>✉</span>
              <input
                id="email"
                type="email"
                className={styles.input}
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete={mode === 'reset' ? 'email' : 'username'}
                required
                disabled={loading}
              />
            </div>
          </div>

          {mode !== 'reset' && (
            <div className={styles.field}>
              <label className={styles.label} htmlFor="password">PASSWORD</label>
              <div className={styles.inputWrap}>
                <span className={styles.inputIcon}>🔑</span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className={styles.input}
                  placeholder="Min 8 characters, letters + numbers"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className={styles.toggle}
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  disabled={loading}
                >
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>
            </div>
          )}

          {error && <div className={styles.error}>{error}</div>}
          {notice && <div className={styles.notice}>{notice}</div>}

          <button
            type="submit"
            className={styles.submit}
            disabled={!email || (mode !== 'reset' && !password) || loading}
          >
            {loading
              ? 'PLEASE WAIT&hellip;'
              : mode === 'signup' ? 'CREATE ACCOUNT'
              : mode === 'reset' ? 'SEND RESET LINK'
              : 'SIGN IN'}
          </button>
        </form>

        {mode !== 'reset' && (
          <button
            type="button"
            className={styles.demo}
            onClick={handleDemoLogin}
            disabled={demoLoading || loading}
          >
            {demoLoading ? 'STARTING DEMO&hellip;' : 'TRY THE DEMO'}
          </button>
        )}

        <div className={styles.modeSwitch}>
          {mode === 'signup' && (
            <>
              Already have an account?{' '}
              <button type="button" className={styles.link} onClick={() => switchMode('login')}>
                Sign in
              </button>
            </>
          )}
          {mode === 'login' && (
            <>
              Need an account?{' '}
              <button type="button" className={styles.link} onClick={() => switchMode('signup')}>
                Create one
              </button>
            </>
          )}
          {mode !== 'reset' && (
            <>
              {' '}|{' '}
              <button type="button" className={styles.link} onClick={() => switchMode('reset')}>
                Forgot password?
              </button>
            </>
          )}
          {mode === 'reset' && (
            <>
              <button type="button" className={styles.link} onClick={() => switchMode('login')}>
                &larr; Back to sign in
              </button>
            </>
          )}
        </div>

        <button className={styles.backLink} type="button" onClick={onBack}>
          &larr; Back to home
        </button>
      </div>
    </div>
  )
}

export function AuthScreen({ onAuth, onBack }: Props) {
  if (!supabaseConfigured) {
    return (
      <div className={styles.screen}>
        <AuroraBorealisShader className={styles.aurora} />
        <div className={styles.card}>
          <div className={styles.iconWrap}>
            <span className={styles.lockIcon}>⚠️</span>
          </div>
          <div className={styles.cardHeader}>
            <div className={styles.unitBadge}>AUTH UNAVAILABLE</div>
            <h2 className={styles.heading}>Supabase Not Configured</h2>
            <p className={styles.sub}>
              Authentication requires a Supabase project. Please create one at{' '}
              <a href="https://supabase.com" target="_blank" rel="noopener noreferrer">supabase.com</a>
              and add the environment variables.
            </p>
          </div>
          <button className={styles.backLink} type="button" onClick={onBack}>
            &larr; Back to home
          </button>
        </div>
      </div>
    )
  }

  return <AuthScreenContent onAuth={onAuth} onBack={onBack} />
}