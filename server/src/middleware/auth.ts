import { Request, Response, NextFunction } from 'express'
import { createRemoteJWKSet, jwtVerify, JWTPayload } from 'jose'
import { User } from '../models/User'
import { Progress } from '../models/Progress'
import { supabaseAdmin } from '../lib/supabaseAdmin'

const SUPABASE_URL = process.env.SUPABASE_URL
const JWKS = SUPABASE_URL
  ? createRemoteJWKSet(new URL(`${SUPABASE_URL}/auth/v1/certs`))
  : null

interface SupabasePayload extends JWTPayload {
  sub?: string
  email?: string
  user_metadata?: { displayName?: string }
}

export interface AuthRequest extends Request {
  userId?: string
  userEmail?: string
  userRole?: 'user' | 'admin'
}

export async function verifyToken(token: string): Promise<SupabasePayload | null> {
  if (!JWKS || !SUPABASE_URL) return null
  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `${SUPABASE_URL}/auth/v1`,
    })
    return payload as SupabasePayload
  } catch {
    return null
  }
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorised.' })
    return
  }

  const token = header.slice(7)
  const payload = await verifyToken(token)

  let supabaseId = payload?.sub
  let email = payload?.email
  let displayName = payload?.user_metadata?.displayName

  if (!supabaseId && supabaseAdmin) {
    const { data, error } = await supabaseAdmin.auth.getUser(token)
    if (!error && data.user) {
      supabaseId = data.user.id
      email = data.user.email ?? undefined
      displayName = (data.user.user_metadata as { displayName?: string } | null)?.displayName
    }
  }

  if (!supabaseId) {
    res.status(401).json({ error: 'Invalid or expired token.' })
    return
  }

  if (!email) {
    res.status(400).json({ error: 'Email missing from token.' })
    return
  }

  let user = await User.findOne({ supabaseId })
  if (!user) {
    user = await User.create({
      supabaseId,
      email,
      displayName: displayName ?? '',
    })
    await Progress.create({ userId: user._id })
  }

  req.userId = user._id.toString()
  req.userEmail = user.email
  req.userRole = user.role
  next()
}
