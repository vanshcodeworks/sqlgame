import { describe, it, expect, beforeAll } from 'vitest'
import initSqlJs, { type SqlJsStatic } from 'sql.js'
import { levels } from './levels'
import { runQuery, guardPlayerQuery } from './sqlEngine'
import { validate } from './validator'

let sql: SqlJsStatic

beforeAll(async () => {
  sql = await initSqlJs()
})

describe('levels content', () => {
  it('has unique, sequential level ids starting at 1', () => {
    const ids = levels.map(l => l.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(ids).toEqual([...ids].sort((a, b) => a - b))
  })

  for (const level of levels) {
    it(`level ${level.id} (${level.title}): expectedQuery runs clean and validates against itself`, () => {
      const expectedResult = runQuery(sql, level.expectedQuery, level.schema)
      expect(expectedResult.error, `expectedQuery errored: ${expectedResult.error}`).toBeUndefined()
      expect(expectedResult.rows.length).toBeGreaterThan(0)

      const selfCheck = validate(expectedResult, expectedResult, level.orderSensitive)
      expect(selfCheck.passed).toBe(true)
    })
  }
})

describe('guardPlayerQuery', () => {
  function dbWithSchema(schema: string) {
    const db = new sql.Database()
    db.run(schema)
    return db
  }

  it('allows a plain SELECT', () => {
    const db = dbWithSchema('')
    expect(guardPlayerQuery(db, 'SELECT 1').ok).toBe(true)
    db.close()
  })

  it('allows a WITH ... SELECT (CTE)', () => {
    const db = dbWithSchema('')
    expect(guardPlayerQuery(db, 'WITH x AS (SELECT 1 AS n) SELECT * FROM x').ok).toBe(true)
    db.close()
  })

  it('rejects DDL like DROP TABLE', () => {
    const db = dbWithSchema('CREATE TABLE employees (id INTEGER);')
    const res = guardPlayerQuery(db, 'DROP TABLE employees')
    expect(res.ok).toBe(false)
    db.close()
  })

  it('rejects multi-statement scripts', () => {
    const db = dbWithSchema('CREATE TABLE employees (id INTEGER);')
    const res = guardPlayerQuery(db, "DROP TABLE employees; SELECT 1")
    expect(res.ok).toBe(false)
    db.close()
  })

  it('rejects an empty query', () => {
    const db = dbWithSchema('')
    expect(guardPlayerQuery(db, '   ').ok).toBe(false)
    db.close()
  })

  it('does not misfire on a semicolon inside a string literal', () => {
    const db = dbWithSchema('')
    const res = guardPlayerQuery(db, "SELECT 'a;b' AS val")
    expect(res.ok).toBe(true)
    db.close()
  })
})
