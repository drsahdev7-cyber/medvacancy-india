'use client'

import { useEffect, useState } from 'react'

export default function Admin() {
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [form, setForm] = useState({
    title: '',
    institute: '',
    state: '',
    source_url: '',
    summary: ''
  })

  async function load() {
    setLoading(true)
    const res = await fetch('/api/jobs')
    const json = await res.json()
    setJobs(json.jobs || [])
    setLoading(false)
  }

  async function addJob() {
    const res = await fetch('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    const json = await res.json()
    if (json.ok) {
      setForm({ title: '', institute: '', state: '', source_url: '', summary: '' })
      load()
    } else {
      alert(json.error)
    }
  }

  async function deleteJob(id: string) {
    await fetch(`/api/jobs?id=${id}`, { method: 'DELETE' })
    load()
  }

  useEffect(() => { load() }, [])

  return (
    <div className="container">
      <h1>Admin Panel</h1>

      <div className="card">
        <h3>Add Job</h3>
        <input placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
        <input placeholder="Institute" value={form.institute} onChange={e => setForm({ ...form, institute: e.target.value })} />
        <input placeholder="State" value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} />
        <input placeholder="Official Link" value={form.source_url} onChange={e => setForm({ ...form, source_url: e.target.value })} />
        <textarea placeholder="Summary" value={form.summary} onChange={e => setForm({ ...form, summary: e.target.value })} />
        <button onClick={addJob}>Add Job</button>
      </div>

      <button onClick={load}>Refresh Jobs</button>

      {loading && <div className="card">Loading...</div>}

      {jobs.map(j => (
        <div key={j.id} className="card">
          <h3>{j.title}</h3>
          <p>{j.institute}</p>
          <button onClick={() => deleteJob(j.id)}>Delete</button>
        </div>
      ))}
    </div>
  )
}
