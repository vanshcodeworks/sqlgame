import { useState, useCallback, useEffect } from 'react'
import {
  loadState,
  saveState,
  applyLevelCompletion,
  fetchServerProgress,
  syncLevelCompletionToServer,
} from '../lib/storage.ts'

export function useGameState() {
  const [state, setState] = useState(() => loadState())

  useEffect(() => {
    let cancelled = false
    fetchServerProgress().then(serverState => {
      if (cancelled || !serverState) return
      setState(prev => {
        // Server is the source of truth for a signed-in account; only take
        // it if it actually has data, so a brand-new account doesn't wipe
        // any pre-signup local progress. playedDates isn't synced server-side
        // (used only for the local streak-calendar popover), so always keep
        // the local copy regardless of which side wins.
        const next = serverState.completedLevels.length > 0 || prev.completedLevels.length === 0
          ? { ...serverState, playedDates: prev.playedDates }
          : prev
        saveState(next)
        return next
      })
    })
    return () => { cancelled = true }
  }, [])

  const completeLevel = useCallback((levelId: number, xpReward: number) => {
    setState(prev => {
      const next = applyLevelCompletion(prev, levelId, xpReward)
      saveState(next)
      return next
    })

    syncLevelCompletionToServer(levelId).then(serverState => {
      if (!serverState) return
      setState(prev => {
        const next = { ...prev, xp: serverState.xp, streak: serverState.streak, completedLevels: serverState.completedLevels }
        saveState(next)
        return next
      })
    })
  }, [])

  return {
    xp: state.xp,
    streak: state.streak,
    completedLevels: state.completedLevels,
    playedDates: state.playedDates,
    completeLevel
  }
}
