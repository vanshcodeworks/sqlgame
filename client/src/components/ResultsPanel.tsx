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
      <div className={styles.header}>
        <span className={styles.headerLabel}>Results</span>
        {queryResult && !queryResult.error && !isRunning && (
          <span className={styles.headerMeta}>
            {queryResult.columns.length} col{queryResult.columns.length !== 1 ? 's' : ''} · {queryResult.rows.length} row{queryResult.rows.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {validationResult && (
        <div className={validationResult.passed ? styles.feedbackSuccess : styles.feedbackError}>
          <span className={styles.feedbackIcon}>{validationResult.passed ? '✓' : '✗'}</span>
          <span className={styles.feedbackText}>{validationResult.message}</span>
        </div>
      )}

      <div className={styles.content}>
        {isRunning && (
          <div className={styles.empty}>
            <span className={styles.spinner} />
            Running query…
          </div>
        )}

        {!isRunning && initError && (
          <div className={styles.errorBlock}>
            <span className={styles.errorLabel}>SQL engine failed to load</span>
            <pre className={styles.errorText}>{initError}</pre>
          </div>
        )}

        {!isRunning && !queryResult && !initError && (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>▸</span>
            Press <kbd className={styles.kbd}>Run</kbd> to see your results here.
          </div>
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
              <div className={styles.empty}>
                <span className={styles.emptyIcon}>∅</span>
                Query ran successfully — no rows matched.
              </div>
            ) : (
              <ResultsTable columns={queryResult.columns} rows={queryResult.rows} />
            )}
          </>
        )}
      </div>
    </div>
  )
}