export default function EventsPage() {
  return (
    <div className="members-page">
      <div className="dashboard-page__glow" />

      <div className="dashboard-page__content">
        <header className="dashboard-topbar">
          <div className="dashboard-topbar__crumbs">
            <span>Family hierarchy</span>
            <span className="separator">/</span>
            <span className="current">Events</span>
          </div>
        </header>

        <section className="dashboard-hero">
          <p className="dashboard-hero__eyebrow">FAMILY HIERARCHY</p>
          <h1>Events</h1>
          <p>Events and gatherings tied to the family.</p>
        </section>

        <section className="members-shell">
          <div className="members-shell__header">
            <div className="members-shell__title-wrap">
              <span className="members-shell__icon">📅</span>
              <h2>Upcoming events</h2>
            </div>
          </div>

          <div className="page-empty">No events yet</div>
        </section>
      </div>
    </div>
  );
}
