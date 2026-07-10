import type { SqlJsStatic } from 'sql.js'

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
