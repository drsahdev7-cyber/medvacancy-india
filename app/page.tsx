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
  salary?: string | null
  eligibility?: string | null
  last_date?: string | null
  created_at?: string | null
  isFallback?: boolean
}

const PUBLIC_SOURCE_DIRECTORY: Job[] = [
  {
    id: 'source-nhm-rajasthan',
    title: 'Medical Officer / Specialist / Programme Vacancies',
    institute: 'National Health Mission Rajasthan',
    state: 'Rajasthan',
    category: 'Government Medical',
    source_url: 'https://rajswasthya.nic.in/',
    summary: 'Official Rajasthan health recruitment source for medical officer, specialist, contractual and programme vacancies.',
    eligibility: 'MBBS / Specialist qualification as per official notice',
    salary: 'As per government notification',
    isFallback: true
  },
  {
    id: 'source-medical-education-rajasthan',
    title: 'Resident / Faculty / Medical College Vacancies',
    institute: 'Medical Education Rajasthan',
    state: 'Rajasthan',
    category: 'Medical College',
    source_url: 'https://medicaleducation.rajasthan.gov.in/',
    summary: 'Official Rajasthan medical education source for resident, faculty and college-level recruitment updates.',
    eligibility: 'As per NMC / department norms',
    salary: 'As per institution rules',
    isFallback: true
  },
  {
    id: 'source-aiims-exams',
    title: 'AIIMS Doctor / Resident / Institute Notices',
    institute: 'AIIMS Exams',
    state: 'India',
    category: 'AIIMS / Central Govt',
    source_url: 'https://www.aiimsexams.ac.in/landingpage/notice',
    summary: 'Official AIIMS notice page for recruitment, exams and institute-level doctor vacancy updates.',
    eligibility: 'MBBS / MD / MS / DNB as per notice',
    salary: 'As per AIIMS rules',
    isFallback: true
  },
  {
    id: 'source-esic',
    title: 'Senior Resident / Specialist / Faculty Vacancies',
    institute: 'Employees State Insurance Corporation',
    state: 'India',
    category: 'ESIC Hospital Jobs',
    source_url: 'https://www.esic.gov.in/recruitments',
    summary: 'Official ESIC recruitment page for medical officer, specialist, senior resident, faculty and hospital notifications.',
    eligibility: 'MBBS / PG degree / experience as per notice',
    salary: 'As per ESIC notification',
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
      .limit(50)

    if (error) return { jobs: PUBLIC_SOURCE_DIRECTORY, error: error.message, usingFallback: true }
    if (!data || data.length === 0) return { jobs: PUBLIC_SOURCE_DIRECTORY, error: null, usingFallback: true }
    return { jobs: data as Job[], error: null, usingFallback: false }
  } catch (e: any) {
    return { jobs: PUBLIC_SOURCE_DIRECTORY, error: e?.message || 'Database temporarily unavailable', usingFallback: true }
  }
}

