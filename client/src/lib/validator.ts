import type { QueryResult, ValidationResult } from '../types/index.ts'

function rowKey(row: Record<string, unknown>, columns: string[]): string {
  return columns
    .map(col => {
      const v = row[col]
      return v === null || v === undefined ? '\x01NULL\x01' : String(v)
    })
    .join('\x00')
}

export function validate(
  userResult: QueryResult,
  expectedResult: QueryResult,
  orderSensitive: boolean
): ValidationResult {
  if (userResult.error) {
    return { passed: false, message: `SQL error: ${userResult.error}` }
  }

  const userCols = [...userResult.columns].sort().join(',')
  const expectCols = [...expectedResult.columns].sort().join(',')
  if (userCols !== expectCols) {
    return {
      passed: false,
      message: `Wrong columns. Expected: ${[...expectedResult.columns].sort().join(', ')}`
    }
  }

  if (userResult.rows.length !== expectedResult.rows.length) {
    return {
      passed: false,
      message: `Wrong number of rows. Got ${userResult.rows.length}, expected ${expectedResult.rows.length}.`
    }
  }

  const cols = expectedResult.columns

  if (orderSensitive) {
    for (let i = 0; i < userResult.rows.length; i++) {
      if (rowKey(userResult.rows[i], cols) !== rowKey(expectedResult.rows[i], cols)) {
        return { passed: false, message: `Row ${i + 1} doesn't match. Check your ORDER BY clause.` }
      }
    }
  } else {
    const userKeys = userResult.rows.map(r => rowKey(r, cols)).sort()
    const expectKeys = expectedResult.rows.map(r => rowKey(r, cols)).sort()
    if (JSON.stringify(userKeys) !== JSON.stringify(expectKeys)) {
      return { passed: false, message: "Data doesn't match. Double-check your WHERE clause or column values." }
    }
  }

  return { passed: true, message: 'Correct! Great work.' }
}
