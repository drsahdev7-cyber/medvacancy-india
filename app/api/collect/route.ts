import { NextResponse } from 'next/server'
import * as cheerio from 'cheerio'
import { getSupabaseAdmin } from '../../../lib/supabase'

const DEFAULT_SOURCES = [
  { name: 'Medical Education Rajasthan', url: 'https://medicaleducation.rajasthan.gov.in/', state: 'Rajasthan', category: 'Medical College' },
  { name: 'AIIMS Exams Notices', url: 'https://www.aiimsexams.ac.in/landingpage/notice', state: 'India', category: 'Government Medical' }
]

const STRONG_JOB_KEYWORDS = [
  'recruitment', 'vacancy', 'walk-in', 'walk in', 'medical officer',
  'junior resident', 'senior resident', 'faculty', 'professor',
  'tutor', 'demonstrator', 'appointment', 'advertisement', 'notification'
]

const BAD_WORDS = [
  'privacy', 'terms', 'refund', 'cancellation', 'support', 'key dates',
  'main portal', 'home', 'login', 'registration', 'result', 'admit card',
  'syllabus', 'prospectus', 'miscellaneous', 'notice', 'notices'
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

  if (!cleanTitle || cleanTitle.length < 15) return false
  if (!lowerUrl.startsWith('http')) return false
  if (lowerUrl.includes('undefined')) return false
  if (lowerUrl.includes('javascript:')) return false
  if (lowerUrl.includes('#')) return false
  if (BAD_WORDS.some(w => lowerTitle.includes(w))) return false
  if (BAD_WORDS.some(w => lowerUrl.includes(w.replace(/\s+/g, '-')))) return false

  return hasStrongJobSignal(cleanTitle, url)
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

        for (const item of candidates.slice(0, 20)) {
          const { data, error } = await supabase
            .from('vacancies')
            .upsert({
              title: item.title,
              institute: source.name,
              state: source.state,
              category: source.category,
              source_url: item.url,
              summary: 'Auto-collected from official public source. Verify eligibility, deadline and application details from the official link before applying.',
              status: 'approved'
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
