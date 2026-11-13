import { createClient, type Session } from '@supabase/supabase-js'
import type { UserProfile } from '../types/index.ts'
import { validateEmail } from './emailValidator.ts'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? ''

const SESSION_KEY = 'qqauth_v2'

interface StoredSession {
  accessToken: string
  refreshToken?: string
  /** Epoch milliseconds. Older saves may not have this. */
  expiresAt?: number
  user: UserProfile
}

type AuthResult =
  | { success: true; needsEmailConfirm?: boolean }
  | { success: false; error: string }

let supabaseConfigured = false
let supabase: ReturnType<typeof createClient> | null = null

if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    supabaseConfigured = true
  } catch (e) {
    console.error('Failed to initialize Supabase client:', e)
  }
} else {
  console.warn(
    '⚠️ Supabase not configured: VITE_SUPABASE_URL and/or VITE_SUPABASE_ANON_KEY missing.\n' +
    '   Auth features will be disabled. Create a Supabase project and add:\n' +
    '   VITE_SUPABASE_URL=https://your-project.supabase.co\n' +
    '   VITE_SUPABASE_ANON_KEY=your-anon-key'
  )
}

export { supabaseConfigured, supabase }

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
  try { localStorage.setItem(SESSION_KEY, JSON.stringify(session)) } catch { /* ignore */ }
}

function clearSession(): void {
  try { localStorage.removeItem(SESSION_KEY) } catch { /* ignore */ }
}

function sessionExpiry(expiresIn?: number): number | undefined {
  return expiresIn ? Date.now() + expiresIn * 1000 : undefined
}

function dispatchSessionExpired(): void {
  clearSession()
  window.dispatchEvent(new Event('qq:session-expired'))
}

export function getUser(): UserProfile | null {
  return readSession()?.user ?? null
}

export function getToken(): string | null {
  return readSession()?.accessToken ?? null
}

let refreshPromise: Promise<string | null> | null = null

async function refreshAccessToken(): Promise<string | null> {
  if (!supabaseConfigured || !supabase) {
    dispatchSessionExpired()
    return null
  }
  const session = readSession()
  if (!session?.refreshToken) {
    dispatchSessionExpired()
    return null
  }

  if (!refreshPromise) {
    refreshPromise = supabase.auth
      .refreshSession({ refresh_token: session.refreshToken })
      .then(({ data, error }) => {
        const next = data.session
        if (error || !next) {
          dispatchSessionExpired()
          return null
        }
        const current = readSession()
        if (current) {
          writeSession({
            accessToken: next.access_token,
            refreshToken: next.refresh_token,
            expiresAt: sessionExpiry(next.expires_in),
            user: current.user,
          })
        }
        return next.access_token
      })
      .catch(() => {
        dispatchSessionExpired()
        return null
      })
      .finally(() => { refreshPromise = null })
  }

  return refreshPromise
}

/**
 * Returns a token that is safe to send to the API, refreshing it first when
 * it is close to expiry. The Supabase access token only lives for an hour,
 * so using the raw cached token would silently break every request after
 * that.
 */
export async function getValidToken(): Promise<string | null> {
  const session = readSession()
  if (!session) return null
  if (!session.expiresAt || session.expiresAt - 60_000 > Date.now()) {
    return session.accessToken
  }
  return refreshAccessToken()
}

/** fetch() with the current access token and expiry handling. */
export async function authFetch(
  input: RequestInfo | URL,
  init: RequestInit = {}
): Promise<Response> {
  const token = await getValidToken()
  const headers = new Headers(init.headers)
  if (token) headers.set('Authorization', `Bearer ${token}`)
  const res = await fetch(input, { ...init, headers })
  if (res.status === 401) dispatchSessionExpired()
  return res
}

/**
 * Keeps our cached tokens in step with Supabase's own automatic refresh.
 * Called from the auth-state subscription. Must stay synchronous: awaiting
 * Supabase inside its own auth callback can deadlock the client.
 */
export function syncSupabaseSession(session: Session | null): void {
  if (!session) return
  const current = readSession()
  if (!current) return
  writeSession({
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    expiresAt: sessionExpiry(session.expires_in),
    user: current.user,
  })
}

/**
 * Restores the app session on load. This is what makes email-confirmation
 * and password-recovery links work: Supabase exchanges the token in the URL
 * for a session, and we copy it into the app's own session cache.
 */
export async function bootstrapAuth(): Promise<UserProfile | null> {
  if (!supabaseConfigured || !supabase) {
    console.warn('Supabase not configured, skipping auth bootstrap')
    return getUser()
  }
  try {
    const { data } = await supabase.auth.getSession()
    const session = data.session

    if (!session) {
      if (readSession()) clearSession()
      return null
    }

    const cached = readSession()
    if (cached && cached.accessToken === session.access_token) {
      // Tokens are already in sync, but refresh the profile in the background.
      refreshUser(session.access_token).catch(() => { /* offline is fine */ })
      return cached.user
    }

    const result = await storeSession(session)
    return result.success ? getUser() : null
  } catch {
    return getUser()
  }
}

export function patchCachedUser(patch: Partial<UserProfile>): void {
  const session = readSession()
  if (!session) return
  writeSession({ ...session, user: { ...session.user, ...patch } })
}

