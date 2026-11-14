import { useState, useEffect } from 'react'
import AuroraBorealisShader from './AuroraBorealisShader.tsx'
import { getUser, authFetch, signOut, updateProfile, refreshUser } from '../lib/auth.ts'
import type { UserProfile } from '../types/index.ts'
import styles from './SettingsScreen.module.css'

interface Props {
  onBack: () => void
  onSignedOut: () => void
  /** Injected from App so the privacy control stays in this module. */
  privacySlot?: React.ReactNode
}

interface AccessRequest {
  arcId:     number
  status:    'pending' | 'approved' | 'rejected'
  message:   string
  adminNote?: string
  createdAt: string
}

const IDENTITY_OPTS = [
  { id: 'rookie'   as const, icon: '◎', label: 'Rookie Analyst',   xp: 'FULL', desc: 'Full hints & explanations' },
  { id: 'engineer' as const, icon: '◉', label: 'Field Engineer',   xp: 'LIGHT', desc: 'Core tips only' },
  { id: 'agent'    as const, icon: '◈', label: 'Returning Agent',  xp: 'NONE', desc: 'No hints — max challenge' },
]

const TEMPO_OPTS = [
  { id: 'scout' as const, icon: '○', label: 'Scout',  daily: '1 / day',    color: '#39d0d8' },
  { id: 'agent' as const, icon: '◉', label: 'Agent',  daily: '2–3 / day',  color: '#3fb950', recommended: true },
  { id: 'elite' as const, icon: '◈', label: 'Elite',  daily: '5+ / day',   color: '#e3b341' },
]

const ARC_INFO: Record<number, { title: string; domain: string; color: string }> = {
  4: { title: 'The Erased Decade',    domain: 'Memory',       color: '#e3b341' },
  5: { title: 'The Ranking Wars',     domain: 'Power',        color: '#ff79c6' },
  6: { title: 'The Bloodline Query',  domain: 'Lineage',      color: '#3fb950' },
  7: { title: 'The Null Architect',   domain: '???',          color: '#ff5555' },
}

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? ''

