import { cookies } from 'next/headers'
import crypto from 'crypto'

const COOKIE_NAME = 'gdv_admin_session'
const MAX_AGE_SECONDS = 60 * 60 * 8

function secret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || 'development-only-secret'
}

export function getAdminUsername() {
  return process.env.ADMIN_USERNAME || 'admin'
}

export function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || ''
}

export function signAdminSession(username: string) {
  const expires = Date.now() + MAX_AGE_SECONDS * 1000
  const payload = `${username}.${expires}`
  const signature = crypto.createHmac('sha256', secret()).update(payload).digest('hex')
  return `${payload}.${signature}`
}

export function verifyAdminSession(token?: string) {
  if (!token) return false
  const parts = token.split('.')
  if (parts.length !== 3) return false

  const [username, expiresRaw, signature] = parts
  const expires = Number(expiresRaw)
  if (!username || !expires || Date.now() > expires) return false

  const payload = `${username}.${expires}`
  const expected = crypto.createHmac('sha256', secret()).update(payload).digest('hex')

  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  } catch {
    return false
  }
}

export function isAdminLoggedIn() {
  return verifyAdminSession(cookies().get(COOKIE_NAME)?.value)
}

export function setAdminCookie(token: string) {
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: MAX_AGE_SECONDS
  })
}

export function clearAdminCookie() {
  cookies().set(COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0
  })
}
