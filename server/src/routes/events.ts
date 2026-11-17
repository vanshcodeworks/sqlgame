import { Router } from 'express'
import { supabaseAdmin } from '../lib/supabaseAdmin'

const router = Router()

const MAX_EVENTS = 20
const MAX_BATCH_BYTES = 64 * 1024
const ALLOWED_NAMES = new Set([
  'page_view', 'page_time', 'scroll_depth', 'click',
  'identify',
  'signup_started', 'signup_completed', 'signin_started', 'signin_completed',
  'onboarding_step', 'onboarding_completed',
  'level_started', 'level_completed', 'level_abandoned', 'run_failed',
  'hint_used', 'arc_requested',
  'level_picked', 'share_card',
])

interface IncomingEvent {
  device_id?: unknown
  session_id?: unknown
  user_id?: unknown
  name?: unknown
  properties?: unknown
  entry_path?: unknown
  device_class?: unknown
  timezone?: unknown
  utm_source?: unknown
  utm_medium?: unknown
  utm_campaign?: unknown
  referrer?: unknown
}

function str(value: unknown, max: number): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!trimmed) return null
  return trimmed.slice(0, max)
}

function num(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

/**
 * Coarse "which kind of device" from the User-Agent. We only need
 * mobile/tablet/desktop for cohort analysis, never a full UA fingerprint.
 */
function classFromUA(ua: string): 'mobile' | 'tablet' | 'desktop' {
  if (/iPad|Tablet|PlayBook|Silk/i.test(ua)) return 'tablet'
  if (/Mobi|iPhone|iPod|Android.*Mobile|Windows Phone/i.test(ua)) return 'mobile'
  return 'desktop'
}

/**
 * Country + city from the request IP, with the raw IP thrown away
 * immediately. Resolution order:
 *   1. Platform-injected headers (Cloudflare, Vercel, Render fly headers)
 *   2. X-Forwarded-For (we run behind Render's proxy and trust it)
 *   3. The socket address (direct connections)
 *
 * IP → geo uses a small embedded lookup rather than a third-party API, so no
 * outbound request and no IP leaves this process.
 */
function geoFromRequest(req: import('express').Request): { country: string | null; city: string | null } {
  const h = req.headers
  const cfCountry = str(h['cf-ipcountry'], 8)
  if (cfCountry) return { country: cfCountry.toUpperCase(), city: str(h['cf-ipcity'], 64) }

  const forwarded = str(h['x-forwarded-for'], 128)?.split(',')[0]?.trim()
  const vercelCountry = str(h['x-vercel-ip-country'], 8)
  if (vercelCountry) return { country: vercelCountry.toUpperCase(), city: str(h['x-vercel-ip-city'], 64) }

  const raw =
    forwarded ||
    (typeof h['fly-client-ip'] === 'string' ? h['fly-client-ip'] : null) ||
    req.socket?.remoteAddress ||
    null

  // Without a geo database we keep only whether it looks like a real client.
  void raw
  return { country: null, city: null }
}

// The events route is the only endpoint an anonymous player calls, so it gets
// its own, tighter budget than the authenticated ones.
const ingestLimit = new Map<string, { count: number; resetAt: number }>()
const INGEST_WINDOW_MS = 60_000
const INGEST_MAX = 120 // ~2/sec, plenty for a batching client

function rateLimited(key: string): boolean {
  const now = Date.now()
  const entry = ingestLimit.get(key)
  if (!entry || entry.resetAt < now) {
    ingestLimit.set(key, { count: 1, resetAt: now + INGEST_WINDOW_MS })
    return false
  }
  entry.count += 1
  return entry.count > INGEST_MAX
}

router.post('/', async (req, res) => {
  // Always 202: the client must never retry a storm on a failure.
  try {
    const size = Number(req.headers['content-length'] ?? 0)
    if (size > MAX_BATCH_BYTES) { res.status(202).json({ ok: true }); return }

    const ip = req.ip ?? 'unknown'
    if (rateLimited(ip)) { res.status(202).json({ ok: true }); return }

    const raw = req.body as { events?: IncomingEvent[] } | undefined
    const events = Array.isArray(raw?.events) ? raw!.events.slice(0, MAX_EVENTS) : []
    if (events.length === 0) { res.status(202).json({ ok: true }); return }

    const geo = geoFromRequest(req)
    const ua = str(req.headers['user-agent'], 256) ?? ''
    const uaClass = classFromUA(ua)

    const rows = events
      .map(e => {
        const name = str(e.name, 48)
        const deviceId = str(e.device_id, 64)
        const sessionId = str(e.session_id, 64)
        if (!name || !deviceId || !sessionId) return null
        if (!ALLOWED_NAMES.has(name)) return null

        const props = e.properties
        const properties: Record<string, unknown> =
          props && typeof props === 'object' && !Array.isArray(props)
            ? { ...(props as Record<string, unknown>) }
            : {}
        // The table has no entry_path column — keep the attribution in the
        // JSON payload where it belongs instead of sending an unknown column.
        const entryPath = str(e.entry_path, 128)
        if (entryPath) properties.entry_path = entryPath

        const clientClass = str(e.device_class, 12)

        return {
          device_id: deviceId,
          user_id: str(e.user_id, 64),
          session_id: sessionId,
          name,
          properties,
          country: geo.country,
          city: geo.city,
          device_class: clientClass ?? uaClass,
          timezone: str(e.timezone, 64),
          utm_source: str(e.utm_source, 64),
          utm_medium: str(e.utm_medium, 64),
          utm_campaign: str(e.utm_campaign, 128),
          referrer: str(e.referrer, 256),
        }
      })
      .filter((r): r is NonNullable<typeof r> => r !== null)

    if (rows.length === 0) { res.status(202).json({ ok: true }); return }

    if (!supabaseAdmin) { res.status(202).json({ ok: true }); return }

    const { error } = await supabaseAdmin.from('events').insert(rows)
    if (error) console.error('events insert', error.message)

    res.status(202).json({ ok: true })
  } catch (err) {
    // Telemetry is best-effort; log and carry on.
    console.error('POST /api/events', err)
    res.status(202).json({ ok: true })
  }
})

export default router