import { Router } from 'express'
import { randomUUID } from 'crypto'
import { supabaseAdmin } from '../lib/supabaseAdmin'

const router = Router()

// POST /api/demo/session
// Provisions a fresh, ephemeral Supabase account per request so that
// "try the demo" visitors never share one login or clobber each other's
// progress. Credentials are single-use and never stored in the client
// bundle. Intentionally not rate-limited beyond the app-wide limiter.
router.post('/session', async (_req, res) => {
  if (!supabaseAdmin) {
    res.status(503).json({ error: 'Demo mode is not configured.' })
    return
  }

  const email = `demo-${randomUUID()}@queryquest.demo`
  const password = randomUUID()

  const { error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { displayName: 'Demo Operative' },
  })

  if (error) {
    console.error('POST /demo/session', error.message)
    res.status(500).json({ error: 'Unable to start demo session.' })
    return
  }

  res.json({ email, password })
})

export default router
