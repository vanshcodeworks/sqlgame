import { useState } from 'react'
import { signUp, signIn, getDemoCredentials } from '../lib/auth.ts'
import AuroraBorealisShader from './AuroraBorealisShader.tsx'
import styles from './AuthScreen.module.css'

interface Props {
  onAuth: () => void
  onBack: () => void
}

type Mode = 'signup' | 'login'

export function AuthScreen({ onAuth, onBack }: Props) {
  const [mode, setMode] = useState<Mode>('signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(false)
  const demo = getDemoCredentials()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setNotice('')
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
    if (!demo) return
    setMode('login')
    setEmail(demo.email)
    setPassword(demo.password)
    setError('')
    setNotice('')
    setLoading(true)
    const result = await signIn(demo.email, demo.password)
    setLoading(false)
    if (!result.success) {
      setError(result.error)
      return
    }
    onAuth()
  }

  function switchMode(next: Mode) {
    setMode(next)
    setError('')
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
          <div className={styles.unitBadge}>UNIT-7 AUTHORIZATION</div>
          <h2 className={styles.heading}>Neural Uplink</h2>
          <p className={styles.sub}>
            Identity verification required<br />to access The Archive.
          </p>
        </div>

        {/* Mode tabs */}
        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tab} ${mode === 'signup' ? styles.tabActive : ''}`}
            onClick={() => switchMode('signup')}
          >
            Create Account
          </button>
          <button
            type="button"
            className={`${styles.tab} ${mode === 'login' ? styles.tabActive : ''}`}
            onClick={() => switchMode('login')}
          >
            Sign In
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">OPERATIVE EMAIL</label>
            <div className={styles.inputWrap}>
              <span className={styles.inputIcon}>✉</span>
              <input
                id="email"
                type="email"
                className={styles.input}
                placeholder="operative@domain.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">TERMINAL PASSWORD</label>
            <div className={styles.passwordWrap}>
              <span className={styles.inputIcon}>⌨</span>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className={styles.input}
                placeholder={mode === 'signup' ? 'Min 8 characters' : '··········'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                required
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPassword(v => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '○' : '◉'}
              </button>
            </div>
          </div>

          {error && <div className={styles.error}>{error}</div>}
          {notice && <div className={styles.notice}>{notice}</div>}

          <button
            type="submit"
            className={styles.submit}
            disabled={!email || !password || loading}
          >
            {loading
              ? 'AUTHENTICATING…'
              : mode === 'signup' ? '▶ INITIALIZE UNIT-7' : '▶ AUTHENTICATE'}
          </button>

          {demo && (
            <button
              type="button"
              className={styles.demo}
              onClick={handleDemoLogin}
              disabled={loading}
            >
              ▶ ENTER DEMO SIMULATION
            </button>
          )}
        </form>

        <button className={styles.backLink} type="button" onClick={onBack}>
          ← Back to mission briefing
        </button>
      </div>
    </div>
  )
}
