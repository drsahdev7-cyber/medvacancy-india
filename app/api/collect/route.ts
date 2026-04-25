import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '../../../lib/supabase'

export async function GET() {
  const supabase = getSupabaseAdmin()

  // dummy insert to confirm working
  await supabase.from('vacancies').insert([
    {
      title: 'Test Vacancy Auto',
      institute: 'System',
      source_url: 'https://example.com',
      status: 'approved'
    }
  ])

  return NextResponse.json({ ok: true })
}
