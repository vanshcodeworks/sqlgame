import { Router } from 'express'
import { levels, levelArcId } from '@queryquest/shared'
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

/**
 * Returns a YYYY-MM-DD date in the player's timezone. Streaks are personal,
 * so "today" has to mean today where the player is, not where the server is.
 * Falls back to UTC when the client does not send a usable timezone.
 */
function localDate(timeZone: string | undefined, daysAgo = 0): string {
  const date = new Date(Date.now() - daysAgo * 86_400_000)
  if (timeZone) {
    try {
      return new Intl.DateTimeFormat('en-CA', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(date)
    } catch {
      // Invalid timezone string — fall through to UTC.
    }
  }
  return date.toISOString().slice(0, 10)
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
// XP is always derived from the level definition, never from the request body.
router.post('/complete', requireAuth, async (req: AuthRequest, res) => {
  if (!supabaseAdmin) { res.status(500).json({ error: 'Server misconfigured.' }); return }
  try {
    const { levelId: rawLevelId } = req.body as { levelId?: unknown }
    if (typeof rawLevelId !== 'number' || !Number.isInteger(rawLevelId)) {
      res.status(400).json({ error: 'A numeric levelId is required.' })
      return
    }
    const levelId = rawLevelId

    const level = levels.find(l => l.id === levelId)
    if (!level) {
      res.status(404).json({ error: 'Level not found.' })
      return
    }

    if (!req.profile?.arc_access.includes(levelArcId(level.id))) {
      res.status(403).json({ error: 'This arc has not been unlocked for your account yet.' })
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

    const timeZone = req.get('x-timezone')
    const today = localDate(timeZone)
    const yesterday = localDate(timeZone, 1)
    const last = progress.last_played_date

    let streak = progress.streak
    if (!last) streak = 1
    else if (last === today) { /* already played today */ }
    else if (last === yesterday) streak += 1
    else streak = 1

    const alreadyDone = progress.completed_levels.includes(levelId)
    const newXp = progress.xp + (alreadyDone ? 0 : level.xpReward)
    const newLevels = alreadyDone
      ? progress.completed_levels
      : [...progress.completed_levels, levelId].sort((a, b) => a - b)

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

    res.json({ xp: newXp, streak, lastPlayedDate: today, completedLevels: newLevels })
  } catch (err) {
    console.error('POST /progress/complete', err)
    res.status(500).json({ error: 'Server error.' })
  }
})

export default router
