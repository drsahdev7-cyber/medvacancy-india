import './style.css';

export const metadata = {
  title: 'MedVacancy India',
  description: 'Latest government and private medical vacancies in India.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
      </body>
    </html>
  );
}
