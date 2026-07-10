import { useState, useEffect, useCallback } from 'react'
import type { SqlJsStatic } from 'sql.js'
import { loadSqlJs } from '../lib/sqlEngine.ts'
import { runQuery } from '@queryquest/shared'
import type { QueryResult } from '../types/index.ts'

export function useSqlEngine() {
  const [sqlJs, setSqlJs] = useState<SqlJsStatic | null>(null)
  const [loading, setLoading] = useState(true)
  const [initError, setInitError] = useState<string | null>(null)

  useEffect(() => {
    loadSqlJs()
      .then(sql => { setSqlJs(sql); setLoading(false) })
      .catch(err => { setInitError(String(err)); setLoading(false) })
  }, [])

  const execute = useCallback(
    (query: string, schema: string): QueryResult => {
      if (initError) return { columns: [], rows: [], error: initError }
      if (!sqlJs) return { columns: [], rows: [], error: 'SQL engine not ready' }
      return runQuery(sqlJs, query, schema)
    },
    [sqlJs, initError]
  )

  return { loading, initError, execute }
}
