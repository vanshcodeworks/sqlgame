import { Router } from 'express'
import { requireAuth, AuthRequest } from '../middleware/auth'
import { levels, runQuery, validate, levelArcId, MAX_QUERY_LENGTH } from '@queryquest/shared'
import type { QueryResult } from '@queryquest/shared'
import { ValidationQueue } from '../lib/validationQueue'
import { getSqlEngine } from '../lib/sqlEngine'

const router = Router()
// Concurrency > 1 so one slow/hostile query doesn't stall grading for every
// concurrent player; each sql.js Database instance is independent per call.
const queue = new ValidationQueue(Number(process.env.VALIDATION_CONCURRENCY ?? '4'))
const expectedCache = new Map<number, QueryResult>()

router.post('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { levelId, query } = req.body as { levelId?: number; query?: string }
    if (!Number.isInteger(levelId) || typeof query !== 'string') {
      res.status(400).json({ error: 'A numeric levelId and a query string are required.' })
      return
    }
    if (query.length > MAX_QUERY_LENGTH) {
      res.status(400).json({ error: `Queries are limited to ${MAX_QUERY_LENGTH} characters.` })
      return
    }

    const level = levels.find(l => l.id === levelId)
    if (!level) {
      res.status(404).json({ error: 'Level not found.' })
      return
    }

    if (!req.profile?.arc_access.includes(levelArcId(level.id))) {
      res.status(403).json({ error: 'This arc has not been unlocked for your account yet.' })
      return
    }

    const validation = await queue.enqueue(async () => {
      const sql = await getSqlEngine()
      const userResult = runQuery(sql, query, level.schema)
      let expectedResult = expectedCache.get(level.id)
      if (!expectedResult) {
        expectedResult = runQuery(sql, level.expectedQuery, level.schema)
        expectedCache.set(level.id, expectedResult)
      }
      return validate(userResult, expectedResult, level.orderSensitive)
    })

    res.json({ validation })
  } catch (err) {
    console.error('POST /validate', err)
    res.status(500).json({ error: 'Validation error.' })
  }
})

export default router
