export default function Home() {
  return (
    <main>
      <section className="hero">
        <h1>MedVacancy India</h1>
        <p>Latest medical vacancies from official public sources across India.</p>
      </section>
      <section className="container">
        <div className="grid">
          <div className="card">
            <h2>Government Jobs</h2>
            <p className="muted">NHM, medical colleges, public hospitals and scheme-based roles.</p>
          </div>
          <div className="card">
            <h2>Private Hospital Jobs</h2>
            <p className="muted">JR, RMO, medical officer, audit doctor and insurance desk roles.</p>
          </div>
          <div className="card">
            <h2>Premium Alerts</h2>
            <p className="muted">State-wise early alerts, deadline reminders and official links.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
