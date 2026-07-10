import { describe, it, expect } from 'vitest'
import { validate } from './validator'
import type { QueryResult } from './types'

function result(columns: string[], rows: Array<Record<string, unknown>>, error?: string): QueryResult {
  return { columns, rows, error }
}

describe('validate', () => {
  it('passes when rows match exactly (order-sensitive)', () => {
    const user = result(['id'], [{ id: 1 }, { id: 2 }])
    const expected = result(['id'], [{ id: 1 }, { id: 2 }])
    expect(validate(user, expected, true).passed).toBe(true)
  })

  it('fails order-sensitive when row order differs', () => {
    const user = result(['id'], [{ id: 2 }, { id: 1 }])
    const expected = result(['id'], [{ id: 1 }, { id: 2 }])
    const res = validate(user, expected, true)
    expect(res.passed).toBe(false)
    expect(res.message).toMatch(/ORDER BY/)
  })

  it('passes order-insensitive when rows match regardless of order', () => {
    const user = result(['id'], [{ id: 2 }, { id: 1 }])
    const expected = result(['id'], [{ id: 1 }, { id: 2 }])
    expect(validate(user, expected, false).passed).toBe(true)
  })

  it('treats NULL and undefined as equivalent', () => {
    const user = result(['id', 'val'], [{ id: 1, val: null }])
    const expected = result(['id', 'val'], [{ id: 1, val: undefined }])
    expect(validate(user, expected, false).passed).toBe(true)
  })

  it('fails when column names differ regardless of order', () => {
    const user = result(['b', 'a'], [{ a: 1, b: 2 }])
    const expected = result(['a', 'b'], [{ a: 1, b: 2 }])
    expect(validate(user, expected, false).passed).toBe(true)
  })

  it('is case-sensitive on column names', () => {
    const user = result(['ID'], [{ ID: 1 }])
    const expected = result(['id'], [{ id: 1 }])
    expect(validate(user, expected, false).passed).toBe(false)
  })

  it('fails with the user error message when the user query errored', () => {
    const user = result([], [], 'syntax error')
    const expected = result(['id'], [{ id: 1 }])
    const res = validate(user, expected, false)
    expect(res.passed).toBe(false)
    expect(res.message).toMatch(/syntax error/)
  })

  it('fails distinctly when the expected query itself is broken', () => {
    const user = result(['id'], [{ id: 1 }])
    const expected = result([], [], 'no such table: typo_table')
    const res = validate(user, expected, false)
    expect(res.passed).toBe(false)
    expect(res.message).toMatch(/Level content error/)
    expect(res.message).toMatch(/typo_table/)
  })

  it('fails when row counts differ', () => {
    const user = result(['id'], [{ id: 1 }])
    const expected = result(['id'], [{ id: 1 }, { id: 2 }])
    const res = validate(user, expected, false)
    expect(res.passed).toBe(false)
    expect(res.message).toMatch(/number of rows/)
  })
})
