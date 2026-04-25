import { supabasePublic } from '../lib/supabase'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const { data: jobs, error } = await supabasePublic
    .from('vacancies')
    .select('*')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(30)

  return (
    <main>
      <section className="hero">
        <div className="badge">Official-source medical recruitment tracker</div>
        <h1>MedVacancy India</h1>
        <p>Latest doctor, resident, faculty, medical officer and hospital vacancies from official public sources across India.</p>
        <div className="heroActions">
          <a className="btn light" href="/admin">Open Admin Panel</a>
          <a className="btn outline" href="/api/collect" target="_blank">Run Collector</a>
        </div>
      </section>

      <section className="container">
        <div className="sectionHead">
          <div>
            <h2>Latest Medical Vacancies</h2>
            <p className="muted">Auto-collected and manually editable vacancy board.</p>
          </div>
          <a className="miniBtn" href="/premium">Premium Alerts</a>
        </div>

        {error && (
          <div className="card warning">
            <h3>Database needs repair</h3>
            <p>{error.message}</p>
            <p className="muted">Run the SQL file at <b>supabase/repair_live_database.sql</b>, then open <b>/api/collect</b>.</p>
          </div>
        )}

        {(!jobs || jobs.length === 0) && !error && (
          <div className="grid">
            <div className="card warning">
              <h3>No approved vacancies visible yet</h3>
              <p>The website is live. Now run the collector or add jobs from Admin to populate the board.</p>
              <a className="btn" href="/api/collect" target="_blank">Run Collector Now</a>
            </div>
            <div className="card">
              <h3>Admin control ready</h3>
              <p>Add, approve, edit or remove vacancies manually from the admin panel.</p>
              <a className="btn secondary" href="/admin">Go to Admin</a>
            </div>
            <div className="card">
              <h3>Sources connected</h3>
              <p>NHM Rajasthan, Medical Education Rajasthan, AIIMS notices and ESIC recruitment are configured in the collector.</p>
            </div>
          </div>
        )}

        <div className="grid">
          {jobs?.map((j: any) => (
            <article key={j.id} className="card jobCard">
              <div className="pill">{j.category || 'Medical Job'}</div>
              <h3>{j.title}</h3>
              <p className="muted">{j.institute || 'Official Source'} • {j.state || 'India'}</p>
              <p>{j.summary || 'Verify eligibility, last date and application details from the official source before applying.'}</p>
              <div className="jobFooter">
                {j.last_date && <span className="deadline">Last date: {j.last_date}</span>}
                <a className="btn" href={j.source_url} target="_blank">Apply / View Official Notice</a>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
