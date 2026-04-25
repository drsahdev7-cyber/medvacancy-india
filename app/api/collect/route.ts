import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '../../../lib/supabase'

export async function GET() {
  try {
    const supabase = getSupabaseAdmin()
    const sourceUrl = 'https://example.com/test-vacancy-auto-' + Date.now()

    const { data, error } = await supabase
      .from('vacancies')
      .insert([
        {
          title: 'Test Vacancy Auto',
          institute: 'System',
          state: 'India',
          category: 'Test',
          source_url: sourceUrl,
          summary: 'This is a test vacancy inserted by the auto collector.',
          status: 'approved'
        }
      ])
      .select()

    if (error) {
      return NextResponse.json({ ok: false, error: error.message, details: error }, { status: 500 })
    }

    return NextResponse.json({ ok: true, inserted: data })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message || 'Unknown error' }, { status: 500 })
  }
}
