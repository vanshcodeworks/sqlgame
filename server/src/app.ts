import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import authRoutes from './routes/auth'
import progressRoutes from './routes/progress'
import accessRoutes from './routes/access'
import validateRoutes from './routes/validate'
import demoRoutes from './routes/demo'
import eventsRoutes from './routes/events'

/**
 * The Express app, with no process-level side effects.
 *
 * Two entry points import this:
 *   · server/src/index.ts — `app.listen()` for local dev and Render
 *   · api/index.ts        — the Vercel serverless handler
 *
 * Anything here runs on both, so nothing may call `process.exit`, bind a port,
 * or register signal handlers.
 */

const app = express()
const CLIENT_URL = process.env.CLIENT_URL ?? 'http://localhost:5173'
const NODE_ENV = process.env.NODE_ENV ?? 'development'

/**
 * On Vercel the client and API share one origin, so the browser sends no
 * `Origin` header and the existing allow-list keeps working unchanged.
 */
const vercelOrigins = (process.env.VERCEL_URL
  ? [`https://${process.env.VERCEL_URL}`]
  : [])

const extraOrigins = (process.env.CORS_ORIGINS ?? '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean)

// Optional regex for preview deployments, e.g. Vercel branch URLs.
const originRegex = process.env.CORS_ORIGIN_REGEX
  ? new RegExp(process.env.CORS_ORIGIN_REGEX)
  : null

const staticOrigins = new Set([
  CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  ...vercelOrigins,
  ...extraOrigins,
])

function isAllowedOrigin(origin: string): boolean {
  return staticOrigins.has(origin) || Boolean(originRegex?.test(origin))
}

function makeLimiter(windowMs: number, limit: number, message: string) {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    // Preflights and health checks should never eat a player's quota.
    skip: req => req.method === 'OPTIONS' || req.path === '/api/health',
    handler: (_req, res) => {
      res.status(429).json({ error: message })
    },
  })
}

const globalLimiter = makeLimiter(
  15 * 60 * 1000,
  300,
  'Too many requests. Please wait a few minutes and try again.'
)
const validateLimiter = makeLimiter(
  15 * 60 * 1000,
  120,
  'You are running queries very quickly. Take a breath and try again in a few minutes.'
)
const authLimiter = makeLimiter(
  15 * 60 * 1000,
  120,
  'Too many sign-in attempts. Please wait a few minutes and try again.'
)
const demoLimiter = makeLimiter(
  60 * 60 * 1000,
  5,
  'Demo sessions are limited to 5 per hour. Create a free account to keep playing.'
)
const accessLimiter = makeLimiter(
  60 * 60 * 1000,
  20,
  'Too many access requests. Please try again later.'
)

// Render and most hosts terminate TLS in front of the app, so the forwarded
// client IP is the one the rate limiter needs.
app.set('trust proxy', 1)
app.disable('x-powered-by')

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}))
app.use(cors({
  origin: (origin, callback) => {
    // Same-origin / curl requests have no Origin header.
    if (!origin || isAllowedOrigin(origin)) return callback(null, true)
    const err = new Error('Origin not allowed') as Error & { status?: number }
    err.status = 403
    return callback(err)
  },
  methods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Timezone'],
  maxAge: 86_400,
}))
app.use(compression())
app.use(globalLimiter)
app.use(express.json({ limit: '64kb' }))

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    name: 'QueryQuest API',
    runtime: process.env.VERCEL ? 'vercel' : 'node',
    time: new Date().toISOString(),
  })
})

app.use('/api/auth',     authLimiter, authRoutes)
app.use('/api/progress', progressRoutes)
app.use('/api/access',   accessLimiter, accessRoutes)
app.use('/api/validate', validateLimiter, validateRoutes)
app.use('/api/demo',     demoLimiter, demoRoutes)
// Telemetry is the one route an anonymous visitor calls, so it sits before
// the authenticated routers and manages its own budget.
app.use('/api/events',   eventsRoutes)

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found.' })
})

app.use((err: Error & { status?: number; statusCode?: number; type?: string },
  _req: express.Request,
  res: express.Response,
  _next: express.NextFunction) => {
  const status =
    err.type === 'entity.parse.failed' ? 400
      : err.type === 'entity.too.large' ? 413
        : err.status ?? err.statusCode ?? 500

  if (status >= 500) console.error('Unhandled error:', err)

  const message =
    status === 400 ? 'Invalid JSON body.'
      : status === 403 ? 'This origin is not allowed to call the API.'
        : status === 413 ? 'Request body is too large.'
          : 'Internal server error.'

  res.status(status).json({ error: message })
})

export default app