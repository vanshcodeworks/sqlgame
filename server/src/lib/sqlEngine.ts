import type { SqlJsStatic } from 'sql.js'
import initSqlJs from 'sql.js'

const SQL_WASM_PATH = require.resolve('sql.js/dist/sql-wasm.wasm')

let sqlPromise: Promise<SqlJsStatic> | undefined

export function getSqlEngine(): Promise<SqlJsStatic> {
  if (!sqlPromise) {
    sqlPromise = initSqlJs({ locateFile: () => SQL_WASM_PATH })
  }
  return sqlPromise
}
