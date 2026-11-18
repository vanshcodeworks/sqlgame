#!/usr/bin/env node
/**
 * QueryQuest analytics — prints a clean visitor report from the events table.
 *
 * Usage:
 *   node scripts/analytics.mjs                 # last 30 days
 *   node scripts/analytics.mjs 7               # last 7 days
 *
 * Reads SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY from the shell environment
 * or from server/.env (never commit real keys).
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const days = Number(process.argv[2] ?? 30)

function loadEnv() {
  const env = { ...process.env }
  const file = path.join(root, 'server', '.env')
  if (fs.existsSync(file)) {
    for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/)
      if (m && !env[m[1]]) env[m[1]] = m[2]
    }
  }
  return env
}

const env = loadEnv()
const URL = env.SUPABASE_URL
const KEY = env.SUPABASE_SERVICE_ROLE_KEY

if (!URL || !KEY) {
  console.error('Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in env or server/.env')
  process.exit(1)
}

const since = new Date(Date.now() - days * 86_400_000).toISOString()
const url =
  `${URL}/rest/v1/events` +
  `?select=device_id,user_id,session_id,name,properties,country,device_class,created_at` +
  `&created_at=gte.${encodeURIComponent(since)}&limit=10000`

const res = await fetch(url, {
  headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
})

if (!res.ok) {
  console.error(`Supabase returned ${res.status}: ${await res.text()}`)
  process.exit(1)
}

const events = await res.json()

const uniq = (key) => new Set(events.map(e => e[key]).filter(Boolean))
const byName = {}
for (const e of events) byName[e.name] = (byName[e.name] ?? 0) + 1

const devices = uniq('device_id')
const sessions = uniq('session_id')
const accounts = uniq('user_id')
const views = events.filter(e => e.name === 'page_view')
const visits = uniq('session_id') // one sessionId per tab-session

// Time on page: take the FINAL page_time row per session (not the sum of
// heartbeats). Old data from before the heartbeat fix will be de-duplicated.
const lastTime = new Map()
for (const e of events) {
  if (e.name !== 'page_time') continue
  const ms = Number(e.properties?.ms ?? 0)
  const cur = lastTime.get(e.session_id) ?? 0
  if (ms > cur) lastTime.set(e.session_id, ms)
}
const times = [...lastTime.values()].filter(n => Number.isFinite(n) && n > 0).sort((a, b) => a - b)
const pct = (p) => times.length ? Math.round(times[Math.floor((times.length - 1) * p)] / 1000) : 0

const countries = {}
for (const e of events) {
  if (e.country) countries[e.country] = (countries[e.country] ?? 0) + 1
}

const pad = (s, n) => String(s).padEnd(n)
const fmt = (ms) => ms >= 60 ? `${Math.floor(ms / 60)}m ${ms % 60}s` : `${ms}s`

console.log(`\nQueryQuest · visitor report (last ${days} days)`)
console.log('─'.repeat(46))
console.log(`${pad('Total events', 28)} ${events.length}`)
console.log(`${pad('Unique devices (browsers)', 28)} ${devices.size}`)
console.log(`${pad('Unique sessions (visits)', 28)} ${visits.size}`)
console.log(`${pad('Identified accounts', 28)} ${accounts.size}`)
console.log(`${pad('Page views', 28)} ${views.length}`)
console.log(`${pad('Median time on page', 28)} ${fmt(pct(0.5))}`)
console.log(`${pad('p90 time on page', 28)} ${fmt(pct(0.9))}`)
console.log('─'.repeat(46))
console.log('Events by name:')
for (const [name, count] of Object.entries(byName).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${pad(name, 26)} ${count}`)
}
if (Object.keys(countries).length) {
  console.log('By country:')
  for (const [c, count] of Object.entries(countries).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${pad(c, 26)} ${count}`)
  }
}
console.log('')

if (devices.size <= 1) {
  console.log('Note: 1 device usually means only this browser has visited while tracking was on.')
}
