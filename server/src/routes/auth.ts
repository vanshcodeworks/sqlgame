import { Router } from 'express'
import { requireAuth, AuthRequest } from '../middleware/auth'
import { supabaseAdmin } from '../lib/supabaseAdmin'
import type { Profile, ProfileIdentity, ProfileTempo } from '../lib/profiles'

const router = Router()

const IDENTITIES: ReadonlyArray<ProfileIdentity> = ['rookie', 'engineer', 'agent']
const TEMPOS: ReadonlyArray<ProfileTempo> = ['scout', 'agent', 'elite']
const MAX_DISPLAY_NAME = 40

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
