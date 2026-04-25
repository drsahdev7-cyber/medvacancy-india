import './style.css'
import type { ReactNode } from 'react'
import { Analytics } from '@vercel/analytics/next'

export const metadata = {
  title: 'MedVacancy India',
  description: 'Latest government and private medical vacancies in India.'
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="topbar">
          <a className="brand" href="/">MedVacancy India</a>
          <nav>
            <a href="/">Vacancies</a>
            <a href="/premium">Premium</a>
            <a href="/admin">Admin</a>
          </nav>
        </header>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
