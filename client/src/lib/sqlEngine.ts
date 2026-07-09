import type { SqlJsStatic } from 'sql.js'
import type { QueryResult } from '../types/index.ts'

export async function loadSqlJs(): Promise<SqlJsStatic> {
  const mod = await import('sql.js')
  const initSqlJs = (mod as unknown as { default?: unknown }).default ?? mod
  if (typeof initSqlJs !== 'function') {
    throw new Error('sql.js init function not found')
  }
  const baseUrl = import.meta.env.BASE_URL || '/'
  const normalized = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`
  return (initSqlJs as (config: { locateFile: (file: string) => string }) => Promise<SqlJsStatic>)(
    { locateFile: file => `${normalized}${file}` }
  )
}

export function runQuery(
  sql: SqlJsStatic,
  query: string,
  schema: string
): QueryResult {
  const db = new sql.Database()
  try {
    db.run(schema)
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
