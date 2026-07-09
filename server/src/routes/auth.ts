import { Router } from 'express'
import { requireAuth, AuthRequest } from '../middleware/auth'
import { supabaseAdmin } from '../lib/supabaseAdmin'
import type { Profile } from '../lib/profiles'

const router = Router()

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
router.patch('/profile', requireAuth, async (req: AuthRequest, res) => {
  try {
    if (!supabaseAdmin) { res.status(500).json({ error: 'Server misconfigured.' }); return }

    const { displayName, identity, tempo, onboardingComplete } = req.body
    const updates: Record<string, unknown> = {}
    if (displayName        !== undefined) updates.display_name        = displayName
    if (identity           !== undefined) updates.identity            = identity
    if (tempo              !== undefined) updates.tempo               = tempo
    if (onboardingComplete !== undefined) updates.onboarding_complete = onboardingComplete

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
router.get('/me', requireAuth, async (req: AuthRequest, res) => {
  if (!req.profile) { res.status(404).json({ error: 'User not found.' }); return }
  res.json({ user: toClientUser(req.profile) })
})

export default router
