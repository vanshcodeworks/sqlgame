export interface QueryResult {
  columns: string[]
  rows: Array<Record<string, unknown>>
  error?: string
}

export interface ValidationResult {
  passed: boolean
  message: string
}

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
