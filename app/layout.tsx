import './style.css'
import type { ReactNode } from 'react'

export const metadata = {
  title: 'Global Doctor Vacancies',
  description: 'Public government and hospital doctor vacancies from trusted global sources.'
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="topbar">
          <a className="brand" href="/">Global Doctor Vacancies</a>
          <nav>
            <a href="/">Jobs</a>
            <a href="/premium">Premium</a>
            <a href="/admin">Admin</a>
          </nav>
        </header>
        {children}
      </body>
    </html>
  )
}
