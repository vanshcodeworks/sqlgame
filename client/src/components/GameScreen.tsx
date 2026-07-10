import { useState } from 'react'
import type { Level, QueryResult, ValidationResult } from '../types/index.ts'
import type { useSqlEngine } from '../hooks/useSqlEngine.ts'
import { getToken } from '../lib/auth.ts'
import { StoryPanel } from './StoryPanel.tsx'
import { SqlEditor } from './SqlEditor.tsx'
import { ResultsPanel } from './ResultsPanel.tsx'
import { SuccessOverlay } from './SuccessOverlay.tsx'
import AuroraBorealisShader from './AuroraBorealisShader.tsx'
import styles from './GameScreen.module.css'

interface Props {
  level: Level
  sqlEngine: ReturnType<typeof useSqlEngine>
  completedLevels: number[]
  onComplete: (levelId: number, xpReward: number) => void
  onContinue: () => void
}

export function GameScreen({ level, sqlEngine, completedLevels, onComplete, onContinue }: Props) {
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null)
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? ''

  const alreadyCompleted = completedLevels.includes(level.id)

  async function handleRun(query: string) {
    if (isRunning) return
    setIsRunning(true)

    // Run user query locally for immediate results
    const userResult = sqlEngine.execute(query, level.schema)
    setQueryResult(userResult)

    try {
      const token = getToken()
      const res = await fetch(`${API_BASE}/api/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token ?? ''}`,
        },
        body: JSON.stringify({ levelId: level.id, query }),
      })
      const data = await res.json() as { validation?: ValidationResult; error?: string }
      if (!res.ok || !data.validation) {
        setValidationResult({ passed: false, message: data.error ?? 'Validation failed.' })
      } else {
        setValidationResult(data.validation)
        if (data.validation.passed && !alreadyCompleted) {
          onComplete(level.id, level.xpReward)
          setShowSuccess(true)
        }
      }
    } catch {
      setValidationResult({ passed: false, message: 'Validation service unavailable.' })
    }

    setIsRunning(false)
  }

  function handleContinue() {
    setShowSuccess(false)
    onContinue()
  }

  return (
    <div className={styles.screen}>
      <AuroraBorealisShader className={styles.aurora} />

      <div className={styles.story}>
        <StoryPanel
          levelId={level.id}
          levelTitle={level.title}
          story={level.story}
          task={level.task}
        />
      </div>

      <div className={styles.editor}>
        {/* Key on level.id so editor remounts (fresh state) when level changes */}
        <SqlEditor
          key={level.id}
          initialQuery={level.initialQuery}
          loading={sqlEngine.loading || isRunning}
          onRun={handleRun}
        />
      </div>

      <div className={styles.results}>
        <ResultsPanel
          queryResult={queryResult}
          validationResult={validationResult}
          isRunning={isRunning}
          initError={sqlEngine.initError}
        />
      </div>

      {showSuccess && (
        <SuccessOverlay
          levelTitle={level.title}
          xpEarned={level.xpReward}
          onContinue={handleContinue}
        />
      )}
    </div>
  )
}
