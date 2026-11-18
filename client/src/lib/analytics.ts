/**
 * Product telemetry — one `track()` function, batched, never blocks the UI.
 *
 * Design rules (from docs/RETENTION-TRACKING.md):
 *  1. Nothing is collected until the player has consented, and "Do Not Track"
 *     / Global Privacy Control disables it outright.
 *  2. `sendBeacon` on pagehide — a `fetch` is cancelled when the tab closes
 *     and all time-on-page data would be lost.
 *  3. Heartbeat every 15s on the pages we actually care about, so session
 *     length is measured rather than guessed.
 *  4. Batched to ≤ 20 events / ≤ 5s to stay well inside the rate limiter.
 */

const EVENT_LIMIT = 20
const BATCH_MS = 5_000
const STORAGE_KEY = 'qq_device_id'
const OPT_OUT_KEY = 'qq_tracking_off'

/** Context resolved once per page load. */
interface Context {
  deviceId: string
  sessionId: string
  entryPath: string
  utm: { source?: string; medium?: string; campaign?: string; referrer?: string }
}

let ctx: Context | null = null
let queue: Array<Record<string, unknown>> = []
let flushTimer: ReturnType<typeof setTimeout> | undefined
let pageEnteredAt = 0

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? ''

/* ── Consent ─────────────────────────────────────────────────────────── */

function trackingDisabled(): boolean {
  if (typeof window === 'undefined') return true
  try {
    if (localStorage.getItem(OPT_OUT_KEY) === '1') return true
  } catch { /* private mode: treat as disabled */ }

  const nav = navigator as Navigator & { globalPrivacyControl?: boolean; doNotTrack?: string }
  if (nav.globalPrivacyControl) return true

  // "Do Not Track" is advisory, but honouring it is the cheap honest default.
  if (nav.doNotTrack === '1') return true

  return false
}

export function setTrackingEnabled(enabled: boolean): void {
  try {
    if (enabled) localStorage.removeItem(OPT_OUT_KEY)
    else localStorage.setItem(OPT_OUT_KEY, '1')
  } catch { /* ignore */ }
}

export function isTrackingEnabled(): boolean {
  return !trackingDisabled()
}

/* ── Identity (anonymous, first-party) ───────────────────────────────── */

function getDeviceId(): string {
  try {
    const existing = localStorage.getItem(STORAGE_KEY)
    if (existing) return existing
    const id = `d_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`
    localStorage.setItem(STORAGE_KEY, id)
    return id
  } catch {
    // No storage at all — still track within this tab.
    return `t_${Math.random().toString(36).slice(2, 12)}`
  }
}

function getSessionId(): string {
  try {
    const existing = sessionStorage.getItem('qq_session_id')
    if (existing) return existing
    const id = `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
    sessionStorage.setItem('qq_session_id', id)
    return id
  } catch {
    return `s_${Math.random().toString(36).slice(2, 12)}`
  }
}

/* ── Context ─────────────────────────────────────────────────────────── */

function getContext(): Context {
  if (ctx) return ctx

  const params = new URLSearchParams(window.location.search)
  const referrer = document.referrer || undefined

  ctx = {
    deviceId: getDeviceId(),
    sessionId: getSessionId(),
    entryPath: window.location.pathname,
    utm: {
      source: params.get('utm_source') ?? undefined,
      medium: params.get('utm_medium') ?? undefined,
      campaign: params.get('utm_campaign') ?? undefined,
      referrer,
    },
  }
  return ctx
}

function deviceClass(): 'mobile' | 'tablet' | 'desktop' {
  const coarse = window.matchMedia('(pointer: coarse)').matches
  if (coarse) {
    // Anything coarse-pointer and small is a phone.
    return window.innerWidth < 820 ? 'mobile' : 'tablet'
  }
  return 'desktop'
}

let timezone: string | undefined
function getTimezone(): string {
  if (timezone === undefined) {
    try { timezone = Intl.DateTimeFormat().resolvedOptions().timeZone } catch { timezone = '' }
  }
  return timezone
}

/* ── Transport ───────────────────────────────────────────────────────── */

function send(events: Array<Record<string, unknown>>, useBeacon: boolean): void {
  if (events.length === 0) return
  const body = JSON.stringify({ events })

  if (useBeacon && navigator.sendBeacon) {
    // sendBeacon needs a Blob with a content type, otherwise it sends text/plain.
    const ok = navigator.sendBeacon(
      `${API_BASE}/api/events`,
      new Blob([body], { type: 'application/json' })
    )
    if (ok) return
  }

  void fetch(`${API_BASE}/api/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true,
  }).catch(() => { /* telemetry must never surface an error to the player */ })
}

