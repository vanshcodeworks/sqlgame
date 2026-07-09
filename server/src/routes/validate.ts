import { Router } from 'express'
import { requireAuth, AuthRequest } from '../middleware/auth'
import { levels } from '../data/levels'
import { ValidationQueue } from '../lib/validationQueue'
import { getSqlEngine, runQuery } from '../lib/sqlEngine'
import { validate } from '../lib/validator'

const router = Router()
const queue = new ValidationQueue(Number(process.env.VALIDATION_CONCURRENCY ?? '1'))

router.post('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { levelId, query } = req.body as { levelId?: number; query?: string }
    if (typeof levelId !== 'number' || typeof query !== 'string') {
      res.status(400).json({ error: 'levelId and query are required.' })
      return
    }

    const level = levels.find(l => l.id === levelId)
    if (!level) {
      res.status(404).json({ error: 'Level not found.' })
      return
    }

    const validation = await queue.enqueue(async () => {
      const sql = await getSqlEngine()
      const userResult = runQuery(sql, query, level.schema)
      const expectedResult = runQuery(sql, level.expectedQuery, level.schema)
      return validate(userResult, expectedResult, level.orderSensitive)
    })

    res.json({ validation })
  } catch (err) {
    console.error('POST /validate', err)
    res.status(500).json({ error: 'Validation error.' })
  }
})

export default router
