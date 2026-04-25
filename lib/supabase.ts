import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://irgiymgaizixrxahrxth.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlyZ2l5bWdhaXppeHJ4YWhyeHRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwOTk3NzksImV4cCI6MjA5MjY3NTc3OX0.2FBpvYoXmHUTQOrvqsjeNDoNom8Kc9iOC8UeJnr1Nog'

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
