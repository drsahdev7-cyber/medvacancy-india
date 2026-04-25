'use client'

import { useEffect, useState } from 'react'
import { supabasePublic } from '../../lib/supabase'

export default function Admin() {
  const [jobs, setJobs] = useState<any[]>([])

  async function load() {
    const { data } = await supabasePublic.from('vacancies').select('*').limit(50)
    setJobs(data || [])
  }

  useEffect(() => { load() }, [])

  return (
    <div className="container">
      <h1>Admin Panel</h1>
      {jobs.map(j => (
        <div key={j.id} className="card">
          <h3>{j.title}</h3>
          <p>{j.institute}</p>
        </div>
      ))}
    </div>
  )
}
