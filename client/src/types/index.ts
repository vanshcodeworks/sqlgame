export interface LevelStory {
  character: string
  message: string
  hint?: string
}

export interface Level {
  id: number
  title: string
  xpReward: number
  story: LevelStory
  task: string
  schema: string
  expectedQuery: string
  initialQuery: string
  orderSensitive: boolean
}

export interface QueryResult {
  columns: string[]
  rows: Array<Record<string, unknown>>
  error?: string
}

export interface ValidationResult {
  passed: boolean
  message: string
}

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
}