function flush(useBeacon = false): void {
  if (queue.length === 0) return
  const events = queue.slice(0, EVENT_LIMIT)
  queue = queue.slice(events.length)
  send(events, useBeacon)
}

function scheduleFlush(): void {
  if (flushTimer) return
  flushTimer = setTimeout(() => {
    flushTimer = undefined
    flush()
  }, BATCH_MS)
}

/* ── Public API ──────────────────────────────────────────────────────── */

/**
 * Record an event. Cheap enough to call anywhere; no-ops when tracking is
 * disabled so callers never need to check.
 */
export function track(name: string, properties: Record<string, unknown> = {}): void {
  if (trackingDisabled()) return

  const c = getContext()
  queue.push({
    device_id: c.deviceId,
    session_id: c.sessionId,
    name,
    properties,
    entry_path: c.entryPath,
    device_class: deviceClass(),
    timezone: getTimezone(),
    utm_source: c.utm.source ?? null,
    utm_medium: c.utm.medium ?? null,
    utm_campaign: c.utm.campaign ?? null,
    referrer: c.utm.referrer ?? null,
  })

  if (queue.length >= EVENT_LIMIT) flush()
  else scheduleFlush()
}

/** Identify the current device with an account, so pre/post-signup joins. */
export function identify(userId: string): void {
  if (trackingDisabled()) return
  getContext()
  // Send immediately: this is the join key, it must not sit in a queue that
  // gets dropped when the tab closes.
  queue.push({
    device_id: ctx!.deviceId,
    session_id: ctx!.sessionId,
    name: 'identify',
    user_id: userId,
    properties: {},
  })
  flush()
}

/** Time-on-page. `page` is a stable label like 'landing' or 'levels'. */
export function trackPage(page: string): void {
  if (trackingDisabled()) return
  pageEnteredAt = Date.now()
  track('page_view', { page })

  const onHide = () => {
    if (!pageEnteredAt) return
    track('page_time', { page, ms: Date.now() - pageEnteredAt })
    flush(true)
    pageEnteredAt = 0
  }

  // pagehide fires on tab close and on navigation — the only reliable moment.
  window.addEventListener('pagehide', onHide, { once: true })
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') onHide()
  }, { once: true })

  // One `page_time` row per visit is enough. A periodic heartbeat was writing
  // a cumulative row every 15s — ~240 rows/hour for an idle tab, which wrecks
  // both the 90-day budget and any p50/p90 time-on-page query. `pagehide` with
  // sendBeacon already survives tab close, so the heartbeat was redundant.
}

/** Scroll depth as a fraction of the document, sampled once per page. */
export function trackScrollDepth(page: string): void {
  if (trackingDisabled()) return
  let deepest = 0
  let reported = false

  const onScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight
    if (max <= 0) return
    const depth = Math.min(window.scrollY / max, 1)
    if (depth > deepest) deepest = depth
    if (!reported && deepest >= 0.9) {
      reported = true
      track('scroll_depth', { page, depth: 1 })
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('pagehide', () => {
    track('scroll_depth', { page, depth: Number(deepest.toFixed(2)) })
    flush(true)
  }, { once: true })
}

/** CTA clicks, captured once per element identity per page. */
export function trackClick(page: string, target: string): void {
  if (trackingDisabled()) return
  track('click', { page, target })
}