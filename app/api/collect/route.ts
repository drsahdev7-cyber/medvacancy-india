import { NextResponse } from 'next/server'
import * as cheerio from 'cheerio'
import { getSupabaseAdmin } from '../../../lib/supabase'

const DEFAULT_SOURCES = [
  { name: 'NHM Rajasthan', url: 'https://rajswasthya.nic.in/', state: 'Rajasthan', category: 'Government Medical' },
  { name: 'Medical Education Rajasthan', url: 'https://medicaleducation.rajasthan.gov.in/', state: 'Rajasthan', category: 'Medical College' },
  { name: 'AIIMS Exams', url: 'https://www.aiimsexams.ac.in/', state: 'India', category: 'Government Medical' },
  { name: 'ESIC Recruitment', url: 'https://www.esic.gov.in/recruitments', state: 'India', category: 'Government Medical' }
]

const KEYWORDS = [
  'recruitment', 'vacancy', 'walk-in', 'walk in', 'doctor', 'medical officer',
  'junior resident', 'jr', 'senior resident', 'sr', 'faculty', 'professor',
  'tutor', 'demonstrator', 'hospital', 'nhm', 'aiims', 'esic', 'appointment'
]

function cleanText(text: string) {
  return text.replace(/\s+/g, ' ').trim()
}

function isMedicalVacancy(text: string) {
  const t = text.toLowerCase()
  return KEYWORDS.some(k => t.includes(k))
}

function absoluteUrl(href: string, base: string) {
  try {
    return new URL(href, base).toString()
  } catch {
    return ''
  }
}

export async function GET() {
  try {
    const supabase = getSupabaseAdmin()
    const inserted: any[] = []
    const skipped: any[] = []
    const errors: any[] = []

    for (const source of DEFAULT_SOURCES) {
      try {
        const response = await fetch(source.url, {
          headers: {
            'user-agent': 'Mozilla/5.0 (compatible; MedVacancyIndiaBot/1.0; +https://github.com/drsahdev7-cyber/medvacancy-india)',
            accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'accept-language': 'en-IN,en;q=0.9'
          },
          cache: 'no-store'
        })

        if (!response.ok) {
          errors.push({ source: source.name, error: 'HTTP ' + response.status })
          continue
        }

        const html = await response.text()
        const $ = cheerio.load(html)
        const candidates: { title: string; url: string }[] = []

        $('a').each((_, el) => {
          const title = cleanText($(el).text())
          const href = $(el).attr('href') || ''
          if (!title || !href) return
          const combined = title + ' ' + href
          if (!isMedicalVacancy(combined)) return
          const url = absoluteUrl(href, source.url)
          if (!url) return
          candidates.push({ title: title.slice(0, 240), url })
        })

        for (const item of candidates.slice(0, 12)) {
          // Keep this payload matched to the live Supabase table. Do not include optional columns
          // like collected_by here, because older Supabase schema cache can reject the insert.
          const { data, error } = await supabase
            .from('vacancies')
            .upsert({
              title: item.title,
              institute: source.name,
              state: source.state,
              category: source.category,
              source_url: item.url,
              summary: 'Auto-collected from official public source. Verify eligibility, deadline and application details from the official link before applying.',
              status: 'approved',
              confidence_score: 70
            }, { onConflict: 'source_url' })
            .select()

          if (error) {
            skipped.push({ title: item.title, error: error.message })
          } else if (data && data.length) {
            inserted.push(...data)
          }
        }
      } catch (e: any) {
        errors.push({ source: source.name, error: e.message || 'Unknown source error' })
      }
    }

    return NextResponse.json({ ok: true, inserted_count: inserted.length, inserted, skipped, errors })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message || 'Unknown error' }, { status: 500 })
  }
}
