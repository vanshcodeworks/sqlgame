import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import mongoose from 'mongoose'
import authRoutes from './routes/auth'
import progressRoutes from './routes/progress'
import accessRoutes from './routes/access'
import validateRoutes from './routes/validate'
import { ensureDemoUser } from './lib/seedDemoUser'

const app = express()
const PORT = process.env.PORT ?? 3001
const MONGO = process.env.MONGO_URI ?? 'mongodb://127.0.0.1:27017/queryquest'
const CLIENT_URL = process.env.CLIENT_URL ?? 'http://localhost:5173'

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

// Delete the old db.ts reference — kept here intentionally to ensure
// it is no longer imported.  src/db.ts can be removed.

async function start() {
  try {
    await mongoose.connect(MONGO)
    console.log('MongoDB connected')
    if (process.env.NODE_ENV !== 'production') {
      await ensureDemoUser()
    }
    app.listen(PORT, () => {
      console.log(`QueryQuest server → http://localhost:${PORT}`)
    })
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err)
    process.exit(1)
  }
}

start()
