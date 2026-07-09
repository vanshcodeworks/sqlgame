import { useState, useCallback } from 'react'
import { loadState, saveState, applyLevelCompletion } from '../lib/storage.ts'

export function useGameState() {
  const [state, setState] = useState(() => loadState())

  const completeLevel = useCallback((levelId: number, xpReward: number) => {
    setState(prev => {
      const next = applyLevelCompletion(prev, levelId, xpReward)
      saveState(next)
      return next
    })
  }, [])

  return {
    xp: state.xp,
    streak: state.streak,
    completedLevels: state.completedLevels,
    completeLevel
  }
}
