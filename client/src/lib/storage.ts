import type { GameState } from '../types/index.ts'
import { authFetch } from './auth.ts'

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
  completedLevels: [],
  playedDates: [],
  dailyCount: 0,
}

/** How many missions the player has completed since their local midnight. */
export function todayCount(state: GameState): number {
  if (state.dailyDate !== localToday()) return 0
  return state.dailyCount ?? 0
}

export function loadState(): GameState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...DEFAULT_STATE }
    const state = { ...DEFAULT_STATE, ...JSON.parse(raw) } as GameState
    // Backfill for saves from before playedDates existed — otherwise a
    // real streak shows an entirely empty calendar until the next completion.
    if (state.playedDates.length === 0 && state.lastPlayedDate) {
      state.playedDates = [state.lastPlayedDate]
    }
    return state
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

/** Local calendar day (YYYY-MM-DD), not UTC — streaks follow the player's day. */
function localToday(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function applyLevelCompletion(
  state: GameState,
  levelId: number,
  xpReward: number
): GameState {
  const today = localToday()
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
      : [...state.completedLevels, levelId],
    playedDates: state.playedDates.includes(today)
      ? state.playedDates
      : [...state.playedDates, today],
    // Daily counter resets on a new local day.
    dailyDate: today,
    dailyCount: state.dailyDate === today ? (state.dailyCount ?? 0) + 1 : 1,
  }
}

/**
 * localStorage is the offline-first cache; the server (Supabase Postgres,
 * via /api/progress) is the source of truth for a signed-in account.
 */
export async function fetchServerProgress(): Promise<GameState | null> {
  try {
    const res = await authFetch(`${API_BASE}/api/progress`)
    if (!res.ok) return null
    return await res.json() as GameState
  } catch {
    return null
  }
}

export async function syncLevelCompletionToServer(
  levelId: number
): Promise<Pick<GameState, 'xp' | 'streak' | 'completedLevels'> | null> {
  try {
    const res = await authFetch(`${API_BASE}/api/progress/complete`, {
      method: 'POST',
      // Send the browser's timezone so "today" means today where the player
      // is, not UTC — otherwise a late-evening session rolls the streak early.
      headers: {
        'Content-Type': 'application/json',
        'X-Timezone': Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      body: JSON.stringify({ levelId }),
    })
    if (!res.ok) return null
    const data = await res.json() as { xp: number; streak: number; completedLevels: number[] }
    return { xp: data.xp, streak: data.streak, completedLevels: data.completedLevels }
  } catch {
    return null
  }
}
