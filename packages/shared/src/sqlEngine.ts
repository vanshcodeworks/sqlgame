import type { Database, SqlJsStatic } from 'sql.js'
import type { QueryResult } from './types'

const ALLOWED_LEADING_KEYWORDS = new Set(['SELECT', 'WITH'])

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
  schema: string
): QueryResult {
  const db = new sql.Database()
  try {
    db.run(schema)

    const guard = guardPlayerQuery(db, query)
    if (!guard.ok) {
      return { columns: [], rows: [], error: guard.reason }
    }

    const results = db.exec(query)
    if (results.length === 0) {
      return { columns: [], rows: [] }
    }
    const { columns, values } = results[0]
    return {
      columns,
      rows: values.map(row =>
        Object.fromEntries(columns.map((col, i) => [col, row[i]]))
      )
    }
  } catch (e) {
    return { columns: [], rows: [], error: (e as Error).message }
  } finally {
    db.close()
  }
}
