import { supabasePublic } from '../lib/supabase'

export const dynamic = 'force-dynamic'

type Job = {
  id: string
  title: string
  institute: string
  state: string
  category: string
  source_url: string
  summary: string
  last_date?: string | null
  isFallback?: boolean
}

const PUBLIC_SOURCE_DIRECTORY: Job[] = [
  {
    id: 'source-nhm-rajasthan',
    title: 'NHM Rajasthan recruitment source',
    institute: 'National Health Mission Rajasthan',
    state: 'Rajasthan',
    category: 'Government Medical',
    source_url: 'https://rajswasthya.nic.in/',
    summary: 'Official Rajasthan health recruitment source. Open the link for current notices and medical officer, specialist, contractual and programme vacancies.',
    isFallback: true
  },
  {
    id: 'source-medical-education-rajasthan',
    title: 'Rajasthan Medical Education recruitment source',
    institute: 'Medical Education Rajasthan',
    state: 'Rajasthan',
    category: 'Medical College',
    source_url: 'https://medicaleducation.rajasthan.gov.in/',
    summary: 'Official source for Rajasthan medical college and medical education department notices, including resident, faculty and college-level recruitment updates.',
    isFallback: true
  },
  {
    id: 'source-aiims-exams',
    title: 'AIIMS exams and recruitment notices source',
    institute: 'AIIMS Exams',
    state: 'India',
    category: 'Government Medical',
    source_url: 'https://www.aiimsexams.ac.in/landingpage/notice',
    summary: 'Official AIIMS notice page for examination and recruitment updates. Use this for AIIMS-related doctor, resident and institutional notices.',
    isFallback: true
  },
  {
    id: 'source-esic',
    title: 'ESIC recruitment source',
    institute: 'Employees State Insurance Corporation',
    state: 'India',
    category: 'Government Medical',
    source_url: 'https://www.esic.gov.in/recruitments',
    summary: 'Official ESIC recruitment page for medical officer, specialist, senior resident, faculty and hospital vacancy notifications.',
    isFallback: true
  }
]

async function getJobs() {
  try {
    const { data, error } = await supabasePublic
      .from('vacancies')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(30)

    if (error) return { jobs: PUBLIC_SOURCE_DIRECTORY, error: error.message, usingFallback: true }
    if (!data || data.length === 0) return { jobs: PUBLIC_SOURCE_DIRECTORY, error: null, usingFallback: true }
    return { jobs: data as Job[], error: null, usingFallback: false }
  } catch (e: any) {
    return { jobs: PUBLIC_SOURCE_DIRECTORY, error: e?.message || 'Database temporarily unavailable', usingFallback: true }
  }
}

export default async function Home() {
  const { jobs, error, usingFallback } = await getJobs()

  return (
    <main>
      <section className="hero">
        <div className="badge">Public official-source medical recruitment tracker</div>
        <h1>Global Doctor Vacancies</h1>
        <p>Doctor, resident, faculty, medical officer and hospital vacancies from official public sources. Built for doctors who want one clean place to track opportunities.</p>
        <div className="heroActions">
          <a className="btn light" href="/admin">Admin Panel</a>
          <a className="btn outline" href="/api/collect" target="_blank">Run Collector</a>
          <a className="btn outline" href="/premium">Premium Alerts</a>
        </div>
      </section>

      <section className="container">
        <div className="statsGrid">
          <div className="stat"><b>{jobs.length}</b><span>{usingFallback ? 'official sources connected' : 'live vacancies'}</span></div>
          <div className="stat"><b>Admin</b><span>manual add/remove ready</span></div>
          <div className="stat"><b>Auto</b><span>collector API ready</span></div>
        </div>

        {usingFallback && (
          <div className="card warning">
            <h3>Website is public and working</h3>
            <p>Live vacancies will appear here after the collector writes to Supabase. Until then, visitors can use the official source directory below.</p>
            {error && <p className="muted">Database status: {error}</p>}
          </div>
        )}

        <div className="sectionHead">
          <div>
            <h2>{usingFallback ? 'Official Vacancy Sources' : 'Latest Medical Vacancies'}</h2>
            <p className="muted">{usingFallback ? 'Public source directory visible to visitors now.' : 'Auto-collected and manually editable vacancy board.'}</p>
          </div>
          <a className="miniBtn" href="/admin">Manage Jobs</a>
        </div>

        <div className="grid">
          {jobs.map((j: any) => (
            <article key={j.id} className="card jobCard">
              <div className="pill">{j.category || 'Medical Job'}</div>
              <h3>{j.title}</h3>
              <p className="muted">{j.institute || 'Official Source'} • {j.state || 'India'}</p>
              <p>{j.summary || 'Verify eligibility, last date and application details from the official source before applying.'}</p>
              <div className="jobFooter">
                {j.last_date && <span className="deadline">Last date: {j.last_date}</span>}
                <a className="btn" href={j.source_url} target="_blank">{j.isFallback ? 'Open Official Source' : 'Apply / View Official Notice'}</a>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