export default async function Home() {
  const { jobs, error, usingFallback } = await getJobs()
  const featured = jobs[0]
  const states = Array.from(new Set(jobs.map(j => j.state || 'India'))).slice(0, 8)
  const categories = Array.from(new Set(jobs.map(j => j.category || 'Medical Job'))).slice(0, 8)

  return (
    <main>
      <section className="jobHero">
        <div className="heroInner">
          <div className="badge">India's doctor vacancy search engine</div>
          <h1>Find doctor jobs from official sources</h1>
          <p>Search government hospitals, medical colleges, AIIMS, ESIC, NHM, resident posts, faculty posts and medical officer vacancies in one clean job portal.</p>

          <form className="searchBar" action="/" method="get">
            <div className="searchField">
              <label>What</label>
              <input name="q" placeholder="Medical Officer, JR, SR, Faculty" />
            </div>
            <div className="searchField">
              <label>Where</label>
              <input name="location" placeholder="Rajasthan, Delhi, India" />
            </div>
            <button type="submit">Search Jobs</button>
          </form>

          <div className="popularSearches">
            <span>Popular:</span>
            <a href="#jobs">Junior Resident</a>
            <a href="#jobs">Senior Resident</a>
            <a href="#jobs">Medical Officer</a>
            <a href="#jobs">Faculty</a>
          </div>
        </div>
      </section>

      <section className="portalShell" id="jobs">
        <aside className="filterPanel">
          <h3>Filter jobs</h3>
          <div className="filterGroup">
            <b>Location</b>
            {states.map(state => <label key={state}><input type="checkbox" /> {state}</label>)}
          </div>
          <div className="filterGroup">
            <b>Job type</b>
            {categories.map(category => <label key={category}><input type="checkbox" /> {category}</label>)}
          </div>
          <div className="filterGroup">
            <b>Quick actions</b>
            <a className="sideLink" href="/premium">Get premium alerts</a>
            <a className="sideLink" href="/admin">Post / manage job</a>
            <a className="sideLink" href="/api/collect" target="_blank">Run collector</a>
          </div>
        </aside>

        <section className="jobResults">
          <div className="resultsHeader">
            <div>
              <h2>{usingFallback ? 'Official source jobs directory' : 'Latest doctor vacancies'}</h2>
              <p>{usingFallback ? 'Live job feed is being connected. These official sources are public and usable now.' : `${jobs.length} live vacancy results`}</p>
            </div>
            <select defaultValue="newest">
              <option value="newest">Sort: newest</option>
              <option value="deadline">Sort: deadline</option>
              <option value="government">Government first</option>
            </select>
          </div>

          {usingFallback && (
            <div className="systemNotice">
              <b>Public portal active.</b> Database feed pending. Visitors still see official vacancy sources instead of an empty website.
              {error && <span> DB: {error}</span>}
            </div>
          )}

          <div className="linkedinLayout">
            <div className="jobList">
              {jobs.map((j, index) => (
                <article key={j.id} className={`jobListCard ${index === 0 ? 'activeJob' : ''}`}>
                  <div className="companyLogo">{(j.institute || 'M').slice(0, 1)}</div>
                  <div className="jobListContent">
                    <h3>{j.title}</h3>
                    <p className="companyName">{j.institute || 'Official Source'}</p>
                    <p className="jobMeta">{j.state || 'India'} • {j.category || 'Medical Job'} • Official link</p>
                    <p className="jobSummary">{j.summary}</p>
                    <div className="chips">
                      <span>{j.salary || 'Salary as per notice'}</span>
                      <span>{j.eligibility || 'Eligibility as per notice'}</span>
                      {j.last_date && <span>Last date: {j.last_date}</span>}
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {featured && (
              <aside className="jobDetailPane">
                <div className="detailHeader">
                  <div className="bigLogo">{(featured.institute || 'M').slice(0, 1)}</div>
                  <div>
                    <h2>{featured.title}</h2>
                    <p>{featured.institute} • {featured.state}</p>
                  </div>
                </div>
                <div className="detailActions">
                  <a className="btn" href={featured.source_url} target="_blank">Apply on official website</a>
                  <a className="saveBtn" href="/premium">Save alert</a>
                </div>
                <div className="detailSection">
                  <h3>Job summary</h3>
                  <p>{featured.summary}</p>
                </div>
                <div className="detailGrid">
                  <div><b>Category</b><span>{featured.category}</span></div>
                  <div><b>Location</b><span>{featured.state}</span></div>
                  <div><b>Salary</b><span>{featured.salary || 'As per official notice'}</span></div>
                  <div><b>Eligibility</b><span>{featured.eligibility || 'As per official notice'}</span></div>
                </div>
                <div className="detailSection">
                  <h3>Important note</h3>
                  <p>This portal links only to official public sources. Always verify eligibility, deadline, fees and application process on the official website before applying.</p>
                </div>
              </aside>
            )}
          </div>
        </section>
      </section>
    </main>
  )
}
