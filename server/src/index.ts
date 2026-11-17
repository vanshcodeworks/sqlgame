import app from './app'
import { checkSupabaseConnection } from './lib/supabaseAdmin'

/**
 * Long-running entry point: local dev (`npm run dev --workspace=server`)
 * and Render. Vercel uses api/index.ts instead — it imports the same app.
 */

const PORT = Number(process.env.PORT ?? 3001)
const NODE_ENV = process.env.NODE_ENV ?? 'development'

if (NODE_ENV === 'production') {
  const required = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']
  const missing = required.filter(key => !process.env[key])
  if (missing.length) {
    console.error(`Missing required env vars in production: ${missing.join(', ')}`)
    process.exit(1)
  }
}

process.on('unhandledRejection', reason => {
  console.error('Unhandled rejection:', reason)
})
process.on('uncaughtException', err => {
  console.error('Uncaught exception:', err)
})

const server = app.listen(PORT, () => {
  console.log(`QueryQuest server (${NODE_ENV}) → http://localhost:${PORT}`)
  // Fail loudly here rather than silently dropping every write later.
  void checkSupabaseConnection()
})

function shutdown(signal: string) {
  console.log(`${signal} received, closing server…`)
  server.close(() => process.exit(0))
  // Don't hang forever if a client keeps a connection open.
  setTimeout(() => process.exit(0), 8_000).unref()
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))