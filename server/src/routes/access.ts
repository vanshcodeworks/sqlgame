import { Router, Response, NextFunction } from 'express'
import { requireAuth, AuthRequest } from '../middleware/auth'
import { supabaseAdmin } from '../lib/supabaseAdmin'

const router = Router()

const MAX_REQUEST_MESSAGE = 500
const MAX_ADMIN_NOTE = 500

interface AccessRequestRow {
  id: string
  user_id: string
  arc_id: number
  status: 'pending' | 'approved' | 'rejected'
  message: string
  admin_note: string
  created_at: string
  updated_at: string
  profiles?: {
    email?: string
    display_name?: string
    identity?: string
    tempo?: string
  } | Array<{
    email?: string
    display_name?: string
    identity?: string
    tempo?: string
  }> | null
}

function toClientRequest(row: AccessRequestRow) {
  const joined = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles

  return {
    id: row.id,
    userId: row.user_id,
    arcId: row.arc_id,
    status: row.status,
    message: row.message,
    adminNote: row.admin_note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    ...(joined
      ? {
          user: {
            email: joined.email ?? '',
            displayName: joined.display_name ?? '',
            identity: joined.identity ?? 'rookie',
            tempo: joined.tempo ?? 'agent',
          },
        }
      : {}),
  }
}

function readMessage(value: unknown): string | null {
  if (value === undefined) return ''
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length > MAX_REQUEST_MESSAGE ? null : trimmed
}

// POST /api/access/request
// User expresses interest in an arc beyond their current access.
router.post('/request', requireAuth, async (req: AuthRequest, res) => {
  if (!supabaseAdmin) { res.status(500).json({ error: 'Server misconfigured.' }); return }
  try {
    const { arcId, message } = req.body as { arcId?: unknown; message?: unknown }
    if (!Number.isInteger(arcId) || (arcId as number) < 4 || (arcId as number) > 7) {
      res.status(400).json({ error: 'Choose an arc between 4 and 7.' })
      return
    }

    const cleanMessage = readMessage(message)
    if (cleanMessage === null) {
      res.status(400).json({ error: `Messages must be ${MAX_REQUEST_MESSAGE} characters or fewer.` })
      return
    }

    const profile = req.profile!
    if (profile.arc_access.includes(arcId as number)) {
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
        {
          user_id: req.userId,
          arc_id: arcId,
          status: 'pending',
          message: cleanMessage,
          admin_note: '',
        },
        { onConflict: 'user_id,arc_id' }
      )
      .select('*')
      .single()

    if (error) { console.error('POST /access/request', error.message); res.status(500).json({ error: 'Server error.' }); return }

    res.status(201).json({ request: toClientRequest(request as AccessRequestRow) })
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
    res.json({ requests: (data as AccessRequestRow[]).map(toClientRequest) })
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
    if (status && !['pending', 'approved', 'rejected'].includes(status)) {
      res.status(400).json({ error: 'Invalid status filter.' })
      return
    }

    let query = supabaseAdmin
      .from('access_requests')
      .select('*, profiles(email, display_name, identity, tempo)')
      .order('created_at', { ascending: false })
    if (status) query = query.eq('status', status)

    const { data, error } = await query
    if (error) { res.status(500).json({ error: 'Server error.' }); return }
    res.json({ requests: (data as AccessRequestRow[]).map(toClientRequest) })
  } catch {
    res.status(500).json({ error: 'Server error.' })
  }
})

// PATCH /api/access/admin/requests/:id — approve or reject a request
router.patch('/admin/requests/:id', requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  if (!supabaseAdmin) { res.status(500).json({ error: 'Server misconfigured.' }); return }
  try {
    const { status, adminNote } = req.body as {
      status?: unknown
      adminNote?: unknown
    }

    if (status !== 'approved' && status !== 'rejected') {
      res.status(400).json({ error: 'Status must be approved or rejected.' })
      return
    }

    if (adminNote !== undefined && (typeof adminNote !== 'string' || adminNote.trim().length > MAX_ADMIN_NOTE)) {
      res.status(400).json({ error: `Admin notes must be ${MAX_ADMIN_NOTE} characters or fewer.` })
      return
    }

    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('access_requests')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle()

    if (fetchError) { res.status(500).json({ error: 'Server error.' }); return }
    if (!existing) { res.status(404).json({ error: 'Request not found.' }); return }

    const request = existing as AccessRequestRow

    // Grant first: if the profile update fails, the request stays pending and
    // the admin can simply approve it again. Retrying is idempotent.
    if (status === 'approved') {
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('arc_access')
        .eq('id', request.user_id)
        .single()

      if (profileError) { res.status(500).json({ error: 'Server error.' }); return }

      const arcAccess: number[] = profile?.arc_access ?? []
      if (!arcAccess.includes(request.arc_id)) {
        const { error: grantError } = await supabaseAdmin
          .from('profiles')
          .update({ arc_access: [...arcAccess, request.arc_id].sort((a, b) => a - b) })
          .eq('id', request.user_id)

        if (grantError) {
          console.error('PATCH /access/admin/requests grant', grantError.message)
          res.status(500).json({ error: 'Could not grant arc access.' })
          return
        }
      }
    }

    const { data: updated, error: updateError } = await supabaseAdmin
      .from('access_requests')
      .update({
        status,
        admin_note: typeof adminNote === 'string' ? adminNote.trim() : '',
      })
      .eq('id', request.id)
      .select('*')
      .single()

    if (updateError || !updated) {
      res.status(500).json({ error: 'Could not update the request.' })
      return
    }

    res.json({ request: toClientRequest(updated as AccessRequestRow) })
  } catch (err) {
    console.error('PATCH /access/admin/requests/:id', err)
    res.status(500).json({ error: 'Server error.' })
  }
})

export default router
