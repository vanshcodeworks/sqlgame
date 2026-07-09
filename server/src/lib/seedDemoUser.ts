import { supabaseAdmin } from './supabaseAdmin'
import { User } from '../models/User'
import { Progress } from '../models/Progress'

export async function ensureDemoUser() {
  const email = process.env.DEMO_EMAIL
  const password = process.env.DEMO_PASSWORD

  if (!email || !password) return
  if (!supabaseAdmin) {
    console.warn('SUPABASE_SERVICE_ROLE_KEY missing: demo user not seeded.')
    return
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (error && !/already/i.test(error.message)) {
    console.error('Failed to seed demo user in Supabase:', error.message)
    return
  }

  let supabaseId = data?.user?.id
  if (!supabaseId && /already/i.test(error?.message ?? '')) {
    const { data: listData, error: listError } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    })
    if (listError) {
      console.error('Failed to look up demo user in Supabase:', listError.message)
      return
    }
    supabaseId = listData.users.find(user => user.email?.toLowerCase() === email.toLowerCase())?.id
  }

  if (!supabaseId) return

  const existing = await User.findOne({ supabaseId })
  if (!existing) {
    const user = await User.create({ supabaseId, email })
    await Progress.create({ userId: user._id })
  }
}
