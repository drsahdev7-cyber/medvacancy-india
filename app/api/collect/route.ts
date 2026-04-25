import { NextResponse } from 'next/server'
import * as cheerio from 'cheerio'
import { getSupabaseAdmin } from '../../../lib/supabase'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const DEFAULT_SOURCES = [
  { name: 'NHM Rajasthan', url: 'https://rajswasthya.nic.in/', state: 'Rajasthan', category: 'Government Medical' },
  { name: 'Medical Education Rajasthan', url: 'https://medicaleducation.rajasthan.gov.in/', state: 'Rajasthan', category: 'Medical College' },
  { name: 'AIIMS Exams Notices', url: 'https://www.aiimsexams.ac.in/landingpage/notice', state: 'India', category: 'Government Medical' },
  { name: 'ESIC Recruitment', url: 'https://www.esic.gov.in/recruitments', state: 'India', category: 'Government Medical' }
]

const STRONG_JOB_KEYWORDS = [
  'recruitment', 'vacancy', 'vacancies', 'walk-in', 'walk in', 'interview',
  'medical officer', 'junior resident', 'senior resident', 'resident',
  'faculty', 'professor', 'associate professor', 'assistant professor',
  'tutor', 'demonstrator', 'appointment', 'advertisement', 'notification',
  'contractual', 'consultant', 'doctor', 'specialist'
]

const BAD_WORDS = [
  'privacy', 'terms', 'refund', 'cancellation', 'support', 'key dates',
  'main portal', 'home', 'login', 'registration', 'result', 'admit card',
  'syllabus', 'prospectus', 'miscellaneous', 'tender', 'purchase', 'gallery'
]

function cleanText(text: string) {
  return text.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim()
}

function absoluteUrl(href: string, base: string) {
  try {
    return new URL(href, base).toString()
  } catch {
    return ''
  }
}

function hasStrongJobSignal(title: string, url: string) {
  const haystack = `${title} ${url}`.toLowerCase()
  return STRONG_JOB_KEYWORDS.some(k => haystack.includes(k))
}

function isGoodCandidate(title: string, url: string) {
  const cleanTitle = cleanText(title)
  const lowerTitle = cleanTitle.toLowerCase()
  const lowerUrl = url.toLowerCase()

  if (!cleanTitle || cleanTitle.length < 10) return false
  if (!lowerUrl.startsWith('http')) return false
  if (lowerUrl.includes('undefined')) return false
  if (lowerUrl.includes('javascript:')) return false
  if (lowerUrl.includes('#')) return false
  if (BAD_WORDS.some(w => lowerTitle.includes(w))) return false
  if (BAD_WORDS.some(w => lowerUrl.includes(w.replace(/\s+/g, '-')))) return false

  return hasStrongJobSignal(cleanTitle, url)
}

function vacancyPayload(item: { title: string; url: string }, source: typeof DEFAULT_SOURCES[number]) {
  return {
    title: item.title,
    institute: source.name,
    state: source.state,
    category: source.category,
    source_url: item.url,
    summary: 'Auto-collected from official public source. Verify eligibility, deadline and application details from the official link before applying.',
    status: 'approved'
  }
}

async function upsertVacancy(supabase: ReturnType<typeof getSupabaseAdmin>, payload: ReturnType<typeof vacancyPayload>) {
  const { data, error } = await supabase
    .from('vacancies')
    .upsert(payload, { onConflict: 'source_url' })
    .select()

  return { data, error }
}

export async function GET() {
  try {
    const supabase = getSupabaseAdmin()
    const inserted: any[] = []
    const skipped: any[] = []
    const errors: any[] = []
    const seenUrls = new Set<string>()

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
          const url = absoluteUrl(href, source.url)
          if (!isGoodCandidate(title, url)) return
          if (seenUrls.has(url)) return
          seenUrls.add(url)
          candidates.push({ title: title.slice(0, 240), url })
        })

        for (const item of candidates.slice(0, 25)) {
          const payload = vacancyPayload(item, source)
          const { data, error } = await upsertVacancy(supabase, payload)

          if (error) {
            skipped.push({ title: item.title, source: source.name, error: error.message })
          } else if (data && data.length) {
            inserted.push(...data)
          }
        }
      } catch (e: any) {
        errors.push({ source: source.name, error: e.message || 'Unknown source error' })
      }
    }

    return NextResponse.json({
      ok: errors.length === 0 || inserted.length > 0,
      inserted_count: inserted.length,
      inserted,
      skipped,
      errors,
      next_step_if_empty: 'Open Supabase SQL editor and run supabase/repair_live_database.sql, then redeploy and open /api/collect again.'
    })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message || 'Unknown error' }, { status: 500 })
  }
}
