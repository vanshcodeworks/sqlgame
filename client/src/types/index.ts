export type { Level, LevelStory, QueryResult, ValidationResult } from '@queryquest/shared'

export interface UserProfile {
  id:                 string
  email:              string
  displayName:        string
  identity:           'rookie' | 'engineer' | 'agent'
  tempo:              'scout'  | 'agent'    | 'elite'
  onboardingComplete: boolean
  arcAccess:          number[]
  role:               'user' | 'admin'
}

export interface GameState {
  xp: number
  streak: number
  lastPlayedDate: string | null
  completedLevels: number[]
  /** Local-only (not synced server-side): dates played, for the streak popover. */
  playedDates: string[]
  /** Local-only: missions completed today (the daily-goal ring). */
  dailyDate?: string
  dailyCount?: number
}
