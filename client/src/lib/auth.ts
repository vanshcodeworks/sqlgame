import { createClient, type Session } from '@supabase/supabase-js'
import type { UserProfile } from '../types/index.ts'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? ''

const SESSION_KEY = 'qqauth_v2'

interface StoredSession {
  accessToken: string
  user: UserProfile
}

type AuthResult =
  | { success: true; needsEmailConfirm?: boolean }
  | { success: false; error: string }

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('Supabase env vars missing: VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY')
}

const supabase = createClient(SUPABASE_URL ?? '', SUPABASE_ANON_KEY ?? '')

function readSession(): StoredSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    return JSON.parse(raw) as StoredSession
  } catch {
    return null
  }
}

function writeSession(session: StoredSession): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function getUser(): UserProfile | null {
  return readSession()?.user ?? null
}

export function getToken(): string | null {
  return readSession()?.accessToken ?? null
}

export function patchCachedUser(patch: Partial<UserProfile>): void {
  const session = readSession()
  if (!session) return
  writeSession({ ...session, user: { ...session.user, ...patch } })
}

async function storeSession(session: Session | null): Promise<AuthResult> {
  const accessToken = session?.access_token
  if (!accessToken) {
    return { success: true, needsEmailConfirm: true }
  }

  const user = await refreshUser(accessToken)
  if (!user) {
    return { success: false, error: 'Unable to load profile.' }
  }

  writeSession({ accessToken, user })
  return { success: true }
}

export async function signUp(
  email: string,
  password: string,
  displayName?: string
): Promise<AuthResult> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { displayName: displayName ?? '' },
        emailRedirectTo: window.location.origin,
      },
    })
    if (error) return { success: false, error: error.message }
    return await storeSession(data.session)
  } catch {
    return { success: false, error: 'Network error — please try again.' }
  }
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { success: false, error: error.message }
    return await storeSession(data.session)
  } catch {
    return { success: false, error: 'Network error — please try again.' }
  }
}

export async function updateProfile(patch: {
  displayName?: string
  identity?: UserProfile['identity']
  tempo?: UserProfile['tempo']
  onboardingComplete?: boolean
}): Promise<{ success: true; user: UserProfile } | { success: false; error: string }> {
  const token = getToken()
  if (!token) return { success: false, error: 'Not authenticated.' }
  try {
    const res = await fetch(`${API_BASE}/api/auth/profile`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(patch),
    })
    const data = await res.json() as { user?: UserProfile; error?: string }
    if (!res.ok) return { success: false, error: data.error ?? 'Update failed.' }
    patchCachedUser(data.user!)
    return { success: true, user: data.user! }
  } catch {
    return { success: false, error: 'Network error.' }
  }
}

export async function refreshUser(tokenOverride?: string): Promise<UserProfile | null> {
  const token = tokenOverride ?? getToken()
  if (!token) return null
  try {
    const res = await fetch(`${API_BASE}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) return null
    const data = await res.json() as { user: UserProfile }
    patchCachedUser(data.user)
    return data.user
  } catch {
    return null
  }
}

export async function signOut(): Promise<void> {
  try { await supabase.auth.signOut() } catch { /* ignore */ }
  try { localStorage.removeItem(SESSION_KEY) } catch { /* ignore */ }
}

export function getDemoCredentials(): { email: string; password: string } | null {
  const email = import.meta.env.VITE_DEMO_EMAIL as string | undefined
  const password = import.meta.env.VITE_DEMO_PASSWORD as string | undefined
  if (!email || !password) return null
  return { email, password }
}