function userFromSession(session: Session): UserProfile | null {
  if (!session.user) return null
  const meta = session.user.user_metadata as { displayName?: string } | null
  return {
    id: session.user.id,
    email: session.user.email ?? '',
    displayName: meta?.displayName ?? '',
    identity: 'rookie',
    tempo: 'agent',
    onboardingComplete: false,
    arcAccess: [1, 2, 3],
    role: 'user',
  }
}

async function storeSession(session: Session | null): Promise<AuthResult> {
  const accessToken = session?.access_token
  if (!accessToken || !session) {
    return { success: true, needsEmailConfirm: true }
  }

  // The profile API can be cold or briefly unavailable (especially on a free
  // Render instance). A Supabase session is still valid, so fall back to the
  // cached profile or the token's own user data rather than blocking sign-in.
  const cached = readSession()
  const cachedUser = cached && session.user && cached.user.id === session.user.id
    ? cached.user
    : null
  const user = (await refreshUser(accessToken)) ?? cachedUser ?? userFromSession(session)
  if (!user) {
    return { success: false, error: 'Unable to load your profile. Please try again.' }
  }

  writeSession({
    accessToken,
    refreshToken: session.refresh_token,
    expiresAt: sessionExpiry(session.expires_in),
    user,
  })
  return { success: true }
}

/** Minimum bar for launch: 8+ chars, at least one letter and one number. */
export function checkPasswordStrength(password: string): { ok: boolean; reason?: string } {
  if (password.length < 8) return { ok: false, reason: 'Password must be at least 8 characters.' }
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return { ok: false, reason: 'Password must contain both letters and numbers.' }
  }
  return { ok: true }
}

export async function signUp(
  email: string,
  password: string,
  displayName?: string
): Promise<AuthResult> {
  if (!supabaseConfigured || !supabase) {
    return { success: false, error: 'Authentication not configured. Please contact support.' }
  }
  const emailCheck = validateEmail(email)
  if (!emailCheck.ok) return { success: false, error: emailCheck.reason! }

  const passwordCheck = checkPasswordStrength(password)
  if (!passwordCheck.ok) return { success: false, error: passwordCheck.reason! }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { displayName: displayName ?? '' },
        emailRedirectTo: `${window.location.origin}/auth`,
      },
    })
    if (error) return { success: false, error: error.message }
    return await storeSession(data.session)
  } catch {
    return { success: false, error: 'Network error — please try again.' }
  }
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  if (!supabaseConfigured || !supabase) {
    return { success: false, error: 'Authentication not configured. Please contact support.' }
  }
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { success: false, error: error.message }
    return await storeSession(data.session)
  } catch {
    return { success: false, error: 'Network error — please try again.' }
  }
}

export async function requestPasswordReset(email: string): Promise<AuthResult> {
  if (!supabaseConfigured || !supabase) {
    return { success: false, error: 'Authentication not configured. Please contact support.' }
  }
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) return { success: false, error: error.message }
    return { success: true }
  } catch {
    return { success: false, error: 'Network error — please try again.' }
  }
}

export async function updatePassword(newPassword: string): Promise<AuthResult> {
  if (!supabaseConfigured || !supabase) {
    return { success: false, error: 'Authentication not configured. Please contact support.' }
  }
  const passwordCheck = checkPasswordStrength(newPassword)
  if (!passwordCheck.ok) return { success: false, error: passwordCheck.reason! }

  try {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) return { success: false, error: error.message }
    return { success: true }
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
  const token = await getValidToken()
  if (!token) return { success: false, error: 'Your session expired. Please sign in again.' }
  try {
    const res = await authFetch(`${API_BASE}/api/auth/profile`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    })
    const data = await res.json() as { user?: UserProfile; error?: string }
    if (!res.ok || !data.user) return { success: false, error: data.error ?? 'Update failed.' }
    patchCachedUser(data.user)
    return { success: true, user: data.user }
  } catch {
    return { success: false, error: 'Network error. Please try again.' }
  }
}

export async function refreshUser(tokenOverride?: string): Promise<UserProfile | null> {
  const token = tokenOverride ?? await getValidToken()
  if (!token) return null
  try {
    const res = await fetch(`${API_BASE}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) return null
    const data = await res.json() as { user: UserProfile }
    if (!data.user) return null
    patchCachedUser(data.user)
    return data.user
  } catch {
    return null
  }
}

export async function signOut(): Promise<void> {
  clearSession()
  if (supabaseConfigured && supabase) {
    try { await supabase.auth.signOut() } catch { /* ignore */ }
  }
}

/**
 * Provisions a fresh, single-use demo account via the server (which holds
 * the service-role key) and signs in with it. Replaces the old approach of
 * baking one shared demo email/password into the public client bundle.
 */
export async function signInAsDemo(): Promise<AuthResult> {
  try {
    const res = await fetch(`${API_BASE}/api/demo/session`, { method: 'POST' })
    if (!res.ok) return { success: false, error: 'Demo mode is unavailable right now.' }
    const { email, password } = await res.json() as { email: string; password: string }
    return await signIn(email, password)
  } catch {
    return { success: false, error: 'Network error — please try again.' }
  }
}
