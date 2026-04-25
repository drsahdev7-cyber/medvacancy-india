import { supabasePublic } from '../lib/supabase'

export default async function Home() {
  const { data: jobs } = await supabasePublic
    .from('vacancies')
    .select('*')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(20)

  return (
    <main>
      <section className="hero">
        <h1>MedVacancy India</h1>
        <p>Latest medical vacancies from official public sources across India.</p>
      </section>

      <section className="container">
        {(!jobs || jobs.length === 0) && (
          <div className="card">No vacancies yet. Run collector.</div>
        )}

        {jobs?.map((j: any) => (
          <div key={j.id} className="card">
            <h3>{j.title}</h3>
            <p className="muted">{j.institute} • {j.state}</p>
            <p>{j.summary}</p>
            <a className="btn" href={j.source_url} target="_blank">Apply / View</a>
          </div>
        ))}
      </section>
    </main>
  )
}
