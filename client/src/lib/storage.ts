import type { GameState } from '../types/index.ts'
import { getToken } from './auth.ts'

const KEY = 'sqlgame_v1'
const ONBOARD_KEY = 'qqonboard_v1'
const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? ''

export type OnboardIdentity = 'rookie' | 'engineer' | 'agent'
export type OnboardTempo    = 'scout'  | 'agent'    | 'elite'

export interface OnboardingPrefs {
  identity:    OnboardIdentity
  tempo:       OnboardTempo
  completedAt: string
}

export function hasCompletedOnboarding(): boolean {
  return !!localStorage.getItem(ONBOARD_KEY)
}

export function saveOnboardingPrefs(prefs: OnboardingPrefs): void {
  try { localStorage.setItem(ONBOARD_KEY, JSON.stringify(prefs)) } catch { /* ignore */ }
}

export function loadOnboardingPrefs(): OnboardingPrefs | null {
  try {
    const raw = localStorage.getItem(ONBOARD_KEY)
    return raw ? (JSON.parse(raw) as OnboardingPrefs) : null
  } catch { return null }
}

const DEFAULT_STATE: GameState = {
  xp: 0,
  streak: 0,
  lastPlayedDate: null,
  completedLevels: []
}

export function loadState(): GameState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...DEFAULT_STATE }
    return { ...DEFAULT_STATE, ...JSON.parse(raw) } as GameState
  } catch {
    return { ...DEFAULT_STATE }
  }
}

export function saveState(state: GameState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    // localStorage unavailable (private mode) — progress won't persist
  }
}

export function applyLevelCompletion(
  state: GameState,
  levelId: number,
  xpReward: number
): GameState {
  const today = new Date().toISOString().split('T')[0]
  const last = state.lastPlayedDate

  let newStreak = state.streak
  if (last === null) {
    newStreak = 1
  } else {
    const diffDays = Math.round(
      (new Date(today).getTime() - new Date(last).getTime()) / 86_400_000
    )
    if (diffDays === 0) {
      newStreak = state.streak
    } else if (diffDays === 1) {
      newStreak = state.streak + 1
    } else {
      newStreak = 1
    }
  }

  return {
    xp: state.xp + (state.completedLevels.includes(levelId) ? 0 : xpReward),
    streak: newStreak,
    lastPlayedDate: today,
    completedLevels: state.completedLevels.includes(levelId)
      ? state.completedLevels
      : [...state.completedLevels, levelId]
  }
}

/**
 * localStorage is the offline-first cache; the server (Supabase Postgres,
 * via /api/progress) is the source of truth for a signed-in account.
 */
export async function fetchServerProgress(): Promise<GameState | null> {
  const token = getToken()
  if (!token) return null
  try {
    const res = await fetch(`${API_BASE}/api/progress`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) return null
    return await res.json() as GameState
  } catch {
    return null
  }
}

export async function syncLevelCompletionToServer(
  levelId: number,
  xpReward: number
): Promise<GameState | null> {
  const token = getToken()
  if (!token) return null
  try {
    const res = await fetch(`${API_BASE}/api/progress/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ levelId, xpReward }),
    })
    if (!res.ok) return null
    const data = await res.json() as { xp: number; streak: number; completedLevels: number[] }
    return { xp: data.xp, streak: data.streak, lastPlayedDate: null, completedLevels: data.completedLevels }
  } catch {
    return null
  }
}
