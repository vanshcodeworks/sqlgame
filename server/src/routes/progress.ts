import { Router } from 'express'
import { requireAuth, AuthRequest } from '../middleware/auth'
import { supabaseAdmin } from '../lib/supabaseAdmin'

const router = Router()

interface ProgressRow {
  user_id: string
  xp: number
  streak: number
  last_played_date: string | null
  completed_levels: number[]
}

// GET /api/progress
router.get('/', requireAuth, async (req: AuthRequest, res) => {
  if (!supabaseAdmin) { res.status(500).json({ error: 'Server misconfigured.' }); return }
  try {
    const { data, error } = await supabaseAdmin
      .from('progress')
      .select('*')
      .eq('user_id', req.userId)
      .maybeSingle()

    if (error) { console.error('GET /progress', error.message); res.status(500).json({ error: 'Server error.' }); return }

    if (!data) {
      res.json({ xp: 0, streak: 0, lastPlayedDate: null, completedLevels: [] })
      return
    }

    const progress = data as ProgressRow
    res.json({
      xp: progress.xp,
      streak: progress.streak,
      lastPlayedDate: progress.last_played_date,
      completedLevels: progress.completed_levels,
    })
  } catch (err) {
    console.error('GET /progress', err)
    res.status(500).json({ error: 'Server error.' })
  }
})

// POST /api/progress/complete
router.post('/complete', requireAuth, async (req: AuthRequest, res) => {
  if (!supabaseAdmin) { res.status(500).json({ error: 'Server misconfigured.' }); return }
  try {
    const { levelId, xpReward } = req.body as { levelId?: number; xpReward?: number }
    if (typeof levelId !== 'number' || typeof xpReward !== 'number') {
      res.status(400).json({ error: 'levelId and xpReward are required numbers.' })
      return
    }

    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('progress')
      .select('*')
      .eq('user_id', req.userId)
      .maybeSingle()

    if (fetchError) { console.error('POST /progress/complete fetch', fetchError.message); res.status(500).json({ error: 'Server error.' }); return }

    const progress: ProgressRow = existing ?? {
      user_id: req.userId!,
      xp: 0,
      streak: 0,
      last_played_date: null,
      completed_levels: [],
    }

    const today = new Date().toISOString().slice(0, 10)
    const yesterday = new Date(Date.now() - 864e5).toISOString().slice(0, 10)
    const last = progress.last_played_date

    let streak = progress.streak
    if (!last) streak = 1
    else if (last === today) { /* already played today */ }
    else if (last === yesterday) streak += 1
    else streak = 1

    const alreadyDone = progress.completed_levels.includes(levelId)
    const newXp = progress.xp + (alreadyDone ? 0 : xpReward)
    const newLevels = alreadyDone
      ? progress.completed_levels
      : [...progress.completed_levels, levelId]

    const { error: upsertError } = await supabaseAdmin
      .from('progress')
      .upsert({
        user_id: req.userId,
        xp: newXp,
        streak,
        last_played_date: today,
        completed_levels: newLevels,
      })

    if (upsertError) { console.error('POST /progress/complete upsert', upsertError.message); res.status(500).json({ error: 'Server error.' }); return }

    res.json({ xp: newXp, streak, completedLevels: newLevels })
  } catch (err) {
    console.error('POST /progress/complete', err)
    res.status(500).json({ error: 'Server error.' })
  }
})

export default router
