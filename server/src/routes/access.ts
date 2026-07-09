import { Router, Response, NextFunction } from 'express'
import { requireAuth, AuthRequest } from '../middleware/auth'
import { supabaseAdmin } from '../lib/supabaseAdmin'

const router = Router()

// POST /api/access/request
// User expresses interest in an arc beyond their current access
router.post('/request', requireAuth, async (req: AuthRequest, res) => {
  if (!supabaseAdmin) { res.status(500).json({ error: 'Server misconfigured.' }); return }
  try {
    const { arcId, message } = req.body as { arcId?: number; message?: string }
    if (typeof arcId !== 'number' || arcId < 4 || arcId > 7) {
      res.status(400).json({ error: 'arcId must be a number 4–7.' })
      return
    }

    const profile = req.profile!
    if (profile.arc_access.includes(arcId)) {
      res.status(400).json({ error: 'You already have access to this arc.' })
      return
    }

    const { data: existing } = await supabaseAdmin
      .from('access_requests')
      .select('*')
      .eq('user_id', req.userId)
      .eq('arc_id', arcId)
      .maybeSingle()

    if (existing && existing.status === 'pending') {
      res.status(400).json({ error: 'You already have a pending request for this arc.' })
      return
    }

    const { data: request, error } = await supabaseAdmin
      .from('access_requests')
      .upsert(
        { user_id: req.userId, arc_id: arcId, status: 'pending', message: message?.trim() ?? '', admin_note: '' },
        { onConflict: 'user_id,arc_id' }
      )
      .select('*')
      .single()

    if (error) { console.error('POST /access/request', error.message); res.status(500).json({ error: 'Server error.' }); return }

    res.status(201).json({ request })
  } catch (err) {
    console.error('POST /access/request', err)
    res.status(500).json({ error: 'Server error.' })
  }
})

// GET /api/access/my-requests
router.get('/my-requests', requireAuth, async (req: AuthRequest, res) => {
  if (!supabaseAdmin) { res.status(500).json({ error: 'Server misconfigured.' }); return }
  try {
    const { data, error } = await supabaseAdmin
      .from('access_requests')
      .select('*')
      .eq('user_id', req.userId)
      .order('created_at', { ascending: false })

    if (error) { res.status(500).json({ error: 'Server error.' }); return }
    res.json({ requests: data })
  } catch {
    res.status(500).json({ error: 'Server error.' })
  }
})

// ── Admin endpoints ─────────────────────────────────────────────────────────

function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.userRole !== 'admin') { res.status(403).json({ error: 'Admin only.' }); return }
  next()
}

// GET /api/access/admin/requests?status=pending
router.get('/admin/requests', requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  if (!supabaseAdmin) { res.status(500).json({ error: 'Server misconfigured.' }); return }
  try {
    const status = req.query.status as string | undefined
    let query = supabaseAdmin
      .from('access_requests')
      .select('*, profiles(email, display_name, identity, tempo)')
      .order('created_at', { ascending: false })
    if (status) query = query.eq('status', status)

    const { data, error } = await query
    if (error) { res.status(500).json({ error: 'Server error.' }); return }
    res.json({ requests: data })
  } catch {
    res.status(500).json({ error: 'Server error.' })
  }
})

// PATCH /api/access/admin/requests/:id — approve or reject a request
router.patch('/admin/requests/:id', requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  if (!supabaseAdmin) { res.status(500).json({ error: 'Server misconfigured.' }); return }
  try {
    const { status, adminNote } = req.body as { status: 'approved' | 'rejected'; adminNote?: string }
    if (!['approved', 'rejected'].includes(status)) {
      res.status(400).json({ error: 'status must be approved or rejected.' })
      return
    }

    const { data: request, error } = await supabaseAdmin
      .from('access_requests')
      .update({ status, admin_note: adminNote ?? '' })
      .eq('id', req.params.id)
      .select('*')
      .single()

    if (error || !request) { res.status(404).json({ error: 'Request not found.' }); return }

    if (status === 'approved') {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('arc_access')
        .eq('id', request.user_id)
        .single()

      const arcAccess: number[] = profile?.arc_access ?? []
      if (!arcAccess.includes(request.arc_id)) {
        await supabaseAdmin
          .from('profiles')
          .update({ arc_access: [...arcAccess, request.arc_id] })
          .eq('id', request.user_id)
      }
    }

    res.json({ request })
  } catch (err) {
    console.error('PATCH /access/admin/requests/:id', err)
    res.status(500).json({ error: 'Server error.' })
  }
})

export default router
