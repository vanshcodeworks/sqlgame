import { supabaseAdmin } from './supabaseAdmin'

export type ProfileRole = 'user' | 'admin'
export type ProfileIdentity = 'rookie' | 'engineer' | 'agent'
export type ProfileTempo = 'scout' | 'agent' | 'elite'

export interface Profile {
  id: string
  email: string
  display_name: string
  identity: ProfileIdentity
  tempo: ProfileTempo
  onboarding_complete: boolean
  arc_access: number[]
  role: ProfileRole
}

/**
 * The Postgres trigger `handle_new_user` creates a profile row on signup,
 * so this is normally a plain lookup. The upsert fallback only matters for
 * accounts created before the trigger existed, or a rare replication race.
 */
export async function getOrCreateProfile(
  supabaseId: string,
  email: string,
  displayName?: string
): Promise<Profile | null> {
  if (!supabaseAdmin) return null

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', supabaseId)
    .maybeSingle()

  if (error) {
    console.error('getOrCreateProfile select', error.message)
    return null
  }
  if (data) return data as Profile

  const { data: created, error: insertError } = await supabaseAdmin
    .from('profiles')
    .insert({ id: supabaseId, email, display_name: displayName ?? '' })
    .select('*')
    .single()

  if (insertError) {
    console.error('getOrCreateProfile insert', insertError.message)
    return null
  }

  await supabaseAdmin.from('progress').insert({ user_id: supabaseId }).select().maybeSingle()

  return created as Profile
}
