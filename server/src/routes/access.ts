import { Router } from 'express'
import { requireAuth, AuthRequest } from '../middleware/auth'
import { AccessRequest } from '../models/AccessRequest'
import { User } from '../models/User'

const router = Router()

// POST /api/access/request
// User expresses interest in an arc beyond their current access
router.post('/request', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { arcId, message } = req.body as { arcId?: number; message?: string }
    if (typeof arcId !== 'number' || arcId < 4 || arcId > 7) {
      res.status(400).json({ error: 'arcId must be a number 4–7.' })
      return
    }

    const user = await User.findById(req.userId)
    if (!user) { res.status(404).json({ error: 'User not found.' }); return }

    if (user.arcAccess.includes(arcId)) {
      res.status(400).json({ error: 'You already have access to this arc.' })
      return
    }

    // Upsert: if they already have a pending/rejected request, refresh it
    const existing = await AccessRequest.findOne({ userId: req.userId, arcId })
    if (existing && existing.status === 'pending') {
      res.status(400).json({ error: 'You already have a pending request for this arc.' })
      return
    }

    const request = await AccessRequest.findOneAndUpdate(
      { userId: req.userId, arcId },
      { status: 'pending', message: message?.trim() ?? '', adminNote: '' },
      { upsert: true, new: true }
    )

    res.status(201).json({ request })
  } catch (err) {
    console.error('POST /access/request', err)
    res.status(500).json({ error: 'Server error.' })
  }
})

// GET /api/access/my-requests
// Returns all access requests for the current user
router.get('/my-requests', requireAuth, async (req: AuthRequest, res) => {
  try {
    const requests = await AccessRequest.find({ userId: req.userId }).sort({ createdAt: -1 })
    res.json({ requests })
  } catch (err) {
    res.status(500).json({ error: 'Server error.' })
  }
})

// ── Admin endpoints ─────────────────────────────────────────────────────────

function requireAdmin(req: AuthRequest, res: any, next: any) {
  if (!req.userId) { res.status(401).json({ error: 'Unauthorised.' }); return }
  User.findById(req.userId).then(user => {
    if (!user || user.role !== 'admin') {
      res.status(403).json({ error: 'Admin only.' }); return
    }
    next()
  })
}

// GET /api/access/admin/requests?status=pending
router.get('/admin/requests', requireAuth, requireAdmin, async (_req, res) => {
  try {
    const { status } = (_req as any).query
    const filter = status ? { status } : {}
    const requests = await AccessRequest.find(filter)
      .populate('userId', 'email displayName identity tempo')
      .sort({ createdAt: -1 })
    res.json({ requests })
  } catch (err) {
    res.status(500).json({ error: 'Server error.' })
  }
})

// PATCH /api/access/admin/requests/:id
// Approve or reject a request
router.patch('/admin/requests/:id', requireAuth, requireAdmin, async (req: any, res) => {
  try {
    const { status, adminNote } = req.body as { status: 'approved' | 'rejected'; adminNote?: string }
    if (!['approved', 'rejected'].includes(status)) {
      res.status(400).json({ error: 'status must be approved or rejected.' })
      return
    }

    const request = await AccessRequest.findByIdAndUpdate(
      req.params.id,
      { status, adminNote: adminNote ?? '' },
      { new: true }
    )
    if (!request) { res.status(404).json({ error: 'Request not found.' }); return }

    // If approved, add arcId to user's arcAccess
    if (status === 'approved') {
      await User.findByIdAndUpdate(
        request.userId,
        { $addToSet: { arcAccess: request.arcId } }
      )
    }

    res.json({ request })
  } catch (err) {
    res.status(500).json({ error: 'Server error.' })
  }
})

export default router
