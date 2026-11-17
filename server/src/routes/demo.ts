import { Router } from 'express'
import { randomUUID } from 'crypto'
import { supabaseAdmin } from '../lib/supabaseAdmin'

const router = Router()

const DEMO_DOMAIN = '@queryquest.demo'
const DEMO_TTL_MS = 24 * 60 * 60 * 1000
let cleanupRunning = false

/**
 * Demo accounts are disposable, but a free-tier project should not accumulate
 * them forever. This deletes demo users older than a day, a page at a time.
 * Failures are non-fatal: the demo still works if cleanup cannot run.
 */
async function cleanupDemoUsers(): Promise<void> {
  if (!supabaseAdmin || cleanupRunning) return
  cleanupRunning = true
  try {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 })
    if (error) return

    const cutoff = Date.now() - DEMO_TTL_MS
    // Vercel's function bundler can infer `never` for the Admin API user list;
    // an explicit shape keeps the build identical in both runtimes.
    type ListedUser = { id: string; email?: string | null; created_at: string }
    const users = (data?.users ?? []) as ListedUser[]

    const stale = users.filter(user => {
      const email = user.email ?? ''
      if (!email.startsWith('demo-') || !email.endsWith(DEMO_DOMAIN)) return false
      const created = Date.parse(user.created_at)
      return Number.isFinite(created) && created < cutoff
    })

    await Promise.allSettled(stale.map(user => supabaseAdmin!.auth.admin.deleteUser(user.id)))
  } catch (err) {
    console.error('demo cleanup', err)
  } finally {
    cleanupRunning = false
  }
}

// POST /api/demo/session
// Provisions a fresh, ephemeral Supabase account per request so that
// "try the demo" visitors never share one login or clobber each other's
// progress. Credentials are single-use and never stored in the client
// bundle. The route has a strict, dedicated rate limit in index.ts.
router.post('/session', async (_req, res) => {
  if (!supabaseAdmin) {
    res.status(503).json({ error: 'Demo mode is not configured.' })
    return
  }

  try {
    const email = `demo-${randomUUID()}${DEMO_DOMAIN}`
    const password = randomUUID()

    const { error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { displayName: 'Demo Operative' },
    })

    if (error) {
      console.error('POST /demo/session', error.message)
      res.status(500).json({ error: 'Unable to start a demo session right now.' })
      return
    }

    // Opportunistic housekeeping; never block the response on it.
    if (Math.random() < 0.25) void cleanupDemoUsers()

    res.json({ email, password })
  } catch (err) {
    console.error('POST /demo/session', err)
    res.status(500).json({ error: 'Unable to start a demo session right now.' })
  }
})

export default router
