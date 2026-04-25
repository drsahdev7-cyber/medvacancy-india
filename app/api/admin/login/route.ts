import { NextResponse } from 'next/server'
import { getAdminUsername, getAdminPassword, signAdminSession, setAdminCookie } from '../../../../lib/adminAuth'

export async function POST(req: Request) {
  const { username, password } = await req.json()

  if (username !== getAdminUsername() || password !== getAdminPassword()) {
    return NextResponse.json({ ok: false, error: 'Invalid credentials' })
  }

  const token = signAdminSession(username)
  setAdminCookie(token)

  return NextResponse.json({ ok: true })
}
