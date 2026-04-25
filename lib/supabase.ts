import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://irgiymgaizixrxahrxth.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_I0sYakOMk6tzDfWzWHXgOQ_6wJAVcJr'

export const supabasePublic = createClient(supabaseUrl, supabaseAnonKey)

export function getSupabaseAdmin() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !key) {
    throw new Error('Missing Supabase server environment variables')
  }

  return createClient(supabaseUrl, key, {
    auth: { persistSession: false }
  })
}
