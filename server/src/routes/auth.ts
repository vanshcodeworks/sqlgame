import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { requireAuth, AuthRequest } from '../middleware/auth'
import { supabaseAdmin } from '../lib/supabaseAdmin'
import { checkSignupEmail, checkPassword } from '../lib/emailGuard'
import type { Profile, ProfileIdentity, ProfileTempo } from '../lib/profiles'

const router = Router()

const IDENTITIES: ReadonlyArray<ProfileIdentity> = ['rookie', 'engineer', 'agent']
const TEMPOS: ReadonlyArray<ProfileTempo> = ['scout', 'agent', 'elite']
const MAX_DISPLAY_NAME = 40

/**
 * Registration is the one unauthenticated endpoint that can create a row, so
 * it gets a tighter budget than sign-in. 5/hour per IP stops casual bot
 * signups while leaving plenty of room for a real person retrying.
 */
export const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: req => req.method === 'OPTIONS',
  handler: (_req, res) => {
    res.status(429).json({ error: 'Too many accounts created from this network. Try again later.' })
  },
})

/**
 * POST /api/auth/signup — the trusted registration path.
 *
 * The client calls this before signing in. It validates the email and enforces
 * the rate limit here (a client-side check is trivially bypassed), then creates
 * the auth user with email already confirmed. The client then signs in with
 * the same credentials to obtain its session — the service-role key never
 * leaves this process and no session tokens are minted here.
 */
router.post('/signup', signupLimiter, async (req, res) => {
  try {
    if (!supabaseAdmin) { res.status(503).json({ error: 'Server misconfigured.' }); return }

    const { email, password, displayName } = req.body as {
      email?: unknown; password?: unknown; displayName?: unknown
    }

    const emailCheck = checkSignupEmail(email)
    if (!emailCheck.ok) { res.status(400).json({ error: emailCheck.reason }); return }

    const passwordCheck = checkPassword(password)
    if (!passwordCheck.ok) { res.status(400).json({ error: passwordCheck.reason }); return }

    let name = ''
    if (typeof displayName === 'string') name = displayName.trim().slice(0, MAX_DISPLAY_NAME)

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: String(email).trim().toLowerCase(),
      password: password as string,
      email_confirm: true,
      user_metadata: { displayName: name },
    })

    if (error) {
      const msg = error.message.toLowerCase()
      if (msg.includes('already') || msg.includes('registered')) {
        // Do not reveal whether an email is registered — sign-in handles it.
        res.status(200).json({ ok: true })
        return
      }
      console.error('signup createUser', error.message)
      res.status(400).json({ error: 'Could not create the account. Please try again.' })
      return
    }

    res.status(201).json({ ok: true, id: data.user?.id })
  } catch (err) {
    console.error('POST /api/auth/signup', err)
    res.status(500).json({ error: 'Could not create the account.' })
  }
})

function toClientUser(p: Profile) {
  return {
    id: p.id,
    email: p.email,
    displayName: p.display_name,
    identity: p.identity,
    tempo: p.tempo,
    onboardingComplete: p.onboarding_complete,
    arcAccess: p.arc_access,
    role: p.role,
  }
}

// PATCH /api/auth/profile
// Only the fields a player is allowed to change can be patched here. Role and
// arc_access are deliberately absent: those are granted by an admin.
router.patch('/profile', requireAuth, async (req: AuthRequest, res) => {
  try {
    if (!supabaseAdmin) { res.status(500).json({ error: 'Server misconfigured.' }); return }

    const { displayName, identity, tempo, onboardingComplete } = req.body as {
      displayName?: unknown
      identity?: unknown
      tempo?: unknown
      onboardingComplete?: unknown
    }

    const updates: Record<string, unknown> = {}

    if (displayName !== undefined) {
      if (typeof displayName !== 'string' || displayName.trim().length > MAX_DISPLAY_NAME) {
        res.status(400).json({ error: `Display name must be ${MAX_DISPLAY_NAME} characters or fewer.` })
        return
      }
      updates.display_name = displayName.trim()
    }

    if (identity !== undefined) {
      if (typeof identity !== 'string' || !IDENTITIES.includes(identity as ProfileIdentity)) {
        res.status(400).json({ error: 'Invalid identity.' })
        return
      }
      updates.identity = identity
    }

    if (tempo !== undefined) {
      if (typeof tempo !== 'string' || !TEMPOS.includes(tempo as ProfileTempo)) {
        res.status(400).json({ error: 'Invalid tempo.' })
        return
      }
      updates.tempo = tempo
    }

    if (onboardingComplete !== undefined) {
      if (typeof onboardingComplete !== 'boolean') {
        res.status(400).json({ error: 'onboardingComplete must be true or false.' })
        return
      }
      updates.onboarding_complete = onboardingComplete
    }

    if (Object.keys(updates).length === 0) {
      // Nothing to change — return the current profile instead of failing.
      if (!req.profile) { res.status(404).json({ error: 'User not found.' }); return }
      res.json({ user: toClientUser(req.profile) })
      return
    }

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update(updates)
      .eq('id', req.userId)
      .select('*')
      .single()

    if (error || !data) { res.status(404).json({ error: 'User not found.' }); return }

    res.json({ user: toClientUser(data as Profile) })
  } catch (err) {
    console.error('/profile', err)
    res.status(500).json({ error: 'Server error.' })
  }
})

// GET /api/auth/me — refresh user info
router.get('/me', requireAuth, (req: AuthRequest, res) => {
  if (!req.profile) { res.status(404).json({ error: 'User not found.' }); return }
  res.json({ user: toClientUser(req.profile) })
})

export default router
