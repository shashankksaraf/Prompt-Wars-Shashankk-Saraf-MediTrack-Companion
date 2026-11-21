import { useState, type FormEvent } from 'react'
import './ManageScreen.css'
import './WelcomeScreen.css'

interface NamePromptProps {
  heading: string
  subtitle: string
  label: string
  placeholder: string
  submitLabel: string
  onSubmit: (name: string) => void
  onBack?: () => void
}

export default function NamePrompt({
  heading,
  subtitle,
  label,
  placeholder,
  submitLabel,
  onSubmit,
  onBack,
}: NamePromptProps) {
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!name.trim()) {
      setError('Enter a name to continue.')
      return
    }
    onSubmit(name)
  }

  return (
    <main className="welcome-screen">
      <div className="welcome-card">
        {onBack && (
          <button type="button" className="back-link" onClick={onBack}>
            ← Back
          </button>
        )}
        <h1>{heading}</h1>
        <p className="welcome-subtitle">{subtitle}</p>

        <form onSubmit={handleSubmit}>
          <label className="field-label" htmlFor="profile-name">
            {label}
          </label>
          <input
            id="profile-name"
            className="text-input"
            type="text"
            autoFocus
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setError(null)
            }}
            placeholder={placeholder}
          />

          {error && (
            <ul className="form-errors" aria-live="polite">
              <li>{error}</li>
            </ul>
          )}

          <div className="form-actions">
            <button type="submit" className="save-button">
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
