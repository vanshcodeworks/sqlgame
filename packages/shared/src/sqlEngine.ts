import type { Database, SqlJsStatic } from 'sql.js'
import type { QueryResult } from './types'

const ALLOWED_LEADING_KEYWORDS = new Set(['SELECT', 'WITH'])
const BLOCKED_FUNCTIONS = /\b(randomblob|zeroblob|load_extension|writefile|readfile)\s*\(/i

export const MAX_QUERY_LENGTH = 5_000
export const MAX_RESULT_ROWS = 2_000

export interface QueryGuardResult {
  ok: boolean
  reason?: string
}

/**
 * Restricts player-submitted SQL to read-only, single-statement queries.
 * Uses sql.js's own statement iterator (the real SQLite tokenizer) rather
 * than naive `;`-splitting, since literals/comments can contain `;`.
 *
 * Must run against a Database that already has the level's schema loaded —
 * SQLite validates table references at prepare time, so an empty database
 * would reject every legitimate query with "no such table".
 *
 * Uses getSQL() (the original query text) rather than getNormalizedSQL(),
 * since SQLite's normalized form collapses whitespace after keywords
 * (e.g. "SELECT?;"), which breaks a plain whitespace-split keyword check.
 */
export function guardPlayerQuery(db: Database, query: string): QueryGuardResult {
  if (!query.trim()) {
    return { ok: false, reason: 'Query is empty.' }
  }
  if (query.length > MAX_QUERY_LENGTH) {
    return { ok: false, reason: `Query is too long (max ${MAX_QUERY_LENGTH} characters).` }
  }
  if (BLOCKED_FUNCTIONS.test(query)) {
    return { ok: false, reason: 'That function is not allowed in this playground.' }
  }
  // Recursive CTEs can spin the single-threaded WASM engine indefinitely.
  // No current mission uses them; enable them again with a worker timeout.
  if (/\bWITH\s+RECURSIVE\b/i.test(query)) {
    return { ok: false, reason: 'Recursive queries are not supported yet.' }
  }

  try {
    let statementCount = 0
    let firstKeyword: string | null = null

    const iter = db.iterateStatements(query)
    for (const stmt of iter) {
      statementCount++
      if (firstKeyword === null) {
        const text = stmt.getSQL().trim()
        firstKeyword = (text.split(/\s+/)[0] ?? '').toUpperCase()
      }
      stmt.free()
      if (statementCount > 1) break
    }

    if (statementCount === 0) {
      return { ok: false, reason: 'Query is empty.' }
    }
    if (statementCount > 1) {
      return { ok: false, reason: 'Only a single statement is allowed per query.' }
    }
    if (!firstKeyword || !ALLOWED_LEADING_KEYWORDS.has(firstKeyword)) {
      return { ok: false, reason: 'Only SELECT (or WITH ... SELECT) queries are allowed here.' }
    }

    return { ok: true }
  } catch (e) {
    return { ok: false, reason: (e as Error).message }
  }
}

export function runQuery(
  sql: SqlJsStatic,
  query: string,
  schema: string,
  maxRows = MAX_RESULT_ROWS
): QueryResult {
  const db = new sql.Database()
  try {
    db.run(schema)
    // Keep a single hostile query from exhausting the Render free instance.
    // Older SQLite builds simply ignore this pragma.
    try { db.run('PRAGMA hard_heap_limit = 67108864') } catch { /* optional */ }

    const guard = guardPlayerQuery(db, query)
    if (!guard.ok) {
      return { columns: [], rows: [], error: guard.reason }
    }

    const stmt = db.prepare(query)
    try {
      const columns = stmt.getColumnNames()
      const rows: Record<string, unknown>[] = []
      while (stmt.step()) {
        if (rows.length >= maxRows) {
          return {
            columns: [],
            rows: [],
            error: `That query returns more than ${maxRows.toLocaleString()} rows. Add a WHERE or LIMIT clause and try again.`
          }
        }
        const values = stmt.get()
        rows.push(Object.fromEntries(columns.map((col, i) => [col, values[i]])))
      }
      return { columns, rows }
    } finally {
      stmt.free()
    }
  } catch (e) {
    return { columns: [], rows: [], error: (e as Error).message }
  } finally {
    db.close()
  }
}
