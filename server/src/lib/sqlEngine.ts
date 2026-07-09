import path from 'path'
import type { SqlJsStatic } from 'sql.js'
import initSqlJs from 'sql.js'
import type { QueryResult } from '../types/index'

const SQL_WASM_PATH = path.resolve(__dirname, '../../node_modules/sql.js/dist/sql-wasm.wasm')

let sqlPromise: Promise<SqlJsStatic> | null = null

export function getSqlEngine(): Promise<SqlJsStatic> {
  if (!sqlPromise) {
    sqlPromise = initSqlJs({ locateFile: () => SQL_WASM_PATH })
  }
  return sqlPromise
}

export function runQuery(sql: SqlJsStatic, query: string, schema: string): QueryResult {
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
      rows: values.map(row => Object.fromEntries(columns.map((col, i) => [col, row[i]])))
    }
  } catch (e) {
    return { columns: [], rows: [], error: (e as Error).message }
  } finally {
    db.close()
  }
}
