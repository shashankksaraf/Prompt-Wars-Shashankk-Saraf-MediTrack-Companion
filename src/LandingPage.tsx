import './LandingPage.css'

export default function LandingPage() {
  return (
    <main className="landing-page">
      <section className="landing-hero">
        <h1>Keep track of today’s medicines.</h1>
        <p className="landing-subtitle">
          Set up your own daily medicine schedule, or help a family member set one up on the same
          device. Either way, the day comes down to one simple screen: what's due, and what's
          already been taken.
        </p>
        <a className="landing-cta" href="/app">
          Open MediTrack
        </a>
      </section>

      <section className="landing-steps" aria-label="How it works">
        <ol className="steps-list">
          <li>
            <span className="step-number">1</span>
            <span className="step-text">Choose to set up your own schedule, set one up for someone else, or try the demo.</span>
          </li>
          <li>
            <span className="step-number">2</span>
            <span className="step-text">Add each medicine, its directions, and the times it's taken.</span>
          </li>
          <li>
            <span className="step-number">3</span>
            <span className="step-text">Through the day, mark each dose as taken or skipped — and undo if you tap the wrong one.</span>
          </li>
        </ol>
      </section>

      <section className="landing-example" aria-label="Example schedule">
        <p className="example-label">Example schedule (fictional)</p>

        <div className="example-group">
          <p className="example-time">8:00 AM · 2 medicines</p>
          <div className="example-row">
            <span className="example-name">Ferropex 500mg</span>
            <span className="example-pill example-pill-pending">Pending</span>
          </div>
          <div className="example-row">
            <span className="example-name">Nightcalm 10mg</span>
            <span className="example-pill example-pill-pending">Pending</span>
          </div>
        </div>

        <p className="example-recorded-label">Recorded today</p>
        <div className="example-row example-row-recorded">
          <span className="example-name">Glowmin D · 7:00 AM</span>
          <span className="example-pill example-pill-taken">Taken at 7:05 AM</span>
        </div>
      </section>

      <p className="landing-storage-note">
        Your schedule is saved in this browser on this device.
      </p>
    </main>
  )
}