export function SettingsScreen({ onBack, onSignedOut, privacySlot }: Props) {
  // `user` is state (not a one-time read) so an admin approving access while
  // this screen is open shows up without a full page reload.
  const [user, setUser]             = useState<UserProfile | null>(getUser)
  const [displayName, setDisplayName] = useState(user?.displayName ?? '')
  const [identity, setIdentity]       = useState<UserProfile['identity']>(user?.identity ?? 'rookie')
  const [tempo, setTempo]             = useState<UserProfile['tempo']>(user?.tempo ?? 'agent')
  const [saving, setSaving]           = useState(false)
  const [saveMsg, setSaveMsg]         = useState('')
  const [signingOut, setSigningOut]   = useState(false)

  const [requests, setRequests]             = useState<AccessRequest[]>([])
  const [requestingArc, setRequestingArc]   = useState<number | null>(null)
  const [requestMsg, setRequestMsg]         = useState('')
  const [requestSending, setRequestSending] = useState(false)
  const [requestError, setRequestError]     = useState('')

  const arcAccess = user?.arcAccess ?? [1, 2, 3]

  // Refresh profile + request statuses on mount, and re-check periodically:
  // an admin may approve a request on another device at any time.
  useEffect(() => {
    let alive = true

    async function refresh() {
      try {
        const fresh = await refreshUser()
        if (alive && fresh) setUser(fresh)
        const res = await authFetch(`${API_BASE}/api/access/my-requests`)
        const d = await res.json() as { requests?: AccessRequest[] }
        if (alive && d.requests) setRequests(d.requests)
      } catch {
        // silent — the last known state stays on screen
      }
    }

    void refresh()
    const timer = window.setInterval(() => void refresh(), 15_000)
    return () => { alive = false; window.clearInterval(timer) }
  }, [])

  async function handleSave() {
    setSaving(true)
    setSaveMsg('')
    const result = await updateProfile({ displayName: displayName.trim(), identity, tempo })
    setSaving(false)
    if (result.success) {
      if (result.user) setUser(result.user)
      setSaveMsg('Saved.')
      setTimeout(() => setSaveMsg(''), 2500)
    } else {
      setSaveMsg(result.error)
    }
  }

  async function handleRequestAccess(arcId: number) {
    setRequestSending(true)
    setRequestError('')
    try {
      const res = await authFetch(`${API_BASE}/api/access/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ arcId, message: requestMsg.trim() }),
      })
      const data = await res.json() as { request?: AccessRequest; error?: string }
      if (!res.ok) { setRequestError(data.error ?? 'Request failed.'); setRequestSending(false); return }
      setRequests(prev => [...prev.filter(r => r.arcId !== arcId), data.request!])
      setRequestingArc(null)
      setRequestMsg('')
    } catch {
      setRequestError('Network error.')
    }
    setRequestSending(false)
  }

  function requestStatus(arcId: number): AccessRequest | undefined {
    return requests.find(r => r.arcId === arcId)
  }

  async function handleSignOut() {
    setSigningOut(true)
    await signOut()
    onSignedOut()
  }

  return (
    <div className={styles.screen}>
      <AuroraBorealisShader className={styles.aurora} />
      <div className={styles.overlay} />

      <div className={styles.content}>
        {/* Header */}
        <div className={styles.header}>
          <button className={styles.backBtn} onClick={onBack}>← BACK</button>
          <div className={styles.headerTitle}>
            <div className={styles.headerSub}>UNIT-7 · DATHOS ARCHIVE</div>
            <h1 className={styles.title}>Operative Settings</h1>
          </div>
        </div>

        <div className={styles.sections}>

          {/* Profile */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Identity</h2>
            <div className={styles.field}>
              <label className={styles.label}>Display Name</label>
              <input
                className={styles.input}
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="Unit-7 (optional)"
                maxLength={32}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Email</label>
              <div className={styles.staticField}>{user?.email}</div>
            </div>
          </section>

          {/* Agent Role */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Agent Role</h2>
            <p className={styles.sectionDesc}>Affects how much guidance the Archive gives you.</p>
            <div className={styles.cardRow}>
              {IDENTITY_OPTS.map(opt => (
                <button
                  key={opt.id}
                  className={`${styles.selCard} ${identity === opt.id ? styles.selCardActive : ''}`}
                  onClick={() => setIdentity(opt.id)}
                >
                  <span className={styles.selIcon}>{opt.icon}</span>
                  <span className={styles.selLabel}>{opt.label}</span>
                  <span className={styles.selBadge}>{opt.xp} HINTS</span>
                  <span className={styles.selDesc}>{opt.desc}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Tempo */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Mission Tempo</h2>
            <p className={styles.sectionDesc}>How many missions you plan to run each day.</p>
            <div className={styles.cardRow}>
              {TEMPO_OPTS.map(opt => (
                <button
                  key={opt.id}
                  className={`${styles.selCard} ${tempo === opt.id ? styles.selCardActive : ''}`}
                  style={{ '--sel-color': opt.color } as React.CSSProperties}
                  onClick={() => setTempo(opt.id)}
                >
                  <span className={styles.selIcon}>{opt.icon}</span>
                  <span className={styles.selLabel}>{opt.label}</span>
                  <span className={styles.selBadge}>{opt.daily}</span>
                  {opt.recommended && <span className={styles.recommended}>Recommended</span>}
                </button>
              ))}
            </div>
          </section>

          {/* Save */}
          <div className={styles.saveRow}>
            <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
              {saving ? 'SAVING…' : 'SAVE CHANGES'}
            </button>
            {saveMsg && <span className={`${styles.saveMsg} ${saveMsg === 'Saved.' ? styles.saveMsgOk : styles.saveMsgErr}`}>{saveMsg}</span>}
          </div>

          {/* Arc Access */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Arc Access</h2>
            <p className={styles.sectionDesc}>
              Arcs 1–3 are available now. Arcs 4–7 are still in development — register your
              interest and we&rsquo;ll let you know the moment they open.
            </p>

            <div className={styles.arcList}>
              {([4, 5, 6, 7] as const).map(arcId => {
                const info    = ARC_INFO[arcId]
                const hasAccess  = arcAccess.includes(arcId)
                const req     = requestStatus(arcId)
                const isOpen  = requestingArc === arcId

                return (
                  <div
                    key={arcId}
                    className={styles.arcRow}
                    style={{ '--arc-color': info.color } as React.CSSProperties}
                  >
                    <div className={styles.arcInfo}>
                      <span className={styles.arcNum}>Arc {arcId}</span>
                      <span className={styles.arcTitle}>{info.title}</span>
                      <span className={styles.arcDomain}>{info.domain}</span>
                    </div>

                    <div className={styles.arcStatus}>
                      {hasAccess && (
                        <span className={styles.statusApproved}>✓ UNLOCKED</span>
                      )}
                      {!hasAccess && req?.status === 'pending' && (
                        <span className={styles.statusPending}>⏳ REQUEST PENDING</span>
                      )}
                      {!hasAccess && req?.status === 'approved' && (
                        <span className={styles.statusApproved}>✓ APPROVED</span>
                      )}
                      {!hasAccess && req?.status === 'rejected' && (
                        <span className={styles.statusRejected}>✗ NOT APPROVED</span>
                      )}
                      {!hasAccess && !req && (
                        <button
                          className={styles.requestBtn}
                          onClick={() => { setRequestingArc(arcId); setRequestError('') }}
                        >
                          Request Access
                        </button>
                      )}
                      {!hasAccess && req?.status === 'rejected' && (
                        <button
                          className={styles.requestBtn}
                          style={{ marginLeft: 8 }}
                          onClick={() => { setRequestingArc(arcId); setRequestError('') }}
                        >
                          Re-apply
                        </button>
                      )}
                    </div>

                    {isOpen && (
                      <div className={styles.requestForm}>
                        <label className={styles.label}>
                          Why do you want access to Arc {arcId}? (optional)
                        </label>
                        <textarea
                          className={styles.textarea}
                          rows={3}
                          placeholder="Tell us about your progress, motivation, or SQL experience…"
                          value={requestMsg}
                          onChange={e => setRequestMsg(e.target.value)}
                        />
                        {requestError && <span className={styles.saveMsgErr}>{requestError}</span>}
                        <div className={styles.requestActions}>
                          <button
                            className={styles.saveBtn}
                            disabled={requestSending}
                            onClick={() => handleRequestAccess(arcId)}
                          >
                            {requestSending ? 'SENDING…' : 'SEND REQUEST'}
                          </button>
                          <button
                            className={styles.ghostBtn}
                            onClick={() => { setRequestingArc(null); setRequestError('') }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </section>

          {/* Privacy — reversible consent */}
          {privacySlot && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Privacy</h2>
              <p className={styles.sectionDesc}>
                How long players take on each mission and where they abandon it is how
                we find the missions that are too hard. Turn this off at any time —
                nothing breaks, we simply stop learning.
              </p>
              {privacySlot}
            </section>
          )}

          {/* Account */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Account</h2>
            <p className={styles.sectionDesc}>
              Signed in as {user?.email}. Signing out clears this device&rsquo;s saved session.
            </p>
            <button className={styles.ghostBtn} onClick={handleSignOut} disabled={signingOut}>
              {signingOut ? 'SIGNING OUT…' : 'SIGN OUT'}
            </button>
          </section>

        </div>
      </div>
    </div>
  )
}
