'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleLogin() {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })

    const json = await res.json()

    if (json.ok) {
      router.push('/admin')
    } else {
      setError(json.error || 'Login failed')
    }
  }

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 420, margin: '60px auto' }}>
        <h2>Admin Login</h2>
        <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button onClick={handleLogin}>Login</button>
      </div>
    </div>
  )
}
