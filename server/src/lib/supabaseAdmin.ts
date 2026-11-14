import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

export const supabaseAdmin = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null

/**
 * A wrong-but-present service key is worse than a missing one: every write
 * returns success to the client and silently drops the row, so progress and
 * telemetry vanish with no visible error. Probe it once at boot and shout.
 */
export async function checkSupabaseConnection(): Promise<boolean> {
  if (!supabaseAdmin) {
    console.error(
      '✗ Supabase is not configured (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).\n' +
      '  Auth, progress sync and telemetry are all disabled.'
    )
    return false
  }

  try {
    const { error } = await supabaseAdmin.from('profiles').select('id').limit(1)
    if (error) {
      console.error(
        `✗ Supabase rejected the service key for ${SUPABASE_URL}: ${error.message}\n` +
        '  Every server-side write is being dropped. Copy the FULL secret key from\n' +
        '  Supabase Dashboard → Settings → API → service_role (it is longer than the\n' +
        '  masked value shown in the key list).'
      )
      return false
    }
    console.log(`✓ Supabase connected (${SUPABASE_URL})`)
    return true
  } catch (err) {
    console.error('✗ Supabase connection failed:', err)
    return false
  }
}
