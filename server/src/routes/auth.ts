import { Router } from 'express'
import { User } from '../models/User'
import { requireAuth, AuthRequest } from '../middleware/auth'

const router = Router()

// PATCH /api/auth/profile
router.patch('/profile', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { displayName, identity, tempo, onboardingComplete } = req.body
    const updates: Record<string, unknown> = {}
    if (displayName        !== undefined) updates.displayName        = displayName
    if (identity           !== undefined) updates.identity           = identity
    if (tempo              !== undefined) updates.tempo              = tempo
    if (onboardingComplete !== undefined) updates.onboardingComplete = onboardingComplete

    const user = await User.findByIdAndUpdate(req.userId, updates, { new: true })
    if (!user) { res.status(404).json({ error: 'User not found.' }); return }

    res.json({
      user: {
        id:                 user._id,
        email:              user.email,
        displayName:        user.displayName,
        identity:           user.identity,
        tempo:              user.tempo,
        onboardingComplete: user.onboardingComplete,
        arcAccess:          user.arcAccess,
        role:               user.role,
      },
    })
  } catch (err) {
    console.error('/profile', err)
    res.status(500).json({ error: 'Server error.' })
  }
})

// GET /api/auth/me — refresh user info
router.get('/me', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = await User.findById(req.userId)
    if (!user) { res.status(404).json({ error: 'User not found.' }); return }
    res.json({
      user: {
        id:                 user._id,
        email:              user.email,
        displayName:        user.displayName,
        identity:           user.identity,
        tempo:              user.tempo,
        onboardingComplete: user.onboardingComplete,
        arcAccess:          user.arcAccess,
        role:               user.role,
      },
    })
  } catch (err) {
    res.status(500).json({ error: 'Server error.' })
  }
})

export default router
