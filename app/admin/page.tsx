'use client'

import { useEffect, useState } from 'react'

export default function Admin() {
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/jobs')
    const json = await res.json()
    setJobs(json.jobs || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  return (
    <div className="container">
      <h1>Admin Panel</h1>
      <button onClick={load}>Refresh Jobs</button>

      {loading && <div className="card">Loading...</div>}

      {!loading && jobs.length === 0 && (
        <div className="card">No jobs found yet.</div>
      )}

      {jobs.map(j => (
        <div key={j.id} className="card">
          <h3>{j.title}</h3>
          <p>{j.institute}</p>
        </div>
      ))}
    </div>
  )
}
