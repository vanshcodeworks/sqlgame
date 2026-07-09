import { Router } from 'express'
import { requireAuth, AuthRequest } from '../middleware/auth'
import { Progress } from '../models/Progress'

const router = Router()

// GET /api/progress
router.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const progress = await Progress.findOne({ userId: req.userId })
    if (!progress) {
      res.json({ xp: 0, streak: 0, lastPlayedDate: null, completedLevels: [] })
      return
    }
    res.json({
      xp:              progress.xp,
      streak:          progress.streak,
      lastPlayedDate:  progress.lastPlayedDate,
      completedLevels: progress.completedLevels,
    })
  } catch (err) {
    console.error('GET /progress', err)
    res.status(500).json({ error: 'Server error.' })
  }
})

// POST /api/progress/complete
router.post('/complete', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { levelId, xpReward } = req.body as { levelId?: number; xpReward?: number }
    if (typeof levelId !== 'number' || typeof xpReward !== 'number') {
      res.status(400).json({ error: 'levelId and xpReward are required numbers.' })
      return
    }

    let progress = await Progress.findOne({ userId: req.userId })
    if (!progress) {
      progress = await Progress.create({ userId: req.userId })
    }

    const today     = new Date().toISOString().slice(0, 10)
    const yesterday = new Date(Date.now() - 864e5).toISOString().slice(0, 10)
    const last      = progress.lastPlayedDate

    let streak = progress.streak
    if (!last)               streak = 1
    else if (last === today) { /* already played today */ }
    else if (last === yesterday) streak += 1
    else streak = 1

    const alreadyDone = progress.completedLevels.includes(levelId)
    const newXp       = progress.xp + (alreadyDone ? 0 : xpReward)
    const newLevels   = alreadyDone
      ? progress.completedLevels
      : [...progress.completedLevels, levelId]

    await Progress.updateOne(
      { userId: req.userId },
      { xp: newXp, streak, lastPlayedDate: today, completedLevels: newLevels }
    )

    res.json({ xp: newXp, streak, completedLevels: newLevels })
  } catch (err) {
    console.error('POST /progress/complete', err)
    res.status(500).json({ error: 'Server error.' })
  }
})

export default router
