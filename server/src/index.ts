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

const app = express()
const PORT = process.env.PORT ?? 3001
const CLIENT_URL = process.env.CLIENT_URL ?? 'http://localhost:5173'
const NODE_ENV = process.env.NODE_ENV ?? 'development'

if (NODE_ENV === 'production') {
  const required = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']
  const missing = required.filter(key => !process.env[key])
  if (missing.length) {
    console.error(`Missing required env vars in production: ${missing.join(', ')}`)
    process.exit(1)
  }
}

const extraOrigins = (process.env.CORS_ORIGINS ?? '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean)

const allowedOrigins = new Set([
  CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  ...extraOrigins,
])

app.set('trust proxy', 1)

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}))
app.use(compression())
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
}))
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.has(origin)) return callback(null, true)
    return callback(new Error('Not allowed by CORS'))
  },
}))
app.use(express.json({ limit: '1mb' }))

app.get('/api/health', (_req, res) => res.json({ ok: true, name: 'QueryQuest API' }))
app.use('/api/auth',     authRoutes)
app.use('/api/progress', progressRoutes)
app.use('/api/access',   accessRoutes)
app.use('/api/validate', validateRoutes)
app.use('/api/demo',     demoRoutes)

app.use((req, res) => {
  res.status(404).json({ error: 'Not found.' })
})

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ error: 'Internal server error.' })
})

process.on('unhandledRejection', reason => {
  console.error('Unhandled rejection:', reason)
})
process.on('uncaughtException', err => {
  console.error('Uncaught exception:', err)
})

app.listen(PORT, () => {
  console.log(`QueryQuest server (${NODE_ENV}) → http://localhost:${PORT}`)
})
