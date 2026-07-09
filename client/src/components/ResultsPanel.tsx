import type { QueryResult, ValidationResult } from '../types/index.ts'
import { ResultsTable } from './ResultsTable.tsx'
import styles from './ResultsPanel.module.css'

interface Props {
  queryResult: QueryResult | null
  validationResult: ValidationResult | null
  isRunning: boolean
  initError?: string | null
}

export function ResultsPanel({ queryResult, validationResult, isRunning, initError }: Props) {
  return (
    <div className={styles.panel}>
      {validationResult && (
        <div className={validationResult.passed ? styles.feedbackSuccess : styles.feedbackError}>
          <span className={styles.feedbackIcon}>{validationResult.passed ? '✓' : '✗'}</span>
          {validationResult.message}
        </div>
      )}

      <div className={styles.content}>
        {isRunning && (
          <div className={styles.empty}>Running...</div>
        )}

        {!isRunning && initError && (
          <div className={styles.errorBlock}>
            <span className={styles.errorLabel}>SQL engine failed to load</span>
            <pre className={styles.errorText}>{initError}</pre>
          </div>
        )}

        {!isRunning && !queryResult && !initError && (
          <div className={styles.empty}>Run a query to see results</div>
        )}

        {!isRunning && queryResult?.error && (
          <div className={styles.errorBlock}>
            <span className={styles.errorLabel}>Error</span>
            <pre className={styles.errorText}>{queryResult.error}</pre>
          </div>
        )}

        {!isRunning && queryResult && !queryResult.error && (
          <>
            {queryResult.rows.length === 0 ? (
              <div className={styles.empty}>No rows returned</div>
            ) : (
              <>
                <div className={styles.rowCount}>
                  {queryResult.rows.length} row{queryResult.rows.length !== 1 ? 's' : ''}
                </div>
                <ResultsTable columns={queryResult.columns} rows={queryResult.rows} />
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
