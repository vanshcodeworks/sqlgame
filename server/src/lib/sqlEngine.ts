import type { SqlJsStatic } from 'sql.js'
import initSqlJs from 'sql.js'

/**
 * sql.js needs its WebAssembly module. Where it lives depends on the runtime:
 *
 *   · Node (local dev, Render) — read it off disk from node_modules.
 *   · Vercel serverless — no usable filesystem, but the client build already
 *     publishes sql-wasm.wasm to the public root, so fetch it over HTTP from
 *     the same deployment. VERCEL_URL is injected by the platform, so no
 *     environment variable is needed.
 *
 * This keeps one Express app that runs unchanged in both places.
 */
function wasmLocator(): string {
  if (process.env.VERCEL) {
    const host = process.env.SQL_WASM_URL
      ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null)

    if (host) return `${host.replace(/\/$/, '')}/sql-wasm.wasm`

    // Last resort: same-origin path.
    return '/sql-wasm.wasm'
  }

  // Node runtime: node_modules/sql.js/dist/sql-wasm.wasm.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require.resolve('sql.js/dist/sql-wasm.wasm')
}

let sqlPromise: Promise<SqlJsStatic> | undefined

export function getSqlEngine(): Promise<SqlJsStatic> {
  if (!sqlPromise) {
    sqlPromise = initSqlJs({ locateFile: wasmLocator })
      .catch(err => {
        // Allow a retry rather than caching a permanently failed promise.
        sqlPromise = undefined
        throw err
      })
  }
  return sqlPromise
}