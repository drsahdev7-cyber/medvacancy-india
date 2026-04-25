'use client'

import { useEffect, useState } from 'react'
import { supabasePublic } from '../../lib/supabase'

export default function Admin() {
  const [jobs, setJobs] = useState<any[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    setError('')
    const { data, error } = await supabasePublic
      .from('vacancies')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) setError(error.message)
    setJobs(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  return (
    <div className="container">
      <h1>Admin Panel</h1>
      <p className="muted">Showing approved public vacancies from Supabase. Use /api/collect to test auto insertion.</p>
      <button onClick={load}>Refresh Jobs</button>

      {loading && <div className="card">Loading jobs...</div>}
      {error && <div className="card"><b>Error:</b> {error}</div>}
      {!loading && !error && jobs.length === 0 && <div className="card">No jobs found yet.</div>}

      {jobs.map(j => (
        <div key={j.id} className="card">
          <h3>{j.title}</h3>
          <p><b>{j.institute || 'Institute not added'}</b></p>
          <p className="muted">{j.state || 'India'} • {j.category || 'Medical'} • {j.status}</p>
          {j.summary && <p>{j.summary}</p>}
          {j.source_url && <a className="btn" href={j.source_url} target="_blank">Official Source</a>}
        </div>
      ))}
    </div>
  )
}
