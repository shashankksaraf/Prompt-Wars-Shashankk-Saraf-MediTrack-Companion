import './WelcomeScreen.css'

interface WelcomeScreenProps {
  onChooseSelf: () => void
  onChooseCaregiver: () => void
  onTryDemo: () => void
}

export default function WelcomeScreen({
  onChooseSelf,
  onChooseCaregiver,
  onTryDemo,
}: WelcomeScreenProps) {
  return (
    <main className="welcome-screen">
      <div className="welcome-card">
        <h1>MediTrack Companion</h1>
        <p className="welcome-subtitle">
          Organize, manage, and track daily medicine schedules — for yourself, or for someone
          you care for.
        </p>

        <div className="welcome-actions">
          <button type="button" className="welcome-primary-button" onClick={onChooseSelf}>
            Set up my schedule
          </button>
          <button type="button" className="welcome-primary-button" onClick={onChooseCaregiver}>
            Set up for someone else
          </button>
          <button type="button" className="welcome-secondary-button" onClick={onTryDemo}>
            Try an editable demo
          </button>
        </div>
      </div>
    </main>
  )
}
